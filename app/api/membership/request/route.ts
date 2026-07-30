// ─── POST /api/membership/request ────────────────────
// Submit a new payment request (screenshot or PayPal)
import { NextResponse } from "next/server";
import { createAdminClient, ensureProfileForUser } from "@/lib/supabase-admin";

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
    const serviceClient = await import("@/lib/supabase-admin").then((m) =>
      m.getAdminServiceClient(),
    );

    const writeClient = serviceClient || supabase;

    const { data, error } = await writeClient
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
      })
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
