"use client";

import Link from "next/link";
import { useState } from "react";
import {
  companyHighlights,
  teamMembers,
  testimonials,
  values,
} from "../content";
import { SiteShell } from "../components/site-shell";

function TeamAvatar({ member }: { member: (typeof teamMembers)[number] }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="team-visual">
      {member.image && !imageError ? (
        <img
          src={member.image}
          alt={member.name}
          className="team-photo"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="team-avatar">{member.initials}</div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">About</div>
          <h1 className="h-display">
            We build software that turns complexity into momentum and growth.
          </h1>
          <p className="lead">
            Fera AI Solutions partners with founders, operators, and ambitious
            teams to build advanced software platforms that are smart,
            resilient, and ready for measurable business impact.
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn solid">
              Let&apos;s talk
            </Link>
            <Link href="/projects" className="btn">
              See our work
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="about-grid">
            <div className="about-panel reveal">
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
                <div className="highlight-card reveal" key={item.label}>
                  <div className="highlight-number">{item.number}</div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Principles</div>
              <h2 className="h-section">
                The values that guide every engagement.
              </h2>
            </div>
          </div>
          <div className="values-grid">
            {values.map((value) => (
              <div className="value-card reveal" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Leadership</div>
              <h2 className="h-section">
                A senior team with deep product and engineering expertise.
              </h2>
            </div>
          </div>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div className="team-card reveal" key={member.name}>
                <TeamAvatar member={member} />
                <div className="team-card-content">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Testimonials</div>
              <h2 className="h-section">
                Trusted by founders and operators building complex products.
              </h2>
            </div>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <div className="testimonial-card" key={item.author}>
                <div className="testimonial-avatar">{item.avatar}</div>
                <p>“{item.quote}”</p>
                <div className="testimonial-author">
                  <b>{item.author}</b>
                  <span>{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
