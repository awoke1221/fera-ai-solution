// ─── POST /api/membership/approve (admin only) ───────
// Approve or reject a payment request and activate membership
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
  isAdminUser,
} from "@/lib/supabase-admin";
import { buildMembershipActivation } from "@/lib/membership";
import { sendEmailViaResend } from "@/lib/email";
import { randomBytes } from "node:crypto";

function createAccessKey() {
  return `PREMIUM-${randomBytes(18).toString("hex").toUpperCase()}`;
}

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
      const accessKey = createAccessKey();
      const activation = buildMembershipActivation({
        userId: paymentRequest.user_id,
        planId: paymentRequest.plan_id,
        paymentRequestId,
        accessKey,
        startDate,
        durationDays,
      });

      // Check if user already has a membership
      const { data: existingMembership } = await (db as any)
        .from("memberships")
        .select("id")
        .eq("user_id", paymentRequest.user_id)
        .maybeSingle();

      if (existingMembership) {
        const { error: membershipError } = await (db as any)
          .from("memberships")
          .update({
            ...activation,
            user_id: paymentRequest.user_id,
          } as any)
          .eq("id", existingMembership.id);
        if (membershipError) {
          return NextResponse.json(
            { error: membershipError.message },
            { status: 500 },
          );
        }
      } else {
        const { error: membershipError } = await (db as any)
          .from("memberships")
          .insert(activation as any);
        if (membershipError) {
          return NextResponse.json(
            { error: membershipError.message },
            { status: 500 },
          );
        }
      }

      const { data: memberProfile } = await (db as any)
        .from("profiles")
        .select("email, full_name")
        .eq("id", paymentRequest.user_id)
        .maybeSingle();

      let emailSent = false;
      if (memberProfile?.email) {
        try {
          await sendEmailViaResend({
            to: memberProfile.email,
            subject: "Your FERA AI premium access is approved",
            text: [
              `Hi ${memberProfile.full_name || "there"},`,
              "",
              "Your payment has been approved and your premium membership is now active.",
              `Access key: ${accessKey}`,
              "",
              "Sign in at https://www.feraaisolution.com and open Stack Advisor to use your premium access.",
            ].join("\n"),
          });
          emailSent = true;
        } catch (emailError) {
          console.error("Unable to send membership access email", emailError);
        }
      }

      const { data: updatedRequest } = await (db as any)
        .from("payment_requests")
        .select(
          "*, membership_plans(name), profiles!payment_requests_user_id_fkey(email, full_name)",
        )
        .eq("id", paymentRequestId)
        .single();

      return NextResponse.json({
        success: true,
        message: "Payment approved and membership activated.",
        accessKey,
        emailSent,
        request: updatedRequest,
      });
    }

    const { error: revokeError } = await (db as any)
      .from("memberships")
      .update({
        is_active: false,
        access_key: null,
        access_key_issued_at: null,
      })
      .eq("user_id", paymentRequest.user_id)
      .eq("payment_request_id", paymentRequestId);
    if (revokeError) {
      return NextResponse.json({ error: revokeError.message }, { status: 500 });
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
