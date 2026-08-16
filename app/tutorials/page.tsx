import React from "react";
import TutorialCard from "../components/tutorial-card";
import SearchTutorials from "../components/search-tutorials";
import {
  getAllTutorialSections,
  getAllTutorialTags,
  getAllTutorials,
} from "../../lib/tutorials";
import { SiteShell } from "../components/site-shell";

export default async function TutorialsPage({
  searchParams,
}: {
  searchParams?: { section?: string; tag?: string };
}) {
  const tutorials = await getAllTutorials();
  const sections = await getAllTutorialSections();
  const tags = await getAllTutorialTags();
  const selectedSection = searchParams?.section || "";
  const selectedTag = searchParams?.tag || "";

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSection =
      !selectedSection || (tutorial.section || "General") === selectedSection;
    const matchesTag =
      !selectedTag || (tutorial.tags || []).some((tag) => tag === selectedTag);
    return matchesSection && matchesTag;
  });

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

          <SearchTutorials tutorials={tutorials} />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <a
              href="/tutorials"
              className="btn"
              style={{ textDecoration: "none" }}
            >
              All
            </a>
            {sections.map((section) => (
              <a
                key={section}
                href={`/tutorials?section=${encodeURIComponent(section)}`}
                className="btn"
                style={{ textDecoration: "none" }}
              >
                {section}
              </a>
            ))}
            {tags.map((tag) => (
              <a
                key={tag}
                href={`/tutorials?tag=${encodeURIComponent(tag)}`}
                className="btn"
                style={{ textDecoration: "none" }}
              >
                #{tag}
              </a>
            ))}
          </div>

          {selectedSection || selectedTag ? (
            <div style={{ display: "grid", gap: 24 }}>
              <div>
                <div className="eyebrow">
                  Filtered by {selectedSection || selectedTag}
                </div>
              </div>
              <div className="tutorials-grid">
                {filteredTutorials.map((t) => (
                  <TutorialCard key={t.slug} tutorial={t} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 32 }}>
              {sections.map((section) => {
                const items = tutorials.filter(
                  (t) => (t.section || "General") === section,
                );

                return (
                  <div key={section}>
                    <div style={{ marginBottom: 16 }}>
                      <div className="eyebrow">{section}</div>
                    </div>
                    <div className="tutorials-grid">
                      {items.map((t) => (
                        <TutorialCard key={t.slug} tutorial={t} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
