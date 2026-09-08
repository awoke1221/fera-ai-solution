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
              <div className="eyebrow">Production • Level • Development</div>
              <h1 className="h-display">
                A Platform that Automates
                <br />
                <span className="gradient-text">Developers Work.</span>
              </h1>
              <p className="lead">
                AI-powered Software Development Guide / Software Building
                Platform A platform that guides developers from a software idea
                to production, helping them plan, design, build, test, deploy,
                and maintain any type of software step by step
              </p>

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
                  <span>Projects </span>
                </div>
                <div className="stat">
                  <b>15+</b>
                  <span>Production Levels</span>
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
          </div>
        </div>
      </section>

      <LandingSections />
    </SiteShell>
  );
}
