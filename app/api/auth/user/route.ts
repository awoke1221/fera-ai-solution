// ─── GET /api/auth/user — current user & profile ─────
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch active membership
    const { data: membership } = await supabase
      .from("memberships")
      .select("*, membership_plans(name)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .maybeSingle();

    return NextResponse.json({
      user,
      profile,
      membership,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
