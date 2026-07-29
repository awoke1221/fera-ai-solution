// ─── Stack Advisor Page — Vibe Coder's Tech Stack Platform ──
// This page provides an interactive wizard for vibe coders to
// select their project type and tech stack, visualize connections,
// and get detailed configuration + business recommendations.

import { SiteShell } from "../components/site-shell";
import { StackAdvisorClient } from "./client-page";

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
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Vibe Coder Tool</div>
          <h1 className="h-display">
            Stack <span className="gradient-text">Advisor</span>
          </h1>
          <p className="lead">
            Your intelligent tech stack companion. Select what you&apos;re
            building, choose your tools, and get a production-ready architecture
            diagram, environment variables, integration guides, and business
            recommendations — all tailored to your needs.
          </p>
        </div>
      </section>

      <section style={{ borderBottom: "none" }}>
        <div className="wrap">
          <StackAdvisorClient />
        </div>
      </section>
    </SiteShell>
  );
}
