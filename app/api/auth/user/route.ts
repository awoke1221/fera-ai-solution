// ─── GET /api/auth/user — current user & profile ─────
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  isAdminUser,
} from "@/lib/supabase-admin";

// Avoid stale membership state so premium access updates immediately after approval.
const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "private",
};

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null }, { headers: CACHE_HEADERS });
    }

    const profileResult = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let profile = profileResult.data;

    const ensuredProfile = await ensureProfileForUser(user);

    if (!profile || ensuredProfile) {
      const refreshedProfile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = refreshedProfile.data;
    }

    const membershipResult = await supabase
      .from("memberships")
      .select("*, membership_plans(name)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .maybeSingle();

    const adminStatus = await isAdminUser(user);
    if (profile) {
      profile.is_admin = adminStatus;
      profile.role = profile.role || (adminStatus ? "admin" : "user");
    } else if (adminStatus) {
      profile = {
        id: user.id,
        email: user.email ?? null,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        is_admin: true,
        role: "admin",
      } as any;
    }

    return NextResponse.json(
      {
        user,
        profile,
        membership: membershipResult.data,
      },
      { headers: CACHE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
