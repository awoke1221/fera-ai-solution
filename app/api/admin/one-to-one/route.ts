import { NextResponse } from "next/server";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";

export async function GET() {
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
      .from("one_to_one_requests")
      .select("*, profiles:user_id(id, email, full_name)")
      .order("created_at", { ascending: false });
    return NextResponse.json({ requests: res.data || [] });
  } catch (err: any) {
    console.error("/api/admin/one-to-one GET", err);
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
    const { id, handled } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updates: any = {};
    if (typeof handled === "boolean") {
      updates.handled = handled;
      updates.handled_by = handled ? user.id : null;
      updates.handled_at = handled ? new Date().toISOString() : null;
    }

    const res = await supabase
      .from("one_to_one_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (res.error)
      return NextResponse.json({ error: res.error.message }, { status: 400 });
    return NextResponse.json({ request: res.data });
  } catch (err: any) {
    console.error("/api/admin/one-to-one PATCH", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
