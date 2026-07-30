// ─── POST /api/membership/approve (admin only) ───────
// Approve or reject a payment request and activate membership
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
  isAdminUser,
} from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const serviceClient = getAdminServiceClient();

    // Ensure request is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureProfileForUser(user);

    const isAdmin = await isAdminUser(user);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Require the admin service client for admin operations to bypass RLS
    if (!serviceClient) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set. Admin client required to approve requests.",
        },
        { status: 500 },
      );
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

    // Use service client for admin reads/writes (bypasses RLS)
    const db = serviceClient;

    // Get the payment request
    const { data: paymentRequest, error: fetchError } = await (db as any)
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
    const { error: updateError } = await (db as any)
      .from("payment_requests")
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      } as any)
      .eq("id", paymentRequestId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, create or update membership
    if (status === "approved") {
      const { data: plan } = await (db as any)
        .from("membership_plans")
        .select("duration_days")
        .eq("id", paymentRequest.plan_id)
        .single();

      const durationDays = plan?.duration_days || 30;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Check if user already has a membership
      const { data: existingMembership } = await (db as any)
        .from("memberships")
        .select("id")
        .eq("user_id", paymentRequest.user_id)
        .maybeSingle();

      if (existingMembership) {
        // Update existing membership
        await (db as any)
          .from("memberships")
          .update({
            plan_id: paymentRequest.plan_id,
            payment_request_id: paymentRequestId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
          } as any)
          .eq("id", existingMembership.id);
      } else {
        // Create new membership
        await (db as any).from("memberships").insert({
          user_id: paymentRequest.user_id,
          plan_id: paymentRequest.plan_id,
          payment_request_id: paymentRequestId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        } as any);
      }
    }

    // Return updated payment request for UI refresh
    const { data: updatedRequest } = await (db as any)
      .from("payment_requests")
      .select(
        "*, membership_plans(name), profiles!payment_requests_user_id_fkey(email, full_name)",
      )
      .eq("id", paymentRequestId)
      .single();

    return NextResponse.json({
      success: true,
      message: `Payment request ${status} successfully.`,
      request: updatedRequest,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
