import React from "react";
import TutorialCard from "../components/tutorial-card";
import { getAllTutorials } from "../../lib/tutorials";
import { SiteShell } from "../components/site-shell";

export default async function TutorialsPage() {
  const tutorials = await getAllTutorials();

  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Tutorials</div>
          <h1 className="h-display">Learn, ship, and iterate faster.</h1>
          <p className="lead">
            Practical guides, product thinking, and implementation patterns for
            founders, builders, and product teams working on modern SaaS and AI
            products.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Resources</div>
              <h2 className="h-section">Fresh insights for your next build.</h2>
            </div>
          </div>

          <div className="tutorials-grid">
            {tutorials.map((t) => (
              <TutorialCard key={t.slug} tutorial={t} />
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
