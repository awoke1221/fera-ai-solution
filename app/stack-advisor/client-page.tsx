"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ToolSelector } from "../components/stack-advisor/tool-selector";
import { StackDiagram } from "../components/stack-advisor/stack-diagram";
import { ToolDetails } from "../components/stack-advisor/tool-details";
import { AiRecommendation } from "../components/stack-advisor/ai-recommendation";
import { ToolComparison } from "../components/stack-advisor/tool-comparison";
import { CostProjections } from "../components/stack-advisor/cost-projections";
import { CodeScaffolding } from "../components/stack-advisor/code-scaffolding";
import {
  ShareStack,
  getSelectionsFromUrl,
} from "../components/stack-advisor/share-stack";
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
  const [activeView, setActiveView] = useState<
    "select" | "diagram" | "details" | "ai" | "compare" | "cost" | "scaffold"
  >("select");

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
      {(hasSelections || selectedProject) && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(8, 16, 24, 0.78)",
            padding: "1rem 1.15rem",
            borderRadius: "16px",
            marginBottom: "1rem",
            display: "grid",
            gap: "0.6rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--muted)",
                }}
              >
                Advanced stack intelligence
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                {selectedProject
                  ? `${selectedProject.icon} ${selectedProject.label}`
                  : "Custom stack plan"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Estimated cost
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                ${costEstimate.totalMonthly.max}/mo
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <span
              style={{
                background: "rgba(31, 180, 184, 0.14)",
                padding: "0.35rem 0.65rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            >
              {Object.keys(selections).length} tools selected
            </span>
            <span
              style={{
                background: "rgba(244, 178, 75, 0.14)",
                padding: "0.35rem 0.65rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            >
              {compatibilityWarnings.length} compatibility checks
            </span>
            <span
              style={{
                background: "rgba(34, 197, 94, 0.14)",
                padding: "0.35rem 0.65rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            >
              {recommendedNextStep}
            </span>
          </div>
        </div>
      )}
      {/* View Switcher — AI is always available */}
      <div className="stack-view-switcher">
        {!hasSelections && activeView === "select" ? null : (
          <>
            <button
              className={`stack-view-btn ${activeView === "select" ? "active" : ""}`}
              onClick={() => setActiveView("select")}
            >
              🛠️ Select Tools
            </button>
            {hasSelections && (
              <>
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
      <div style={{ display: activeView === "select" ? "block" : "none" }}>
        <ToolSelector
          onSelectionsChange={handleSelectionsChange}
          onProjectChange={setSelectedProjectId}
        />
      </div>

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
