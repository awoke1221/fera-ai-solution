// ─── GET /api/auth/user — current user & profile ─────
import { NextResponse } from "next/server";
import { createAdminClient, ensureProfileForUser } from "@/lib/supabase-admin";

// Cache for 10s, stale for 1 min — quick enough for nav bar but avoids repeated DB hits
const CACHE_HEADERS = {
  "Cache-Control": "private, max-age=10, stale-while-revalidate=60",
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
