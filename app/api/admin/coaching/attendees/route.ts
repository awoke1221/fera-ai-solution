import { NextResponse } from "next/server";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId)
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 },
      );

    const attendeesRes = await supabase
      .from("session_attendees")
      .select(
        "id, user_id, status, created_at, profiles: user_id (id, email, full_name)",
      )
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    const waitlistRes = await supabase
      .from("session_waitlist")
      .select(
        "id, user_id, created_at, profiles: user_id (id, email, full_name)",
      )
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      attendees: attendeesRes.data || [],
      waitlist: waitlistRes.data || [],
    });
  } catch (err: any) {
    console.error("/api/admin/coaching/attendees GET", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
