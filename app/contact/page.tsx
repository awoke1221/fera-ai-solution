import dynamic from "next/dynamic";
import { SiteShell } from "../components/site-shell";

const ContactFormClient = dynamic(
  () =>
    import("../components/contact-form-client").then(
      (module) => module.ContactFormClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 300,
          display: "grid",
          placeItems: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading contact form...
      </div>
    ),
  },
);

export default function ContactPage() {
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

            <ContactFormClient />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
