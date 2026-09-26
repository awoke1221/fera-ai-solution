import { SiteShell } from "../components/site-shell";
import { AICareerGuide } from "./career-guide";

export const metadata = {
  title: "Learn AI by Building Projects",
  description:
    "Choose one AI engineering skill, build a focused project, and follow practical implementation steps with tests and evidence.",
};

export default function AICareersPage() {
  return (
    <SiteShell>
      <main className="career-guide">
        <section className="career-hero">
          <div className="wrap career-hero-grid">
            <div className="career-hero-copy">
              <div className="career-kicker">
                Project-based AI engineering lab
              </div>
              <h1>Learn one AI skill by building one real project.</h1>
              <p>
                Choose LLMs, RAG, MCP, tool calling, evaluation, agents, or
                production reliability. Get the project idea, implementation
                steps, deliverables, and checks for that skill only.
              </p>
              <a className="career-primary-link" href="#career-focus-bar">
                Choose a skill project <span aria-hidden="true">↓</span>
              </a>
            </div>
            <aside className="career-hero-note" aria-label="Guide principles">
              <span className="career-note-index">FIELD NOTE 01</span>
              <strong>
                Pick one skill. Build it. Test it. Keep the proof.
              </strong>
              <span>
                Each project stays focused on one capability, with measurable
                checks and a saved build log.
              </span>
              <div className="career-note-stamp">2026 / PRACTICE FIRST</div>
            </aside>
          </div>
        </section>

        <AICareerGuide />
      </main>
    </SiteShell>
  );
}
