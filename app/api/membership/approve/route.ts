// ─── POST /api/membership/approve (admin only) ───────
// Approve or reject a payment request and activate membership
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

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { paymentRequestId, status, adminNotes } = await request.json();

    if (!paymentRequestId || !status) {
      return NextResponse.json(
        { error: "Payment request ID and status are required" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 },
      );
    }

    // Get the payment request
    const { data: paymentRequest, error: fetchError } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("id", paymentRequestId)
      .single();

    if (fetchError || !paymentRequest) {
      return NextResponse.json(
        { error: "Payment request not found" },
        { status: 404 },
      );
    }

    // Update payment request status
    const { error: updateError } = await supabase
      .from("payment_requests")
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", paymentRequestId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, create or update membership
    if (status === "approved") {
      const { data: plan } = await supabase
        .from("membership_plans")
        .select("duration_days")
        .eq("id", paymentRequest.plan_id)
        .single();

      const durationDays = plan?.duration_days || 30;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Check if user already has a membership
      const { data: existingMembership } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", paymentRequest.user_id)
        .maybeSingle();

      if (existingMembership) {
        // Update existing membership
        await supabase
          .from("memberships")
          .update({
            plan_id: paymentRequest.plan_id,
            payment_request_id: paymentRequestId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
          })
          .eq("id", existingMembership.id);
      } else {
        // Create new membership
        await supabase.from("memberships").insert({
          user_id: paymentRequest.user_id,
          plan_id: paymentRequest.plan_id,
          payment_request_id: paymentRequestId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment request ${status} successfully.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
