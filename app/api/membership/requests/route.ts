// ─── GET /api/membership/requests (admin only) ───────
import { NextResponse } from "next/server";
import { createAdminClient, getAdminServiceClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const supabase = await createAdminClient();
    const serviceClient = getAdminServiceClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // optional filter

    // Use service client for admin reads (bypasses RLS to see all users)
    const db = serviceClient || supabase;

    let query = db
      .from("payment_requests")
      .select(
        "*, membership_plans(name), profiles!payment_requests_user_id_fkey(email, full_name)",
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
