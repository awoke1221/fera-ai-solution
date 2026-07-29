// ─── System Design Tutorials Page ────────────────────
// Premium content library with gating
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";
import { PremiumGate } from "@/app/components/premium-gate";
import { AuthModal } from "@/app/components/auth-modal";

type Tutorial = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  icon: string;
  is_premium: boolean;
  is_locked: boolean;
  order_index: number;
};

export default function SystemDesignPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [hasPremium, setHasPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/tutorials").then((r) => r.json()),
      fetch("/api/auth/user").then((r) => r.json()),
    ])
      .then(([tutorialsData, userData]) => {
        setTutorials(tutorialsData.tutorials || []);
        setHasPremium(tutorialsData.hasPremium || false);
        setUser(userData.user);
      })
      .catch(() => setTutorials([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(tutorials.map((t) => t.category))];
  const difficulties = ["beginner", "intermediate", "advanced"];

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
          <div className="eyebrow">Learning Library</div>
          <h1 className="h-display">
            System Design <span className="gradient-text">Tutorials</span>
          </h1>
          <p className="lead">
            Master the art of system design with our comprehensive tutorial
            library. From fundamentals to advanced architecture patterns.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {loading ? (
            <div className="loading-shell">
              <div className="loading-spinner" />
              <p>Loading tutorials...</p>
            </div>
          ) : (
            <>
              {/* Category filters could go here */}

              <div className="tutorials-grid">
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className={`tutorial-card ${
                      tutorial.is_locked ? "locked" : ""
                    }`}
                  >
                    <div className="tutorial-card-top">
                      <span className="tutorial-icon">{tutorial.icon}</span>
                      {tutorial.is_locked && (
                        <span className="tutorial-lock-badge">🔒</span>
                      )}
                      {tutorial.is_premium && !tutorial.is_locked && (
                        <span className="tutorial-premium-badge">💎</span>
                      )}
                    </div>

                    <div className="tutorial-meta">
                      <span
                        className="tutorial-difficulty"
                        style={{
                          borderColor: difficultyColor(tutorial.difficulty),
                          color: difficultyColor(tutorial.difficulty),
                        }}
                      >
                        {tutorial.difficulty}
                      </span>
                      <span className="tutorial-category">
                        {tutorial.category}
                      </span>
                    </div>

                    <h3>{tutorial.title}</h3>
                    <p>{tutorial.description}</p>

                    {tutorial.is_locked ? (
                      <PremiumGate hasPremium={hasPremium} user={user}>
                        <div />
                      </PremiumGate>
                    ) : (
                      <div className="tutorial-card-footer">
                        <span className="tutorial-status free">
                          {tutorial.is_premium ? "Premium" : "Free"}
                        </span>
                        <Link
                          href={`/system-design/${tutorial.slug}`}
                          className="btn"
                        >
                          Read →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!hasPremium && (
                <div className="tutorials-cta">
                  <h2>Want full access?</h2>
                  <p>
                    Upgrade to premium to unlock all tutorials, including
                    in-depth architecture guides, templates, and project
                    reviews.
                  </p>
                  <div className="tutorials-cta-actions">
                    <Link href="/membership" className="btn solid">
                      View Membership Plans
                    </Link>
                    <button className="btn" onClick={() => setShowAuth(true)}>
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={() => window.location.reload()}
      />
    </SiteShell>
  );
}
