// ─── Require Auth Gate ──────────────────────────────
// Wraps pages that require login. Shows sign-in prompt if not authenticated.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import useAuth from "../store/useAuth";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const error = useAuth((s) => s.error);
  const fetchUser = useAuth((s) => s.fetchUser);

  useEffect(() => {
    // If user is still undefined (initial state), fetch the current session
    if (user === undefined && !loading && !error) fetchUser();
  }, [user, loading, error, fetchUser]);

  if (user === undefined && error) {
    return (
      <div className="premium-gate">
        <div className="premium-gate-shell">
          <div className="premium-gate-content">
            <div className="premium-gate-kicker">Session check</div>
            <h3>We couldn&apos;t verify your sign-in</h3>
            <p>
              Your session has not been signed out. Retry the connection check
              before signing in again.
            </p>
            <p role="alert">{error}</p>
            <div className="premium-gate-actions">
              <button
                type="button"
                className="btn solid"
                onClick={() => fetchUser(true)}
              >
                Retry session check
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || user === undefined) {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <div className="loading-spinner" />
        <p style={{ color: "var(--muted)", marginTop: 16 }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="premium-gate">
        <div className="premium-gate-icon">🔒</div>
        <h3>Sign in required</h3>
        <p>
          You need to sign in with your Google account before accessing
          membership features.
        </p>
        <div className="premium-gate-actions">
          <Link href="/auth/login" className="btn solid">
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
