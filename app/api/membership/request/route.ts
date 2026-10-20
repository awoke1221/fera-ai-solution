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

    const { planId, paymentMethod, screenshotUrl, paypalOrderId } =
      await request.json();

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { error: "Plan ID, amount, and payment method are required" },
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

    if (!["mobile_money", "bank_transfer", "paypal"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Unsupported payment method" },
        { status: 400 },
      );
    }

    const resolvedPlanId = plan.id;

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

    const { data: existingRequest, error: existingRequestError } = await (
      writeClient as any
    )
      .from("payment_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingRequestError) {
      return NextResponse.json(
        { error: "Unable to verify your existing payment requests." },
        { status: 500 },
      );
    }

    if (existingRequest) {
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

    const { data: activeMembership, error: membershipError } = await (
      writeClient as any
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
        { error: "Your paid membership is already active.", status: "approved" },
        { status: 409 },
      );
    }

    const { data, error } = await (writeClient as any)
      .from("payment_requests")
      .insert({
        user_id: user.id,
        plan_id: resolvedPlanId,
        amount: plan.price,
        currency: plan.currency,
        payment_method: paymentMethod,
        screenshot_url: screenshotUrl || null,
        paypal_order_id: paypalOrderId || null,
        status: "pending",
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "A payment request is already in progress. Please wait for its review.",
            status: "pending",
          },
          { status: 409 },
        );
      }
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
