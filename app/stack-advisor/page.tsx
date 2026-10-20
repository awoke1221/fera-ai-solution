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
      <MembershipCheck>
        <StackAdvisorClient />
      </MembershipCheck>
    </SiteShell>
  );
}
