// ─── Home page — Hero, services overview, stats, CTA ──
import Link from "next/link";
import { LandingSections } from "./components/landing-sections";
import { SiteShell } from "./components/site-shell";

export default function HomePage() {
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

      <LandingSections />
    </SiteShell>
  );
}
