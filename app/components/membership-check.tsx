// ─── Membership Check Wrapper ───────────────────────
// Checks if the current user has premium membership and
// gates children behind it. Shows login/upgrade prompts.
"use client";

import { useEffect, useState } from "react";
import { PremiumGate } from "./premium-gate";

type MembershipCheckProps = {
  children: React.ReactNode;
};

export function MembershipCheck({ children }: MembershipCheckProps) {
  const [user, setUser] = useState<any | null>(undefined);
  const [hasPremium, setHasPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const refreshMembership = () => {
      fetch("/api/membership/status", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) throw new Error("Membership status unavailable");
          return res.json();
        })
        .then((data) => {
          setUser(data?.user ?? null);
          setHasPremium(data?.hasPremium === true);
        })
        .catch(() => {
          setUser(null);
          setHasPremium(false);
        })
        .finally(() => setChecking(false));
    };

    refreshMembership();

    const intervalId = window.setInterval(refreshMembership, 5000);
    window.addEventListener("focus", refreshMembership);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshMembership);
    };
  }, []);

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

  return (
    <PremiumGate hasPremium={hasPremium} user={user}>
      {children}
    </PremiumGate>
  );
}
