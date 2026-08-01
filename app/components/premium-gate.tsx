// ─── Premium Content Gate ────────────────────────────
// Wraps premium content. Shows login prompt if not authenticated,
// or a rich upgrade prompt if logged in but no premium access.
"use client";

import Link from "next/link";

type PremiumGateProps = {
  hasPremium: boolean;
  user: any | null;
  children: React.ReactNode;
};

function PlanHighlight({
  title,
  price,
  description,
}: {
  title: string;
  price: string;
  description: string;
}) {
  return (
    <div className="premium-gate-plan-card">
      <strong>{title}</strong>
      <div className="premium-gate-plan-price">{price}</div>
      <p>{description}</p>
    </div>
  );
}

export function PremiumGate({ hasPremium, user, children }: PremiumGateProps) {
  if (hasPremium) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="premium-gate">
        <div className="premium-gate-icon">🔒</div>
        <h3>Sign in to unlock premium access</h3>
        <p>
          Log in with your account to view the Stack Guides and AI support
          tools. After sign-in you will be taken to the membership offer.
        </p>
        <div className="premium-gate-actions">
          <Link href="/auth/login?next=/membership" className="btn solid">
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-gate">
      <div className="premium-gate-icon">⭐</div>
      <h3>Unlock Stack Guides + AI support</h3>
      <p>
        Your membership unlocks unlimited access to every Stack Guide,
        architecture walkthroughs, and AI support tools. Ethiopian members pay
        500 birr per month and diaspora members pay $10 per month.
      </p>
      <div className="premium-gate-plans">
        <PlanHighlight
          title="Local members"
          price="500 birr / month"
          description="Telebirr, CBE Birr, or bank transfer"
        />
        <PlanHighlight
          title="Diaspora members"
          price="$10 / month"
          description="Secure monthly PayPal checkout"
        />
      </div>
      <div className="premium-gate-actions">
        <Link href="/membership" className="btn solid">
          View Membership Plans
        </Link>
      </div>
    </div>
  );
}
