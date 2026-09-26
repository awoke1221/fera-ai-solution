"use client";

import { useState, useMemo } from "react";
import {
  projectTypes,
  recommendedStacks,
  toolCategories,
  tools,
  type ToolOption,
  type ProjectType,
  getProjectMapping,
  getOrderedCategories,
  isCategoryRequired,
  sortToolsForProject,
} from ".";

// ─── Props ──────────────────────────────────────────────
interface ToolSelectorProps {
  onSelectionsChange: (selections: Record<string, string>) => void;
  onProjectChange?: (projectId: string | null) => void;
}

// ─── Component ──────────────────────────────────────────
export function ToolSelector({
  onSelectionsChange,
  onProjectChange,
}: ToolSelectorProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null,
  );
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [toolQuery, setToolQuery] = useState("");
  const [toolFilter, setToolFilter] = useState<
    "all" | "recommended" | "ethiopian"
  >("all");

  // ─── Dynamic category/tool filtering ────────────────
  const projectMapping = useMemo(
    () => (selectedProject ? getProjectMapping(selectedProject.id) : undefined),
    [selectedProject],
  );

  const filteredCategories = useMemo(
    () => getOrderedCategories(projectMapping, toolCategories),
    [projectMapping],
  );

  const getCategoryRequired = (catId: string): boolean => {
    const cat = toolCategories.find((c) => c.id === catId);
    return isCategoryRequired(catId, projectMapping, cat?.required ?? false);
  };

  const getSortedTools = (categoryId: string): ToolOption[] => {
    const catTools = tools.filter((t) => t.category === categoryId);
    return sortToolsForProject(
      catTools,
      categoryId,
      projectMapping,
      true,
    ) as ToolOption[];
  };

  // ─── Handlers ───────────────────────────────────────
  const handleProjectSelect = (project: ProjectType) => {
    setSelectedProject(project);
    setSelections({});
    const firstVisible = filteredCategories[0]?.id || null;
    setActiveCategory(firstVisible);
    onSelectionsChange({});
    onProjectChange?.(project.id);
  };

  const handleToolSelect = (categoryId: string, toolId: string) => {
    const newSelections = { ...selections, [categoryId]: toolId };
    setSelections(newSelections);
    onSelectionsChange(newSelections);
  };

  const resetAll = () => {
    setSelectedProject(null);
    setSelections({});
    setActiveCategory(null);
    onSelectionsChange({});
    onProjectChange?.(null);
  };

  // ─── Navigation helpers (only visible categories) ───
  const getNextCategory = () => {
    const currentIdx = filteredCategories.findIndex(
      (c) => c.id === activeCategory,
    );
    for (let i = currentIdx + 1; i < filteredCategories.length; i++) {
      if (!selections[filteredCategories[i].id])
        return filteredCategories[i].id;
    }
    return null;
  };

  const getPrevCategory = () => {
    const currentIdx = filteredCategories.findIndex(
      (c) => c.id === activeCategory,
    );
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (!selections[filteredCategories[i].id])
        return filteredCategories[i].id;
    }
    return null;
  };

  const activeCatData = activeCategory
    ? toolCategories.find((c) => c.id === activeCategory)!
    : null;

  const activeCatTools = activeCategory ? getSortedTools(activeCategory) : [];
  const visibleCatTools = useMemo(() => {
    if (!activeCatData) return [];

    const normalizedQuery = toolQuery.trim().toLowerCase();
    const recommendedIds = new Set(
      activeCatTools.filter((tool) => tool.recommended).map((tool) => tool.id),
    );
    const ethiopianIds = new Set(
      projectMapping?.categoryPriorities[activeCatData.id]?.ethiopianPriority ??
        [],
    );

    return activeCatTools.filter((tool) => {
      const isEthiopian = ethiopianIds.has(tool.id);
      const matchesQuery =
        !normalizedQuery ||
        `${tool.name} ${tool.description} ${tool.freeTier}`
          .toLowerCase()
          .includes(normalizedQuery);

      if (!matchesQuery) return false;

      if (toolFilter === "recommended" && !recommendedIds.has(tool.id)) {
        return false;
      }

      if (toolFilter === "ethiopian" && !isEthiopian) {
        return false;
      }

      return true;
    });
  }, [activeCatData, activeCatTools, projectMapping, toolFilter, toolQuery]);

  const setRecommendedTool = () => {
    if (!activeCatData) return;

    const preferred =
      activeCatTools.find((tool) => tool.recommended) ?? activeCatTools[0];
    if (!preferred) return;
    handleToolSelect(activeCatData.id, preferred.id);
  };

  const clearCategorySelection = () => {
    if (!activeCatData) return;

    const nextSelections = { ...selections };
    delete nextSelections[activeCatData.id];
    setSelections(nextSelections);
    onSelectionsChange(nextSelections);
  };

  const selectionsCount = Object.keys(selections).length;
  const visibleCount = filteredCategories.length;
  const progressPct =
    visibleCount > 0 ? (selectionsCount / visibleCount) * 100 : 0;

  // If no project selected, show project type grid
  if (!selectedProject) {
    return (
      <div className="stack-project-select">
        <div className="section-label">
          <span className="eyebrow">Step 1</span>
          <h3>What are you building?</h3>
          <p>Select the type of platform you want to create.</p>
        </div>
        <div className="stack-project-grid">
          {projectTypes.map((project) => {
            const bestStack = recommendedStacks.find(
              (stack) => stack.projectType === project.id && stack.isPrimary,
            );
            return (
              <button
                key={project.id}
                className="stack-project-card"
                onClick={() => handleProjectSelect(project)}
              >
                <span className="stack-project-icon">{project.icon}</span>
                <span className="stack-project-name">{project.label}</span>
                <span className="stack-project-desc">
                  {project.description}
                </span>
                {bestStack && (
                  <span className="stack-project-hint">
                    <strong>Advanced path:</strong> {bestStack.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-selector-panel">
      {/* Header */}
      <div className="stack-selector-header">
        <div className="stack-selector-breadcrumb">
          <button className="breadcrumb-back" onClick={resetAll}>
            &larr; Change project type
          </button>
          <span className="breadcrumb-current">
            {selectedProject.icon} {selectedProject.label}
          </span>
        </div>

        {/* Dynamic recommendation note */}
        {projectMapping && (
          <div className="dynamic-mapping-note">
            &#x1f4a1; {projectMapping.note}
          </div>
        )}

        {projectMapping && (
          <div className="project-advanced-summary">
            <p>
              <strong>Advanced project strategy:</strong> Choose tools in the
              highlighted categories first, then refine for local payment, media
              delivery, and launch readiness.
            </p>
          </div>
        )}

        {projectMapping && (
          <div className="stack-project-strategy">
            <div className="strategy-line">
              <strong>Primary advanced stack:</strong>{" "}
              {recommendedStacks.find(
                (stack) =>
                  stack.projectType === projectMapping.projectType &&
                  stack.isPrimary,
              )?.name || "Review recommended stack"}
            </div>
            <div className="strategy-line">
              <strong>Required categories:</strong>{" "}
              {projectMapping.forceRequiredCategories.length > 0
                ? projectMapping.forceRequiredCategories
                    .map(
                      (id) =>
                        toolCategories.find((cat) => cat.id === id)?.label ||
                        id,
                    )
                    .join(", ")
                : "Core stack only"}
            </div>
          </div>
        )}

        <div className="stack-selector-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: progressPct + "%" }}
            />
          </div>
          <span className="progress-text">
            {selectionsCount} / {visibleCount} categories selected
          </span>
        </div>
      </div>

      <div className="stack-selector-body">
        {/* Category sidebar — only visible categories */}
        <div className="stack-category-sidebar">
          <h4>Categories</h4>
          {filteredCategories.map((cat) => {
            const catData = toolCategories.find((c) => c.id === cat.id);
            const isSelected = selections[cat.id] !== undefined;
            const isActive = activeCategory === cat.id;
            const required = getCategoryRequired(cat.id);
            return (
              <button
                key={cat.id}
                className={
                  "stack-category-btn" +
                  (isActive ? " active" : "") +
                  (isSelected ? " done" : "")
                }
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="cat-icon">{catData?.icon || "\u2022"}</span>
                <span className="cat-label">
                  {catData?.label || cat.id}
                  {required && <span className="cat-req-mark">*</span>}
                </span>
                {isSelected && <span className="cat-check">&#x2713;</span>}
              </button>
            );
          })}
        </div>

        {/* Tool options — active category only */}
        <div className="stack-options-area">
          {activeCatData && (
            <div className="stack-category-section">
              <div className="stack-category-header">
                <span className="cat-icon-large">{activeCatData.icon}</span>
                <div>
                  <h4>{activeCatData.label}</h4>
                  <p className="cat-desc">{activeCatData.description}</p>
                </div>
                {getCategoryRequired(activeCatData.id) ? (
                  <span className="required-badge">Required</span>
                ) : (
                  <span className="optional-badge-inline">Optional</span>
                )}
              </div>

              <div className="stack-tool-toolbar">
                <label className="stack-search-field">
                  <span>Search</span>
                  <input
                    type="text"
                    value={toolQuery}
                    onChange={(event) => setToolQuery(event.target.value)}
                    placeholder="Search tools..."
                  />
                </label>

                <div className="stack-filter-pills">
                  {[
                    { id: "all", label: "All" },
                    { id: "recommended", label: "Recommended" },
                    { id: "ethiopian", label: "Ethiopian" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        "stack-filter-pill" +
                        (toolFilter === option.id ? " active" : "")
                      }
                      onClick={() =>
                        setToolFilter(option.id as typeof toolFilter)
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="stack-category-actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={setRecommendedTool}
                  >
                    Quick pick
                  </button>
                  {selections[activeCatData.id] && (
                    <button
                      type="button"
                      className="btn"
                      onClick={clearCategorySelection}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Ethiopian context hint */}
              {projectMapping?.categoryPriorities[activeCatData.id]
                ?.ethiopianPriority?.length ? (
                <div className="ethiopian-hint">
                  &#x1f1ea;&#x1f1f9; Ethiopian-optimized tools recommended for
                  this category
                </div>
              ) : null}

              <div className="stack-tool-grid">
                {visibleCatTools.length > 0 ? (
                  visibleCatTools.map((tool) => {
                    const selectedToolId = selections[activeCatData.id];
                    const isSelected = selectedToolId === tool.id;
                    const isEthiopianPriority =
                      projectMapping?.categoryPriorities[
                        activeCatData.id
                      ]?.ethiopianPriority?.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        className={
                          "stack-tool-card" +
                          (isSelected ? " selected" : "") +
                          (tool.recommended || isEthiopianPriority
                            ? " recommended"
                            : "")
                        }
                        onClick={() =>
                          handleToolSelect(activeCatData.id, tool.id)
                        }
                      >
                        {tool.recommended && !isEthiopianPriority && (
                          <span className="tool-recommended-badge">
                            &#9733; Recommended
                          </span>
                        )}
                        {isEthiopianPriority && (
                          <span className="ethiopian-badge">
                            &#x1f1ea;&#x1f1f9; Ethiopian Best
                          </span>
                        )}
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-name">{tool.name}</span>
                        <span className="tool-desc">{tool.description}</span>
                        <span className="tool-free-badge">{tool.freeTier}</span>
                        {isSelected && (
                          <span className="tool-selected-check">
                            &#x2713; Selected
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="stack-empty-state">
                    <strong>No tools match this filter.</strong>
                    <p>Try another keyword or switch back to All tools.</p>
                  </div>
                )}
              </div>

              {/* Prev / Next navigation */}
              <div className="stack-category-nav">
                <button
                  className="btn"
                  onClick={() => {
                    const prev = getPrevCategory();
                    if (prev) setActiveCategory(prev);
                  }}
                  style={{
                    visibility: getPrevCategory() ? "visible" : "hidden",
                  }}
                >
                  &larr; Previous
                </button>
                <span className="stack-nav-progress">
                  {filteredCategories.findIndex(
                    (c) => c.id === activeCategory,
                  ) + 1}{" "}
                  / {visibleCount}
                </span>
                <button
                  className="btn solid"
                  onClick={() => {
                    const next = getNextCategory();
                    if (next) setActiveCategory(next);
                  }}
                  style={{
                    visibility: getNextCategory() ? "visible" : "hidden",
                  }}
                >
                  {selections[activeCategory!] ? "Next \u2192" : "Skip \u2192"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
