import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Zoom client not configured");

  const tokenUrl = `https://zoom.us/oauth/token?grant_type=authorization_code&code=${encodeURIComponent(
    code,
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoom token exchange failed: ${text}`);
  }

  return res.json();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "/membership";
    if (!code)
      return NextResponse.json({ error: "Missing code" }, { status: 400 });

    // Build redirect uri the same way as the start route
    const host = request.headers.get("host") || "www.feraaisolution.com";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const origin = siteUrl || `${protocol}://${host}`;
    const redirectUri = `${origin}/api/membership/zoom/oauth/callback`;

    const tokenResp = await exchangeCodeForToken(code, redirectUri);

    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Save tokens
    const expiresAt = tokenResp.expires_in
      ? new Date(Date.now() + tokenResp.expires_in * 1000).toISOString()
      : null;

    await supabase
      .from("zoom_tokens")
      .upsert(
        {
          user_id: user.id,
          access_token: tokenResp.access_token,
          refresh_token: tokenResp.refresh_token,
          scope: tokenResp.scope || null,
          expires_at: expiresAt,
        },
        { onConflict: ["user_id"] },
      )
      .select();

    // Redirect back to site
    const target = decodeURIComponent(state);
    return NextResponse.redirect(new URL(target, origin));
  } catch (err: any) {
    console.error("/api/membership/zoom/oauth/callback", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
