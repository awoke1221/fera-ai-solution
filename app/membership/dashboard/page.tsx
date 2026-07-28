// ─── Membership Dashboard Page ───────────────────────
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/app/components/site-shell";
import { AuthModal } from "@/app/components/auth-modal";

export default function MembershipDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/membership/status");
      const d = await res.json();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAuthSuccess = () => {
    fetchStatus();
  };

  const handleLogout = async () => {
    // For now, redirect to login page
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <h1 className="h-display">Dashboard</h1>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="loading-shell">
              <div className="loading-spinner" />
              <p>Loading dashboard...</p>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  if (!data?.user) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Dashboard</div>
            <h1 className="h-display">Sign in required</h1>
            <p className="lead">
              Please sign in to view your membership dashboard.
            </p>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="dash-auth-prompt">
              <button className="btn solid" onClick={() => setShowAuth(true)}>
                Sign In
              </button>
            </div>
          </div>
        </section>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </SiteShell>
    );
  }

  const { user, profile, membership, latestPayment } = data;
  const daysRemaining = membership
    ? Math.max(
        0,
        Math.ceil(
          (new Date(membership.end_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Dashboard</div>
          <h1 className="h-display">
            Welcome, {profile?.full_name || user.email}
          </h1>
          <p className="lead">Manage your membership and account settings.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="dash-grid">
            {/* Membership Status Card */}
            <div className="dash-card membership-status-card">
              <h2>Membership Status</h2>
              {membership ? (
                <div className="status-active">
                  <div className="status-badge active">Premium Active</div>
                  <div className="status-details">
                    <div className="detail-row">
                      <span>Plan</span>
                      <strong>
                        {membership.membership_plans?.name || "Premium"}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Days Remaining</span>
                      <strong>{daysRemaining} days</strong>
                    </div>
                    <div className="detail-row">
                      <span>Expires</span>
                      <strong>
                        {new Date(membership.end_date).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>
                  <Link href="/system-design" className="btn solid">
                    Access Premium Content
                  </Link>
                </div>
              ) : (
                <div className="status-inactive">
                  <div className="status-badge inactive">No Active Plan</div>
                  <p>
                    You don&apos;t have an active membership. Choose a plan to
                    get started.
                  </p>
                  <Link href="/membership" className="btn solid">
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* Latest Payment Card */}
            <div className="dash-card payment-status-card">
              <h2>Latest Payment</h2>
              {latestPayment ? (
                <div className="payment-info">
                  <div className="detail-row">
                    <span>Status</span>
                    <strong
                      className={`payment-status-${latestPayment.status}`}
                    >
                      {latestPayment.status.charAt(0).toUpperCase() +
                        latestPayment.status.slice(1)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Amount</span>
                    <strong>
                      ${latestPayment.amount} {latestPayment.currency}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Method</span>
                    <strong>
                      {latestPayment.payment_method === "paypal"
                        ? "PayPal"
                        : latestPayment.payment_method === "mobile_money"
                          ? "Mobile Money"
                          : "Bank Transfer"}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Date</span>
                    <strong>
                      {new Date(latestPayment.created_at).toLocaleDateString()}
                    </strong>
                  </div>
                  {latestPayment.admin_notes && (
                    <div className="detail-row">
                      <span>Admin Notes</span>
                      <strong>{latestPayment.admin_notes}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="payment-info">
                  <p>No payment records yet.</p>
                  <Link href="/membership" className="btn">
                    Choose a Plan
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dash-card quick-actions-card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <Link href="/system-design" className="quick-action-item">
                  <span className="qa-icon">📚</span>
                  <div>
                    <strong>System Design Tutorials</strong>
                    <small>Learn architecture & design patterns</small>
                  </div>
                </Link>
                <Link href="/membership" className="quick-action-item">
                  <span className="qa-icon">💎</span>
                  <div>
                    <strong>Upgrade Plan</strong>
                    <small>Explore premium membership options</small>
                  </div>
                </Link>
                <Link href="/contact" className="quick-action-item">
                  <span className="qa-icon">💬</span>
                  <div>
                    <strong>Contact Support</strong>
                    <small>Get help with your account</small>
                  </div>
                </Link>
                <Link href="/book" className="quick-action-item">
                  <span className="qa-icon">📅</span>
                  <div>
                    <strong>Book a Consultation</strong>
                    <small>Schedule a session with our team</small>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="dash-card account-info-card">
              <h2>Account</h2>
              <div className="account-details">
                <div className="detail-row">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="detail-row">
                  <span>Region</span>
                  <strong>
                    {profile?.region === "global" ? "Global" : "Local"}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Member Since</span>
                  <strong>
                    {new Date(
                      profile?.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
