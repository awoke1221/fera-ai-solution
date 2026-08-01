// ─── POST /api/membership/request ────────────────────
// Submit a new payment request (screenshot or PayPal)
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
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

    await ensureProfileForUser(user);

    const {
      planId,
      amount,
      currency,
      paymentMethod,
      screenshotUrl,
      paypalOrderId,
    } = await request.json();

    if (!planId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Plan ID, amount, and payment method are required" },
        { status: 400 },
      );
    }

    const planLookup = await supabase
      .from("membership_plans")
      .select("id")
      .eq("id", planId)
      .maybeSingle();

    const resolvedPlanId = planLookup.data?.id || planId;

    // Use the admin service client for writes that require bypassing RLS
    const serviceClient = getAdminServiceClient();

    if (!serviceClient) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set. Admin client required to create payment requests.",
        },
        { status: 500 },
      );
    }

    const writeClient = serviceClient;

    const { data: existingRequest } = await (writeClient as any)
      .from("payment_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (existingRequest?.status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your payment request is already pending review. You do not need to submit it again.",
          status: "pending",
          paymentRequestId: existingRequest.id,
        },
        { status: 409 },
      );
    }

    if (existingRequest?.status === "approved") {
      return NextResponse.json(
        {
          error: "Your membership is already approved and active.",
          status: "approved",
        },
        { status: 409 },
      );
    }

    const { data, error } = await (writeClient as any)
      .from("payment_requests")
      .insert({
        user_id: user.id,
        plan_id: resolvedPlanId,
        amount,
        currency: currency || "USD",
        payment_method: paymentMethod,
        screenshot_url: screenshotUrl || null,
        paypal_order_id: paypalOrderId || null,
        status: "pending",
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      paymentRequest: data,
      message: "Payment request submitted! Waiting for admin approval.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
