"use client";

import React, { useEffect, useMemo, useState } from "react";
import useAuth from "@/app/store/useAuth";

export function AdminCoachingClient() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [zoomMeetingId, setZoomMeetingId] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const user = useAuth((s: any) => s.user);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coaching");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      setNotice({ type: "error", text: "Couldn't load coaching sessions." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const stats = useMemo(() => {
    const upcoming = sessions.filter(
      (s) => new Date(s.start_time) > new Date(),
    ).length;
    const totalSeats = sessions.reduce(
      (sum, s) => sum + Number(s.capacity || 0),
      0,
    );
    const avgCapacity = sessions.length
      ? Math.round(totalSeats / sessions.length)
      : 0;
    return { upcoming, totalSeats, avgCapacity };
  }, [sessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime) {
      setNotice({
        type: "error",
        text: "Please provide a title and a start time for the session.",
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start_time: startTime,
          capacity,
          zoom_meeting_id: zoomMeetingId,
        }),
      });
      const data = await res.json();
      if (data?.session) {
        setSessions((s) => [data.session, ...s]);
        setTitle("");
        setStartTime("");
        setZoomMeetingId("");
        setCapacity(50);
        setNotice({ type: "success", text: "Session created successfully." });
      } else {
        setNotice({
          type: "error",
          text: data.error || "Failed to create session",
        });
      }
    } catch {
      setNotice({
        type: "error",
        text: "Unable to create the session right now.",
      });
    }
  };

  const handleGenerateLink = async (sessionId: string) => {
    try {
      const res = await fetch("/api/membership/zoom/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data?.link) {
        await navigator.clipboard.writeText(data.link);
        setNotice({
          type: "success",
          text: "Zoom link copied to your clipboard.",
        });
      } else {
        setNotice({
          type: "error",
          text: data.error || "Failed to generate link",
        });
      }
    } catch {
      setNotice({ type: "error", text: "Could not generate the Zoom link." });
    }
  };

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-overview-row">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📅</span>
          <div>
            <label>Upcoming</label>
            <strong>{stats.upcoming}</strong>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">👥</span>
          <div>
            <label>Total seats</label>
            <strong>{stats.totalSeats}</strong>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">⚡</span>
          <div>
            <label>Avg. capacity</label>
            <strong>{stats.avgCapacity}</strong>
          </div>
        </div>
      </div>

      {notice && (
        <div className={`session-notice ${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-card admin-form-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-mini-tag">Create</span>
              <h3>New session</h3>
            </div>
          </div>

          <form onSubmit={handleCreate} className="admin-form">
            <div className="field-group">
              <label>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="System Design Office Hours"
              />
            </div>
            <div className="field-group">
              <label>Start Time</label>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="2026-08-20T15:00:00Z"
              />
            </div>
            <div className="field-group">
              <label>Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            <div className="field-group">
              <label>Zoom Meeting ID (optional)</label>
              <input
                value={zoomMeetingId}
                onChange={(e) => setZoomMeetingId(e.target.value)}
                placeholder="123 456 7890"
              />
            </div>
            <button className="btn solid" type="submit">
              Create session
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-mini-tag">Schedule</span>
              <h3>Live sessions</h3>
            </div>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={fetchSessions}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="session-skeleton-grid">
              {[1, 2].map((item) => (
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
            <ul className="session-list">
              {sessions.map((s) => (
                <li key={s.id} className="session-item admin-session-item">
                  <div className="session-item-copy">
                    <span className="session-status open">Live</span>
                    <strong>{s.title}</strong>
                    <div className="muted">
                      {new Date(s.start_time).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleGenerateLink(s.id)}
                  >
                    Generate link
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
