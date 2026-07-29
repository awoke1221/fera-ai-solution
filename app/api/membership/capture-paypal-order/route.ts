// ─── POST /api/membership/capture-paypal-order ───────
// Captures a PayPal order after user approval
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderID, planId } = await request.json();

    if (!orderID || !planId) {
      return NextResponse.json(
        { error: "Order ID and Plan ID are required" },
        { status: 400 },
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

    // Capture order
    const captureResponse = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      return NextResponse.json(
        {
          error:
            captureData?.message ||
            captureData?.details?.[0]?.description ||
            "Failed to capture PayPal payment",
        },
        { status: 500 },
      );
    }

    const capture =
      captureData.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

    if (!capture || capture.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: `Payment not completed: ${capture?.status ?? captureData.status}`,
        },
        { status: 400 },
      );
    }

    // Get plan for amount and currency validation
    const { data: plan } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const expectedAmount = Number(plan.price ?? 0).toFixed(2);
    const expectedCurrency = plan.currency || "USD";
    const capturedAmount = capture.amount?.value;
    const capturedCurrency = capture.amount?.currency_code;

    if (
      capturedAmount !== expectedAmount ||
      capturedCurrency !== expectedCurrency
    ) {
      return NextResponse.json(
        {
          error: `Captured payment metadata mismatch: expected ${expectedAmount} ${expectedCurrency}, got ${capturedAmount} ${capturedCurrency}`,
        },
        { status: 400 },
      );
    }

    // Create payment request (auto-approved for PayPal since payment is already captured)
    const { data: paymentRequest } = await supabase
      .from("payment_requests")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: plan?.price || 0,
        currency: "USD",
        payment_method: "paypal",
        paypal_order_id: orderID,
        status: "approved",
      })
      .select()
      .single();

    // Auto-activate membership for PayPal payments
    const durationDays = plan?.duration_days || 30;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    // Check existing membership
    const { data: existingMembership } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMembership) {
      await supabase
        .from("memberships")
        .update({
          plan_id: planId,
          payment_request_id: paymentRequest?.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        })
        .eq("id", existingMembership.id);
    } else {
      await supabase.from("memberships").insert({
        user_id: user.id,
        plan_id: planId,
        payment_request_id: paymentRequest?.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment captured and membership activated!",
      captureData,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
