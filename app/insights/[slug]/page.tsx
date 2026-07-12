import Link from "next/link";
import { notFound } from "next/navigation";
import { insights } from "../data";

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const insight = insights.find((item) => item.slug === params.slug);

  if (!insight) {
    notFound();
  }

  return (
    <main className="project-page">
      <div className="wrap detail-topbar">
        <div className="detail-topbar-inner">
          <Link href="/" className="brand detail-brand">
            <img
              src="/fera-logo.jpg"
              alt="Fera AI Solutions logo"
              className="brand-mark"
            />
            <span className="brand-text">Fera AI Solutions</span>
          </Link>
          <Link href="/" className="back-link">
            ← Back to home
          </Link>
        </div>
      </div>
      <div className="wrap project-shell">
        <article className="project-hero">
          <div className="eyebrow">Insights</div>
          <h1 className="h-section">{insight.title}</h1>
          <p className="lead">{insight.excerpt}</p>
          <div className="project-meta">
            <span>{insight.category}</span>
            <span>{insight.publishedAt}</span>
            <span>{insight.readTime}</span>
          </div>
          <p style={{ marginTop: 24, color: "var(--muted)" }}>
            This article placeholder highlights the kind of advanced, practical
            content we publish around AI systems, software platforms, ERP
            strategy, learning technology, and blockchain-enabled products.
          </p>
        </article>
      </div>
    </main>
  );
}
