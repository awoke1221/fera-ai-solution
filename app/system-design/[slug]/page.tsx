// ─── Individual System Design Tutorial Page ──────────
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";
import { PremiumGate } from "@/app/components/premium-gate";

export default function TutorialDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tutorial, setTutorial] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tutorials")
      .then((res) => res.json())
      .then((data) => {
        const found = data.tutorials?.find((t: any) => t.slug === slug);
        setTutorial(found || null);
        setHasPremium(data.hasPremium || false);
      })
      .catch(() => setTutorial(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <h1 className="h-display">Loading...</h1>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!tutorial) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <h1 className="h-display">Tutorial not found</h1>
            <Link href="/system-design" className="btn">
              ← Back to tutorials
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case "beginner":
        return "var(--teal)";
      case "intermediate":
        return "var(--amber)";
      case "advanced":
        return "var(--danger)";
      default:
        return "var(--muted)";
    }
  };

  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <Link
            href="/system-design"
            className="back-link"
            style={{ display: "inline-block", marginBottom: "16px" }}
          >
            ← Back to Tutorials
          </Link>
          <div className="eyebrow">{tutorial.category}</div>
          <h1 className="h-display">
            {tutorial.icon} {tutorial.title}
          </h1>
          <div className="tutorial-detail-meta">
            <span
              className="tutorial-difficulty"
              style={{
                borderColor: difficultyColor(tutorial.difficulty),
                color: difficultyColor(tutorial.difficulty),
              }}
            >
              {tutorial.difficulty}
            </span>
            {tutorial.is_premium && (
              <span className="tutorial-premium-badge">💎 Premium</span>
            )}
          </div>
          <p className="lead">{tutorial.description}</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {tutorial.is_locked ? (
            <PremiumGate hasPremium={false}>
              <div />
            </PremiumGate>
          ) : (
            <div className="tutorial-content">
              <div className="tutorial-body">
                {tutorial.content
                  ?.split("\n")
                  .map((line: string, i: number) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={i} className="tutorial-heading">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <h3 key={i} className="tutorial-subheading">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("- **")) {
                      const match = line.match(/-\s\*\*(.+?)\*\*(.*)$/);
                      if (match) {
                        return (
                          <div key={i} className="tutorial-list-item">
                            <strong>{match[1]}</strong>
                            {match[2]}
                          </div>
                        );
                      }
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li key={i} className="tutorial-bullet">
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    if (line.startsWith("1. ")) {
                      return (
                        <li key={i} className="tutorial-num-item">
                          {line.replace(/^\d+\.\s*/, "")}
                        </li>
                      );
                    }
                    if (line.startsWith("`")) {
                      const codeMatch = line.match(/`(.+?)`/);
                      if (codeMatch) {
                        return (
                          <code key={i} className="tutorial-inline-code">
                            {codeMatch[1]}
                          </code>
                        );
                      }
                    }
                    if (line.trim() === "") {
                      return <br key={i} />;
                    }
                    return (
                      <p key={i} className="tutorial-paragraph">
                        {line}
                      </p>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
