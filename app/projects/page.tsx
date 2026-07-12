import Link from "next/link";
import { projects } from "./data";
import { SiteShell } from "../components/site-shell";

export default function ProjectsPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Projects</div>
          <h1 className="h-display">Selected work with measurable impact.</h1>
          <p className="lead">
            A portfolio of AI-powered platforms, enterprise software, and
            digital products we have designed and shipped for ambitious clients.
          </p>
          <div className="hero-cta">
            <Link href="/contact" className="btn solid">
              Discuss your idea
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="work-grid reveal">
            {projects.map((item) => (
              <Link
                href={`/projects/${item.slug}`}
                className="work-card"
                key={item.slug}
              >
                <div className="work-card-top">
                  <div className="work-tags">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <span className="work-year">{item.year}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="work-card-bottom">
                  <div className="work-metrics">
                    {item.metrics.slice(0, 2).map((m) => (
                      <span key={m} className="metric-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                  <span className="work-cta">View case study →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
