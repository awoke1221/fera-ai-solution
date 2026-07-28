// ─── POST /api/membership/request ────────────────────
// Submit a new payment request (screenshot or PayPal)
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

    const { data, error } = await supabase
      .from("payment_requests")
      .insert({
        user_id: user.id,
        plan_id: planId,
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
