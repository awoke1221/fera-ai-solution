// ─── GET /api/auth/callback — OAuth redirect handler ─
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/membership/dashboard";

  // Use NEXT_PUBLIC_SITE_URL when set (production), otherwise derive from request.
  // Hard-code the production domain as a final fallback so users are never
  // redirected to localhost in production.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const requestOrigin = new URL(request.url).origin;
  const origin = siteUrl || requestOrigin || "https://www.feraaisolution.com";

  // Debug: log what origin is being used
  console.log(
    "[auth/callback] code:",
    code ? "present" : "missing",
    "siteUrl:",
    siteUrl,
    "requestOrigin:",
    requestOrigin,
    "origin:",
    origin,
    "next:",
    next,
  );

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const cookieStore = await cookies();

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // ignore
            }
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // 307 preserves the redirect method and is faster than 302
        const response = NextResponse.redirect(`${origin}${next}`, 307);
        // Hint the browser to prefetch the target page immediately
        response.headers.set("Cache-Control", "private, no-cache");
        return response;
      }
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
