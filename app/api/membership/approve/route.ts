// ─── POST /api/membership/approve (admin only) ───────
// Approve or reject a payment request and activate membership
import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
  isAdminUser,
} from "@/lib/supabase-admin";
import { activateMembershipForPayment } from "@/lib/membership";
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

    // If approved, create or update membership
    if (status === "approved") {
      const accessKey = createAccessKey();
      await (db as any)
        .from("payment_requests")
        .update({ admin_notes: adminNotes || null })
        .eq("id", paymentRequestId);

      const activation = await activateMembershipForPayment(db, {
        paymentRequestId,
        accessKey,
        reviewedBy: user.id,
      });
      const issuedAccessKey = activation.already_activated ? null : accessKey;

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
              ...(issuedAccessKey ? [`Access key: ${issuedAccessKey}`] : []),
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
        message: activation.already_activated
          ? "Membership was already activated."
          : "Payment approved and membership activated.",
        accessKey: issuedAccessKey,
        emailSent,
        request: updatedRequest,
      });
    }

    const { error: updateError } = await (db as any)
      .from("payment_requests")
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      } as any)
      .eq("id", paymentRequestId)
      .eq("status", "pending");

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
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
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
