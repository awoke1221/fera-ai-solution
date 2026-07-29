"use client";

import { useState } from "react";
import {
  projectTypes,
  toolCategories,
  tools,
  type ToolOption,
  type ProjectType,
} from ".";

// ─── Props ──────────────────────────────────────────────
interface ToolSelectorProps {
  onSelectionsChange: (selections: Record<string, string>) => void;
}

// ─── Component ──────────────────────────────────────────
export function ToolSelector({ onSelectionsChange }: ToolSelectorProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null,
  );
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleProjectSelect = (project: ProjectType) => {
    setSelectedProject(project);
    setSelections({});
    const firstRequired = toolCategories.find((c) => c.required)?.id || null;
    setActiveCategory(firstRequired);
    onSelectionsChange({});
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
  };

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
          {projectTypes.map((project) => (
            <button
              key={project.id}
              className="stack-project-card"
              onClick={() => handleProjectSelect(project)}
            >
              <span className="stack-project-icon">{project.icon}</span>
              <span className="stack-project-name">{project.label}</span>
              <span className="stack-project-desc">{project.description}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Navigation helpers ───
  const getNextCategory = () => {
    const currentIdx = toolCategories.findIndex((c) => c.id === activeCategory);
    for (let i = currentIdx + 1; i < toolCategories.length; i++) {
      if (!selections[toolCategories[i].id]) return toolCategories[i].id;
    }
    return null;
  };
  const getPrevCategory = () => {
    const currentIdx = toolCategories.findIndex((c) => c.id === activeCategory);
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (!selections[toolCategories[i].id]) return toolCategories[i].id;
    }
    return null;
  };
  const activeCatData = activeCategory
    ? toolCategories.find((c) => c.id === activeCategory)!
    : null;
  const activeCatTools = activeCategory
    ? tools.filter((t) => t.category === activeCategory)
    : [];

  return (
    <div className="stack-selector-panel">
      {/* Header */}
      <div className="stack-selector-header">
        <div className="stack-selector-breadcrumb">
          <button className="breadcrumb-back" onClick={resetAll}>
            ← Change project type
          </button>
          <span className="breadcrumb-current">
            {selectedProject.icon} {selectedProject.label}
          </span>
        </div>
        <div className="stack-selector-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (Object.keys(selections).length / toolCategories.length) * 100
                }%`,
              }}
            />
          </div>
          <span className="progress-text">
            {Object.keys(selections).length} / {toolCategories.length} selected
          </span>
        </div>
      </div>

      <div className="stack-selector-body">
        {/* Category sidebar */}
        <div className="stack-category-sidebar">
          <h4>Categories</h4>
          {toolCategories.map((cat) => {
            const isSelected = selections[cat.id] !== undefined;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`stack-category-btn ${isActive ? "active" : ""} ${isSelected ? "done" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
                {isSelected && <span className="cat-check">✓</span>}
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
                {activeCatData.required && (
                  <span className="required-badge">Required</span>
                )}
              </div>

              <div className="stack-tool-grid">
                {activeCatTools.map((tool) => {
                  const selectedToolId = selections[activeCatData.id];
                  const isSelected = selectedToolId === tool.id;
                  return (
                    <button
                      key={tool.id}
                      className={`stack-tool-card ${isSelected ? "selected" : ""} ${tool.recommended ? "recommended" : ""}`}
                      onClick={() =>
                        handleToolSelect(activeCatData.id, tool.id)
                      }
                    >
                      {tool.recommended && (
                        <span className="tool-recommended-badge">
                          ★ Recommended
                        </span>
                      )}
                      <span className="tool-icon">{tool.icon}</span>
                      <span className="tool-name">{tool.name}</span>
                      <span className="tool-desc">{tool.description}</span>
                      <span className="tool-free-badge">{tool.freeTier}</span>
                      {isSelected && (
                        <span className="tool-selected-check">✓ Selected</span>
                      )}
                    </button>
                  );
                })}
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
                  ← Previous
                </button>
                <span className="stack-nav-progress">
                  {toolCategories.findIndex((c) => c.id === activeCategory) + 1}{" "}
                  / {toolCategories.length}
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
                  {selections[activeCategory!] ? "Next →" : "Skip →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
