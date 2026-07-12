"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteShell } from "../components/site-shell";

type FormData = {
  name: string;
  email: string;
  company: string;
  service: string;
  date: string;
  message: string;
};

const serviceOptions = [
  "AI Agent / Automation",
  "Web Platform / Website",
  "Custom Software",
  "ERP / Operations",
  "Mobile Application",
  "Fintech / Payments",
  "LMS / Learning Platform",
  "Blockchain / Web3",
  "Consulting & Strategy",
  "Something else",
];

export default function BookingPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    service: "",
    date: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.service || !form.date) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const bookingRecord = {
        id: Date.now(),
        clientName: form.name,
        clientEmail: form.email,
        service: form.service,
        bookingDate: form.date,
        notes: `Company: ${form.company || "N/A"}\nMessage: ${form.message}`,
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
        source: "website",
      };

      const existing = JSON.parse(
        localStorage.getItem("admin_bookings") || "[]",
      );
      existing.unshift(bookingRecord);
      localStorage.setItem("admin_bookings", JSON.stringify(existing));

      setSubmitted(true);
    } catch {
      setError(
        "Something went wrong. Please email us directly at hello@feraisolutions.com.",
      );
    }
  };

  if (submitted) {
    return (
      <SiteShell>
        <section className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Booking received</div>
            <h1 className="h-display">Thank you, {form.name}.</h1>
            <p className="lead" style={{ maxWidth: 600 }}>
              Your booking request has been received. We will review your
              details and respond within 24 hours with a clear next step.
            </p>
            <div className="hero-cta" style={{ marginTop: 32 }}>
              <Link href="/" className="btn solid">
                Back to home
              </Link>
              <Link href="/projects" className="btn">
                View our work
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Book a consultation</div>
          <h1 className="h-display">
            Let&apos;s start with a focused conversation.
          </h1>
          <p className="lead">
            Tell us about your project, timeline, and goals. We will prepare a
            tailored roadmap and schedule a call within 24 hours.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="booking-form-shell">
            <div className="booking-info">
              <div className="eyebrow">What happens next</div>
              <h2 className="h-section">A clear, structured process.</h2>
              <div className="booking-steps">
                <div className="booking-step">
                  <span className="booking-step-num">01</span>
                  <div>
                    <strong>You submit this form</strong>
                    <span>
                      Share your goals, requirements, and any relevant context.
                    </span>
                  </div>
                </div>
                <div className="booking-step">
                  <span className="booking-step-num">02</span>
                  <div>
                    <strong>We review and prepare</strong>
                    <span>
                      Our team studies your request and crafts a tailored
                      approach.
                    </span>
                  </div>
                </div>
                <div className="booking-step">
                  <span className="booking-step-num">03</span>
                  <div>
                    <strong>Discovery call</strong>
                    <span>
                      A focused conversation to align on vision, scope, and
                      delivery plan.
                    </span>
                  </div>
                </div>
                <div className="booking-step">
                  <span className="booking-step-num">04</span>
                  <div>
                    <strong>Proposal & start</strong>
                    <span>
                      You receive a clear proposal, timeline, and next steps.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="bookName">Full name *</label>
                  <input
                    id="bookName"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Alex Morgan"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="bookEmail">Email *</label>
                  <input
                    id="bookEmail"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="alex@company.com"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="bookCompany">Company</label>
                  <input
                    id="bookCompany"
                    type="text"
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Your company (optional)"
                  />
                </div>
                <div className="field">
                  <label htmlFor="bookService">Service needed *</label>
                  <select
                    id="bookService"
                    value={form.service}
                    onChange={(e) => handleChange("service", e.target.value)}
                    required
                  >
                    <option value="">Select a service...</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="bookDate">Preferred date *</label>
                <input
                  id="bookDate"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="bookMessage">Project details</label>
                <textarea
                  id="bookMessage"
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn solid">
                  Submit booking request
                </button>
                <a href="mailto:hello@feraisolutions.com" className="btn">
                  Email directly
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
