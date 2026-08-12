"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";

export default function CoachingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const user = useAuth((s: any) => s.user);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const res = await fetch("/api/membership/sessions");
      const d = await res.json();
      const s = (d.sessions || []).find((x: any) => x.id === id) || null;
      setSession(s);
      setLoading(false);
    };
    fetchSession();
  }, [id]);

  const handleRegister = async () => {
    if (!session) return;
    setActionLoading(true);
    const res = await fetch("/api/membership/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id }),
    });
    const d = await res.json();
    if (d.ok) {
      window.location.reload();
    } else {
      alert(d.error || (d.waitlisted && "Added to waitlist") || "Failed");
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!session) return;
    setActionLoading(true);
    const res = await fetch(
      `/api/membership/sessions?session_id=${session.id}`,
      { method: "DELETE" },
    );
    const d = await res.json();
    if (d.ok) window.location.reload();
    else alert(d.error || "Failed to cancel");
    setActionLoading(false);
  };

  return (
    <SiteShell>
      <div className="wrap">
        {loading ? (
          <p>Loading…</p>
        ) : !session ? (
          <p>Session not found.</p>
        ) : (
          <div className="session-detail">
            <h1>{session.title}</h1>
            <p className="muted">{session.start_time}</p>
            <p>{session.description}</p>
            <div className="session-meta">
              <div>
                Capacity: {session.attendee_count}/{session.capacity}
              </div>
              <div>Waitlist: {session.waitlist_count}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              {session.is_registered ? (
                <button
                  className="btn"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="btn solid"
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {session.attendee_count >= session.capacity
                    ? `Join Waitlist (${session.waitlist_count})`
                    : "Register"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
