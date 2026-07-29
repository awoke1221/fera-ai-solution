"use client";

import { useState, useMemo } from "react";
import { tools, toolCategories } from ".";

// ─── Props ──────────────────────────────────────────────
interface ToolComparisonProps {
  selections: Record<string, string>;
}

// ─── Category color map for badges ─────────────────────
const catColorMap: Record<string, string> = {
  frontend: "#1fb4b8",
  backend: "#0b7fd4",
  database: "#f4b24b",
  auth: "#c792ea",
  storage: "#22c55e",
  deploy_frontend: "#38bdf8",
  deploy_backend: "#d9614f",
  cicd: "#f4b24b",
  payment: "#22c55e",
  email: "#e879f9",
  cache: "#ef4444",
  testing: "#34d399",
  monitoring: "#facc15",
  css_ui: "#f4b24b",
  state_mgmt: "#c792ea",
  search: "#38bdf8",
  mobile: "#22c55e",
};

// ─── Component ──────────────────────────────────────────
export function ToolComparison({ selections }: ToolComparisonProps) {
  const [compareSelections, setCompareSelections] = useState<
    Record<string, string[]>
  >({});

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean);
  }, [selections]);

  // Group selected tools by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof tools>();
    for (const tool of selectedTools as typeof tools) {
      if (!map.has(tool.category)) map.set(tool.category, []);
      map.get(tool.category)!.push(tool);
    }
    return Array.from(map.entries());
  }, [selectedTools]);

  const toggleCompare = (categoryId: string, toolId: string) => {
    setCompareSelections((prev) => {
      const current = prev[categoryId] || [];
      if (current.includes(toolId)) {
        return { ...prev, [categoryId]: current.filter((id) => id !== toolId) };
      }
      if (current.length >= 3) return prev; // max 3
      return { ...prev, [categoryId]: [...current, toolId] };
    });
  };

  const activeComparisons = Object.entries(compareSelections).filter(
    ([, ids]) => ids.length >= 2,
  );

  return (
    <div className="comparison-container">
      {/* Header */}
      <div className="comparison-header">
        <h4>&#x2696;&#xfe0f; Side-by-Side Tool Comparison</h4>
        <p>
          Select 2-3 tools from the same category to compare them side by side.
        </p>
      </div>

      {/* Category selection panels */}
      {grouped.length === 0 ? (
        <div className="comparison-empty">
          <div className="comparison-empty-icon">&#x2696;&#xfe0f;</div>
          <h4>No Tools Selected</h4>
          <p>
            Select tools in the Tool Selector view first, then come here to
            compare them.
          </p>
        </div>
      ) : (
        <div className="comparison-categories">
          {grouped.map(([catId, catTools]) => {
            const catLabel =
              toolCategories.find((c) => c.id === catId)?.label || catId;
            const compareIds = compareSelections[catId] || [];
            const catColor = catColorMap[catId] || "#666";
            return (
              <div key={catId} className="comparison-category-block">
                <div className="comparison-category-head">
                  <span
                    className="comparison-cat-badge"
                    style={{ borderColor: catColor + "44", color: catColor }}
                  >
                    {catLabel}
                  </span>
                  <span className="comparison-cat-count">
                    {compareIds.length}/3 selected for comparison
                  </span>
                </div>
                <div className="comparison-tool-row">
                  {(catTools as typeof tools).map((tool) => {
                    const isSelected = compareIds.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        className={
                          "comparison-tool-chip" +
                          (isSelected ? " selected" : "")
                        }
                        onClick={() => toggleCompare(catId, tool.id)}
                        style={{
                          borderColor: isSelected ? catColor : undefined,
                          background: isSelected ? catColor + "15" : undefined,
                        }}
                      >
                        <span className="comparison-tool-icon">
                          {tool.icon}
                        </span>
                        <span className="comparison-tool-name">
                          {tool.name}
                        </span>
                        {isSelected && (
                          <span className="comparison-check">&#x2713;</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison table */}
      {activeComparisons.length > 0 && (
        <div className="comparison-table-wrapper">
          {activeComparisons.map(([catId, toolIds]) => {
            const comparedTools = toolIds
              .map((id) => tools.find((t) => t.id === id))
              .filter(Boolean);
            const catLabel =
              toolCategories.find((c) => c.id === catId)?.label || catId;
            return (
              <div key={catId} className="comparison-table-block">
                <h5 className="comparison-table-title">{catLabel}</h5>
                <div className="comparison-table">
                  {/* Header row */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      Tool
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        <span className="comparison-big-icon">{t!.icon}</span>
                        <strong>{t!.name}</strong>
                        {t!.recommended && (
                          <span className="comparison-rec-badge">
                            &#9733; Recommended
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      Description
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        {t!.description}
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      &#x1f4b2; Pricing
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        {t!.pricing}
                      </div>
                    ))}
                  </div>

                  {/* Free Tier */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      &#x1f381; Free Tier
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        {t!.freeTier}
                      </div>
                    ))}
                  </div>

                  {/* Scalability */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      &#x1f4c8; Scalability
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        {t!.scalability}
                      </div>
                    ))}
                  </div>

                  {/* Ethiopian Support */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      &#x1f1ea;&#x1f1f9; Ethiopian Support
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        {t!.ethiopianSupport}
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      &#x26a0;&#xfe0f; Limitations
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        <ul className="comparison-limitations">
                          {t!.limitations.map((l: string, i: number) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Docs */}
                  <div className="comparison-tr">
                    <div className="comparison-td comparison-label-cell">
                      &#x1f4d6; Docs
                    </div>
                    {comparedTools.map((t) => (
                      <div
                        key={t!.id}
                        className="comparison-td comparison-value-cell"
                      >
                        <a
                          href={t!.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="comparison-docs-link"
                        >
                          View Docs &rarr;
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
