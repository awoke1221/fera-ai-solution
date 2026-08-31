"use client";

import { useMemo } from "react";
import { buildCloudDeploymentRecommendation } from "./cloud-deployment-recommendation";
import type { ProjectRequirements } from "./types";

interface CloudDeploymentPanelProps {
  projectRequirements: ProjectRequirements | null;
}

export function CloudDeploymentPanel({
  projectRequirements,
}: CloudDeploymentPanelProps) {
  const recommendation = useMemo(() => {
    if (!projectRequirements) return null;
    return buildCloudDeploymentRecommendation(projectRequirements);
  }, [projectRequirements]);

  if (!recommendation || !projectRequirements) {
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
        Complete the discovery workflow to unlock cloud deployment strategy and
        provider guidance.
      </div>
    );
  }

  return (
    <div className="stack-adv-shell">
      <div className="stack-adv-header-shell">
        <div className="stack-adv-header-row">
          <div>
            <div className="stack-adv-eyebrow">
              Cloud architecture recommendation
            </div>
            <h3 className="stack-adv-heading">
              Provider strategy and production deployment guidance
            </h3>
          </div>
        </div>
      </div>

      <div className="stack-adv-grid">
        <div className="stack-adv-card">
          <h4 className="stack-adv-section-title">Primary recommendation</h4>
          <ul className="stack-adv-list">
            {recommendation.primaryProvider.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="stack-adv-card">
          <h4 className="stack-adv-section-title">Cost summary</h4>
          <ul className="stack-adv-list">
            {recommendation.costSummary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Provider options</h3>
        {recommendation.providerOptions.map((option) => (
          <div key={option.provider} className="stack-adv-card">
            <div className="stack-adv-card-header">
              <h4>{option.provider}</h4>
              <span className="stack-adv-meta-pill">
                {option.monthlyCostBand}
              </span>
            </div>

            <p
              style={{
                margin: "0 0 0.8rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              {option.fit}
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
                  Strengths
                </div>
                <ul className="stack-adv-list">
                  {option.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Watch-outs
                </div>
                <ul className="stack-adv-list">
                  {option.watchouts.map((watchout) => (
                    <li key={watchout}>{watchout}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="stack-adv-note">
              <strong>Ideal for:</strong> {option.idealFor}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Decision matrix</h3>
        {recommendation.decisionMatrix.map((metric) => (
          <div key={metric.metric} className="stack-adv-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
                marginBottom: "0.4rem",
              }}
            >
              <strong>{metric.metric}</strong>
              <span className="stack-adv-meta-pill">{metric.weighting}</span>
            </div>
            <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              {metric.summary}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <h3 className="stack-adv-section-title">Strategic recommendation</h3>
        <div className="stack-adv-card">
          <ul className="stack-adv-list" style={{ paddingLeft: "1.2rem" }}>
            {recommendation.strategicRecommendation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
