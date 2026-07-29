// ─── Require Auth Gate ──────────────────────────────
// Wraps pages that require login. Shows sign-in prompt if not authenticated.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const [user, setUser] = useState<any | null>(undefined); // undefined = loading
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
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
