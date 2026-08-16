import React from "react";
import Link from "next/link";
import { getTutorialBySlug } from "../../../lib/tutorials";
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
    </SiteShell>
  );
}
