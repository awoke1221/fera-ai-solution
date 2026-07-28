// ─── Sign Up Page ────────────────────────────────────
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState<"local" | "global">("local");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, region }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess(data.message || "Account created! Please check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/membership/dashboard`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw new Error(error.message);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      const res = await fetch("/api/auth/google", { method: "POST" });
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
            Join Fera AI Solutions and unlock premium system design tutorials,
            templates, and expert guidance.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="auth-page-form">
            {success ? (
              <div className="auth-form-card success-card">
                <div className="success-icon">✅</div>
                <h2>Account Created!</h2>
                <p>{success}</p>
                <p>
                  Once confirmed, you can{" "}
                  <Link href="/auth/login">sign in here</Link>.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="auth-form-card">
                  <h2>Sign Up</h2>

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

                  <div className="field">
                    <label htmlFor="region">Payment Region</label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) =>
                        setRegion(e.target.value as "local" | "global")
                      }
                    >
                      <option value="local">
                        Local — Mobile Money / Bank Transfer
                      </option>
                      <option value="global">Global — PayPal</option>
                    </select>
                  </div>

                  {error && <p className="form-message error">{error}</p>}

                  <button
                    type="submit"
                    className="btn solid"
                    disabled={loading}
                    style={{ width: "100%" }}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                <div className="auth-divider">
                  <span className="auth-divider-line" />
                  <span className="auth-divider-text">or continue with</span>
                  <span className="auth-divider-line" />
                </div>

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
                  {googleLoading ? "Redirecting..." : "Sign up with Google"}
                </button>

                <p className="auth-alt">
                  Already have an account?{" "}
                  <Link href="/auth/login">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
