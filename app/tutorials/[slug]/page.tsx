import React from "react";
import Link from "next/link";
import { getTutorialBySlug } from "../../../lib/tutorials";
import { MDXRemote } from "next-mdx-remote/rsc";
import mdxComponents from "../../components/mdx-components";

export default async function TutorialPage({
  params,
}: {
  params: { slug: string };
}) {
  const tutorial = await getTutorialBySlug(params.slug);

  if (!tutorial) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Not found</h1>
        <p>The requested tutorial does not exist.</p>
        <p>
          <Link href="/tutorials">Back to tutorials</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <p>
        <Link href="/tutorials">← Back to tutorials</Link>
      </p>
      <h1>{tutorial.title}</h1>
      <p style={{ color: "#666" }}>{String(tutorial.date || "")}</p>
      {tutorial.mdxSource ? (
        <article>
          <MDXRemote
            {...tutorial.mdxSource}
            components={mdxComponents as any}
          />
        </article>
      ) : (
        <article
          dangerouslySetInnerHTML={{ __html: tutorial.contentHtml || "" }}
        />
      )}
    </main>
  );
}
