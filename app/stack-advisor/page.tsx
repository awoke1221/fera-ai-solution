// ─── Stack Advisor Page — Premium Members Only ──────
// This page provides an interactive wizard for vibe coders to
// select their project type and tech stack, visualize connections,
// and get detailed configuration + business recommendations.
// Access requires an active premium membership.

import dynamic from "next/dynamic";
import { SiteShell } from "../components/site-shell";
import { MembershipCheck } from "../components/membership-check";

const StackAdvisorClient = dynamic(
  () => import("./client-page").then((module) => module.StackAdvisorClient),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 420,
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Loading Stack Advisor...
      </div>
    ),
  },
);

export const metadata = {
  title: "Stack Advisor — Vibe Coder's Tech Stack Platform",
  description:
    "Interactive tech stack advisor for vibe coders. Select your project type, choose tools, visualize architecture diagrams, and get production-ready configurations.",
  openGraph: {
    title: "Stack Advisor — Vibe Coder's Tech Stack Platform",
    description:
      "Build your perfect tech stack with interactive diagrams, Ethiopian payment integrations, and production-ready configurations.",
  },
};

export default function StackAdvisorPage() {
  return (
    <SiteShell>
      <section className="page-hero stack-advisor-hero">
        <div className="wrap stack-hero-layout">
          <div className="stack-hero-copy">
            <div className="eyebrow">Premium Strategy Tool</div>
            <h1 className="h-display">
              Stack <span className="gradient-text">Advisor</span>
            </h1>
            <p className="lead">
              Design a sharper architecture, compare the right technologies, and
              get a production-ready stack recommendation tailored to your team,
              budget, and market context.
            </p>
            <div className="stack-hero-badges">
              <span>AI recommendations</span>
              <span>Architecture diagrams</span>
              <span>Cost planning</span>
            </div>
          </div>

          <div className="stack-hero-panel">
            <div className="stack-hero-panel-label">Live strategy snapshot</div>
            <div className="stack-hero-panel-metric">
              <strong>3x</strong>
              <span>faster architecture decisions</span>
            </div>
            <div className="stack-hero-panel-grid">
              <div>
                <small>Guidance</small>
                <strong>AI + expert</strong>
              </div>
              <div>
                <small>Delivery</small>
                <strong>Launch-ready</strong>
              </div>
              <div>
                <small>Scalability</small>
                <strong>Built in</strong>
              </div>
              <div>
                <small>Budget</small>
                <strong>Optimized</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ borderBottom: "none" }}>
        <div className="wrap">
          <MembershipCheck>
            <StackAdvisorClient />
          </MembershipCheck>
        </div>
      </section>
    </SiteShell>
  );
}
