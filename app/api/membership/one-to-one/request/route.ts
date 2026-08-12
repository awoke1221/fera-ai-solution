import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmailViaSendGrid } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { preferred_time, message } = body || {};

    // Check membership
    const membershipRes = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .maybeSingle();

    if (!membershipRes.data)
      return NextResponse.json({ error: "Premium required" }, { status: 403 });

    const fromEmail = process.env.FROM_EMAIL || "no-reply@feraaisolution.com";
    const support = process.env.SUPPORT_EMAIL || fromEmail;

    const html = `<p>New 1:1 coaching request from <strong>${user.email}</strong></p>
      <p>Preferred time: ${preferred_time || "(not provided)"}</p>
      <p>Message: ${message || "(none)"}</p>
      <p>Manage requests in the admin dashboard.</p>`;

    await sendEmailViaSendGrid({
      to: support,
      subject: `1:1 Coaching Request — ${user.email}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/membership/one-to-one/request", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
