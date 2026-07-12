"use client";

import { useState } from "react";
import { SiteShell } from "../components/site-shell";

export default function ContactPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleContactSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setContactSubmitting(true);
    setContactMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await response.json();
      setContactMessage(data.message || "Thank you for reaching out!");
      setContactForm({
        name: "",
        email: "",
        company: "",
        service: "",
        message: "",
      });
    } catch {
      setContactMessage(
        "We could not send the message right now. Please email us directly at hello@feraisolutions.com.",
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Contact</div>
          <h1 className="h-display">Let&apos;s build something exceptional.</h1>
          <p className="lead">
            Tell us where you are today and what you need to achieve. We turn
            complex requirements into a clear technical plan, architecture, and
            delivery path.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="contact-container">
            <div className="contact-info-side">
              <div className="eyebrow">Let&apos;s talk</div>
              <h2 className="h-section">Ready to bring your idea to life?</h2>
              <p className="lead">
                We usually respond within 24 hours with a thoughtful next step.
              </p>
              <div className="contact-details">
                <div className="contact-detail-row">
                  <span className="detail-label">Email</span>
                  <a href="mailto:hello@feraisolutions.com">
                    hello@feraisolutions.com
                  </a>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">Response time</span>
                  <span>Within 24 hours</span>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <h3>Send us a message</h3>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="contactName">Your name *</label>
                  <input
                    id="contactName"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    placeholder="Alex Morgan"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="contactEmail">Email *</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    placeholder="alex@company.com"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="contactCompany">Company</label>
                  <input
                    id="contactCompany"
                    type="text"
                    value={contactForm.company}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        company: e.target.value,
                      })
                    }
                    placeholder="Your company"
                  />
                </div>
                <div className="field">
                  <label htmlFor="contactService">I need help with</label>
                  <select
                    id="contactService"
                    value={contactForm.service}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        service: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a service...</option>
                    <option value="Web Platform">Web Platform / Website</option>
                    <option value="AI Agent">AI Agent / Automation</option>
                    <option value="Custom Software">Custom Software</option>
                    <option value="ERP System">ERP / Operations</option>
                    <option value="Mobile App">Mobile Application</option>
                    <option value="Fintech">Fintech / Payments</option>
                    <option value="Other">Something else</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="contactMessage">Project description *</label>
                <textarea
                  id="contactMessage"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  placeholder="Tell us about your project, goals, timeline, and requirements..."
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn solid"
                  disabled={contactSubmitting}
                >
                  {contactSubmitting ? "Sending..." : "Send message"}
                </button>
                <a href="mailto:hello@feraisolutions.com" className="btn">
                  Email directly
                </a>
              </div>
              {contactMessage ? (
                <p className="form-message">{contactMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
