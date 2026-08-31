"use client";

import { useMemo } from "react";
import {
  buildCloudCostComparison,
  generateDeploymentChecklist,
  selectDeploymentPattern,
} from "./cloud-deployment-advanced";
import type { ProjectRequirements } from "./types";

interface CloudDeploymentAdvancedPanelProps {
  projectRequirements: ProjectRequirements | null;
}

export function CloudDeploymentAdvancedPanel({
  projectRequirements,
}: CloudDeploymentAdvancedPanelProps) {
  const analysis = useMemo(() => {
    if (!projectRequirements) return null;
    return {
      costComparison: buildCloudCostComparison(projectRequirements),
      deploymentPattern: selectDeploymentPattern(projectRequirements),
      checklist: generateDeploymentChecklist(projectRequirements),
    };
  }, [projectRequirements]);

  if (!analysis || !projectRequirements) {
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
        Complete the discovery workflow to unlock advanced cloud deployment
        planning.
      </div>
    );
  }

  return (
    <div className="stack-adv-shell">
      <div className="stack-adv-header-shell">
        <div className="stack-adv-header-row">
          <div>
            <div className="stack-adv-eyebrow">
              Advanced cloud deployment planning
            </div>
            <h3 className="stack-adv-heading">
              Cost, pattern, and deployment architecture guidance
            </h3>
          </div>
        </div>
      </div>

      <div className="stack-adv-card">
        <h4>{analysis.deploymentPattern.title}</h4>
        <p
          style={{
            margin: "0 0 0.9rem",
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          {analysis.deploymentPattern.summary}
        </p>

        <div className="stack-adv-grid">
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Recommended architecture
            </div>
            <ul className="stack-adv-list">
              {analysis.deploymentPattern.recommendedArchitecture.map(
                (item) => (
                  <li key={item}>{item}</li>
                ),
              )}
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              When to use it
            </div>
            <ul className="stack-adv-list">
              {analysis.deploymentPattern.whenToUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Provider blueprints</h3>
        {analysis.deploymentPattern.providerBlueprints.map((entry) => (
          <div key={entry.provider} className="stack-adv-card">
            <div className="stack-adv-card-header">
              <h4>{entry.provider}</h4>
              <span className="stack-adv-meta-pill">{entry.estimatedCost}</span>
            </div>

            <p
              style={{
                margin: "0 0 0.8rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              {entry.reason}
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
                  Reference architecture
                </div>
                <ul className="stack-adv-list">
                  {entry.architecture.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Core services
                </div>
                <ul className="stack-adv-list">
                  {entry.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Deployment roadmap</h3>
        {analysis.deploymentPattern.roadmap.map((phase) => (
          <div key={phase.title} className="stack-adv-card">
            <div className="stack-adv-card-header">
              <h4>{phase.title}</h4>
            </div>

            <p
              style={{
                margin: "0 0 0.8rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              {phase.objective}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Focus</div>
                <ul className="stack-adv-list">
                  {phase.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Outcome</div>
                <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                  {phase.outcome}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Executive deployment board</h3>
        {analysis.deploymentPattern.decisionBoard.map((entry) => (
          <div key={entry.recommendedPhase} className="stack-adv-card">
            <div className="stack-adv-card-header">
              <h4>{entry.recommendedPhase}</h4>
              <span className="stack-adv-meta-pill">{entry.riskLevel}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Provider</div>
                <div style={{ color: "var(--muted)" }}>
                  {entry.targetProvider}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Rollout window
                </div>
                <div style={{ color: "var(--muted)" }}>
                  {entry.rolloutWindow}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Investment profile
                </div>
                <div style={{ color: "var(--muted)" }}>
                  {entry.investmentProfile}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "0.9rem",
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              {entry.reasoning}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Cloud cost comparison</h3>
        {analysis.costComparison.map((entry) => (
          <div key={entry.provider} className="stack-adv-card">
            <div className="stack-adv-card-header">
              <h4>{entry.provider}</h4>
              <span className="stack-adv-meta-pill">
                {entry.monthlyEstimate}
              </span>
            </div>

            <div
              style={{
                marginBottom: "0.8rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              <strong>Architecture:</strong> {entry.architecture}
            </div>

            <ul className="stack-adv-list">
              {entry.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="stack-adv-card">
        <h3 className="stack-adv-section-title" style={{ marginTop: 0 }}>
          Deployment checklist
        </h3>
        <ul className="stack-adv-list">
          {analysis.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
