// ─── Admin — Payment Requests Dashboard ──────────────
"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/app/components/site-shell";

type PaymentRequest = {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  screenshot_url: string | null;
  paypal_order_id: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  membership_plans: { name: string } | null;
  profiles: { email: string; full_name: string; role?: string } | null;
};

export default function AdminMembershipsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const fetchRequests = async (statusFilter?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = statusFilter
        ? `/api/membership/requests?status=${statusFilter}`
        : "/api/membership/requests";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load requests");
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const checkAdminAccess = async () => {
      try {
        const res = await fetch("/api/auth/user");
        const data = await res.json();

        if (cancelled) return;

        const canAccess = Boolean(data.profile?.is_admin);
        setIsAdmin(canAccess);

        if (!canAccess) {
          setRequests([]);
          setLoading(false);
          setError(
            "You do not have admin access yet. Add your email to ADMIN_EMAILS in .env.local and sign in again.",
          );
          return;
        }

        fetchRequests(filter);
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
          setError("Unable to verify admin access right now.");
        }
      }
    };

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/membership/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRequestId: requestId,
          status: "approved",
          adminNotes: adminNotes[requestId] || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve");
      }

      fetchRequests(filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/membership/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRequestId: requestId,
          status: "rejected",
          adminNotes: adminNotes[requestId] || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reject");
      }

      fetchRequests(filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Admin</div>
          <h1 className="h-display">Payment Requests</h1>
          <p className="lead">
            Review and approve/reject membership payment requests.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="admin-filters">
            <button
              className={`btn ${filter === "pending" ? "solid" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`btn ${filter === "approved" ? "solid" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Approved
            </button>
            <button
              className={`btn ${filter === "rejected" ? "solid" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </button>
            <button
              className={`btn ${filter === "" ? "solid" : ""}`}
              onClick={() => setFilter("")}
            >
              All
            </button>
          </div>

          {isAdmin === false ? (
            <div className="error-shell">
              <p>{error || "Admin access is required to review payments."}</p>
            </div>
          ) : loading ? (
            <div className="loading-shell">
              <div className="loading-spinner" />
              <p>Loading requests...</p>
            </div>
          ) : error ? (
            <div className="error-shell">
              <p>{error}</p>
              <button className="btn" onClick={() => fetchRequests(filter)}>
                Retry
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-shell">
              <p>No {filter} payment requests found.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Screenshot</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div className="admin-user-info">
                          <strong>{req.profiles?.full_name || "N/A"}</strong>
                          <small>{req.profiles?.email}</small>
                          <span className="admin-user-role">
                            {req.profiles?.role === "admin" ? "Admin" : "User"}
                          </span>
                        </div>
                      </td>
                      <td>{req.membership_plans?.name || "N/A"}</td>
                      <td>
                        ${req.amount} {req.currency}
                      </td>
                      <td>
                        <span className="method-badge">
                          {req.payment_method === "paypal"
                            ? "🌐 PayPal"
                            : req.payment_method === "mobile_money"
                              ? "📱 Mobile"
                              : "🏦 Bank"}
                        </span>
                      </td>
                      <td>
                        {req.screenshot_url ? (
                          <a
                            href={req.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-screenshot"
                          >
                            📸 View
                          </a>
                        ) : req.paypal_order_id ? (
                          <span className="paypal-confirmed">✅ Auto</span>
                        ) : (
                          <span className="no-file">—</span>
                        )}
                      </td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-chip status-${req.status}`}>
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="admin-notes-input"
                          placeholder="Add note..."
                          value={adminNotes[req.id] || ""}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          disabled={req.status !== "pending"}
                        />
                      </td>
                      <td>
                        {req.status === "pending" ? (
                          <div className="admin-actions">
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id}
                            >
                              {actionLoading === req.id ? "..." : "✓ Approve"}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading === req.id}
                            >
                              {actionLoading === req.id ? "..." : "✕ Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="reviewed-label">
                            {req.reviewed_at
                              ? new Date(req.reviewed_at).toLocaleDateString()
                              : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
