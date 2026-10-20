// ─── GET /api/membership/status ──────────────────────
// Returns the user's membership status, payment request history,
// and whether they have premium access.
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
} from "@/lib/supabase-admin";
import { getMembershipAccess } from "@/lib/membership-access";

export const dynamic = "force-dynamic";

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "Unable to verify the current session." },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

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

    const access = await getMembershipAccess(user, supabase);
    if (access.error) {
      console.error(
        "[membership/status] Failed to load active membership:",
        access.error,
      );
      return NextResponse.json(
        { error: "Unable to verify your membership status right now." },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

    const paymentsClient = getAdminServiceClient() || supabase;
    const paymentsResult = await paymentsClient
      .from("payment_requests")
      .select("*, membership_plans(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (paymentsResult.error) {
      console.error(
        "[membership/status] Failed to load payment history:",
        paymentsResult.error,
      );
      return NextResponse.json(
        { error: "Unable to load your payment history right now." },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

    const paymentRequests = paymentsResult.data || [];
    const latestPayment = paymentRequests[0] || null;
    const pendingPayment =
      paymentRequests.find(
        (payment: { status: string }) => payment.status === "pending",
      ) || null;

    return NextResponse.json(
      {
        hasPremium: access.hasPremium,
        hasPendingPayment: Boolean(pendingPayment),
        membership: access.membership,
        profile,
        latestPayment,
        pendingPayment,
        paymentRequests,
        user,
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error(
      "[membership/status] Unexpected status lookup failure:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CACHE_HEADERS },
    );
  }
}
