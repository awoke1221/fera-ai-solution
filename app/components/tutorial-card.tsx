import Link from "next/link";
import React from "react";

export default function TutorialCard({ tutorial }: { tutorial: any }) {
  return (
    <article className="tutorial-card reveal">
      <div className="tutorial-card-top">
        <span className="tutorial-card-badge">Guide</span>
        <span className="tutorial-card-date">
          {tutorial.date || "New resource"}
        </span>
      </div>

      <h3>{tutorial.title}</h3>
      <p>{tutorial.excerpt}</p>

      <div className="tutorial-card-footer">
        <Link
          href={`/tutorials/${tutorial.slug}`}
          className="tutorial-card-link"
        >
          Read article
        </Link>
      </div>
    </article>
  );
}
