"use client";
import React, { useEffect, useMemo, useState } from "react";
import useAuth from "@/app/store/useAuth";
import { SiteShell } from "@/app/components/site-shell";
import { RequireAuth } from "@/app/components/require-auth";

type SessionFilter = "all" | "registered" | "waitlisted" | "open";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const user = useAuth((s: any) => s.user);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/membership/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      setNotice(null);
    } catch {
      setNotice({
        type: "error",
        text: "We couldn’t load the latest sessions right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const filteredSessions = useMemo(() => {
    if (filter === "registered") return sessions.filter((s) => s.is_registered);
    if (filter === "waitlisted") return sessions.filter((s) => s.is_waitlisted);
    if (filter === "open")
      return sessions.filter(
        (s) => !s.is_registered && s.attendee_count < s.capacity,
      );
    return sessions;
  }, [sessions, filter]);

  const sessionStats = useMemo(() => {
    const open = sessions.filter(
      (s) => !s.is_registered && s.attendee_count < s.capacity,
    ).length;
    const registered = sessions.filter((s) => s.is_registered).length;
    const waitlisted = sessions.filter((s) => s.is_waitlisted).length;
    return { open, registered, waitlisted };
  }, [sessions]);

  const formatSessionDate = (value?: string) => {
    if (!value) return "Date TBD";
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleRegister = async (sessionId: string) => {
    setActionLoading(sessionId);
    setNotice(null);
    try {
      const res = await fetch("/api/membership/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();

      if (data?.ok) {
        if (data?.waitlisted) {
          setNotice({
            type: "success",
            text: "This session is full, and you’ve been added to the waitlist.",
          });
        } else {
          setNotice({
            type: "success",
            text: "You’re registered for this session.",
          });
        }
      } else {
        setNotice({
          type: "error",
          text: data?.error || data?.message || "Registration failed.",
        });
      }

      await fetchSessions();
    } catch {
      setNotice({
        type: "error",
        text: "Something went wrong while registering.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (sessionId: string) => {
    setActionLoading(sessionId);
    setNotice(null);
    try {
      const res = await fetch(
        `/api/membership/sessions?session_id=${sessionId}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();

      if (data?.ok) {
        setNotice({
          type: "success",
          text: "Your booking has been cancelled.",
        });
        await fetchSessions();
      } else {
        setNotice({
          type: "error",
          text: data?.error || "Failed to cancel bookings.",
        });
      }
    } catch {
      setNotice({
        type: "error",
        text: "Unable to cancel this session right now.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <SiteShell>
      <RequireAuth>
        <div className="sessions-page-shell">
          <div className="page-hero sessions-hero">
            <div className="wrap">
              <div className="eyebrow">Premium learning</div>
              <h1 className="h-display">Group Coaching Sessions</h1>
              <p className="lead">
                Join live sessions built for product engineers, founders, and
                teams who want practical guidance from the people shipping real
                systems.
              </p>
              <div className="sessions-hero-stats">
                <div className="mini-stat">
                  <strong>{sessions.length}</strong>
                  <span>Total sessions</span>
                </div>
                <div className="mini-stat">
                  <strong>{sessionStats.open}</strong>
                  <span>Open seats</span>
                </div>
                <div className="mini-stat">
                  <strong>{sessionStats.registered}</strong>
                  <span>Registered</span>
                </div>
                <div className="mini-stat">
                  <strong>{sessionStats.waitlisted}</strong>
                  <span>Waitlist</span>
                </div>
              </div>
            </div>
          </div>

          <section className="sessions-section">
            <div className="wrap">
              {notice && (
                <div className={`session-notice ${notice.type}`} role="status">
                  {notice.text}
                </div>
              )}

              <div className="sessions-toolbar">
                <div className="session-filter-row">
                  {[
                    { id: "all", label: "All" },
                    { id: "registered", label: "Registered" },
                    { id: "waitlisted", label: "Waitlist" },
                    { id: "open", label: "Open seats" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`filter-chip ${filter === item.id ? "active" : ""}`}
                      onClick={() => setFilter(item.id as SessionFilter)}
                    >
                      {item.label}
                    </button>
                  ))}
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
                      <div className="skeleton-shape line w-70" />
                      <div className="skeleton-shape line w-50" />
                    </div>
                  ))}
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="session-empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No sessions match this filter</h3>
                  <p>
                    New coaching sessions will appear here when they’re
                    scheduled.
                  </p>
                </div>
              ) : (
                <div className="sessions-grid">
                  {filteredSessions.map((s) => {
                    const isFull = s.attendee_count >= s.capacity;
                    const isRegistered = Boolean(s.is_registered);
                    const isWaitlisted = Boolean(s.is_waitlisted);

                    return (
                      <article key={s.id} className="session-card card">
                        <div className="session-card-header">
                          <div>
                            <div className="session-badge-row">
                              <span
                                className={`session-status ${isRegistered ? "registered" : isWaitlisted ? "waitlist" : isFull ? "full" : "open"}`}
                              >
                                {isRegistered
                                  ? "Registered"
                                  : isWaitlisted
                                    ? "Waitlist"
                                    : isFull
                                      ? "Full"
                                      : "Open"}
                              </span>
                            </div>
                            <h3>{s.title}</h3>
                          </div>
                          <div className="session-date">
                            {formatSessionDate(s.start_time)}
                          </div>
                        </div>

                        <p className="session-description">
                          {s.description ||
                            "A high-value live session focused on practical engineering execution."}
                        </p>

                        <div className="session-meta-row">
                          <span>
                            <strong>{s.attendee_count}</strong> / {s.capacity}{" "}
                            seats
                          </span>
                          <span>
                            <strong>{s.waitlist_count || 0}</strong> on waitlist
                          </span>
                        </div>

                        <div className="session-details-grid">
                          <div>
                            <label>Format</label>
                            <strong>{s.format || "Live coaching"}</strong>
                          </div>
                          <div>
                            <label>Access</label>
                            <strong>Premium members</strong>
                          </div>
                        </div>

                        <div className="session-actions">
                          {isRegistered ? (
                            <button
                              className="btn btn-secondary"
                              disabled={actionLoading === s.id}
                              onClick={() => handleCancel(s.id)}
                            >
                              {actionLoading === s.id
                                ? "Cancelling…"
                                : "Cancel booking"}
                            </button>
                          ) : isWaitlisted ? (
                            <button
                              className="btn btn-secondary"
                              disabled={true}
                            >
                              Already waitlisted
                            </button>
                          ) : isFull ? (
                            <button
                              className="btn btn-secondary"
                              disabled={actionLoading === s.id}
                              onClick={() => handleRegister(s.id)}
                            >
                              {actionLoading === s.id
                                ? "Joining…"
                                : `Join waitlist (${s.waitlist_count || 0})`}
                            </button>
                          ) : (
                            <button
                              className="btn solid"
                              disabled={actionLoading === s.id}
                              onClick={() => handleRegister(s.id)}
                            >
                              {actionLoading === s.id
                                ? "Registering…"
                                : "Register now"}
                            </button>
                          )}

                          <a
                            className="btn btn-ghost"
                            href={`/membership/coaching/${s.id}`}
                          >
                            View details
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </RequireAuth>
    </SiteShell>
  );
}
