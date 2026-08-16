import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects } from "../data";
import { SiteShell } from "@/app/components/site-shell";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((item) => item.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <SiteShell>
      <div className="project-page">
        <div className="wrap">
          <div className="detail-topbar-inner">
            <Link href="/projects" className="back-link">
              ← All projects
            </Link>
          </div>
        </div>
        <div className="wrap project-shell">
          <div className="project-hero">
            <div className="eyebrow">Case study</div>
            <h1 className="h-section">{project.title}</h1>
            <p className="lead">{project.summary}</p>
            <div className="project-meta">
              <span>{project.client}</span>
              <span>{project.year}</span>
              <span>{project.tags.join(" • ")}</span>
            </div>
            <Image
              src={project.image}
              alt={`${project.title} homepage preview`}
              className="project-preview-image"
              width={900}
              height={500}
              priority
              quality={85}
            />
            <div className="hero-cta">
              <a
                href={project.website}
                target="_blank"
                rel="noreferrer"
                className="btn solid"
              >
                Visit live site
              </a>
            </div>
          </div>

          <section className="project-section">
            <h2>The problem</h2>
            <p>{project.problem}</p>
          </section>

          <section className="project-section">
            <h2>What we built</h2>
            <p>{project.solution}</p>
            <ul>
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="project-section">
            <h2>Outcome</h2>
            <p>{project.outcome}</p>
            <div className="metrics-grid">
              {project.metrics.map((metric) => (
                <div className="metric-card" key={metric}>
                  <b>{metric}</b>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
