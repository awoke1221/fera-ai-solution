"use client";
import React, { useEffect, useState } from "react";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";

export default function AdminCoachingPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [zoomMeetingId, setZoomMeetingId] = useState("");
  const user = useAuth((s: any) => s.user);

  const fetchSessions = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coaching");
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } else {
      alert(data.error || "Failed to create session");
    }
  };

  const handleGenerateLink = async (sessionId: string) => {
    const res = await fetch("/api/membership/zoom/generate-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    if (data?.link) {
      navigator.clipboard.writeText(data.link);
      alert("Link copied to clipboard");
    } else {
      alert(data.error || "Failed to generate link");
    }
  };

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Admin</div>
          <h1 className="h-display">Coaching Sessions</h1>
          <p className="lead">Create and manage group coaching sessions.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="admin-grid">
            <div className="admin-card">
              <h3>Create Session</h3>
              <form onSubmit={handleCreate} className="admin-form">
                <label>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Start Time</label>
                <input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="2026-08-20T15:00:00Z"
                />
                <label>Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
                <label>Zoom Meeting ID (optional)</label>
                <input
                  value={zoomMeetingId}
                  onChange={(e) => setZoomMeetingId(e.target.value)}
                />
                <button className="btn solid" type="submit">
                  Create
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h3>Sessions</h3>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ul className="session-list">
                  {sessions.map((s) => (
                    <li key={s.id} className="session-item">
                      <div>
                        <strong>{s.title}</strong>
                        <div className="muted">{s.start_time}</div>
                      </div>
                      <div>
                        <button
                          className="btn"
                          onClick={() => handleGenerateLink(s.id)}
                        >
                          Generate Link
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
