"use client";
import React, { useMemo, useState } from "react";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";
import { RequireAuth } from "@/app/components/require-auth";

export default function OneToOnePage() {
  const user = useAuth((s: any) => s.user);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [focusArea, setFocusArea] = useState("Product strategy");
  const [goals, setGoals] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const summaryText = useMemo(() => {
    return [
      focusArea && `Focus area: ${focusArea}`,
      preferredDate && `Preferred date: ${preferredDate}`,
      preferredTime && `Preferred time: ${preferredTime}`,
      goals && `Goals: ${goals}`,
      message && `Notes: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [focusArea, preferredDate, preferredTime, goals, message]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate && !preferredTime && !goals && !message) {
      setStatus({
        type: "error",
        text: "Please share at least a preferred time or your main goal for the session.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const combinedPreferred = preferredDate
        ? preferredTime
          ? `${preferredDate}T${preferredTime}`
          : preferredDate
        : preferredTime || "";

      const finalMessage = summaryText || "No additional notes provided.";

      const res = await fetch("/api/membership/one-to-one/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_time: combinedPreferred,
          message: finalMessage,
        }),
      });

      const d = await res.json();
      if (d.ok) {
        setStatus({
          type: "success",
          text: "Your request has been submitted. We’ll reach out to confirm your priority slot.",
        });
        setPreferredDate("");
        setPreferredTime("");
        setFocusArea("Product strategy");
        setGoals("");
        setMessage("");
      } else {
        setStatus({
          type: "error",
          text:
            d.error || "We couldn’t submit your coaching request right now.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "Request failed. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <RequireAuth>
        <div className="one-to-one-shell">
          <div className="page-hero one-to-one-hero">
            <div className="wrap">
              <div className="eyebrow">Private advisory</div>
              <h1 className="h-display">Request a 1:1 coaching session</h1>
              <p className="lead">
                Tell us where you’re blocked and we’ll match your request with
                the right support session, roadmap, or technical review.
              </p>
            </div>
          </div>

          <section className="one-to-one-section">
            <div className="wrap one-to-one-layout">
              <div className="one-to-one-info card">
                <span className="info-badge">What this includes</span>
                <h2>Private guidance tailored to your stage</h2>
                <ul className="info-list">
                  <li>Architecture and system design reviews</li>
                  <li>Career strategy and interview preparation</li>
                  <li>Product and engineering planning support</li>
                  <li>Technical stack recommendations for your project</li>
                </ul>
                <div className="info-panel">
                  <strong>Response time</strong>
                  <p>
                    Usually within 1–2 business days for confirmed premium
                    members.
                  </p>
                </div>
              </div>

              <div className="one-to-one-form-wrap card">
                {status && (
                  <div
                    className={`session-notice ${status.type}`}
                    role="status"
                  >
                    {status.text}
                  </div>
                )}

                <form onSubmit={submit} className="one-to-one-form">
                  <div className="form-grid two-col">
                    <div className="field-group">
                      <label htmlFor="focus-area">Focus area</label>
                      <select
                        id="focus-area"
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value)}
                      >
                        <option>Product strategy</option>
                        <option>System design</option>
                        <option>Career coaching</option>
                        <option>Technical stack advisory</option>
                        <option>Custom project support</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label htmlFor="member-email">Membership</label>
                      <input
                        id="member-email"
                        value={user?.email || "Premium member"}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-grid two-col">
                    <div className="field-group">
                      <label htmlFor="preferred-date">Preferred date</label>
                      <input
                        id="preferred-date"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                      />
                    </div>
                    <div className="field-group">
                      <label htmlFor="preferred-time">Preferred time</label>
                      <input
                        id="preferred-time"
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="goals">
                      What would you like to achieve?
                    </label>
                    <textarea
                      id="goals"
                      rows={4}
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      placeholder="Example: I need help validating my platform architecture and identifying the best stack for a new product launch."
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="message">Additional context</label>
                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your current challenge, timeline, and anything you want us to review before the session."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn solid"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Sending request…" : "Request coaching"}
                    </button>
                    <span className="form-hint">
                      No spam. Just a direct coaching request.
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </RequireAuth>
    </SiteShell>
  );
}
