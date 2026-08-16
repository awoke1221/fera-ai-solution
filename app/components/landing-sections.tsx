"use client";

import Link from "next/link";
import {
  companyHighlights,
  partners,
  services,
  testimonials,
} from "@/app/content";

export function LandingSections() {
  const featuredTestimonial = testimonials[0];

  return (
    <>
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
              <div className="contact-card">
                <div className="contact-row">
                  <span>Discovery call</span>
                  <strong>30 mins</strong>
                </div>
                <div className="contact-row">
                  <span>Typical engagement</span>
                  <strong>4–12 weeks</strong>
                </div>
                <Link href="/book" className="btn solid">
                  Book a consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
