import Link from "next/link";
import { notFound } from "next/navigation";
import { insights } from "../data";
import { SiteShell } from "@/app/components/site-shell";

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const insight = insights.find((item) => item.slug === params.slug);

  if (!insight) {
    notFound();
  }

  return (
    <SiteShell>
      <div className="project-page">
        <div className="wrap">
          <div className="detail-topbar-inner">
            <Link href="/insights" className="back-link">
              ← All insights
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
              This article placeholder highlights the kind of advanced,
              practical content we publish around AI systems, software
              platforms, ERP strategy, learning technology, and
              blockchain-enabled products.
            </p>
          </article>
        </div>
      </div>
    </SiteShell>
  );
}
