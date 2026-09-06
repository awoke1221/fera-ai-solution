// ─── POST /api/membership/capture-paypal-order ───────
// Captures a PayPal order after user approval
import { NextResponse } from "next/server";
import { activateMembershipForPayment } from "@/lib/membership";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
} from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const serviceClient = getAdminServiceClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!serviceClient) {
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 },
      );
    }

    await ensureProfileForUser(user);
    const { orderID, planId } = await request.json();

    if (!orderID || !planId) {
      return NextResponse.json(
        { error: "Order ID and Plan ID are required" },
        { status: 400 },
      );
    }

    const planById = await supabase
      .from("membership_plans")
      .select("id, price, currency, is_active")
      .eq("id", planId)
      .eq("is_active", true)
      .maybeSingle();
    const planLookup = planById.data
      ? planById
      : await supabase
          .from("membership_plans")
          .select("id, price, currency, is_active")
          .eq("slug", planId)
          .eq("is_active", true)
          .maybeSingle();
    const plan = planLookup.data;

    if (!plan) {
      return NextResponse.json(
        { error: "Active plan not found" },
        { status: 404 },
      );
    }

    const { data: existingRequest } = await (serviceClient as any)
      .from("payment_requests")
      .select("id, status")
      .eq("paypal_order_id", orderID)
      .maybeSingle();

    if (existingRequest?.status === "approved") {
      return NextResponse.json({
        success: true,
        message: "Payment was already captured and membership activated.",
        paymentRequestId: existingRequest.id,
        alreadyProcessed: true,
      });
    }

    const paypalClientId =
      process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET;
    const paypalApi =
      process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === "true"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    if (!paypalClientId || !paypalSecret) {
      return NextResponse.json(
        { error: "PayPal not configured" },
        { status: 500 },
      );
    }

    const authResponse = await fetch(`${paypalApi}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      return NextResponse.json(
        { error: "PayPal authentication failed" },
        { status: 502 },
      );
    }

    const paypalHeaders = {
      Authorization: `Bearer ${authData.access_token}`,
      "Content-Type": "application/json",
    };
    const orderResponse = await fetch(
      `${paypalApi}/v2/checkout/orders/${encodeURIComponent(orderID)}`,
      { headers: paypalHeaders },
    );
    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: "Unable to verify PayPal order" },
        { status: 502 },
      );
    }

    const purchaseUnit = orderData.purchase_units?.[0];
    if (
      purchaseUnit?.custom_id !== `${user.id}::${plan.id}` ||
      purchaseUnit.reference_id !== plan.id
    ) {
      return NextResponse.json(
        { error: "PayPal order does not belong to this user or plan" },
        { status: 403 },
      );
    }

    const captureResponse =
      orderData.status === "COMPLETED"
        ? null
        : await fetch(
            `${paypalApi}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
            { method: "POST", headers: paypalHeaders },
          );
    const captureData = captureResponse
      ? await captureResponse.json()
      : orderData;

    if (captureResponse && !captureResponse.ok) {
      return NextResponse.json(
        { error: "Failed to capture PayPal payment" },
        { status: 502 },
      );
    }

    const capture =
      captureData.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
    if (!capture || capture.status !== "COMPLETED" || !capture.id) {
      return NextResponse.json(
        { error: "Payment was not completed" },
        { status: 400 },
      );
    }

    const expectedAmount = Number(plan.price ?? 0).toFixed(2);
    if (
      capture.amount?.value !== expectedAmount ||
      capture.amount?.currency_code !== plan.currency
    ) {
      return NextResponse.json(
        {
          error:
            "Captured payment amount or currency does not match the selected plan",
        },
        { status: 400 },
      );
    }

    const { data: paymentRequest, error: insertError } = await (
      serviceClient as any
    )
      .from("payment_requests")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount: plan.price,
        currency: plan.currency,
        payment_method: "paypal",
        paypal_order_id: orderID,
        paypal_capture_id: capture.id,
        paypal_payer_id: orderData.payer?.payer_id || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      const { data: replayedRequest } = await (serviceClient as any)
        .from("payment_requests")
        .select("id, status")
        .eq("paypal_order_id", orderID)
        .maybeSingle();
      if (replayedRequest?.status === "approved") {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          paymentRequestId: replayedRequest.id,
        });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const activation = await activateMembershipForPayment(serviceClient, {
      paymentRequestId: paymentRequest.id,
    });

    return NextResponse.json({
      success: true,
      message: activation.already_activated
        ? "Payment was already captured and membership activated."
        : "Payment captured and membership activated!",
      captureData,
      paymentRequestId: paymentRequest.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
