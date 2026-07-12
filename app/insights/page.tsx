import Link from "next/link";
import { insights } from "./data";
import { SiteShell } from "../components/site-shell";

export default function InsightsPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Insights</div>
          <h1 className="h-display">
            Thoughts on engineering, AI, and product strategy.
          </h1>
          <p className="lead">
            Practical lessons, technical deep dives, and perspectives from
            shipping production systems in modern organizations.
          </p>
          <div className="hero-cta">
            <Link href="/contact" className="btn solid">
              Start a conversation
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="insight-grid reveal">
            {insights.map((insight) => (
              <Link
                href={`/insights/${insight.slug}`}
                className="insight-card"
                key={insight.slug}
              >
                <div className="insight-card-top">
                  <span className="insight-category">{insight.category}</span>
                </div>
                <h3>{insight.title}</h3>
                <p>{insight.excerpt}</p>
                <div className="insight-meta">
                  <span>{insight.publishedAt}</span>
                  <span className="dot">·</span>
                  <span>{insight.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
