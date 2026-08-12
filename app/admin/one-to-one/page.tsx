"use client";
import React, { useEffect, useState } from "react";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";

export default function AdminOneToOnePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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
            View and mark incoming one-to-one coaching requests.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div className="admin-card">
              {requests.length === 0 ? (
                <p>No requests.</p>
              ) : (
                <ul className="request-list">
                  {requests.map((r) => (
                    <li key={r.id} className="request-item">
                      <div>
                        <strong>
                          {r.profiles?.full_name || r.profiles?.email || "User"}
                        </strong>
                        <div className="muted">
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                        <div>Preferred: {r.preferred_time || "—"}</div>
                        <div>{r.message}</div>
                      </div>
                      <div>
                        <button
                          className="btn"
                          onClick={() => markHandled(r.id, true)}
                          disabled={actionLoading === r.id || r.handled}
                        >
                          Mark handled
                        </button>
                        {r.handled && <div className="muted">Handled</div>}
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
