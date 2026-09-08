import Link from "next/link";
import { projects } from "./data";
import { SiteShell } from "../components/site-shell";

export default function ProjectsPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Projects</div>
          <h1 className="h-display">
            Real client work we have launched and grown.
          </h1>
          <p className="lead">
            A curated portfolio of live websites and digital experiences we have
            designed and delivered for brands, businesses, creators, and modern
            service companies.
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
          <div className="work-grid">
            {projects.map((item) => (
              <div className="work-card" key={item.slug}>
                <div className="work-card-top">
                  <div className="work-tags">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <span className="work-year">{item.year}</span>
                </div>
                <img
                  src={item.image || "/fera-logo.jpg"}
                  alt={`${item.title} homepage preview`}
                  className="work-card-image"
                  loading="lazy"
                  decoding="async"
                />
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
                  <div className="work-actions">
                    <Link href={`/projects/${item.slug}`} className="work-cta">
                      View case study →
                    </Link>
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noreferrer"
                      className="work-cta"
                    >
                      Visit live site →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
