// ─── Membership Dashboard Page ───────────────────────
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/app/components/site-shell";
import { AuthModal } from "@/app/components/auth-modal";
import ZoomIntegration from "@/app/components/zoom-integration";

// ── Helpers ───────────────────────────────────────────
const formatDate = (d: string | number | Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(d));

const daysBetween = (end: string) =>
  Math.max(
    0,
    Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

const methodLabel = (m?: string) =>
  m === "paypal"
    ? "PayPal"
    : m === "mobile_money"
      ? "Mobile Money"
      : m === "bank_transfer"
        ? "Bank Transfer"
        : m || "—";

const methodIcon = (m?: string) =>
  m === "paypal"
    ? "💳"
    : m === "mobile_money"
      ? "📱"
      : m === "bank_transfer"
        ? "🏦"
        : "❓";

const paymentStatusLabel = (status?: string) =>
  status === "approved"
    ? "Payment Approved"
    : status === "rejected"
      ? "Payment Rejected"
      : status === "pending"
        ? "Payment Pending"
        : status || "—";

// ── Component ─────────────────────────────────────────
export default function MembershipDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/membership/status", { cache: "no-store" });
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

  useEffect(() => {
    if (!data) return;

    const isPendingPayment =
      !data.membership && data.latestPayment?.status === "pending";

    if (!isPendingPayment) return;

    const intervalId = window.setInterval(fetchStatus, 5000);
    return () => window.clearInterval(intervalId);
  }, [data]);

  const handleAuthSuccess = () => {
    fetchStatus();
  };

  const handleLogout = async () => {
    router.push("/auth/login");
  };

  // ── Loading State ─────────────────────────────────
  if (loading) {
    return (
      <SiteShell>
        <div className="dash-skeleton">
          <div className="wrap">
            <div className="dash-skeleton-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="dash-skeleton-card">
                  <div className="sk-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  // ── Unauthenticated State ─────────────────────────
  if (!data?.user) {
    return (
      <SiteShell>
        <div className="dash-hero">
          <div className="wrap">
            <div className="dash-hero-content">
              <div className="dash-hero-icon">🔒</div>
              <h1 className="h-display">Sign in required</h1>
              <p className="lead">
                Please sign in to view your membership dashboard and manage your
                account.
              </p>
              <button
                className="btn solid dash-hero-btn"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </SiteShell>
    );
  }

  // ── Data ───────────────────────────────────────────
  const { user, profile, membership, latestPayment, paymentRequests } = data;
  const daysRemaining = membership ? daysBetween(membership.end_date) : 0;
  const memberSince = profile?.created_at || user.created_at;
  const avatarUrl =
    user?.user_metadata?.avatar_url || profile?.avatar_url || null;
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasPaymentHistory = paymentRequests && paymentRequests.length > 0;

  return (
    <SiteShell>
      <div className="dash-hero">
        <div className="wrap">
          <div className="dash-page-head">
            <span className="eyebrow">Member portal</span>
            <h1 className="h-display">Your premium dashboard</h1>
            <p className="lead">
              Track your subscription, active learning access, and next actions
              from one place.
            </p>
          </div>
          <div className="dash-profile-card">
            <div className="dash-profile-avatar-wrap">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="dash-profile-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="dash-profile-avatar dash-profile-avatar-fallback">
                  {initials}
                </div>
              )}
              <span className="dash-profile-online" />
            </div>
            <div className="dash-profile-info">
              <h1 className="dash-profile-name">{displayName}</h1>
              <p className="dash-profile-email">{user.email}</p>
              <div className="dash-profile-meta">
                <span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Member since {formatDate(memberSince)}
                </span>
                <span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {profile?.region === "global"
                    ? "Global Region"
                    : "Local Region"}
                </span>
                {membership && (
                  <span className="dash-profile-pill dash-profile-pill-paid">
                    Paid User
                  </span>
                )}
              </div>
            </div>
            <button
              className="dash-profile-logout"
              onClick={handleLogout}
              title="Sign out"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────── */}
      <section className="dash-section">
        <div className="wrap">
          <div className="dash-stats">
            <div className={`dash-stat-card ${membership ? "active" : ""}`}>
              <div className="dash-stat-icon">{membership ? "🌟" : "🔓"}</div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Membership</span>
                <strong className="dash-stat-value">
                  {membership
                    ? membership.membership_plans?.name || "Premium"
                    : "Free"}
                </strong>
              </div>
            </div>

            <div className={`dash-stat-card ${membership ? "active" : "dim"}`}>
              <div className="dash-stat-icon">📅</div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Days Remaining</span>
                <strong className="dash-stat-value">
                  {membership ? `${daysRemaining}d` : "—"}
                </strong>
              </div>
            </div>

            <div
              className={`dash-stat-card ${latestPayment ? "active" : "dim"}`}
            >
              <div className="dash-stat-icon">💳</div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Last Payment</span>
                <strong className="dash-stat-value">
                  {latestPayment ? `$${latestPayment.amount}` : "None"}
                </strong>
              </div>
            </div>

            <div
              className={`dash-stat-card ${hasPaymentHistory ? "active" : "dim"}`}
            >
              <div className="dash-stat-icon">📋</div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Transactions</span>
                <strong className="dash-stat-value">
                  {hasPaymentHistory ? paymentRequests.length : 0}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────── */}
      <section className="dash-section">
        <div className="wrap">
          <div className="dash-layout">
            {/* Left Column */}
            <div className="dash-col dash-col-main">
              {/* Membership Card */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Membership</h3>
                  {membership && (
                    <span className="dash-badge dash-badge-success">
                      Active
                    </span>
                  )}
                </div>
                {membership ? (
                  <div className="dash-card-body">
                    <div className="dash-progress-track">
                      <div
                        className="dash-progress-fill"
                        style={{
                          width: `${Math.min(100, (daysRemaining / 365) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="dash-membership-grid">
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Plan</span>
                        <span className="dash-meta-value">
                          {membership.membership_plans?.name || "Premium"}
                        </span>
                      </div>
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Expires</span>
                        <span className="dash-meta-value">
                          {formatDate(membership.end_date)}
                        </span>
                      </div>
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Days Left</span>
                        <span className="dash-meta-value dash-meta-accent">
                          {daysRemaining} days
                        </span>
                      </div>
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Started</span>
                        <span className="dash-meta-value">
                          {formatDate(
                            membership.start_date || membership.created_at,
                          )}
                        </span>
                      </div>
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Access Key</span>
                        <span className="dash-meta-value">
                          {membership.access_key || "Check your approval email"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/stack-advisor"
                      className="btn solid dash-card-action"
                    >
                      Access Stack Guide →
                    </Link>
                  </div>
                ) : (
                  <div className="dash-card-body">
                    <p className="dash-empty-text">
                      You don&apos;t have an active membership plan. Choose a
                      plan that fits your needs and unlock premium content.
                    </p>
                    <Link
                      href="/membership"
                      className="btn solid dash-card-action"
                    >
                      View Plans &amp; Pricing →
                    </Link>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Payment History</h3>
                  {hasPaymentHistory && (
                    <span className="dash-badge dash-badge-neutral">
                      {paymentRequests.length} total
                    </span>
                  )}
                </div>
                {hasPaymentHistory ? (
                  <div className="dash-table-scroll">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentRequests.slice(0, 10).map((pr: any) => (
                          <tr key={pr.id}>
                            <td className="dash-td-date">
                              {formatDate(pr.created_at)}
                            </td>
                            <td>
                              ${pr.amount} {pr.currency}
                            </td>
                            <td>
                              <span className="dash-method-cell">
                                <span>{methodIcon(pr.payment_method)}</span>
                                {methodLabel(pr.payment_method)}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`dash-status-chip dash-status-${pr.status}`}
                              >
                                {pr.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="dash-card-body">
                    <p className="dash-empty-text">
                      No payment records yet. Your transactions will appear here
                      once you subscribe to a plan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="dash-col dash-col-side">
              {/* Quick Actions */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="dash-card-body dash-card-body-compact">
                  <Link href="/stack-advisor" className="dash-action-row">
                    <span className="dash-action-icon">🧠</span>
                    <div>
                      <strong>Stack Advisor</strong>
                      <small>Design your next technology stack</small>
                    </div>
                    <svg
                      className="dash-action-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                  <Link href="/membership" className="dash-action-row">
                    <span className="dash-action-icon">💎</span>
                    <div>
                      <strong>Upgrade Plan</strong>
                      <small>Explore premium options</small>
                    </div>
                    <svg
                      className="dash-action-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                  <Link href="/contact" className="dash-action-row">
                    <span className="dash-action-icon">💬</span>
                    <div>
                      <strong>Contact Support</strong>
                      <small>Get help with your account</small>
                    </div>
                    <svg
                      className="dash-action-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                  <Link href="/book" className="dash-action-row">
                    <span className="dash-action-icon">📅</span>
                    <div>
                      <strong>Book a Consultation</strong>
                      <small>Schedule a session</small>
                    </div>
                    <svg
                      className="dash-action-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </div>
              </div>

              {membership && (
                <div className="dash-card">
                  <div className="dash-card-header">
                    <h3>Coaching (Zoom)</h3>
                  </div>
                  <div className="dash-card-body">
                    <ZoomIntegration />
                    <div style={{ marginTop: 12 }}>
                      <a className="btn" href="/membership/sessions">
                        Group Sessions
                      </a>
                      <a
                        className="btn"
                        style={{ marginLeft: 8 }}
                        href="/membership/one-to-one"
                      >
                        Request 1:1
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Payment Detail */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Latest Payment</h3>
                  {latestPayment && (
                    <span
                      className={`dash-badge dash-badge-${latestPayment.status}`}
                    >
                      {paymentStatusLabel(latestPayment.status)}
                    </span>
                  )}
                </div>
                {latestPayment ? (
                  <div className="dash-card-body">
                    <div className="dash-payment-hero">
                      <span className="dash-payment-amount">
                        ${latestPayment.amount}{" "}
                        <small>{latestPayment.currency}</small>
                      </span>
                      <span className="dash-payment-method">
                        {methodIcon(latestPayment.payment_method)}{" "}
                        {methodLabel(latestPayment.payment_method)}
                      </span>
                    </div>
                    <div className="dash-meta-grid">
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Date</span>
                        <span className="dash-meta-value">
                          {formatDate(latestPayment.created_at)}
                        </span>
                      </div>
                      {latestPayment.plan_name && (
                        <div className="dash-membership-item">
                          <span className="dash-meta-label">Plan</span>
                          <span className="dash-meta-value">
                            {latestPayment.plan_name}
                          </span>
                        </div>
                      )}
                      {latestPayment.admin_notes && (
                        <div className="dash-membership-item">
                          <span className="dash-meta-label">Notes</span>
                          <span className="dash-meta-value">
                            {latestPayment.admin_notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="dash-card-body">
                    <p className="dash-empty-text">No payments recorded yet.</p>
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Account</h3>
                </div>
                <div className="dash-card-body dash-card-body-compact">
                  <div className="dash-account-row">
                    <span className="dash-account-label">Email</span>
                    <span className="dash-account-value">{user.email}</span>
                  </div>
                  <div className="dash-account-row">
                    <span className="dash-account-label">Region</span>
                    <span className="dash-account-value">
                      {profile?.region === "global" ? "🌍 Global" : "📍 Local"}
                    </span>
                  </div>
                  <div className="dash-account-row">
                    <span className="dash-account-label">Role</span>
                    <span className="dash-account-value dash-account-role">
                      {profile?.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                  <div className="dash-account-row">
                    <span className="dash-account-label">Joined</span>
                    <span className="dash-account-value">
                      {formatDate(memberSince)}
                    </span>
                  </div>
                  <div className="dash-account-row">
                    <span className="dash-account-label">User ID</span>
                    <span className="dash-account-value dash-account-value-mono">
                      {user.id.slice(0, 8)}…
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
