"use client";
import React, { useState } from "react";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";
import { RequireAuth } from "@/app/components/require-auth";

export default function OneToOnePage() {
  const user = useAuth((s: any) => s.user);
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/membership/one-to-one/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_time: preferredTime, message }),
      });
      const d = await res.json();
      if (d.ok) {
        setSuccess(true);
      } else {
        alert(d.error || "Request failed");
      }
    } catch (err) {
      alert("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <RequireAuth>
        <div className="page-hero">
          <div className="wrap">
            <h1 className="h-display">Request One-to-One Coaching</h1>
            <p className="lead">
              Request a private coaching session with our experts. This is for
              premium members.
            </p>
          </div>
        </div>

        <section>
          <div className="wrap">
            {!user ? (
              <p>Please sign in to request a session.</p>
            ) : success ? (
              <div className="msg success">
                Request submitted — our team will contact you.
              </div>
            ) : (
              <form onSubmit={submit} className="card">
                <div className="field">
                  <label>Preferred time (ISO)</label>
                  <input
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    placeholder="2026-08-20T15:00:00Z"
                  />
                </div>
                <div className="field">
                  <label>Message / Notes</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    className="btn solid"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Sending…" : "Request Session"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </RequireAuth>
    </SiteShell>
  );
}
