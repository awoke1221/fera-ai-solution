import { NextResponse } from "next/server";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";

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
    const { session_id, user_id } = body;
    if (!session_id || !user_id)
      return NextResponse.json(
        { error: "Missing session_id or user_id" },
        { status: 400 },
      );

    // Remove attendee
    const del = await supabase
      .from("session_attendees")
      .update({ status: "cancelled" })
      .eq("session_id", session_id)
      .eq("user_id", user_id);
    if (del.error)
      return NextResponse.json({ error: del.error.message }, { status: 400 });

    // Auto-promote next waitlist
    const wlRes = await supabase
      .from("session_waitlist")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (wlRes.data) {
      const promote = wlRes.data;
      await supabase.from("session_waitlist").delete().eq("id", promote.id);
      await supabase
        .from("session_attendees")
        .insert({ session_id, user_id: promote.user_id });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/admin/coaching/attendees/remove POST", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
