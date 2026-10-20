// ─── GET /api/membership/status ──────────────────────
// Returns the user's membership status, payment request history,
// and whether they have premium access.
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
  isAdminUser,
} from "@/lib/supabase-admin";
import { normalizeMembershipDuplicates } from "@/lib/membership";

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

    const serviceClient = getAdminServiceClient();

    if (serviceClient) {
      const { data: allMembershipRows } = await serviceClient
        .from("memberships")
        .select("id, user_id, is_active, end_date, created_at")
        .eq("user_id", user.id)
        .order("end_date", { ascending: false });

      const { duplicateIds } = normalizeMembershipDuplicates(
        allMembershipRows || [],
      );

      if (duplicateIds.length > 0) {
        await (serviceClient as any)
          .from("memberships")
          .update({ is_active: false })
          .in("id", duplicateIds);
      }
    }

    const membershipClient = serviceClient || supabase;

    const [membershipResult, paymentsResult] = await Promise.all([
      membershipClient
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

    if (membershipResult.error || paymentsResult.error) {
      return NextResponse.json(
        { error: "Unable to load complete membership and payment status." },
        { status: 500, headers: CACHE_HEADERS },
      );
    }

    const membership = membershipResult.data;
    const hasPremium = !!membership || (await isAdminUser(user));
    const paymentRequests = paymentsResult.data || [];
    const latestPayment = paymentRequests[0] || null;
    const pendingPayment =
      paymentRequests.find(
        (payment: { status: string }) => payment.status === "pending",
      ) || null;

    return NextResponse.json(
      {
        hasPremium,
        hasPendingPayment: Boolean(pendingPayment),
        membership,
        profile,
        latestPayment,
        pendingPayment,
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
