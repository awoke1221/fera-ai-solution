import Link from "next/link";
import { values } from "../content";
import { SiteShell } from "../components/site-shell";

const processSteps = [
  {
    title: "Discover",
    description:
      "We immerse ourselves in your business, users, workflows, and constraints before a single line of code is written.",
    icon: "🔍",
  },
  {
    title: "Design",
    description:
      "Architecture and interface evolve together so the system and experience are built as one unified product.",
    icon: "🎨",
  },
  {
    title: "Build",
    description:
      "Working software ships every week using AI-accelerated development and transparent delivery rituals.",
    icon: "⚡",
  },
  {
    title: "Deploy",
    description:
      "Every launch is hardened, monitored, and documented with production-grade reliability from day one.",
    icon: "🚀",
  },
  {
    title: "Support & Scale",
    description:
      "We stay engaged after launch to tune, extend, and evolve your platform as your business grows.",
    icon: "🔄",
  },
];

export default function ProcessPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Process</div>
          <h1 className="h-display">A proven process with no surprises.</h1>
          <p className="lead">
            We combine strategy, engineering, and delivery into a calm and
            transparent workflow that keeps momentum high and outcomes
            predictable.
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn solid">
              Discuss your roadmap
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <div className="process-step reveal" key={step.title}>
                <div className="process-step-marker">
                  <span className="step-icon">{step.icon}</span>
                  <div className="step-line" />
                </div>
                <div className="process-step-content">
                  <span className="step-label">
                    Step {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal">
        <div className="wrap">
          <div className="capability-banner">
            <h3>What this means in practice for your team.</h3>
            <div className="values-grid" style={{ marginTop: 24 }}>
              {values.map((value) => (
                <div className="value-card" key={value.title}>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
