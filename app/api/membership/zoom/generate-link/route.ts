import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import nodeCrypto from "crypto";

function makeToken() {
  return nodeCrypto.randomUUID();
}

function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Check premium membership
    const membershipRes = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .maybeSingle();

    if (!membershipRes.data) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    const body = await request.json();
    const sessionId = body.session_id;
    if (!sessionId)
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 },
      );

    const raw = makeToken();
    const expiresAt =
      body.expires_at ||
      new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    const secret = process.env.MEETING_LINK_SECRET || null;
    let token = raw;
    if (secret) {
      const payload = `${raw}|${sessionId}|${expiresAt}`;
      const hmac = nodeCrypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest();
      const sig = base64Url(Buffer.from(hmac));
      token = `${raw}.${expiresAt}.${sig}`;
    }

    const res = await supabase
      .from("meeting_links")
      .insert({
        session_id: sessionId,
        zoom_meeting_id: body.zoom_meeting_id || null,
        token,
        created_by: user.id,
        expires_at: expiresAt,
        single_use: true,
      })
      .select()
      .single();

    if (res.error)
      return NextResponse.json({ error: res.error.message }, { status: 400 });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;
    const link = `${siteUrl}/api/membership/zoom/join/${token}`;
    return NextResponse.json({ link, token, expires_at: expiresAt });
  } catch (err: any) {
    console.error("/api/membership/zoom/generate-link", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
