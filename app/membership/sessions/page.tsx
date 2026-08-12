"use client";
import React, { useEffect, useState } from "react";
import useAuth from "@/app/store/useAuth";
import { SiteShell } from "@/app/components/site-shell";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const user = useAuth((s: any) => s.user);

  const fetchSessions = async () => {
    setLoading(true);
    const res = await fetch("/api/membership/sessions");
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRegister = async (sessionId: string) => {
    setActionLoading(sessionId);
    const res = await fetch("/api/membership/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    if (data?.ok) {
      fetchSessions();
    } else {
      if (data?.waitlisted) {
        alert("Session is full — you've been added to the waitlist.");
        fetchSessions();
      } else {
        alert(data.error || data.message || "Failed to register");
      }
    }
    setActionLoading(null);
  };

  const handleCancel = async (sessionId: string) => {
    setActionLoading(sessionId);
    const res = await fetch(
      `/api/membership/sessions?session_id=${sessionId}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (data?.ok) fetchSessions();
    else alert(data.error || "Failed to cancel");
    setActionLoading(null);
  };

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <h1 className="h-display">Group Coaching Sessions</h1>
          <p className="lead">Exclusive sessions for premium members.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {loading ? (
            <p>Loading sessions…</p>
          ) : (
            <div className="sessions-grid">
              {sessions.map((s) => (
                <div key={s.id} className="session-card">
                  <h3>{s.title}</h3>
                  <div className="muted">{s.start_time}</div>
                  <p>{s.description}</p>
                  <div className="session-meta">
                    <span>
                      Capacity: {s.attendee_count}/{s.capacity}
                    </span>
                    <span>{s.is_registered ? "You are registered" : ""}</span>
                  </div>
                  <div className="session-actions">
                    {s.is_registered ? (
                      <button
                        className="btn"
                        disabled={actionLoading === s.id}
                        onClick={() => handleCancel(s.id)}
                      >
                        Cancel
                      </button>
                    ) : s.attendee_count >= s.capacity ? (
                      <button
                        className="btn"
                        disabled={actionLoading === s.id}
                        onClick={() => handleRegister(s.id)}
                      >
                        Join Waitlist ({s.waitlist_count})
                      </button>
                    ) : (
                      <button
                        className="btn solid"
                        disabled={actionLoading === s.id}
                        onClick={() => handleRegister(s.id)}
                      >
                        Register
                      </button>
                    )}
                    <a className="btn" href={`/membership/coaching/${s.id}`}>
                      Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
