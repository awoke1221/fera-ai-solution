import { NextResponse } from "next/server";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";

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

    const res = await supabase
      .from("group_sessions")
      .select("*, profiles:host_id(id, email, full_name)")
      .order("start_time", { ascending: true });
    return NextResponse.json({ sessions: res.data || [] });
  } catch (err: any) {
    console.error("/api/admin/coaching GET", err);
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

    const admin = await isAdminUser(user);
    if (!admin)
      return NextResponse.json({ error: "Admin required" }, { status: 403 });

    const body = await request.json();
    const payload = {
      title: body.title,
      description: body.description || null,
      zoom_meeting_id: body.zoom_meeting_id || null,
      host_id: body.host_id || user.id,
      start_time: body.start_time || null,
      duration_minutes: body.duration_minutes || 60,
      capacity: body.capacity || 50,
    };

    const res = await supabase
      .from("group_sessions")
      .insert(payload)
      .select()
      .single();
    if (res.error)
      return NextResponse.json({ error: res.error.message }, { status: 400 });
    return NextResponse.json({ session: res.data });
  } catch (err: any) {
    console.error("/api/admin/coaching POST", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await supabase
      .from("group_sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (res.error)
      return NextResponse.json({ error: res.error.message }, { status: 400 });
    return NextResponse.json({ session: res.data });
  } catch (err: any) {
    console.error("/api/admin/coaching PATCH", err);
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

    const admin = await isAdminUser(user);
    if (!admin)
      return NextResponse.json({ error: "Admin required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await supabase.from("group_sessions").delete().eq("id", id);
    if (res.error)
      return NextResponse.json({ error: res.error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/admin/coaching DELETE", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
