import Link from "next/link";
import React from "react";

export default function TutorialCard({ tutorial }: { tutorial: any }) {
  const difficultyColors = {
    beginner: "#10b981",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
  };

  const difficultyColor =
    difficultyColors[tutorial.difficulty as keyof typeof difficultyColors] ||
    "#64748b";

  return (
    <article className="tutorial-card reveal">
      <div className="tutorial-card-top">
        <span className="tutorial-card-badge">
          {tutorial.section || "General"}
        </span>
        {tutorial.lesson && (
          <span
            className="tutorial-card-badge"
            style={{ background: "#8b5cf6" }}
          >
            Lesson {tutorial.lesson}
          </span>
        )}
        {tutorial.difficulty && (
          <span
            className="tutorial-card-badge"
            style={{
              background: difficultyColor,
              textTransform: "capitalize",
            }}
          >
            {tutorial.difficulty}
          </span>
        )}
        {tutorial.readingTimeMinutes && (
          <span
            className="tutorial-card-badge"
            style={{ background: "#6366f1", fontSize: "0.75rem" }}
          >
            ⏱️ {tutorial.readingTimeMinutes} min read
          </span>
        )}
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
