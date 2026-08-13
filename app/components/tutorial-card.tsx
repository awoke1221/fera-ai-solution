import Link from "next/link";
import React from "react";

export default function TutorialCard({ tutorial }: { tutorial: any }) {
  return (
    <article style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
      <h2 style={{ margin: "0 0 8px 0" }}>
        <Link href={`/tutorials/${tutorial.slug}`}>{tutorial.title}</Link>
      </h2>
      <p style={{ margin: "0 0 8px 0", color: "#555" }}>{tutorial.excerpt}</p>
      <p style={{ margin: 0 }}>
        {" "}
        <Link href={`/tutorials/${tutorial.slug}`}>Read →</Link>
      </p>
    </article>
  );
}
