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

  const accessFeatures = [
    "AI-powered stack recommendations",
    "Architecture diagrams and tool mapping",
    "Cost planning and launch guidance",
  ];

  if (!user) {
    return (
      <div className="premium-gate">
        <div className="premium-gate-shell">
          <div className="premium-gate-visual">
            <div className="premium-gate-icon">🔒</div>
          </div>
          <div className="premium-gate-content">
            <div className="premium-gate-kicker">Member access</div>
            <h3>Sign in to unlock premium Stack Advisor access</h3>
            <p>
              Log in to plan your ideal stack, compare tools, and turn product
              ideas into a cleaner, more scalable architecture.
            </p>
            <ul className="premium-gate-list">
              {accessFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="premium-gate-actions">
              <Link href="/auth/login?next=/membership" className="btn solid">
                Sign In with Google
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-gate">
      <div className="premium-gate-shell premium-gate-upgrade">
        <div className="premium-gate-visual">
          <div className="premium-gate-icon">⭐</div>
        </div>
        <div className="premium-gate-content">
          <div className="premium-gate-kicker">Upgrade your access</div>
          <h3>Unlock Stack Guides + AI-ready architecture support</h3>
          <p>
            Your membership gives you deeper guidance for product planning,
            technical decision-making, and production-ready tooling.
          </p>
          <div className="premium-gate-plans">
            <PlanHighlight
              title="Local members"
              price="1000 birr / month"
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
      </div>
    </div>
  );
}
