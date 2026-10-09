import Link from "next/link";
import { projects } from "./data";
import { ProjectImage } from "./project-image";
import { SiteShell } from "../components/site-shell";

export const metadata = {
  title: "Selected Projects",
  description:
    "Explore digital products and websites built by Fera AI Solutions for businesses, communities, and product teams.",
};

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
                  {item.year ? (
                    <span className="work-year">{item.year}</span>
                  ) : null}
                </div>
                <ProjectImage
                  src={item.image || "/fera-logo.jpg"}
                  alt={`${item.title} project visual`}
                  title={item.title}
                  className="work-card-image"
                />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="work-card-bottom">
                  <div className="work-deliverables" aria-label="Project scope">
                    {item.deliverables.slice(0, 2).map((deliverable) => (
                      <span key={deliverable} className="deliverable-chip">
                        {deliverable}
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
                      rel="noopener noreferrer"
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
