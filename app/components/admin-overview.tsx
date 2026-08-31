"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteShell } from "./site-shell";

type Overview = {
  metrics: Record<string, number>;
  finance: { approvedRevenue: Record<string, number> };
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    profiles?: { full_name?: string; email?: string } | null;
    membership_plans?: { name?: string } | null;
  }>;
  recentBookings: Array<{
    id: number;
    name: string | null;
    email: string;
    preferred_time: string | null;
    duration: string | null;
    status: string | null;
    created_at: string;
  }>;
  openRequests: Array<{
    id: string;
    preferred_time: string | null;
    message: string | null;
    created_at: string;
    profiles?: { full_name?: string; email?: string } | null;
  }>;
  warnings: string[];
  generatedAt: string;
};

const actions = [
  {
    href: "/admin/memberships",
    label: "Payment requests",
    detail: "Approve, reject, and annotate payments",
  },
  {
    href: "/admin/coaching",
    label: "Group coaching",
    detail: "Schedule sessions and manage attendees",
  },
  {
    href: "/admin/one-to-one",
    label: "1:1 requests",
    detail: "Triage private coaching enquiries",
  },
  {
    href: "/tutorials/admin",
    label: "Tutorials",
    detail: "Publish and maintain learning content",
  },
];

const metricLabels: Record<string, string> = {
  customers: "Profiles",
  activeMembers: "Active members",
  pendingPayments: "Pending payments",
  bookings: "Discovery bookings",
  sessions: "Group sessions",
  upcomingSessions: "Upcoming sessions",
  requests: "Open 1:1 requests",
};

export function AdminOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setError("");
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load overview");
    setOverview(data);
  };

  useEffect(() => {
    loadOverview().catch((reason) =>
      setError(
        reason instanceof Error ? reason.message : "Unable to load overview",
      ),
    );
  }, []);

  return (
    <SiteShell>
      <main className="admin-console">
        <div className="wrap">
          <header className="admin-console-header">
            <div>
              <div className="eyebrow">Control center</div>
              <h1 className="h-display">Company operations</h1>
              <p className="lead">
                One place to monitor members, revenue workflows, coaching, and
                content.
              </p>
            </div>
            <button
              className="btn"
              type="button"
              onClick={() =>
                loadOverview().catch((reason) => setError(reason.message))
              }
            >
              Refresh data
            </button>
          </header>

          {error ? (
            <div className="admin-console-alert" role="alert">
              <strong>{error}</strong>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  loadOverview().catch((reason) => setError(reason.message))
                }
              >
                Retry
              </button>
            </div>
          ) : !overview ? (
            <div className="admin-console-loading">
              Loading live operations data...
            </div>
          ) : (
            <>
              {overview.warnings.length > 0 && (
                <div className="admin-console-warning" role="status">
                  <strong>Some live data is unavailable.</strong>
                  <span>{overview.warnings.join(" | ")}</span>
                </div>
              )}
              <section
                className="admin-metric-grid"
                aria-label="Operations metrics"
              >
                {Object.entries(overview.metrics).map(([key, value]) => (
                  <article
                    className={`admin-metric-card ${key === "pendingPayments" || key === "requests" ? "attention" : ""}`}
                    key={key}
                  >
                    <span>{metricLabels[key] || key}</span>
                    <strong>{value === null ? "—" : value}</strong>
                  </article>
                ))}
              </section>

              <section className="admin-console-grid">
                <div className="admin-console-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-mini-tag">Workspace</span>
                      <h2>Quick controls</h2>
                    </div>
                  </div>
                  <div className="admin-action-list">
                    {actions.map((action) => (
                      <Link
                        className="admin-action-link"
                        href={action.href}
                        key={action.href}
                      >
                        <strong>{action.label}</strong>
                        <span>{action.detail}</span>
                        <b aria-hidden="true">-&gt;</b>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="admin-console-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-mini-tag">Finance queue</span>
                      <h2>Recent payments</h2>
                    </div>
                    <Link href="/admin/memberships">View all</Link>
                  </div>
                  {overview.recentPayments.length === 0 ? (
                    <p className="admin-console-empty">
                      No payment activity yet.
                    </p>
                  ) : (
                    <div className="admin-payment-list">
                      {overview.recentPayments.map((payment) => (
                        <div className="admin-payment-row" key={payment.id}>
                          <div>
                            <strong>
                              {payment.profiles?.full_name ||
                                payment.profiles?.email ||
                                "Member"}
                            </strong>
                            <span>
                              {payment.membership_plans?.name || "Membership"} ·{" "}
                              {new Date(
                                payment.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <strong>
                              {payment.currency}{" "}
                              {Number(payment.amount).toFixed(2)}
                            </strong>
                            <span className={`admin-status ${payment.status}`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
              <section className="admin-console-grid admin-console-grid-lower">
                <div className="admin-console-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-mini-tag">Revenue</span>
                      <h2>Approved revenue</h2>
                    </div>
                  </div>
                  {Object.keys(overview.finance.approvedRevenue).length ===
                  0 ? (
                    <p className="admin-console-empty">
                      No approved payments recorded.
                    </p>
                  ) : (
                    <div className="admin-revenue-list">
                      {Object.entries(overview.finance.approvedRevenue).map(
                        ([currency, total]) => (
                          <div className="admin-revenue-row" key={currency}>
                            <span>{currency}</span>
                            <strong>{total.toFixed(2)}</strong>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
                <div className="admin-console-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-mini-tag">Bookings</span>
                      <h2>Recent discovery calls</h2>
                    </div>
                    <Link href="/book">View booking form</Link>
                  </div>
                  {overview.recentBookings.length === 0 ? (
                    <p className="admin-console-empty">
                      No discovery bookings recorded.
                    </p>
                  ) : (
                    <div className="admin-payment-list">
                      {overview.recentBookings.map((booking) => (
                        <div className="admin-payment-row" key={booking.id}>
                          <div>
                            <strong>{booking.name || booking.email}</strong>
                            <span>
                              {booking.preferred_time || "Time not specified"} ·{" "}
                              {booking.duration || "Duration not specified"}
                            </span>
                          </div>
                          <span
                            className={`admin-status ${String(booking.status || "pending").toLowerCase()}`}
                          >
                            {booking.status || "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
              <section className="admin-console-panel admin-console-grid-lower">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-mini-tag">Priority queue</span>
                    <h2>Open 1:1 requests</h2>
                  </div>
                  <Link href="/admin/one-to-one">Manage requests</Link>
                </div>
                {overview.openRequests.length === 0 ? (
                  <p className="admin-console-empty">
                    No open coaching requests.
                  </p>
                ) : (
                  <div className="admin-request-grid">
                    {overview.openRequests.map((request) => (
                      <article
                        className="admin-request-summary"
                        key={request.id}
                      >
                        <strong>
                          {request.profiles?.full_name ||
                            request.profiles?.email ||
                            "Member"}
                        </strong>
                        <span>
                          {request.preferred_time
                            ? new Date(request.preferred_time).toLocaleString()
                            : "Flexible schedule"}
                        </span>
                        <p>
                          {request.message || "No additional details provided."}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
              <p className="admin-console-updated">
                Live data updated{" "}
                {new Date(overview.generatedAt).toLocaleTimeString()}.
              </p>
            </>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
