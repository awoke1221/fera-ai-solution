import Link from "next/link";
import { industries, values } from "../content";
import { SiteShell } from "../components/site-shell";

export default function SolutionsPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Solutions</div>
          <h1 className="h-display">
            Purpose-built software for intelligent growth.
          </h1>
          <p className="lead">
            From AI copilots to ERP systems and modern web applications, we
            bring strategy, design, and engineering together into one dependable
            platform.
          </p>
          <div className="hero-cta">
            <Link href="/services" className="btn solid">
              See capabilities
            </Link>
            <Link href="/book" className="btn">
              Start a project
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="solutions-grid">
            <div className="solution-card reveal">
              <h3>Digital products that scale</h3>
              <p>
                High-performance websites, portals, and SaaS products designed
                for speed, clarity, and growth.
              </p>
            </div>
            <div className="solution-card reveal">
              <h3>AI systems that operate</h3>
              <p>
                We build AI agents, copilots, and automation systems that reduce
                manual work and improve decision-making.
              </p>
            </div>
            <div className="solution-card reveal">
              <h3>Enterprise platforms that unify</h3>
              <p>
                ERP, LMS, operations tools, and blockchain systems are
                architected as a single connected layer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal">
        <div className="wrap">
          <div className="capability-banner">
            <h3>
              Built for operations, customer experience, and long-term growth.
            </h3>
            <div className="values-grid" style={{ marginTop: 24 }}>
              {values.map((value) => (
                <div className="value-card" key={value.title}>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
            <div className="industry-grid" style={{ marginTop: 24 }}>
              {industries.map((industry) => (
                <div className="industry-card" key={industry}>
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
