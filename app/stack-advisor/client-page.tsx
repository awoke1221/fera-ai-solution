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
        <div className="stack-project-summary-panel">
          <div className="stack-project-summary-overlay" />
          <div className="stack-project-summary-top">
            <div>
              <div className="stack-project-summary-kicker">
                {projectRequirements
                  ? "Project discovery"
                  : "Advanced stack intelligence"}
              </div>
              <div className="stack-project-summary-title">
                {projectRequirements
                  ? `${projectRequirements.projectName || "Project summary"}`
                  : selectedProject
                    ? `${selectedProject.icon} ${selectedProject.label}`
                    : "Custom stack plan"}
              </div>
            </div>
            <div className="stack-project-summary-cost-wrap">
              <div className="stack-project-summary-cost-label">
                Estimated cost
              </div>
              <div className="stack-project-summary-cost">
                ${costEstimate.totalMonthly.max}/mo
              </div>
            </div>
          </div>

          <div className="stack-project-summary-badges">
            {projectRequirements && (
              <span className="stack-project-summary-badge stack-project-summary-badge-teal">
                {projectRequirements.projectCategory}
              </span>
            )}
            <span className="stack-project-summary-badge stack-project-summary-badge-sky">
              {Object.keys(selections).length} tools selected
            </span>
            <span className="stack-project-summary-badge stack-project-summary-badge-amber">
              {compatibilityWarnings.length} compatibility checks
            </span>
            <span className="stack-project-summary-badge stack-project-summary-badge-emerald">
              ✓ {recommendedNextStep}
            </span>
          </div>
        </div>
      )}

      <div className="stack-intel-strip">
        <div className="stack-intel-card stack-intel-card-primary">
          <span className="stack-intel-label">Primary fit</span>
          <strong>
            {selectedProject
              ? `${selectedProject.icon} ${selectedProject.label}`
              : "Choose a project type"}
          </strong>
          <small>
            {selectedProject
              ? "Architecture is tuned toward the right launch pattern."
              : "Select a direction to unlock the best stack strategy."}
          </small>
        </div>

        <div className="stack-intel-card">
          <span className="stack-intel-label">Compatibility</span>
          <strong>{compatibilityWarnings.length} signals</strong>
          <small>
            {compatibilityWarnings.length > 0
              ? "Review the warnings before moving to production."
              : "Your current stack is well-aligned and stable."}
          </small>
        </div>

        <div className="stack-intel-card">
          <span className="stack-intel-label">Next move</span>
          <strong>
            {selectedTools.length > 0 ? "Harden the stack" : "Define the stack"}
          </strong>
          <small>{recommendedNextStep}</small>
        </div>
      </div>

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
