"use client";

import { useState } from "react";

export function ContactFormClient() {
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
      {contactMessage ? <p className="form-message">{contactMessage}</p> : null}
    </form>
  );
}
