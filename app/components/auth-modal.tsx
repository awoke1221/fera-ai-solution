// ─── Auth Modal — Login / Signup ─────────────────────
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import useAuth from "@/app/store/useAuth";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  defaultMode?: "login" | "signup";
};

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState<"local" | "global">("local");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const body: Record<string, string> = { email, password };
      if (mode === "signup") {
        body.fullName = fullName;
        body.region = region;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      onAuthSuccess();
      try {
        const fetchUser = useAuth.getState().fetchUser;
        fetchUser && (await fetchUser());
      } catch {
        // ignore
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

      if (d.url) {
        window.location.href = d.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          ✕
        </button>

        <div className="auth-header">
          <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p>
            {mode === "login"
              ? "Sign in to access your membership."
              : "Join Fera AI Solutions and unlock premium content."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          {mode === "signup" && (
            <div className="field">
              <label htmlFor="region">Region</label>
              <select
                id="region"
                value={region}
                onChange={(e) =>
                  setRegion(e.target.value as "local" | "global")
                }
              >
                <option value="local">
                  Local (Mobile Money / Bank Transfer)
                </option>
                <option value="global">Global (PayPal)</option>
              </select>
            </div>
          )}

          {error && <p className="form-message error">{error}</p>}

          <button
            type="submit"
            className="btn solid auth-submit"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* ── Google OAuth Divider ──────────────── */}
        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or continue with</span>
          <span className="auth-divider-line" />
        </div>

        {/* ── Google Button ─────────────────────── */}
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
            ? "Redirecting..."
            : `Sign ${mode === "login" ? "in" : "up"} with Google`}
        </button>

        <div className="auth-switch">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
