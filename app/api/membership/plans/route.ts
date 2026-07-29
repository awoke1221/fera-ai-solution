// ─── GET /api/membership/plans ───────────────────────
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Plans change infrequently — cache for 5 min on CDN + browser
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "Surrogate-Control": "public, max-age=300",
};

export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: CACHE_HEADERS },
      );
    }

    return NextResponse.json({ plans: data }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
