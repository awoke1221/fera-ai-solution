import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { generateICS } from "@/lib/ics";
import { sendEmailViaSendGrid } from "@/lib/email";

// This endpoint is intended to be called by a scheduler (cron) to send email reminders.
export async function POST() {
  try {
    const supabase = await createAdminClient();

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    // Find sessions starting within the next 24 hours
    const sessionsRes = await supabase
      .from("group_sessions")
      .select("*")
      .gte("start_time", now.toISOString())
      .lte("start_time", in24h);

    const sessions = sessionsRes.data || [];

    for (const s of sessions) {
      const attendeesRes = await supabase
        .from("session_attendees")
        .select("*, profiles: user_id (id, email, full_name)")
        .eq("session_id", s.id)
        .eq("status", "registered");

      const attendees = attendeesRes.data || [];

      for (const a of attendees) {
        try {
          if (a.reminder_sent) continue;
          const to = a.profiles?.email || a.email || null;
          if (!to) continue;

          const uid = `${s.id}-${a.user_id}`;
          const ics = generateICS({
            uid,
            title: s.title,
            description: s.description || "",
            startTime: s.start_time,
            durationMinutes: s.duration_minutes || 60,
            url: process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/membership/coaching/${s.id}`
              : undefined,
            organizerEmail: process.env.FROM_EMAIL || undefined,
          });

          const subject = `Reminder: ${s.title} — ${new Date(s.start_time).toLocaleString()}`;
          const html = `<p>Hi ${a.profiles?.full_name || "there"},</p><p>This is a reminder for your upcoming session: <strong>${s.title}</strong> at ${new Date(s.start_time).toLocaleString()}.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/membership/coaching/${s.id}">View session details</a></p>`;

          await sendEmailViaSendGrid({
            to,
            subject,
            html,
            attachments: [
              {
                filename: `${s.title || "session"}.ics`,
                content: ics,
                type: "text/calendar",
              },
            ],
          });

          // mark reminder_sent true
          await supabase
            .from("session_attendees")
            .update({ reminder_sent: true })
            .eq("id", a.id);
        } catch (err) {
          console.error("Failed to send reminder to attendee", a, err);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/membership/sessions/cron/reminders", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
