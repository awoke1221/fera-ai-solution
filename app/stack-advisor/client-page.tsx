"use client";

import { useState, useCallback } from "react";
import { ToolSelector } from "../components/stack-advisor/tool-selector";
import { StackDiagram } from "../components/stack-advisor/stack-diagram";
import { ToolDetails } from "../components/stack-advisor/tool-details";
import { tools } from "../components/stack-advisor";

export function StackAdvisorClient() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<
    "select" | "diagram" | "details"
  >("select");

  const handleSelectionsChange = useCallback(
    (newSelections: Record<string, string>) => {
      setSelections(newSelections);
    },
    [],
  );

  const hasSelections = Object.keys(selections).length > 0;

  return (
    <div className="stack-advisor-container">
      {/* View Switcher */}
      {hasSelections && (
        <div className="stack-view-switcher">
          <button
            className={`stack-view-btn ${activeView === "select" ? "active" : ""}`}
            onClick={() => setActiveView("select")}
          >
            🛠️ Select Tools
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
        </div>
      )}

      {/* Content based on active view — keep all mounted to preserve state */}
      <div style={{ display: activeView === "select" ? "block" : "none" }}>
        <ToolSelector onSelectionsChange={handleSelectionsChange} />
      </div>

      {activeView === "diagram" && <StackDiagram selections={selections} />}

      {activeView === "details" && <ToolDetails selections={selections} />}

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
          </div>
        </div>
      )}
    </div>
  );
}
