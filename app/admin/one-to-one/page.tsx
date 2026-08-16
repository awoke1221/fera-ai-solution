"use client";
import React, { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";

export default function AdminOneToOnePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "handled">("all");
  const user = useAuth((s: any) => s.user);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/one-to-one");
    const d = await res.json();
    setRequests(d.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (filter === "pending") return requests.filter((r) => !r.handled);
    if (filter === "handled") return requests.filter((r) => r.handled);
    return requests;
  }, [filter, requests]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => !r.handled).length;
    const handled = requests.filter((r) => r.handled).length;
    return { total: requests.length, pending, handled };
  }, [requests]);

  const markHandled = async (id: string, handled: boolean) => {
    setActionLoading(id);
    const res = await fetch("/api/admin/one-to-one", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handled }),
    });
    const d = await res.json();
    if (d.request) fetchRequests();
    else alert(d.error || "Failed");
    setActionLoading(null);
  };

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Admin</div>
          <h1 className="h-display">1:1 Coaching Requests</h1>
          <p className="lead">
            Review incoming coaching asks, triage the right conversations, and
            keep private support moving.
          </p>
        </div>
      </div>

      <section className="sessions-section">
        <div className="wrap">
          <div className="admin-overview-row">
            <div className="admin-stat-card">
              <span className="admin-stat-icon">📥</span>
              <div>
                <label>Total</label>
                <strong>{stats.total}</strong>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">⏳</span>
              <div>
                <label>Pending</label>
                <strong>{stats.pending}</strong>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">✅</span>
              <div>
                <label>Handled</label>
                <strong>{stats.handled}</strong>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="session-skeleton-grid">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="session-skeleton-card"
                  aria-hidden="true"
                >
                  <div className="skeleton-shape line w-60" />
                  <div className="skeleton-shape line w-40" />
                  <div className="skeleton-shape line w-90" />
                  <div className="skeleton-shape line w-50" />
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-card admin-request-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-mini-tag">Queue</span>
                  <h3>Incoming requests</h3>
                </div>
                <div className="session-filter-row">
                  {[
                    { id: "all", label: "All" },
                    { id: "pending", label: "Pending" },
                    { id: "handled", label: "Handled" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`filter-chip ${filter === item.id ? "active" : ""}`}
                      onClick={() =>
                        setFilter(item.id as "all" | "pending" | "handled")
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="session-empty-state">
                  <div className="empty-icon">✉️</div>
                  <h3>No requests in this view</h3>
                  <p>
                    New 1:1 coaching requests will appear here as members submit
                    them.
                  </p>
                </div>
              ) : (
                <ul className="request-list">
                  {filteredRequests.map((r) => (
                    <li
                      key={r.id}
                      className={`request-item ${r.handled ? "is-handled" : ""}`}
                    >
                      <div className="request-main">
                        <div className="request-head-row">
                          <strong>
                            {r.profiles?.full_name ||
                              r.profiles?.email ||
                              "User"}
                          </strong>
                          <span
                            className={`session-status ${r.handled ? "registered" : "waitlist"}`}
                          >
                            {r.handled ? "Handled" : "Pending"}
                          </span>
                        </div>
                        <div className="muted">
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                        <div className="request-meta-grid">
                          <div>
                            <label>Preferred time</label>
                            <span>{r.preferred_time || "—"}</span>
                          </div>
                          <div>
                            <label>Member</label>
                            <span>{r.profiles?.email || "—"}</span>
                          </div>
                        </div>
                        <div className="request-message">
                          <label>Request details</label>
                          <p>
                            {r.message || "No additional details provided."}
                          </p>
                        </div>
                      </div>

                      <div className="request-actions">
                        <button
                          className={`btn ${r.handled ? "btn-secondary" : "solid"}`}
                          onClick={() => markHandled(r.id, !r.handled)}
                          disabled={actionLoading === r.id}
                        >
                          {actionLoading === r.id
                            ? "Updating..."
                            : r.handled
                              ? "Reopen"
                              : "Mark handled"}
                        </button>
                        {r.handled && (
                          <div className="muted handled-note">Handled</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
