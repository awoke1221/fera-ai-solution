import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getMembershipAccess } from "@/lib/membership-access";

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
        { error: "Unable to verify your sign-in. Please retry." },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Sign in to check Stack Advisor access." },
        { status: 401, headers: CACHE_HEADERS },
      );
    }

    const access = await getMembershipAccess(user, supabase);
    if (access.error) {
      console.error(
        "[membership/access] Failed to load active membership:",
        access.error,
      );
      return NextResponse.json(
        { error: "Unable to verify Stack Advisor access right now." },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

    return NextResponse.json(
      {
        user,
        membership: access.membership,
        hasPremium: access.hasPremium,
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error("[membership/access] Unexpected access check failure:", error);
    return NextResponse.json(
      { error: "Unable to verify Stack Advisor access right now." },
      { status: 500, headers: CACHE_HEADERS },
    );
  }
}
