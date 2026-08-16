"use client";

import { useEffect, useState } from "react";
import useAuth from "@/app/store/useAuth";

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

function PaymentScreenshotCell({
  screenshotUrl,
  paypalOrderId,
}: {
  screenshotUrl: string | null;
  paypalOrderId: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!screenshotUrl) {
    return paypalOrderId ? (
      <span className="paypal-confirmed">✅ Auto</span>
    ) : (
      <span className="no-file">—</span>
    );
  }

  if (imageError) {
    return (
      <div className="screenshot-cell">
        <span className="preview-unavailable">Preview unavailable</span>
        <a
          href={screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="view-screenshot"
        >
          Open image
        </a>
      </div>
    );
  }

  return (
    <div className="screenshot-cell">
      <button
        type="button"
        className="screenshot-thumbnail-button"
        onClick={() => setIsPreviewOpen(true)}
        aria-label="Open payment screenshot preview"
      >
        <img
          src={screenshotUrl}
          alt="Payment screenshot"
          className="screenshot-thumbnail"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </button>
      <div className="screenshot-link">Preview</div>

      {isPreviewOpen && (
        <div
          className="screenshot-modal"
          onClick={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Payment screenshot preview"
        >
          <div
            className="screenshot-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="screenshot-modal-close"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close screenshot preview"
            >
              ×
            </button>
            <img src={screenshotUrl} alt="Payment screenshot preview" />
            <a
              href={screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="view-screenshot"
            >
              Open full image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminMembershipsClient() {
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
        const profile = useAuth.getState().profile as any;

        const canAccess = Boolean(
          profile?.is_admin || profile?.role === "admin",
        );
        if (cancelled) return;
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
    <>
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
                <th>Payment Proof</th>
                <th>Admin Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div>
                      <div className="admin-user-name">
                        {req.profiles?.full_name || "Unknown"}
                      </div>
                      <div className="admin-user-email">
                        {req.profiles?.email || "no-email"}
                      </div>
                    </div>
                  </td>
                  <td>{req.membership_plans?.name || "Unknown Plan"}</td>
                  <td>
                    {req.currency} {req.amount}
                  </td>
                  <td>{req.payment_method}</td>
                  <td>
                    <PaymentScreenshotCell
                      screenshotUrl={req.screenshot_url}
                      paypalOrderId={req.paypal_order_id}
                    />
                  </td>
                  <td>
                    <textarea
                      className="admin-notes-input"
                      value={adminNotes[req.id] || req.admin_notes || ""}
                      onChange={(e) =>
                        setAdminNotes({
                          ...adminNotes,
                          [req.id]: e.target.value,
                        })
                      }
                      placeholder="Add notes..."
                    />
                  </td>
                  <td className="admin-actions">
                    <button
                      className="btn-action-approve"
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-action-reject"
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                    >
                      ✕ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
