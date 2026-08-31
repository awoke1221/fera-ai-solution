"use client";

import { useMemo } from "react";
import { buildAdvancedStackInsights } from "./advanced-insights";
import type { ProjectRequirements } from "./types";

interface AdvancedInsightsPanelProps {
  projectRequirements: ProjectRequirements | null;
  selections: Record<string, string>;
  selectedProject?: { label?: string; icon?: string } | null;
}

export function AdvancedInsightsPanel({
  projectRequirements,
  selections,
  selectedProject,
}: AdvancedInsightsPanelProps) {
  const insights = useMemo(() => {
    if (!projectRequirements) return [];
    return buildAdvancedStackInsights(projectRequirements);
  }, [projectRequirements]);

  if (!projectRequirements) {
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
        Complete the discovery wizard to unlock advanced stack guidance.
      </div>
    );
  }

  return (
    <div className="stack-adv-shell">
      <div className="stack-adv-header-shell">
        <div className="stack-adv-header-row">
          <div>
            <div className="stack-adv-eyebrow">Advanced advisor layer</div>
            <h3 className="stack-adv-heading">
              Strategy, risk, and rollout planning
            </h3>
          </div>
          <div className="stack-adv-badge-row">
            {selectedProject && (
              <span className="stack-adv-badge">
                {selectedProject.icon || "📦"} {selectedProject.label}
              </span>
            )}
            {Object.keys(selections).length > 0 && (
              <span className="stack-adv-badge success">
                {Object.keys(selections).length} tools selected
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="stack-adv-grid">
        {insights.map((insight) => (
          <div
            key={`${insight.category}-${insight.headline}`}
            className="stack-adv-card features"
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background:
                    insight.priority === "high"
                      ? "rgba(239,68,68,0.12)"
                      : insight.priority === "medium"
                        ? "rgba(251,191,36,0.12)"
                        : "rgba(16,185,129,0.12)",
                  color:
                    insight.priority === "high"
                      ? "#fca5a5"
                      : insight.priority === "medium"
                        ? "#fcd34d"
                        : "#86efac",
                  borderRadius: 999,
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {insight.category}
              </span>
              <span
                style={{
                  color: "var(--muted)",
                  fontSize: "0.72rem",
                  textTransform: "capitalize",
                }}
              >
                {insight.priority} priority
              </span>
            </div>

            <h4 style={{ margin: 0, fontSize: "1.08rem" }}>
              {insight.headline}
            </h4>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              {insight.detail}
            </p>
            <div
              style={{
                padding: "0.75rem 0.85rem",
                borderRadius: 12,
                background: "rgba(31,180,184,0.08)",
                border: "1px solid rgba(31,180,184,0.14)",
                color: "#d7f5f5",
                lineHeight: 1.5,
              }}
            >
              <strong>Recommendation:</strong> {insight.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
