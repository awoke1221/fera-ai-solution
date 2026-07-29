// ─── Premium Content Gate ────────────────────────────
// Wraps premium content. Shows login prompt if not authenticated,
// or upgrade prompt if logged in but no premium access.
"use client";

import Link from "next/link";

type PremiumGateProps = {
  hasPremium: boolean;
  user: any | null;
  children: React.ReactNode;
};

export function PremiumGate({ hasPremium, user, children }: PremiumGateProps) {
  if (hasPremium) {
    return <>{children}</>;
  }

  // Not logged in — prompt to sign in first
  if (!user) {
    return (
      <div className="premium-gate">
        <div className="premium-gate-icon">🔒</div>
        <h3>Sign in required</h3>
        <p>
          You need to sign in with your Google account to access this content.
        </p>
        <div className="premium-gate-actions">
          <Link href="/auth/login" className="btn solid">
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  // Logged in but no premium — prompt to upgrade
  return (
    <div className="premium-gate">
      <div className="premium-gate-icon">⭐</div>
      <h3>Premium Content</h3>
      <p>
        This content is available exclusively to premium members. Join the Stack
        Guides membership to unlock unlimited access to the full Stack Guides
        library and AI support tools.
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
