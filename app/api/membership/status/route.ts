// ─── GET /api/membership/status ──────────────────────
// Returns the user's membership status, payment request history,
// and whether they have premium access.
import { NextResponse } from "next/server";
import { createAdminClient, ensureProfileForUser } from "@/lib/supabase-admin";

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
      return NextResponse.json(
        { hasPremium: false, user: null },
        { headers: CACHE_HEADERS },
      );
    }

    let profile = null;
    const profileResult = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    profile = profileResult.data;

    if (!profile) {
      await ensureProfileForUser(user);
      const refreshedProfile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = refreshedProfile.data;
    }

    const [membershipResult, paymentsResult] = await Promise.all([
      supabase
        .from("memberships")
        .select("*, membership_plans(id, name, slug)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .maybeSingle(),
      supabase
        .from("payment_requests")
        .select("*, membership_plans(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const membership = membershipResult.data;
    const paymentRequests = paymentsResult.data || [];
    const latestPayment = paymentRequests[0] || null;

    return NextResponse.json(
      {
        hasPremium: !!membership,
        hasPendingPayment:
          latestPayment?.status === "pending" ||
          paymentRequests.some(
            (pr: { status: string }) => pr.status === "pending",
          ),
        membership,
        profile,
        latestPayment,
        paymentRequests,
        user,
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
