import React from "react";
import Link from "next/link";
import {
  getTutorialBySlug,
  getNextLesson,
  getPreviousLesson,
} from "../../../lib/tutorials";
import { MDXRemote } from "next-mdx-remote/rsc";
import mdxComponents from "../../components/mdx-components";
import { SiteShell } from "../../components/site-shell";

export default async function TutorialPage({
  params,
}: {
  params: { slug: string };
}) {
  const tutorial = await getTutorialBySlug(params.slug);

  if (!tutorial) {
    return (
      <SiteShell>
        <section className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Tutorials</div>
            <h1 className="h-display">Tutorial not found.</h1>
            <p className="lead">
              The requested tutorial does not exist, but there are more guides
              to explore below.
            </p>
            <div className="hero-cta">
              <Link href="/tutorials" className="btn solid">
                Back to tutorials
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const prevLesson =
    tutorial.lesson && tutorial.section
      ? await getPreviousLesson(tutorial.section, tutorial.lesson)
      : null;
  const nextLesson =
    tutorial.lesson && tutorial.section
      ? await getNextLesson(tutorial.section, tutorial.lesson)
      : null;

  return (
    <SiteShell>
      <section className="page-hero tutorial-detail-hero">
        <div className="wrap">
          <p className="tutorial-backlink">
            <Link href="/tutorials">← Back to tutorials</Link>
          </p>
          <div className="eyebrow">Tutorial</div>
          <h1 className="h-display">{tutorial.title}</h1>
          <p className="lead tutorial-meta">{String(tutorial.date || "")}</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <article className="tutorial-article">
            {tutorial.mdxSource ? (
              <MDXRemote
                {...tutorial.mdxSource}
                components={mdxComponents as any}
              />
            ) : (
              <div
                dangerouslySetInnerHTML={{ __html: tutorial.contentHtml || "" }}
              />
            )}
          </article>
        </div>
      </section>

      {(prevLesson || nextLesson) && (
        <section style={{ borderTop: "1px solid rgba(148,163,184,0.2)" }}>
          <div className="wrap">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                padding: "48px 0",
              }}
            >
              {prevLesson ? (
                <Link
                  href={`/tutorials/${prevLesson.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(148,163,184,0.4)";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.02)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(148,163,184,0.2)";
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    ← Previous Lesson
                  </span>
                  <span style={{ fontWeight: 600 }}>{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/tutorials/${nextLesson.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                    textAlign: "right",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(148,163,184,0.4)";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.02)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(148,163,184,0.2)";
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    Next Lesson →
                  </span>
                  <span style={{ fontWeight: 600 }}>{nextLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
