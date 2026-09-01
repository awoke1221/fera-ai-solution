// ─── POST /api/auth/google — Google OAuth sign-in ───
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/membership";
    const supabase = await createAdminClient();

    // Determine the origin dynamically: env var > Host header > production fallback
    const headersList = await headers();
    const host = headersList.get("host") || "www.feraaisolution.com";
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const origin =
      siteUrl || `${protocol}://${host}` || "https://www.feraaisolution.com";
    const redirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

    // Debug: log what redirect URL is being sent
    console.log(
      "[auth/google] siteUrl:",
      siteUrl,
      "host:",
      host,
      "protocol:",
      protocol,
      "origin:",
      origin,
      "redirectTo:",
      redirectTo,
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
