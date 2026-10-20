// ─── POST /api/membership/create-paypal-order ────────
// Creates a PayPal order for global users
import { NextResponse } from "next/server";
import {
  createAdminClient,
  getAdminServiceClient,
} from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = getAdminServiceClient();
    if (!serviceClient) {
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 },
      );
    }

    const { data: pendingRequest, error: pendingError } = await (
      serviceClient as any
    )
      .from("payment_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingError) {
      return NextResponse.json(
        { error: "Unable to verify your existing payment requests." },
        { status: 500 },
      );
    }

    if (pendingRequest) {
      return NextResponse.json(
        {
          error:
            "A payment request is already under review. Please wait for a decision before paying again.",
          status: "pending",
        },
        { status: 409 },
      );
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 },
      );
    }

    // Get plan details
    const { data: plan } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const { data: activeMembership, error: membershipError } = await (
      serviceClient as any
    )
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        { error: "Unable to verify your current membership." },
        { status: 500 },
      );
    }

    if (activeMembership) {
      return NextResponse.json(
        { error: "Your paid membership is already active." },
        { status: 409 },
      );
    }

    const PAYPAL_CLIENT_ID =
      process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
    const PAYPAL_API =
      process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === "true"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json(
        { error: "PayPal not configured" },
        { status: 500 },
      );
    }

    // Get access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: "PayPal auth failed" },
        { status: 500 },
      );
    }

    // Create order
    const amountValue = Number(plan.price ?? 0).toFixed(2);
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: planId,
            description: plan.name,
            amount: {
              currency_code: plan.currency || "USD",
              value: amountValue,
            },
            custom_id: `${user.id}::${planId}`,
          },
        ],
        payer: {
          email_address: user.email,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 500 },
      );
    }

    return NextResponse.json({ orderID: orderData.id });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
