// ─── Membership Dashboard Page ───────────────────────
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/app/components/site-shell";
import ZoomIntegration from "@/app/components/zoom-integration";
import useAuth from "@/app/store/useAuth";

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

const formatAmount = (amount: number, currency?: string) =>
  currency === "USD"
    ? `$${Number(amount).toLocaleString("en-US")}`
    : `${currency || ""} ${Number(amount).toLocaleString("en-US")}`.trim();

// ── Component ─────────────────────────────────────────
export default function MembershipDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/membership/status", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) {
        throw new Error(d?.error || "Unable to load your membership status.");
      }
      if (!d || typeof d !== "object" || !("user" in d)) {
        throw new Error("The membership service returned an invalid response.");
      }
      setData(d);
      setStatusError(null);
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Unable to load your membership status.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!data) return;

    const isPendingPayment =
      !data.membership &&
      (data.hasPendingPayment || data.pendingPayment?.status === "pending");

    if (!isPendingPayment) return;

    const intervalId = window.setInterval(() => void fetchStatus(), 5000);
    return () => window.clearInterval(intervalId);
  }, [data, fetchStatus]);

  const handleLogout = async () => {
    setSigningOut(true);
    setStatusError(null);
    try {
      await useAuth.getState().signOut();
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    } finally {
      setSigningOut(false);
    }
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

  if (!data && statusError) {
    return (
      <SiteShell>
        <div className="premium-gate">
          <div className="premium-gate-shell">
            <div className="premium-gate-content">
              <div className="premium-gate-kicker">Account status</div>
              <h1 className="h-display">We couldn&apos;t load your dashboard</h1>
              <p>
                Your sign-in has not been changed. Retry to load your membership
                and payment details.
              </p>
              <p role="alert">{statusError}</p>
              <div className="premium-gate-actions">
                <button
                  className="btn solid"
                  onClick={() => {
                    setLoading(true);
                    void fetchStatus();
                  }}
                >
                  Retry
                </button>
              </div>
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
              <div className="premium-gate-actions">
                <Link
                  href="/auth/login?next=/membership/dashboard"
                  className="btn solid dash-hero-btn"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup?next=/membership/dashboard"
                  className="btn dash-hero-btn"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  // ── Data ───────────────────────────────────────────
  const {
    user,
    profile,
    membership,
    latestPayment,
    paymentRequests,
  } = data;
  const pendingPayment =
    data.pendingPayment ||
    paymentRequests?.find((payment: any) => payment.status === "pending") ||
    null;
  const lastPayment = pendingPayment || latestPayment;
  const accessStatus = membership
    ? "active"
    : pendingPayment
      ? "pending"
      : latestPayment?.status === "rejected"
        ? "rejected"
        : "required";
  const daysRemaining = membership ? daysBetween(membership.end_date) : 0;
  const membershipDurationDays = membership
    ? Math.max(
        1,
        Math.ceil(
          (new Date(membership.end_date).getTime() -
            new Date(
              membership.start_date || membership.created_at,
            ).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 1;
  const membershipProgress = membership
    ? Math.min(100, Math.max(0, (daysRemaining / membershipDurationDays) * 100))
    : 0;
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
            <h1 className="h-display">Account &amp; membership dashboard</h1>
            <p className="lead">
              Track Stack Advisor plan access, payment review, and account
              activity from one place.
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
                <span
                  className={`dash-profile-pill dash-profile-pill-${accessStatus}`}
                >
                  {accessStatus === "active"
                    ? "Paid plan active"
                    : accessStatus === "pending"
                      ? "Payment in review"
                      : accessStatus === "rejected"
                        ? "Payment needs attention"
                        : "Paid plan required"}
                </span>
              </div>
            </div>
            <button
              className="dash-profile-logout"
              onClick={handleLogout}
              title="Sign out"
              disabled={signingOut}
              aria-label={signingOut ? "Signing out" : "Sign out"}
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

      {statusError && (
        <section className="dash-section" aria-label="Dashboard update warning">
          <div className="wrap">
            <div className="form-message error" role="alert">
              {statusError}{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => void fetchStatus()}
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      )}

      <section
        className="dash-section dash-access-section"
        id="membership-status"
        aria-labelledby="dash-access-title"
      >
        <div className="wrap">
          <div className={`dash-access-card ${accessStatus}`}>
            <div className="dash-access-heading">
              <div>
                <span className="dash-access-kicker">Stack Advisor access</span>
                <h2 id="dash-access-title">
                  {accessStatus === "active"
                    ? "Your paid plan is active"
                    : accessStatus === "pending"
                      ? "Payment review in progress"
                      : accessStatus === "rejected"
                        ? "Payment requires your attention"
                        : "A paid plan is required"}
                </h2>
                <p>
                  {accessStatus === "active"
                    ? "Your membership is active. Open Stack Advisor to continue planning your project."
                    : accessStatus === "pending"
                      ? "We received your payment request. Please do not pay again or submit another receipt while it is under review."
                      : accessStatus === "rejected"
                        ? "Your latest payment request was not approved. Review any admin note below before submitting another payment."
                        : "Stack Advisor is a paid membership feature. Choose a plan and submit payment to request access."}
                </p>
              </div>
              <span className={`dash-access-status ${accessStatus}`}>
                {accessStatus === "active"
                  ? "Active"
                  : accessStatus === "pending"
                    ? "Under review"
                    : accessStatus === "rejected"
                      ? "Action required"
                      : "Not subscribed"}
              </span>
            </div>

            <ol className="dash-access-steps" aria-label="Membership progress">
              <li
                className={
                  accessStatus === "required" ? "current" : "complete"
                }
              >
                <span>1</span>
                <div>
                  <strong>Choose a plan</strong>
                  <small>
                    {accessStatus === "required"
                      ? "Select the plan for your region"
                      : lastPayment?.membership_plans?.name ||
                        membership?.membership_plans?.name ||
                        "Plan selected"}
                  </small>
                </div>
              </li>
              <li
                className={
                  accessStatus === "pending"
                    ? "current"
                    : accessStatus === "rejected"
                      ? "attention"
                      : accessStatus === "active"
                        ? "complete"
                        : ""
                }
              >
                <span>2</span>
                <div>
                  <strong>Payment approval</strong>
                  <small>
                    {accessStatus === "pending"
                      ? "Review is in progress"
                      : accessStatus === "active"
                        ? "Payment approved"
                        : accessStatus === "rejected"
                          ? "Review the decision"
                          : "Submit payment for review"}
                  </small>
                </div>
              </li>
              <li
                className={accessStatus === "active" ? "complete" : ""}
              >
                <span>3</span>
                <div>
                  <strong>Stack Advisor access</strong>
                  <small>
                    {accessStatus === "active"
                      ? "Available until " + formatDate(membership.end_date)
                      : "Available after plan approval"}
                  </small>
                </div>
              </li>
            </ol>

            {lastPayment && (
              <div className="dash-access-payment">
                <div>
                  <span>Latest payment</span>
                  <strong>
                    {formatAmount(lastPayment.amount, lastPayment.currency)}
                  </strong>
                </div>
                <div>
                  <span>Method</span>
                  <strong>{methodLabel(lastPayment.payment_method)}</strong>
                </div>
                <div>
                  <span>Submitted</span>
                  <strong>{formatDate(lastPayment.created_at)}</strong>
                </div>
                <div>
                  <span>Payment status</span>
                  <strong>{paymentStatusLabel(lastPayment.status)}</strong>
                </div>
                {lastPayment.admin_notes && (
                  <div className="dash-access-note">
                    <span>Review note</span>
                    <strong>{lastPayment.admin_notes}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="dash-access-actions">
              {accessStatus === "active" ? (
                <Link href="/stack-advisor" className="btn solid">
                  Open Stack Advisor
                </Link>
              ) : accessStatus === "pending" ? (
                <button
                  className="btn"
                  type="button"
                  onClick={fetchStatus}
                >
                  Refresh payment status
                </button>
              ) : accessStatus === "rejected" && lastPayment?.plan_id ? (
                <Link
                  href={`/membership/join?plan=${lastPayment.plan_id}`}
                  className="btn solid"
                >
                  Submit a new payment
                </Link>
              ) : (
                <Link href="/membership" className="btn solid">
                  View paid plans
                </Link>
              )}
              {accessStatus === "pending" && (
                <span>
                  Your membership will activate after approval. No second
                  payment is needed.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────── */}
      <section className="dash-section">
        <div className="wrap">
          <div className="dash-stats">
            <div
              className={`dash-stat-card ${
                accessStatus === "active"
                  ? "active"
                  : accessStatus === "pending"
                    ? "pending"
                    : "dim"
              }`}
            >
              <div className="dash-stat-icon">
                {accessStatus === "active"
                  ? "🌟"
                  : accessStatus === "pending"
                    ? "⏳"
                    : "🔒"}
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Stack Advisor plan</span>
                <strong className="dash-stat-value">
                  {membership
                    ? membership.membership_plans?.name || "Premium"
                    : accessStatus === "pending"
                      ? "Under review"
                      : "Paid plan required"}
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
                  {lastPayment
                    ? formatAmount(lastPayment.amount, lastPayment.currency)
                    : "None"}
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
                          width: `${membershipProgress}%`,
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
                ) : pendingPayment ? (
                  <div className="dash-card-body">
                    <p className="dash-empty-text">
                      Your payment for{" "}
                      <strong>
                        {pendingPayment.membership_plans?.name ||
                          "the selected plan"}
                      </strong>{" "}
                      is being reviewed. Please do not submit another payment.
                      Your paid Stack Advisor access will activate after
                      approval.
                    </p>
                    <Link
                      href="#membership-status"
                      className="btn dash-card-action"
                    >
                      Track payment progress ↓
                    </Link>
                  </div>
                ) : latestPayment?.status === "rejected" ? (
                  <div className="dash-card-body">
                    <p className="dash-empty-text">
                      Your last payment request was rejected.
                      {latestPayment.admin_notes
                        ? ` Review note: ${latestPayment.admin_notes}`
                        : " Review the payment details and submit a new request if you want to continue."}
                    </p>
                    {latestPayment.plan_id && (
                      <Link
                        href={`/membership/join?plan=${latestPayment.plan_id}`}
                        className="btn solid dash-card-action"
                      >
                        Submit a new payment →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="dash-card-body">
                    <p className="dash-empty-text">
                      Stack Advisor is a paid membership feature. Select a
                      plan to request access; your paid features become
                      available after approval.
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
                          <th>Plan</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Review note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentRequests.slice(0, 10).map((pr: any) => (
                          <tr key={pr.id}>
                            <td className="dash-td-date">
                              {formatDate(pr.created_at)}
                            </td>
                            <td>
                              {pr.membership_plans?.name || "Membership plan"}
                            </td>
                            <td>{formatAmount(pr.amount, pr.currency)}</td>
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
                                {paymentStatusLabel(pr.status)}
                              </span>
                            </td>
                            <td>{pr.admin_notes || "—"}</td>
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
                  <Link
                    href={
                      membership
                        ? "/stack-advisor"
                        : pendingPayment
                          ? "#membership-status"
                          : "/membership"
                    }
                    className="dash-action-row"
                  >
                    <span className="dash-action-icon">🧠</span>
                    <div>
                      <strong>Stack Advisor</strong>
                      <small>
                        {membership
                          ? "Plan your next technology stack"
                          : pendingPayment
                            ? "Payment review in progress"
                            : "Paid membership required"}
                      </small>
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
                  {!membership && !pendingPayment && (
                    <Link href="/membership" className="dash-action-row">
                      <span className="dash-action-icon">💎</span>
                      <div>
                        <strong>View paid plans</strong>
                        <small>Choose a Stack Advisor membership</small>
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
                  )}
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
                  {lastPayment && (
                    <span
                      className={`dash-badge dash-badge-${lastPayment.status}`}
                    >
                      {paymentStatusLabel(lastPayment.status)}
                    </span>
                  )}
                </div>
                {lastPayment ? (
                  <div className="dash-card-body">
                    <div className="dash-payment-hero">
                      <span className="dash-payment-amount">
                        {formatAmount(lastPayment.amount, lastPayment.currency)}
                      </span>
                      <span className="dash-payment-method">
                        {methodIcon(lastPayment.payment_method)}{" "}
                        {methodLabel(lastPayment.payment_method)}
                      </span>
                    </div>
                    <div className="dash-meta-grid">
                      <div className="dash-membership-item">
                        <span className="dash-meta-label">Date</span>
                        <span className="dash-meta-value">
                          {formatDate(lastPayment.created_at)}
                        </span>
                      </div>
                      {lastPayment.membership_plans?.name && (
                        <div className="dash-membership-item">
                          <span className="dash-meta-label">Plan</span>
                          <span className="dash-meta-value">
                            {lastPayment.membership_plans.name}
                          </span>
                        </div>
                      )}
                      {lastPayment.admin_notes && (
                        <div className="dash-membership-item">
                          <span className="dash-meta-label">Notes</span>
                          <span className="dash-meta-value">
                            {lastPayment.admin_notes}
                          </span>
                        </div>
                      )}
                      {lastPayment.reviewed_at && (
                        <div className="dash-membership-item">
                          <span className="dash-meta-label">Reviewed</span>
                          <span className="dash-meta-value">
                            {formatDate(lastPayment.reviewed_at)}
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
