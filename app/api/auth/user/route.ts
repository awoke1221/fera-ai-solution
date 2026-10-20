// ─── GET /api/auth/user — current user & profile ─────
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  isAdminUser,
} from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "Unable to verify the current session." },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

    if (!user) {
      return NextResponse.json({ user: null }, { headers: CACHE_HEADERS });
    }

    let profile = null;
    let adminStatus = false;

    try {
      const profileResult = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = profileResult.data;

      const ensuredProfile = await ensureProfileForUser(user);
      if (!profile || ensuredProfile) {
        const refreshedProfile = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        profile = refreshedProfile.data;
      }
    } catch (error) {
      console.error("[auth/user] Unable to load the user profile:", error);
    }

    try {
      adminStatus = await isAdminUser(user);
    } catch (error) {
      console.error("[auth/user] Unable to verify admin profile status:", error);
    }

    if (profile) {
      profile.is_admin = adminStatus || profile.is_admin === true;
      profile.role =
        profile.role || (profile.is_admin ? "admin" : "user");
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
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error("[auth/user] Unexpected session lookup failure:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CACHE_HEADERS },
    );
  }
}
