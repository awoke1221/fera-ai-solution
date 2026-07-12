// ─── Home page — Hero, services overview, stats, CTA ──
// This is the main landing page showcasing the studio's
// value proposition, core services, testimonials, and
// a closing call-to-action section.

import Link from "next/link";
import { companyHighlights, partners, services, testimonials } from "./content";
import { SiteShell } from "./components/site-shell";

export default function HomePage() {
  const featuredTestimonial = testimonials[0];

  return (
    <SiteShell>
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid-bg" />
          <div className="hero-orbe orbe-1" />
          <div className="hero-orbe orbe-2" />
          <div className="hero-orbe orbe-3" />
        </div>
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">Strategy • Engineering • AI</div>
              <h1 className="h-display">
                Software that helps
                <br />
                <span className="gradient-text">ambitious companies grow.</span>
              </h1>
              <p className="lead">
                We design and deliver high-performance web platforms, AI agents,
                enterprise systems, and digital products with the clarity of a
                product partner and the rigor of a senior engineering team.
              </p>
              <div className="hero-capabilities">
                <span className="hero-chip">Product strategy</span>
                <span className="hero-chip">Custom software</span>
                <span className="hero-chip">AI automation</span>
                <span className="hero-chip">Secure delivery</span>
                <span className="hero-chip">Scalable architecture</span>
              </div>
              <div className="hero-cta">
                <Link href="/projects" className="btn solid">
                  View our work
                </Link>
                <Link href="/book" className="btn">
                  Book a consultation →
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <b>50+</b>
                  <span>Products shipped</span>
                </div>
                <div className="stat">
                  <b>15+</b>
                  <span>Markets served</span>
                </div>
                <div className="stat">
                  <b>98%</b>
                  <span>Client retention</span>
                </div>
                <div className="stat">
                  <b>4.9/5</b>
                  <span>Client rating</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-code-panel">
                <div className="code-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="platform-card-title">Explore the studio</div>
                <div className="platform-stack">
                  <span className="platform-chip">Services</span>
                  <span className="platform-chip">Solutions</span>
                  <span className="platform-chip">Process</span>
                  <span className="platform-chip">Projects</span>
                </div>
                <div className="platform-footer">
                  <span>Smart delivery</span>
                  <span>Clear process</span>
                  <span>Real outcomes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="overview-grid">
            <Link href="/services" className="overview-card">
              <div className="eyebrow">Services</div>
              <h3>What we build</h3>
              <p>
                Explore our full capability set across web platforms, AI
                systems, ERP, LMS, blockchain, and custom software.
              </p>
            </Link>
            <Link href="/solutions" className="overview-card">
              <div className="eyebrow">Solutions</div>
              <h3>How we solve problems</h3>
              <p>
                See how we turn product ideas into scalable digital platforms
                with modern architecture and intelligent automation.
              </p>
            </Link>
            <Link href="/process" className="overview-card">
              <div className="eyebrow">Process</div>
              <h3>How delivery works</h3>
              <p>
                Learn about the disciplined workflow we use to move from
                discovery to launch and long-term support.
              </p>
            </Link>
            <Link href="/projects" className="overview-card">
              <div className="eyebrow">Projects</div>
              <h3>Selected client work</h3>
              <p>
                Browse real case studies and the measurable outcomes we
                delivered for ambitious teams.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="feature-shell">
            <div className="feature-copy reveal">
              <div className="eyebrow">Studio advantage</div>
              <h2 className="h-section">
                Built to turn ambitious ideas into dependable products.
              </h2>
              <p className="lead">
                We combine product strategy, AI execution, and senior
                engineering to give teams a calm, structured path from discovery
                to launch and long-term growth.
              </p>
              <div className="hero-cta">
                <Link href="/process" className="btn solid">
                  See our process
                </Link>
                <Link href="/about" className="btn">
                  Meet the team
                </Link>
              </div>
            </div>
            <div className="feature-panel reveal">
              <div className="feature-quote">
                <span className="quote-mark">“</span>
                <p>{featuredTestimonial.quote}</p>
                <div className="testimonial-author">
                  <b>{featuredTestimonial.author}</b>
                  <span>{featuredTestimonial.role}</span>
                </div>
              </div>
              <div className="feature-chips">
                {partners.map((partner) => (
                  <span className="feature-chip" key={partner}>
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Core capabilities</div>
              <h2 className="h-section">
                Focused services for modern product teams.
              </h2>
            </div>
            <Link href="/services" className="btn">
              See all services
            </Link>
          </div>
          <div className="services-grid">
            {services.slice(0, 6).map((service, index) => (
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

      <section>
        <div className="wrap">
          <div className="about-grid">
            <div className="about-panel">
              <h3>Why companies choose us</h3>
              <div className="about-points">
                <div className="about-point">
                  <strong>Strategic delivery</strong>
                  <span>
                    We align product, engineering, and business goals from the
                    outset.
                  </span>
                </div>
                <div className="about-point">
                  <strong>AI-native execution</strong>
                  <span>
                    Our teams build with intelligent automation and modern
                    delivery practices.
                  </span>
                </div>
                <div className="about-point">
                  <strong>Production-ready systems</strong>
                  <span>
                    Every solution is architected for scale, security, and
                    long-term maintenance.
                  </span>
                </div>
              </div>
            </div>
            <div className="highlights-grid">
              {companyHighlights.map((item) => (
                <div className="highlight-card" key={item.label}>
                  <div className="highlight-number">{item.number}</div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="wrap">
          <div className="contact-container">
            <div className="contact-info-side">
              <div className="eyebrow">Start a conversation</div>
              <h2 className="h-section">Ready to build something ambitious?</h2>
              <p className="lead">
                Share your goals, constraints, and timeline, and we will shape
                the right product strategy, architecture, and delivery roadmap.
              </p>
            </div>
            <div className="contact-form">
              <h3>Let&apos;s talk</h3>
              <div className="form-actions">
                <Link href="/book" className="btn solid">
                  Book a consultation
                </Link>
                <Link href="/about" className="btn">
                  Learn more about us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
