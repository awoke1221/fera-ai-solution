"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ShareStack,
  getSelectionsFromUrl,
} from "../components/stack-advisor/share-stack";
import { ProjectDiscoveryWizard } from "../components/stack-advisor/project-discovery-wizard";
import type { ProjectRequirements } from "../components/stack-advisor";

const ToolSelector = dynamic(
  () =>
    import("../components/stack-advisor/tool-selector").then(
      (module) => module.ToolSelector,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 300,
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Loading tool selector...
      </div>
    ),
  },
);

const StackDiagram = dynamic(
  () =>
    import("../components/stack-advisor/stack-diagram").then(
      (module) => module.StackDiagram,
    ),
  { ssr: false },
);

const ToolDetails = dynamic(
  () =>
    import("../components/stack-advisor/tool-details").then(
      (module) => module.ToolDetails,
    ),
  { ssr: false },
);

const AiRecommendation = dynamic(
  () =>
    import("../components/stack-advisor/ai-recommendation").then(
      (module) => module.AiRecommendation,
    ),
  { ssr: false },
);

const ToolComparison = dynamic(
  () =>
    import("../components/stack-advisor/tool-comparison").then(
      (module) => module.ToolComparison,
    ),
  { ssr: false },
);

const CostProjections = dynamic(
  () =>
    import("../components/stack-advisor/cost-projections").then(
      (module) => module.CostProjections,
    ),
  { ssr: false },
);

const CodeScaffolding = dynamic(
  () =>
    import("../components/stack-advisor/code-scaffolding").then(
      (module) => module.CodeScaffolding,
    ),
  { ssr: false },
);

const AdvancedInsightsPanel = dynamic(
  () =>
    import("../components/stack-advisor/advanced-insights-panel").then(
      (module) => module.AdvancedInsightsPanel,
    ),
  { ssr: false },
);

const DeploymentReadinessPanel = dynamic(
  () =>
    import("../components/stack-advisor/deployment-readiness-panel").then(
      (module) => module.DeploymentReadinessPanel,
    ),
  { ssr: false },
);

const CloudDeploymentPanel = dynamic(
  () =>
    import("../components/stack-advisor/cloud-deployment-panel").then(
      (module) => module.CloudDeploymentPanel,
    ),
  { ssr: false },
);

const CloudDeploymentAdvancedPanel = dynamic(
  () =>
    import("../components/stack-advisor/cloud-deployment-advanced-panel").then(
      (module) => module.CloudDeploymentAdvancedPanel,
    ),
  { ssr: false },
);
import {
  tools,
  projectTypes,
  calculateCost,
  checkCompatibility,
} from "../components/stack-advisor";

export function StackAdvisorClient() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [projectRequirements, setProjectRequirements] =
    useState<ProjectRequirements | null>(null);
  const [activeView, setActiveView] = useState<
    | "discover"
    | "select"
    | "insights"
    | "deploy"
    | "cloud"
    | "advanced-cloud"
    | "diagram"
    | "details"
    | "ai"
    | "compare"
    | "cost"
    | "scaffold"
  >("discover");

  const handleSelectionsChange = useCallback(
    (newSelections: Record<string, string>) => {
      setSelections(newSelections);
    },
    [],
  );

  // ─── Restore selections from URL on mount ────────────
  useEffect(() => {
    const restored = getSelectionsFromUrl();
    if (restored && Object.keys(restored).length > 0) {
      setSelections(restored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();
    if (selectedProjectId) {
      params.set("project", selectedProjectId);
    }

    Object.entries(selections).forEach(([categoryId, toolId]) => {
      if (toolId) {
        params.set(categoryId, toolId);
      }
    });

    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [selectedProjectId, selections]);

  const hasSelections = Object.keys(selections).length > 0;

  const selectedProject = useMemo(
    () =>
      projectTypes.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId],
  );

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((toolId) => tools.find((tool) => tool.id === toolId))
      .filter(Boolean);
  }, [selections]);

  const compatibilityWarnings = useMemo(
    () => checkCompatibility(Object.values(selections)),
    [selections],
  );

  const costEstimate = useMemo(
    () => calculateCost(selectedTools as any[]),
    [selectedTools],
  );

  const recommendedNextStep = useMemo(() => {
    if (compatibilityWarnings.length > 0) {
      return compatibilityWarnings[0].recommendation;
    }
    if (selectedTools.length > 0) {
      return "Add production monitoring, staging deployment, and a backup plan to harden the stack.";
    }
    return "Start by choosing a project type and your core frontend, backend, and database tools.";
  }, [compatibilityWarnings, selectedTools]);

  return (
    <div className="stack-advisor-container">
      {(projectRequirements || hasSelections || selectedProject) && (
        <div
          style={{
            border: "1px solid rgba(56, 189, 248, 0.28)",
            background: `linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.92),
              rgba(15, 118, 110, 0.2)
            ),
            linear-gradient(
              180deg,
              rgba(56, 189, 248, 0.08) 0%,
              rgba(34, 197, 94, 0.06) 100%
            )`,
            padding: "1.35rem 1.5rem",
            borderRadius: "22px",
            marginBottom: "1.2rem",
            display: "grid",
            gap: "0.9rem",
            boxShadow:
              "0 20px 35px rgba(2, 132, 199, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(
                circle at top right,
                rgba(56, 189, 248, 0.12),
                transparent 50%
              ),
              radial-gradient(
                circle at bottom left,
                rgba(34, 197, 94, 0.08),
                transparent 55%
              )`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "1rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "rgba(191, 219, 254, 0.8)",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                }}
              >
                {projectRequirements
                  ? "Project discovery"
                  : "Advanced stack intelligence"}
              </div>
              <div
                style={{
                  fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, rgba(226, 232, 240, 0.95) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {projectRequirements
                  ? `${projectRequirements.projectName || "Project summary"}`
                  : selectedProject
                    ? `${selectedProject.icon} ${selectedProject.label}`
                    : "Custom stack plan"}
              </div>
            </div>
            <div style={{ textAlign: "right", display: "grid", gap: "0.4rem" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(191, 219, 254, 0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontWeight: 700,
                }}
              >
                Estimated cost
              </div>
              <div
                style={{
                  fontSize: "clamp(1.3rem, 2vw, 1.8rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  background:
                    "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ${costEstimate.totalMonthly.max}/mo
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.85rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            {projectRequirements && (
              <span
                style={{
                  background:
                    "linear-gradient(135deg, rgba(31, 180, 184, 0.16), rgba(31, 180, 184, 0.08))",
                  padding: "0.45rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#d1fae5",
                  border: "1px solid rgba(56, 189, 248, 0.24)",
                  textTransform: "uppercase",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                {projectRequirements.projectCategory}
              </span>
            )}
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(56, 189, 248, 0.08))",
                padding: "0.45rem 0.9rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#e0f2fe",
                border: "1px solid rgba(56, 189, 248, 0.28)",
                textTransform: "uppercase",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {Object.keys(selections).length} tools selected
            </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(251, 191, 36, 0.08))",
                padding: "0.45rem 0.9rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#fef3c7",
                border: "1px solid rgba(251, 191, 36, 0.28)",
                textTransform: "uppercase",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {compatibilityWarnings.length} compatibility checks
            </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(34, 197, 94, 0.08))",
                padding: "0.45rem 0.9rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#d1fae5",
                border: "1px solid rgba(34, 197, 94, 0.28)",
                textTransform: "uppercase",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              ✓ {recommendedNextStep}
            </span>
          </div>
        </div>
      )}
      {/* View Switcher — AI is always available */}
      <div className="stack-view-switcher">
        {!hasSelections && activeView === "select" ? null : (
          <>
            <button
              className={`stack-view-btn ${activeView === "discover" ? "active" : ""}`}
              onClick={() => setActiveView("discover")}
            >
              🧭 Discovery
            </button>
            <button
              className={`stack-view-btn ${activeView === "select" ? "active" : ""}`}
              onClick={() => setActiveView("select")}
            >
              🛠️ Select Tools
            </button>
            {hasSelections && (
              <>
                <button
                  className={`stack-view-btn ${activeView === "insights" ? "active" : ""}`}
                  onClick={() => setActiveView("insights")}
                >
                  🧠 Advanced Insights
                </button>
                <button
                  className={`stack-view-btn ${activeView === "deploy" ? "active" : ""}`}
                  onClick={() => setActiveView("deploy")}
                >
                  🚀 Deployment Readiness
                </button>
                <button
                  className={`stack-view-btn ${activeView === "cloud" ? "active" : ""}`}
                  onClick={() => setActiveView("cloud")}
                >
                  ☁️ Cloud Strategy
                </button>
                <button
                  className={`stack-view-btn ${activeView === "advanced-cloud" ? "active" : ""}`}
                  onClick={() => setActiveView("advanced-cloud")}
                >
                  🧠 Advanced Cloud Plan
                </button>
                <button
                  className={`stack-view-btn ${activeView === "diagram" ? "active" : ""}`}
                  onClick={() => setActiveView("diagram")}
                >
                  📐 Architecture Diagram
                </button>
                <button
                  className={`stack-view-btn ${activeView === "details" ? "active" : ""}`}
                  onClick={() => setActiveView("details")}
                >
                  📋 Detailed Guide
                </button>
              </>
            )}
            <button
              className={`stack-view-btn ${activeView === "ai" ? "active" : ""}`}
              onClick={() => setActiveView("ai")}
            >
              🤖 AI Recommend
            </button>
            {hasSelections && (
              <button
                className={`stack-view-btn ${activeView === "compare" ? "active" : ""}`}
                onClick={() => setActiveView("compare")}
              >
                ⚖️ Compare
              </button>
            )}
            {hasSelections && (
              <button
                className={`stack-view-btn ${activeView === "cost" ? "active" : ""}`}
                onClick={() => setActiveView("cost")}
              >
                📊 Costs
              </button>
            )}
            {hasSelections && (
              <button
                className={`stack-view-btn ${activeView === "scaffold" ? "active" : ""}`}
                onClick={() => setActiveView("scaffold")}
              >
                📦 Scaffold
              </button>
            )}
          </>
        )}
      </div>

      {/* Content based on active view — keep all mounted to preserve state */}
      <div style={{ display: activeView === "discover" ? "block" : "none" }}>
        <ProjectDiscoveryWizard
          initialRequirements={projectRequirements}
          onRequirementsChange={setProjectRequirements}
          onComplete={() => setActiveView("select")}
        />
      </div>

      <div style={{ display: activeView === "select" ? "block" : "none" }}>
        <ToolSelector
          onSelectionsChange={handleSelectionsChange}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      {activeView === "insights" && (
        <AdvancedInsightsPanel
          projectRequirements={projectRequirements}
          selections={selections}
          selectedProject={selectedProject}
        />
      )}

      {activeView === "deploy" && (
        <DeploymentReadinessPanel projectRequirements={projectRequirements} />
      )}

      {activeView === "cloud" && (
        <CloudDeploymentPanel projectRequirements={projectRequirements} />
      )}

      {activeView === "advanced-cloud" && (
        <CloudDeploymentAdvancedPanel
          projectRequirements={projectRequirements}
        />
      )}

      {activeView === "diagram" && <StackDiagram selections={selections} />}

      {activeView === "details" && (
        <ToolDetails
          selections={selections}
          selectedProjectType={selectedProjectId}
        />
      )}

      {activeView === "ai" && (
        <AiRecommendation
          selections={selections}
          selectedProject={selectedProject}
          projectRequirements={projectRequirements}
        />
      )}

      {activeView === "compare" && <ToolComparison selections={selections} />}

      {activeView === "cost" && <CostProjections selections={selections} />}

      {activeView === "scaffold" && <CodeScaffolding selections={selections} />}

      {/* Mini preview when on selection view but with selections */}
      {activeView === "select" && hasSelections && (
        <div className="stack-preview-bar">
          <div className="stack-preview-info">
            <span className="stack-preview-count">
              {Object.keys(selections).length} tools selected
            </span>
            <div className="stack-preview-chips">
              {Object.entries(selections).map(([catId, toolId]) => {
                const tool = tools.find((t) => t.id === toolId);
                return (
                  <span key={catId} className="stack-preview-chip">
                    {tool
                      ? `${tool.icon} ${tool.name}`
                      : toolId.replace(/_/g, " ")}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="stack-preview-actions">
            <button
              className="btn solid"
              onClick={() => setActiveView("diagram")}
            >
              📐 View Diagram →
            </button>
            <button className="btn" onClick={() => setActiveView("details")}>
              📋 View Full Guide →
            </button>
            <ShareStack selections={selections} />
          </div>
        </div>
      )}
    </div>
  );
}
