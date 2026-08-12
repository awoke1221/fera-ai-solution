"use client";
import React, { useEffect, useState } from "react";
import useAuth from "@/app/store/useAuth";

export default function ZoomIntegration() {
  const user = useAuth((s: any) => s.user);
  const [connected, setConnected] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [topic, setTopic] = useState("1:1 coaching");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (!user) return;
    fetch("/api/membership/zoom/meetings")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setConnected(false);
        } else {
          setMeetings(d.meetings || []);
          setConnected((d.meetings || []).length > 0);
        }
      })
      .catch(() => setConnected(false));
  }, [user]);

  async function startOAuth() {
    const res = await fetch(`/api/membership/zoom/oauth/start`, {
      method: "POST",
    });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  }

  async function createMeeting(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      topic,
      start_time: startTime,
      duration_minutes: duration,
    };
    const res = await fetch(`/api/membership/zoom/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data?.meeting) {
      setMeetings((m) => [data.meeting, ...m]);
      setConnected(true);
    } else {
      alert(data.error || "Failed to create meeting");
    }
  }

  return (
    <div className="zoom-integration">
      <h3>Zoom Integration</h3>
      {!user && <p>Please sign in to connect Zoom.</p>}
      {user && (
        <div>
          <p>Connected: {connected ? "Yes" : "No"}</p>
          {!connected && (
            <button onClick={startOAuth} className="btn btn-primary">
              Connect Zoom
            </button>
          )}

          <form onSubmit={createMeeting} style={{ marginTop: 12 }}>
            <label>Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} />
            <label>Start time (ISO)</label>
            <input
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="2026-08-20T15:00:00Z"
            />
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <button type="submit" className="btn btn-primary">
              Create Meeting
            </button>
          </form>

          <h4>Upcoming Meetings</h4>
          <ul>
            {meetings.map((m) => (
              <li key={m.id}>
                <strong>{m.topic}</strong> — {m.start_time} —{" "}
                <a href={m.join_url} target="_blank" rel="noreferrer">
                  Join
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
