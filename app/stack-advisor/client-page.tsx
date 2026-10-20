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
  toolCategories,
  calculateCost,
  checkCompatibility,
  getProjectMapping,
  getOrderedCategories,
  isCategoryRequired,
  type ProjectDescriptionAnalysis,
  type ToolOption,
} from "../components/stack-advisor";

export function StackAdvisorClient() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [projectRequirements, setProjectRequirements] =
    useState<ProjectRequirements | null>(null);
  const [projectAnalysis, setProjectAnalysis] =
    useState<ProjectDescriptionAnalysis | null>(null);
  const [hasRestoredUrlState, setHasRestoredUrlState] = useState(false);
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

  const handleProjectTypeChange = useCallback(
    (projectTypeId: string | null) => {
      if (selectedProjectId !== projectTypeId) {
        setSelections({});
      }
      setSelectedProjectId(projectTypeId);
    },
    [selectedProjectId],
  );

  // ─── Restore selections from URL on mount ────────────
  useEffect(() => {
    const restored = getSelectionsFromUrl();
    const params = new URLSearchParams(window.location.search);
    const validSelections = Object.fromEntries(
      Object.entries(restored ?? {}).filter(([categoryId, toolId]) =>
        tools.some(
          (tool) => tool.id === toolId && tool.category === categoryId,
        ),
      ),
    );
    const querySelections = Object.fromEntries(
      Array.from(params.entries()).filter(([categoryId, toolId]) =>
        tools.some(
          (tool) => tool.id === toolId && tool.category === categoryId,
        ),
      ),
    );
    const projectId = params.get("project");

    if (projectId && projectTypes.some((project) => project.id === projectId)) {
      setSelectedProjectId(projectId);
    }

    setSelections(
      Object.keys(validSelections).length > 0
        ? validSelections
        : querySelections,
    );
    setHasRestoredUrlState(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasRestoredUrlState) return;

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
  }, [hasRestoredUrlState, selectedProjectId, selections]);

  const hasSelections = Object.keys(selections).length > 0;

  const selectedProject = useMemo(
    () =>
      projectTypes.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId],
  );

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((toolId) => tools.find((tool) => tool.id === toolId))
      .filter((tool): tool is ToolOption => Boolean(tool));
  }, [selections]);

  const compatibilityWarnings = useMemo(
    () => checkCompatibility(Object.values(selections)),
    [selections],
  );

  const costEstimate = useMemo(
    () => calculateCost(selectedTools, projectRequirements ?? undefined),
    [projectRequirements, selectedTools],
  );

  const requiredCategories = useMemo(() => {
    if (!selectedProjectId) return [];
    const mapping = getProjectMapping(selectedProjectId);
    return getOrderedCategories(mapping, toolCategories).filter((category) =>
      isCategoryRequired(category.id, mapping, category.required),
    );
  }, [selectedProjectId]);

  const completedRequiredCategories = requiredCategories.filter(
    (category) => Boolean(selections[category.id]),
  ).length;
  const blockingCompatibilityWarnings = compatibilityWarnings.filter(
    (warning) => warning.type !== "info",
  );

  const recommendedNextStep = useMemo(() => {
    if (compatibilityWarnings.length > 0) {
      return compatibilityWarnings[0].recommendation;
    }
    const nextRequiredCategory = requiredCategories.find(
      (category) => !selections[category.id],
    );
    if (nextRequiredCategory) {
      const label =
        toolCategories.find((category) => category.id === nextRequiredCategory.id)
          ?.label ?? nextRequiredCategory.id;
      return `Choose a tool for the required ${label.toLowerCase()} layer.`;
    }
    if (selectedTools.length > 0) {
      return "Review deployment, monitoring, backups, and security for your specific launch.";
    }
    return "Describe your project to get a focused recommendation, then review the required stack layers.";
  }, [compatibilityWarnings, requiredCategories, selections, selectedTools]);

  const stackKpis = [
    {
      label: "Required coverage",
      value: selectedProjectId
        ? `${completedRequiredCategories}/${requiredCategories.length}`
        : "Not set",
      trend: selectedProjectId ? "Selected layers only" : "Choose a project",
      tone:
        selectedProjectId &&
        completedRequiredCategories === requiredCategories.length
          ? "success"
          : "warning",
    },
    {
      label: "Tools selected",
      value: String(selectedTools.length),
      trend: selectedTools.length > 0 ? "Active" : "Waiting",
      tone: selectedTools.length > 0 ? "info" : "neutral",
    },
    {
      label: "Compatibility",
      value: `${compatibilityWarnings.length}`,
      trend:
        blockingCompatibilityWarnings.length > 0
          ? "Review needed"
          : compatibilityWarnings.length > 0
            ? "Informational notes"
            : "No rule conflicts found",
      tone: blockingCompatibilityWarnings.length > 0 ? "warning" : "info",
    },
    {
      label: "Est. monthly spend",
      value:
        selectedTools.length > 0
          ? `$${costEstimate.totalMonthly.min}–$${costEstimate.totalMonthly.max}`
          : "Select tools",
      trend:
        selectedTools.length > 0
          ? "Planning estimate"
          : "No cost inputs yet",
      tone: selectedTools.length > 0 ? "info" : "neutral",
    },
  ];

  const statusBlocks = [
    {
      title: "Compatibility review",
      detail:
        compatibilityWarnings.length === 0
          ? "No conflicts were found by the advisor's rules; this is not a runtime or security audit."
          : `${compatibilityWarnings.length} rule-based compatibility note(s) need review.`,
      tone: blockingCompatibilityWarnings.length > 0 ? "warning" : "info",
    },
    {
      title: "Delivery focus",
      detail: recommendedNextStep,
      tone: "info",
    },
    {
      title: "Project state",
      detail: selectedProject
        ? `${selectedProject.label} strategy is active.`
        : "No project type selected yet.",
      tone: selectedProject ? "success" : "neutral",
    },
    {
      title: "Assessment scope",
      detail:
        "This workspace is a planning aid. It does not inspect a deployed service or verify production readiness.",
      tone: "neutral",
    },
  ];

  const strategyScorecards = [
    {
      label: "Product fit",
      value: projectAnalysis
        ? projectAnalysis.source === "ai"
          ? "AI analyzed"
          : "Local suggestion"
        : selectedProject
          ? "Project selected"
          : "Pending",
      note: selectedProject
        ? `${selectedProject.label} is the current focus; verify the recommendation against your constraints.`
        : "Describe the project or choose a project type to start.",
      tone: projectAnalysis?.source === "ai" ? "success" : "neutral",
    },
    {
      label: "Required layers",
      value: selectedProjectId
        ? `${completedRequiredCategories}/${requiredCategories.length}`
        : "Not assessed",
      note: "Selection coverage only; deployment and operational checks are not run here.",
      tone:
        selectedProjectId &&
        completedRequiredCategories === requiredCategories.length
          ? "success"
          : "warning",
    },
    {
      label: "Compatibility rules",
      value: blockingCompatibilityWarnings.length
        ? `${blockingCompatibilityWarnings.length} to review`
        : "No blockers found",
      note:
        "Automated checks cover known tool combinations, not the full architecture or implementation.",
      tone: blockingCompatibilityWarnings.length > 0 ? "warning" : "info",
    },
    {
      label: "Scale input",
      value: projectRequirements?.expectedUsers ?? "Not specified",
      note: "Cost guidance uses the selected scale and published planning assumptions.",
      tone: projectRequirements ? "info" : "neutral",
    },
  ];

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
                  {selectedTools.length > 0
                    ? "Estimated monthly range"
                    : "Monthly estimate"}
              </div>
              <div className="stack-project-summary-cost">
                  {selectedTools.length > 0
                    ? `$${costEstimate.totalMonthly.min}–$${costEstimate.totalMonthly.max}/mo`
                    : "Select tools to estimate"}
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
            {projectAnalysis
              ? projectAnalysis.source === "ai"
                ? `AI analysis: ${projectAnalysis.confidence} confidence; review assumptions.`
                : "Local rules suggested this project type; review the match."
              : selectedProject
                ? "Review this project choice against your actual constraints."
                : "Describe a project or choose a direction to start."}
          </small>
        </div>

        <div className="stack-intel-card">
          <span className="stack-intel-label">Compatibility</span>
          <strong>{compatibilityWarnings.length} signals</strong>
          <small>
            {compatibilityWarnings.length > 0
              ? "Rule-based notes only; review them before deciding."
              : "No known tool conflicts were detected; this is not a full audit."}
          </small>
        </div>

        <div className="stack-intel-card">
          <span className="stack-intel-label">Next move</span>
          <strong>
            {selectedTools.length > 0 ? "Continue review" : "Define the stack"}
          </strong>
          <small>{recommendedNextStep}</small>
        </div>
      </div>

      <div className="stack-dashboard-board">
        <div className="stack-dashboard-kpis">
          <div className="stack-panel-header">
            <span>Executive overview</span>
            <span className="stack-pill neutral">Planning</span>
          </div>
          <div className="stack-kpi-grid">
            {stackKpis.map((kpi) => (
              <div key={kpi.label} className={`stack-kpi-card ${kpi.tone}`}>
                <span className="stack-kpi-label">{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.trend}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="stack-status-panel">
          <div className="stack-panel-header">
            <span>Planning status</span>
            <span className="stack-pill info">Not a live health check</span>
          </div>
          <div className="stack-status-list">
            {statusBlocks.map((block) => (
              <div
                key={block.title}
                className={`stack-status-item ${block.tone}`}
              >
                <div className="stack-status-title">{block.title}</div>
                <p>{block.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stack-strategy-board">
        <div className="stack-panel-header">
          <span>Decision quality</span>
          <span className="stack-pill neutral">Advanced</span>
        </div>
        <div className="stack-score-grid">
          {strategyScorecards.map((card) => (
            <div key={card.label} className={`stack-score-card ${card.tone}`}>
              <span className="stack-score-label">{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </div>
          ))}
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
          onProjectTypeChange={handleProjectTypeChange}
          onProjectAnalysisChange={setProjectAnalysis}
          onComplete={() => setActiveView("select")}
        />
      </div>

      <div style={{ display: activeView === "select" ? "block" : "none" }}>
        <ToolSelector
          selectedProjectId={selectedProjectId}
          selectedSelections={selections}
          projectRequirements={projectRequirements}
          projectAnalysis={projectAnalysis}
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
        <DeploymentReadinessPanel
          projectRequirements={projectRequirements}
          selectedTools={selectedTools}
        />
      )}

      {activeView === "cloud" && (
        <CloudDeploymentPanel
          projectRequirements={projectRequirements}
          selectedTools={selectedTools}
        />
      )}

      {activeView === "advanced-cloud" && (
        <CloudDeploymentAdvancedPanel
          projectRequirements={projectRequirements}
          selectedTools={selectedTools}
        />
      )}

      {activeView === "diagram" && <StackDiagram selections={selections} />}

      {activeView === "details" && (
        <ToolDetails
          selections={selections}
          selectedProjectType={selectedProjectId}
          projectRequirements={projectRequirements}
          onSelectionsChange={handleSelectionsChange}
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

      {activeView === "cost" && (
        <CostProjections
          selections={selections}
          projectRequirements={projectRequirements}
        />
      )}

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
            <ShareStack
              selections={selections}
              projectId={selectedProjectId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
