// Checks the signed-in user's Stack Advisor entitlement before rendering tools.
"use client";

import { useCallback, useEffect, useState } from "react";
import { PremiumGate } from "./premium-gate";
import useAuth from "../store/useAuth";

type MembershipCheckProps = {
  children: React.ReactNode;
};

type AccessState = "loading" | "ready" | "error";

export function MembershipCheck({ children }: MembershipCheckProps) {
  const user = useAuth((state) => state.user);
  const authLoading = useAuth((state) => state.loading);
  const authError = useAuth((state) => state.error);
  const fetchUser = useAuth((state) => state.fetchUser);
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [hasPremium, setHasPremium] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    setAccessState("loading");
    setAccessError(null);

    try {
      const response = await fetch("/api/membership/access", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to verify Stack Advisor access right now.",
        );
      }
      if (typeof data?.hasPremium !== "boolean") {
        throw new Error("The access service returned an invalid response.");
      }

      setHasPremium(data?.hasPremium === true);
      setAccessState("ready");
    } catch (error) {
      setAccessError(
        error instanceof Error
          ? error.message
          : "Unable to verify Stack Advisor access right now.",
      );
      setAccessState("error");
    }
  }, []);

  useEffect(() => {
    if (user === undefined) {
      if (!authLoading && authError) {
        setAccessError(authError);
        setAccessState("error");
      } else if (!authLoading) {
        void fetchUser();
      }
      return;
    }

    if (user === null) {
      setHasPremium(false);
      setAccessError(null);
      setAccessState("ready");
      return;
    }

    void checkAccess();
  }, [user, authLoading, authError, checkAccess, fetchUser]);

  useEffect(() => {
    if (!user) return;

    const refreshAccess = () => void checkAccess();
    window.addEventListener("focus", refreshAccess);
    return () => window.removeEventListener("focus", refreshAccess);
  }, [user, checkAccess]);

  const retry = async () => {
    if (user === undefined) {
      await fetchUser(true);
      const refreshedUser = useAuth.getState().user;
      if (refreshedUser === null) {
        setHasPremium(false);
        setAccessError(null);
        setAccessState("ready");
        return;
      }
      if (!refreshedUser) {
        const refreshedError = useAuth.getState().error;
        if (refreshedError) {
          setAccessError(refreshedError);
          setAccessState("error");
        }
        return;
      }
    }

    await checkAccess();
  };

  if (user === undefined && (authLoading || accessState === "loading")) {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <div className="loading-spinner" />
        <p style={{ color: "var(--muted)", marginTop: 16 }}>
          Checking your account...
        </p>
      </div>
    );
  }

  if (accessState === "loading") {
    return (
      <div style={{ padding: "120px 0", textAlign: "center" }}>
        <div className="loading-spinner" />
        <p style={{ color: "var(--muted)", marginTop: 16 }}>
          Checking Stack Advisor access...
        </p>
      </div>
    );
  }

  if (accessState === "error") {
    const signedIn = Boolean(user);
    return (
      <div className="premium-gate">
        <div className="premium-gate-shell">
          <div className="premium-gate-visual">
            <div className="premium-gate-icon">◌</div>
          </div>
          <div className="premium-gate-content">
            <div className="premium-gate-kicker">
              {signedIn ? "Access check" : "Session check"}
            </div>
            <h3>
              {signedIn
                ? "You’re signed in; access could not be checked"
                : "We couldn’t verify your sign-in"}
            </h3>
            <p>
              {signedIn
                ? `Signed in as ${user?.email || "your account"}. Your account is still signed in; retry the access check.`
                : "Your session has not been signed out. Retry the connection check before signing in again."}
            </p>
            {accessError && <p role="alert">{accessError}</p>}
            <div className="premium-gate-actions">
              <button type="button" className="btn solid" onClick={retry}>
                {signedIn ? "Retry access check" : "Retry session check"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PremiumGate hasPremium={hasPremium} user={user ?? null}>
      {children}
    </PremiumGate>
  );
}
