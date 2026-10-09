import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/app/components/site-shell";
import { projects } from "../data";
import { ProjectImage } from "../project-image";
import styles from "./project.module.css";

type ProjectPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = projects.find((item) => item.slug === params.slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.title} — Case Study`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Fera AI Solutions`,
      description: project.description,
      images: [project.image],
    },
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = projects.find((item) => item.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <SiteShell>
      <div className={styles.page}>
        <div className="wrap">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/projects">Selected projects</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.title}</span>
          </nav>

          <section className={styles.hero} aria-labelledby="project-title">
            <div className={styles.heroCopy}>
              <div className="eyebrow">Selected work · Case study</div>
              <h1 id="project-title" className="h-display">
                {project.title}
              </h1>
              <p className={styles.summary}>{project.summary}</p>

              <div className={styles.tags} aria-label="Project categories">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className={styles.facts}>
                <div>
                  <span>Client</span>
                  <strong>{project.client}</strong>
                </div>
                {project.year ? (
                  <div>
                    <span>Year</span>
                    <strong>{project.year}</strong>
                  </div>
                ) : null}
              </div>

              <a
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn solid"
              >
                Explore the live project <span aria-hidden="true">↗</span>
              </a>
            </div>

            <figure className={styles.preview}>
              <ProjectImage
                src={project.image}
                alt={`${project.title} project visual`}
                title={project.title}
                className={styles.previewImage}
                loading="eager"
                fetchPriority="high"
              />
              <figcaption>Project visual</figcaption>
            </figure>
          </section>

          <section className={styles.story} aria-label="Project overview">
            <article className={styles.storyCard}>
              <span className={styles.sectionLabel}>01 · The challenge</span>
              <h2>What needed to change</h2>
              <p>{project.problem}</p>
            </article>

            <article className={`${styles.storyCard} ${styles.outcomeCard}`}>
              <span className={styles.sectionLabel}>02 · The outcome</span>
              <h2>What the project delivers</h2>
              <p>{project.outcome}</p>
            </article>
          </section>

          <section className={styles.approach}>
            <div className={styles.approachIntro}>
              <span className={styles.sectionLabel}>03 · Our approach</span>
              <h2>Designed around the real use case.</h2>
              <p>{project.solution}</p>
            </div>
            <div className={styles.deliverables}>
              <h3>Project highlights</h3>
              <ul>
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.scope}>
            <div>
              <span className={styles.sectionLabel}>In focus</span>
              <h2>What this project covers</h2>
            </div>
            <ul className={styles.scopeList}>
              {project.deliverables.map((deliverable) => (
                <li key={deliverable}>
                  <span aria-hidden="true">↗</span>
                  {deliverable}
                </li>
              ))}
            </ul>
          </section>

          <footer className={styles.footerCta}>
            <div>
              <span className={styles.sectionLabel}>Have a similar challenge?</span>
              <h2>Let&apos;s build the next one together.</h2>
            </div>
            <Link href="/contact" className="btn solid">
              Start a conversation
            </Link>
          </footer>
        </div>
      </div>
    </SiteShell>
  );
}
