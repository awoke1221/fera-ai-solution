// ─── Membership Check Wrapper ───────────────────────
// Checks if the current user has premium membership and
// gates children behind it. Shows login/upgrade prompts.
"use client";

import { useCallback, useEffect, useState } from "react";
import { PremiumGate } from "./premium-gate";
import useAuth from "../store/useAuth";

type MembershipCheckProps = {
  children: React.ReactNode;
};

export function MembershipCheck({ children }: MembershipCheckProps) {
  const authUser = useAuth((state) => state.user);
  const authLoading = useAuth((state) => state.loading);
  const authError = useAuth((state) => state.error);
  const fetchUser = useAuth((state) => state.fetchUser);
  const [user, setUser] = useState<any | null>(undefined);
  const [hasPremium, setHasPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const refreshMembership = useCallback(async () => {
    try {
      const response = await fetch("/api/membership/status", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || "Membership status is temporarily unavailable.",
        );
      }
      setUser(data?.user ?? null);
      setHasPremium(data?.hasPremium === true);
      setHasPendingPayment(data?.hasPendingPayment === true);
      setStatusError(null);
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Membership status is temporarily unavailable.",
      );
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (authUser === undefined && !authLoading && !authError) {
      void fetchUser();
    }
  }, [authUser, authLoading, authError, fetchUser]);

  useEffect(() => {
    void refreshMembership();

    window.addEventListener("focus", refreshMembership);

    return () => {
      window.removeEventListener("focus", refreshMembership);
    };
  }, [refreshMembership]);

  useEffect(() => {
    if (!hasPendingPayment) return;

    const intervalId = window.setInterval(() => {
      void refreshMembership();
    }, 15_000);
    return () => window.clearInterval(intervalId);
  }, [hasPendingPayment, refreshMembership]);

  if (checking) {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <div className="loading-spinner" />
        <p style={{ color: "var(--muted)", marginTop: 16 }}>
          Checking access...
        </p>
      </div>
    );
  }

  if (user === undefined) {
    if (authUser) {
      return (
        <div className="premium-gate">
          <div className="premium-gate-shell">
            <div className="premium-gate-visual">
              <div className="premium-gate-icon">◌</div>
            </div>
            <div className="premium-gate-content">
              <div className="premium-gate-kicker">Membership status</div>
              <h3>You&apos;re signed in, but access is still being checked</h3>
              <p>
                Signed in as {authUser.email || "your account"}. We couldn&apos;t
                load your membership details, so premium access cannot be
                confirmed yet.
              </p>
              {statusError && <p role="alert">{statusError}</p>}
              <div className="premium-gate-actions">
                <button
                  type="button"
                  className="btn solid"
                  onClick={() => {
                    setChecking(true);
                    void refreshMembership();
                  }}
                >
                  Retry membership check
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (authUser === null) {
      return (
        <PremiumGate hasPremium={false} user={null}>
          {children}
        </PremiumGate>
      );
    }

    if (authLoading) {
      return (
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <div className="loading-spinner" />
          <p style={{ color: "var(--muted)", marginTop: 16 }}>
            Checking authentication...
          </p>
        </div>
      );
    }

    return (
      <div className="premium-gate">
        <div className="premium-gate-shell">
          <div className="premium-gate-visual">
            <div className="premium-gate-icon">◌</div>
          </div>
          <div className="premium-gate-content">
            <div className="premium-gate-kicker">Session check</div>
            <h3>We couldn&apos;t verify your sign-in</h3>
            <p>
              Your session has not been signed out. Please retry the connection
              check before signing in again.
            </p>
            {statusError && <p role="alert">{statusError}</p>}
            <div className="premium-gate-actions">
              <button
                type="button"
                className="btn solid"
                onClick={() => {
                  setChecking(true);
                  void fetchUser(true).then(() => refreshMembership());
                }}
              >
                Retry session check
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PremiumGate hasPremium={hasPremium} user={user}>
      {children}
    </PremiumGate>
  );
}
