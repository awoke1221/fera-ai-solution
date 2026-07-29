// ─── Sign Up Page — Google-only ──────────────────────
"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";

export default function SignupPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      // Use the server API so the redirect URL is built server-side
      // with the production domain (NEXT_PUBLIC_SITE_URL), avoiding
      // localhost redirects from the client-side PKCE flow.
      const next =
        new URLSearchParams(window.location.search).get("next") ||
        "/membership";
      const res = await fetch(
        `/api/auth/google?next=${encodeURIComponent(next)}`,
        {
          method: "POST",
        },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Google sign-in failed");
      if (d.url) window.location.href = d.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Get Started</div>
          <h1 className="h-display">Create your account</h1>
          <p className="lead">
            Join Fera AI Solutions with your Google account and unlock premium
            system design tutorials, templates, and expert guidance.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="auth-page-form">
            <div className="auth-form-card google-only">
              <h2>Sign Up</h2>
              <p className="auth-description">
                One click with Google and you&apos;re in. No forms, no
                passwords.
              </p>

              {error && <p className="form-message error">{error}</p>}

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                {googleLoading
                  ? "Redirecting to Google..."
                  : "Sign up with Google"}
              </button>

              <p className="auth-alt">
                Already have an account?{" "}
                <Link href="/auth/login">Sign in with Google</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
