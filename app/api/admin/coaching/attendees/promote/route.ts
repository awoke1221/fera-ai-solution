import { NextResponse } from "next/server";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";
import { generateICS } from "@/lib/ics";
import { sendEmailViaSendGrid } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const admin = await isAdminUser(user);
    if (!admin)
      return NextResponse.json({ error: "Admin required" }, { status: 403 });

    const body = await request.json();
    const { waitlist_id } = body;
    if (!waitlist_id)
      return NextResponse.json(
        { error: "Missing waitlist_id" },
        { status: 400 },
      );

    const wlRes = await supabase
      .from("session_waitlist")
      .select("*")
      .eq("id", waitlist_id)
      .maybeSingle();
    const wl = wlRes.data;
    if (!wl)
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 },
      );

    // Remove from waitlist
    await supabase.from("session_waitlist").delete().eq("id", waitlist_id);
    // Add to attendees
    const insertRes = await supabase
      .from("session_attendees")
      .insert({ session_id: wl.session_id, user_id: wl.user_id })
      .select()
      .single();
    if (insertRes.error)
      return NextResponse.json(
        { error: insertRes.error.message },
        { status: 400 },
      );

    // Notify promoted user
    try {
      const profileRes = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", wl.user_id)
        .maybeSingle();
      const attendee = profileRes.data;
      const sessionRes = await supabase
        .from("group_sessions")
        .select("*")
        .eq("id", wl.session_id)
        .maybeSingle();
      const s = sessionRes.data;
      if (attendee?.email) {
        const uid = `${wl.session_id}-${wl.user_id}`;
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
        await sendEmailViaSendGrid({
          to: attendee.email,
          subject: `You're in! ${s.title}`,
          html: `<p>You've been promoted to a confirmed spot for ${s.title}.</p>`,
          attachments: [
            {
              filename: `${s.title || "session"}.ics`,
              content: ics,
              type: "text/calendar",
            },
          ],
        });
      }
    } catch (e) {
      console.error("notify promoted user failed", e);
    }

    return NextResponse.json({ ok: true, attendee: insertRes.data });
  } catch (err: any) {
    console.error("/api/admin/coaching/attendees/promote POST", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
