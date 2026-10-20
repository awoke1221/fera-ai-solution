"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/app/store/useAuth";

type AuthFormProps = {
  mode: "login" | "signup";
};

function getSafeDestination(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value)
  ) {
    return "/membership";
  }

  return value;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const destination = getSafeDestination(nextPath);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState<"local" | "global">("local");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isSignup = mode === "signup";
  const switchHref = nextPath
    ? `/auth/${isSignup ? "login" : "signup"}?next=${encodeURIComponent(nextPath)}`
    : `/auth/${isSignup ? "login" : "signup"}`;

  const finishSignIn = async (expectedUserId: string) => {
    await useAuth.getState().fetchUser(true);
    const authState = useAuth.getState();
    if (
      !authState.user ||
      authState.user.id !== expectedUserId ||
      authState.error
    ) {
      throw new Error(
        authState.error ||
          "We couldn’t verify the account session. Please try signing in again.",
      );
    }

    router.replace(destination);
    router.refresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSignup
              ? { email, password, fullName, region }
              : { email, password },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to authenticate your account.");
      }

      if (isSignup && !data?.authenticated) {
        setSuccess(
          data?.message ||
            "Account created. Check your email to confirm it, then sign in.",
        );
        return;
      }

      if (!data?.authenticated) {
        throw new Error("The sign-in service did not create an active session.");
      }
      if (typeof data?.user?.id !== "string") {
        throw new Error("The sign-in service returned an invalid account.");
      }

      await finishSignIn(data.user.id);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to authenticate your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/auth/google?next=${encodeURIComponent(destination)}`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Google sign-in could not be started.");
      }

      window.location.assign(data.url);
    } catch (googleError) {
      setError(
        googleError instanceof Error
          ? googleError.message
          : "Google sign-in could not be started.",
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page-form">
      <div className="auth-form-card">
        <h2>{isSignup ? "Create your account" : "Sign in"}</h2>
        <p className="auth-description">
          {isSignup
            ? "Create an account with email and password, or continue with Google."
            : "Sign in with email and password, or continue with Google."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <>
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="region">Region</label>
                <select
                  id="region"
                  value={region}
                  onChange={(event) =>
                    setRegion(event.target.value as "local" | "global")
                  }
                >
                  <option value="local">Local</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 6 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="form-message error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="form-message success" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="btn solid auth-submit"
            disabled={loading || googleLoading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
        >
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="auth-alt">
          {isSignup ? "Already have an account?" : "New to Fera AI Solutions?"}{" "}
          <Link href={switchHref}>
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
