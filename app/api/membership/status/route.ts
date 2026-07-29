// ─── GET /api/membership/status ──────────────────────
// Returns the user's membership status, payment request history,
// and whether they have premium access.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ hasPremium: false, user: null });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get active membership
    const { data: membership } = await supabase
      .from("memberships")
      .select("*, membership_plans(id, name, slug)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .maybeSingle();

    // Get latest payment request
    const { data: latestPayment } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get all payment requests for full history
    const { data: paymentRequests } = await supabase
      .from("payment_requests")
      .select("*, membership_plans(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      hasPremium: !!membership,
      hasPendingPayment:
        latestPayment?.status === "pending" ||
        paymentRequests?.some(
          (pr: { status: string }) => pr.status === "pending",
        ),
      membership,
      profile,
      latestPayment,
      paymentRequests: paymentRequests || [],
      user,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
