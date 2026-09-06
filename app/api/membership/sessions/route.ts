import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { generateICS } from "@/lib/ics";
import { sendEmailViaResend } from "@/lib/email";
import { getActiveMembership } from "@/lib/membership";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const sessionsRes = await supabase
      .from("group_sessions")
      .select("*")
      .order("start_time", { ascending: true });
    const sessions = sessionsRes.data || [];

    const sessionsWithMeta = await Promise.all(
      sessions.map(async (s: any) => {
        const attendeesRes = await supabase
          .from("session_attendees")
          .select("user_id,status")
          .eq("session_id", s.id);
        const registered = (attendeesRes.data || []).filter(
          (a: any) => a.status === "registered",
        ).length;
        const isRegistered = user
          ? (attendeesRes.data || []).some(
              (a: any) => a.user_id === user.id && a.status === "registered",
            )
          : false;

        const waitlistRes = await supabase
          .from("session_waitlist")
          .select("user_id,created_at")
          .eq("session_id", s.id)
          .order("created_at", { ascending: true });
        const waitlistCount = (waitlistRes.data || []).length;
        const isWaitlisted = user
          ? (waitlistRes.data || []).some((w: any) => w.user_id === user.id)
          : false;

        return {
          ...s,
          attendee_count: registered,
          is_registered: isRegistered,
          waitlist_count: waitlistCount,
          is_waitlisted: isWaitlisted,
        };
      }),
    );

    return NextResponse.json({ sessions: sessionsWithMeta });
  } catch (err: any) {
    console.error("/api/membership/sessions GET", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Check premium membership
    const membership = await getActiveMembership(supabase, user.id);
    if (!membership)
      return NextResponse.json({ error: "Premium required" }, { status: 403 });

    const body = await request.json();
    const sessionId = body.session_id;
    if (!sessionId)
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 },
      );

    // Check capacity
    const sessionRes = await supabase
      .from("group_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();
    const session = sessionRes.data;
    if (!session)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const attendeesRes = await supabase
      .from("session_attendees")
      .select("user_id,status")
      .eq("session_id", sessionId);
    const registered = (attendeesRes.data || []).filter(
      (a: any) => a.status === "registered",
    );

    if (registered.some((a: any) => a.user_id === user.id)) {
      return NextResponse.json({ ok: true, message: "Already registered" });
    }

    if (registered.length >= (session.capacity || 0)) {
      // Add to waitlist
      const exists = await supabase
        .from("session_waitlist")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (exists.data) return NextResponse.json({ ok: true, waitlisted: true });
      const wl = await supabase
        .from("session_waitlist")
        .insert({ session_id: sessionId, user_id: user.id })
        .select()
        .single();
      if (wl.error)
        return NextResponse.json({ error: wl.error.message }, { status: 400 });
      return NextResponse.json({ ok: true, waitlisted: true });
    }

    const insertRes = await supabase
      .from("session_attendees")
      .insert({ session_id: sessionId, user_id: user.id })
      .select()
      .single();
    if (insertRes.error)
      return NextResponse.json(
        { error: insertRes.error.message },
        { status: 400 },
      );

    return NextResponse.json({ ok: true, attendee: insertRes.data });
  } catch (err: any) {
    console.error("/api/membership/sessions POST", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId)
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 },
      );

    const delRes = await supabase
      .from("session_attendees")
      .update({ status: "cancelled" })
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .select()
      .single();
    if (delRes.error)
      return NextResponse.json(
        { error: delRes.error.message },
        { status: 400 },
      );

    // Auto-promote first waitlist user
    const wlRes = await supabase
      .from("session_waitlist")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (wlRes.data) {
      const promote = wlRes.data;
      // remove from waitlist
      await supabase.from("session_waitlist").delete().eq("id", promote.id);
      // add to attendees
      const promoteInsert = await supabase
        .from("session_attendees")
        .insert({ session_id: sessionId, user_id: promote.user_id })
        .select()
        .single();
      if (!promoteInsert.error) {
        // send promotion email with ICS
        try {
          const userRow = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", promote.user_id)
            .maybeSingle();
          const attendee = userRow.data;
          const sessionRow = await supabase
            .from("group_sessions")
            .select("*")
            .eq("id", sessionId)
            .maybeSingle();
          const s = sessionRow.data;
          if (attendee?.email) {
            const uid = `${sessionId}-${promote.user_id}`;
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

            await sendEmailViaResend({
              to: attendee.email,
              subject: `You're in! ${s.title}`,
              html: `<p>Hi ${attendee.full_name || "there"},</p><p>Good news — you've been promoted from the waitlist to a confirmed spot for <strong>${s.title}</strong> at ${new Date(s.start_time).toLocaleString()}.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/membership/coaching/${s.id}">View session details</a></p>`,
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
          console.error("Failed to notify promoted user", e);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/membership/sessions DELETE", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
