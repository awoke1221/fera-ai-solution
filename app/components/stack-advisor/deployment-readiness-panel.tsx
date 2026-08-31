"use client";

import { useMemo } from "react";
import { buildDeploymentReadinessAssessment } from "./deployment-readiness";
import type { ProjectRequirements } from "./types";

interface DeploymentReadinessPanelProps {
  projectRequirements: ProjectRequirements | null;
}

export function DeploymentReadinessPanel({
  projectRequirements,
}: DeploymentReadinessPanelProps) {
  const assessment = useMemo(() => {
    if (!projectRequirements) {
      return null;
    }

    return buildDeploymentReadinessAssessment(projectRequirements);
  }, [projectRequirements]);

  if (!assessment || !projectRequirements) {
    return (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(8,16,24,0.76)",
          borderRadius: 18,
          padding: "1.25rem",
          color: "var(--muted)",
        }}
      >
        Complete the product discovery form to unlock deployment guidance and
        production readiness analysis.
      </div>
    );
  }

  const readinessTone =
    assessment.overallScore >= 80
      ? "Strong production readiness"
      : assessment.overallScore >= 60
        ? "Good foundation with hardening needed"
        : "Needs architecture hardening before launch";

  return (
    <div className="stack-adv-shell">
      <div className="stack-adv-header-shell">
        <div className="stack-adv-header-row">
          <div>
            <div className="stack-adv-eyebrow">
              Deployment strategy & readiness
            </div>
            <h3 className="stack-adv-heading">
              Production deployment engineering
            </h3>
          </div>

          <div className="stack-adv-kpi">
            <div className="stack-adv-kpi-label">Readiness score</div>
            <div className="stack-adv-kpi-value">
              {assessment.overallScore}/100
            </div>
            <div className="stack-adv-kpi-state">{readinessTone}</div>
          </div>
        </div>
      </div>

      <div className="stack-adv-grid">
        <div className="stack-adv-card">
          <h4 className="stack-adv-section-title">
            Recommended deployment strategy
          </h4>
          <ul className="stack-adv-list">
            {assessment.recommendedStrategy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="stack-adv-card">
          <h4 className="stack-adv-section-title">
            Ready for production checklist
          </h4>
          <ul className="stack-adv-list">
            {assessment.readyForProduction.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 style={{ marginBottom: 0 }}>Deployment options</h3>
        {assessment.deploymentOptions.map((option) => (
          <div
            key={option.title}
            style={{
              border: "1px solid rgba(255,255,255,0.11)",
              borderRadius: 18,
              padding: "1rem 1.1rem",
              background: "rgba(10,15,24,0.78)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "0.75rem",
              }}
            >
              <h4 style={{ margin: 0 }}>{option.title}</h4>
              <span
                style={{
                  padding: "0.32rem 0.7rem",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.12)",
                  color: "#bfdbfe",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Best for
              </span>
            </div>

            <p
              style={{
                margin: "0 0 0.75rem",
                color: "var(--muted)",
                lineHeight: 1.65,
              }}
            >
              {option.summary}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Advantages
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.1rem",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {option.advantages.map((advantage) => (
                    <li key={advantage}>{advantage}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Readiness checklist
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.1rem",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {option.readinessChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                marginTop: "0.9rem",
                padding: "0.75rem 0.85rem",
                borderRadius: 12,
                background: "rgba(31,180,184,0.08)",
                border: "1px solid rgba(31,180,184,0.14)",
                color: "#d7f5f5",
                lineHeight: 1.6,
              }}
            >
              <strong>Use case:</strong> {option.bestFor}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 style={{ marginBottom: 0 }}>Operational risk notes</h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.1rem",
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          {assessment.riskNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 style={{ marginBottom: 0 }}>Rollout plan</h3>
        <ol
          style={{
            margin: 0,
            paddingLeft: "1.2rem",
            color: "var(--muted)",
            lineHeight: 1.8,
          }}
        >
          {assessment.rolloutPlan.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
