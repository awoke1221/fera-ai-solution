// ─── Premium Content Gate ────────────────────────────
// Wraps premium content. Shows upgrade prompt if no access.
"use client";

import Link from "next/link";

type PremiumGateProps = {
  hasPremium: boolean;
  children: React.ReactNode;
};

export function PremiumGate({ hasPremium, children }: PremiumGateProps) {
  if (hasPremium) {
    return <>{children}</>;
  }

  return (
    <div className="premium-gate">
      <div className="premium-gate-icon">🔒</div>
      <h3>Premium Content</h3>
      <p>
        This content is available exclusively to premium members. Upgrade your
        membership to unlock the full system design tutorial library.
      </p>
      <div className="premium-gate-actions">
        <Link href="/membership" className="btn solid">
          View Membership Plans
        </Link>
        <Link href="/system-design" className="btn">
          Browse Free Tutorials
        </Link>
      </div>
    </div>
  );
}
