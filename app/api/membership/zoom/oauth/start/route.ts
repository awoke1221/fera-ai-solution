import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const envClientId = process.env.ZOOM_CLIENT_ID;
    if (!envClientId) {
      return NextResponse.json(
        { error: "Zoom client not configured" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const nextPath = searchParams.get("next") || "/membership";

    const headersList = await headers();
    const host = headersList.get("host") || "www.feraaisolution.com";
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const origin = siteUrl || `${protocol}://${host}`;

    const redirectUri = `${origin}/api/membership/zoom/oauth/callback`;

    const state = encodeURIComponent(nextPath);

    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${encodeURIComponent(envClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.json({ url: zoomAuthUrl });
  } catch (err) {
    console.error("/api/membership/zoom/oauth/start", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
