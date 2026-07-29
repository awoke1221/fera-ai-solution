// ─── POST /api/auth/google — Google OAuth sign-in ───
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { headers } from "next/headers";

export async function POST() {
  try {
    const supabase = await createAdminClient();

    // Determine the origin dynamically: env var > Host header > production fallback
    const headersList = await headers();
    const host = headersList.get("host") || "www.feraaisolution.com";
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      `${protocol}://${host}` ||
      "https://www.feraaisolution.com";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
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
