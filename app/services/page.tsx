import Link from "next/link";
import { industries, partners, services } from "../content";
import { SiteShell } from "../components/site-shell";

export default function ServicesPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Services</div>
          <h1 className="h-display">
            Advanced services built for ambitious teams.
          </h1>
          <p className="lead">
            We design and ship modern web platforms, AI systems, enterprise
            software, ERP and LMS experiences, and blockchain-enabled products
            with a production-first mindset.
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn solid">
              Book a discovery call
            </Link>
            <Link href="/projects" className="btn">
              Explore projects
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Capabilities</div>
              <h2 className="h-section">
                End-to-end delivery across the stack.
              </h2>
            </div>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card reveal" key={service.title}>
                <div className="service-icon-wrapper">
                  <span className="service-icon">{service.icon}</span>
                  <span className="service-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal">
        <div className="wrap">
          <div className="capability-banner">
            <h3>
              We partner with teams that need both strategic thinking and
              execution speed.
            </h3>
            <div className="capability-pills">
              <span>Product strategy</span>
              <span>AI implementation</span>
              <span>Enterprise architecture</span>
              <span>Launch support</span>
            </div>
            <div className="industry-grid" style={{ marginTop: 20 }}>
              {industries.map((industry) => (
                <div className="industry-card" key={industry}>
                  {industry}
                </div>
              ))}
            </div>
            <div className="partners-grid" style={{ marginTop: 20 }}>
              {partners.map((partner) => (
                <span className="partner-chip" key={partner}>
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
