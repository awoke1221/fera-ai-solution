"use client";

import { useState, useMemo } from "react";
import {
  tools,
  toolCategories,
  integrationEdges,
  ethiopianAdaptations,
  productionChecklist,
  recommendedStacks,
  projectTypes,
  advancedGuides,
  calculateCost,
  checkCompatibility,
  generateStackExport,
  getToolScore,
  type ToolOption,
  type AdvancedGuide,
} from ".";

// ─── Props ──────────────────────────────────────────────
interface ToolDetailsProps {
  selections: Record<string, string>;
  selectedProjectType?: string | null;
}

// ─── Component ──────────────────────────────────────────
export function ToolDetails({
  selections,
  selectedProjectType,
}: ToolDetailsProps) {
  const [activeTab, setActiveTab] = useState<
    | "details"
    | "env"
    | "integration"
    | "advanced"
    | "cost"
    | "export"
    | "production"
    | "ethiopia"
    | "recommendations"
  >("details");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean) as ToolOption[];
  }, [selections]);

  // Find the project type
  const projectType = useMemo(() => {
    if (!selectedProjectType) return null;
    return projectTypes.find((p) => p.id === selectedProjectType) || null;
  }, [selectedProjectType]);

  const selectedCount = selectedTools.length;

  // Get matching recommended stack
  const matchingStack = useMemo(() => {
    if (!selectedProjectType) return null;
    const stacks = recommendedStacks.filter(
      (s) => s.projectType === selectedProjectType,
    );
    // Check if selections match a recommended stack
    for (const stack of stacks) {
      const matches = Object.entries(stack.selections).every(
        ([cat, toolId]) => selections[cat] === toolId,
      );
      if (matches) return stack;
    }
    return null;
  }, [selectedProjectType, selections]);

  if (selectedCount === 0) return null;

  const getToolName = (id: string) =>
    tools.find((t) => t.id === id)?.name || id;
  const getCategoryName = (catId: string) =>
    toolCategories.find((c) => c.id === catId)?.label || catId;
  const getEdgeLabel = (from: string, to: string) =>
    integrationEdges.find((e) => e.from === from && e.to === to)?.label ||
    "Connects";

  return (
    <div className="stack-details-panel">
      {/* Tabs */}
      <div className="details-tabs">
        <button
          className={`details-tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          📋 Tool Details
        </button>
        <button
          className={`details-tab ${activeTab === "env" ? "active" : ""}`}
          onClick={() => setActiveTab("env")}
        >
          🔧 .env & Setup
        </button>
        <button
          className={`details-tab ${activeTab === "integration" ? "active" : ""}`}
          onClick={() => setActiveTab("integration")}
        >
          🔗 Integration Guide
        </button>
        <button
          className={`details-tab ${activeTab === "advanced" ? "active" : ""}`}
          onClick={() => setActiveTab("advanced")}
        >
          🧠 Advanced Guide
        </button>
        <button
          className={`details-tab ${activeTab === "cost" ? "active" : ""}`}
          onClick={() => setActiveTab("cost")}
        >
          💰 Cost Estimator
        </button>
        <button
          className={`details-tab ${activeTab === "export" ? "active" : ""}`}
          onClick={() => setActiveTab("export")}
        >
          📤 Export Stack
        </button>
        <button
          className={`details-tab ${activeTab === "production" ? "active" : ""}`}
          onClick={() => setActiveTab("production")}
        >
          ✅ Production Readiness
        </button>
        <button
          className={`details-tab ${activeTab === "ethiopia" ? "active" : ""}`}
          onClick={() => setActiveTab("ethiopia")}
        >
          🇪🇹 Ethiopian Adaptations
        </button>
        {projectType && (
          <button
            className={`details-tab ${activeTab === "recommendations" ? "active" : ""}`}
            onClick={() => setActiveTab("recommendations")}
          >
            💡 Business Recommendations
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="details-content">
        {/* ─── Tab: Tool Details ─── */}
        {activeTab === "details" && (
          <div className="details-section">
            <h4>Selected Tech Stack ({selectedCount} tools)</h4>
            <div className="details-tool-list">
              {selectedTools.map((tool) => {
                const isExpanded = expandedTool === tool.id;
                const colors = categoryColorMap[tool.category] || {
                  border: "#666",
                };
                return (
                  <div
                    key={tool.id}
                    className={`details-tool-card ${isExpanded ? "expanded" : ""}`}
                    style={{ borderLeftColor: colors.border }}
                    onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                  >
                    <div className="details-tool-header">
                      <span className="details-tool-icon">{tool.icon}</span>
                      <div className="details-tool-meta">
                        <strong>{tool.name}</strong>
                        <span className="details-tool-category">
                          {getCategoryName(tool.category)}
                          {tool.recommended && (
                            <span className="recommended-tag">Recommended</span>
                          )}
                        </span>
                      </div>
                      <span className="details-expand-icon">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="details-tool-body">
                        <p>{tool.description}</p>

                        <div className="details-grid">
                          <div className="details-info-block">
                            <h5>💰 Pricing</h5>
                            <p>
                              <strong>Free Tier:</strong> {tool.freeTier}
                            </p>
                            <p>
                              <strong>Paid Plans:</strong> {tool.pricing}
                            </p>
                          </div>
                          <div className="details-info-block">
                            <h5>📈 Scalability</h5>
                            <p>{tool.scalability}</p>
                          </div>
                        </div>

                        <div className="details-info-block">
                          <h5>⚠️ Limitations</h5>
                          <ul>
                            {tool.limitations.map((lim, i) => (
                              <li key={i}>{lim}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="details-info-block">
                          <h5>🌍 Ethiopian Support</h5>
                          <p>{tool.ethiopianSupport}</p>
                        </div>

                        <a
                          href={tool.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="details-docs-link"
                        >
                          📖 View Documentation →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab: Environment Variables ─── */}
        {activeTab === "env" && (
          <div className="details-section">
            <h4>🔧 Environment Variables & Setup</h4>
            <p className="details-subtitle">
              Copy these into your <code>.env.local</code> file. Never commit
              secrets to Git.
            </p>

            <div className="env-total-block">
              <h5>Complete .env Template</h5>
              <pre className="env-code-block">
                <code>
                  {`# ─── Generated by Stack Advisor ───
# Project: ${selectedProjectType || "Custom"}
# ${new Date().toLocaleDateString()}

`}
                  {selectedTools
                    .flatMap((t) => t.config.envVars)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((v) => `${v}=""`)
                    .join("\n")}
                </code>
              </pre>
            </div>

            {selectedTools.map((tool) => (
              <div key={tool.id} className="env-tool-block">
                <h5>
                  {tool.icon} {tool.name}
                </h5>
                <div className="env-vars-list">
                  <p>
                    <strong>Environment Variables:</strong>
                  </p>
                  <div className="env-vars-grid">
                    {tool.config.envVars.map((v) => (
                      <code key={v} className="env-var">
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="env-setup">
                  <p>
                    <strong>Setup Steps:</strong>
                  </p>
                  <ol>
                    {tool.config.setupSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="env-packages">
                  <p>
                    <strong>Required Packages:</strong>
                  </p>
                  <div className="env-packages-grid">
                    {tool.config.packages.map((pkg) => (
                      <code key={pkg} className="env-pkg">
                        {pkg}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Tab: Integration Guide ─── */}
        {activeTab === "integration" && (
          <div className="details-section">
            <h4>🔗 Integration & Interaction Guide</h4>
            <p className="details-subtitle">
              How your selected tools connect, authenticate, and share data.
            </p>

            <div className="integration-list">
              {selectedTools.map((tool) => {
                const connectedEdges = integrationEdges.filter(
                  (e) =>
                    (e.from === tool.id &&
                      Object.values(selections).includes(e.to)) ||
                    (e.to === tool.id &&
                      Object.values(selections).includes(e.from)),
                );
                if (connectedEdges.length === 0) return null;

                return (
                  <div key={tool.id} className="integration-tool-block">
                    <h5>
                      {tool.icon} {tool.name}
                    </h5>
                    <p className="integration-note">{tool.integration.notes}</p>
                    <div className="integration-connections">
                      {connectedEdges.map((edge) => {
                        const otherId =
                          edge.from === tool.id ? edge.to : edge.from;
                        const otherTool = tools.find((t) => t.id === otherId);
                        if (!otherTool) return null;
                        const isOutgoing = edge.from === tool.id;
                        return (
                          <div
                            key={edge.label}
                            className={`integration-connection ${isOutgoing ? "outgoing" : "incoming"}`}
                          >
                            <span className="conn-direction">
                              {isOutgoing ? "→" : "←"}
                            </span>
                            <span className="conn-label">{edge.label}</span>
                            <span className="conn-type">
                              {edge.type.toUpperCase()}
                            </span>
                            <span className="conn-tool">
                              {otherTool.icon} {otherTool.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab: Advanced Guide ─── */}
        {activeTab === "advanced" && (
          <div className="details-section">
            <h4>🧠 Advanced Production Guide</h4>
            <p className="details-subtitle">
              Deep-dive architecture patterns, security best practices, code
              examples, and production strategies for each selected tool.
            </p>

            {selectedTools.map((tool) => {
              const guide = advancedGuides[tool.id] as
                | AdvancedGuide
                | undefined;
              if (!guide) {
                return (
                  <div key={tool.id} className="adv-tool-block">
                    <h5>
                      {tool.icon} {tool.name}
                    </h5>
                    <p className="adv-coming-soon">
                      Advanced guide coming soon for this tool.
                    </p>
                  </div>
                );
              }

              return (
                <div key={tool.id} className="adv-tool-block">
                  <div className="adv-tool-header">
                    <span className="adv-tool-icon">{tool.icon}</span>
                    <div>
                      <h5>{tool.name}</h5>
                      <span className="adv-tool-category">
                        {toolCategories.find((c) => c.id === tool.category)
                          ?.label || tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Architecture Patterns */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🏗️</span> Architecture
                      Patterns
                    </h6>
                    <div className="adv-pill-list">
                      {guide.architecturePatterns.map((p, i) => (
                        <span key={i} className="adv-pill">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security Best Practices */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🔒</span> Security Best
                      Practices
                    </h6>
                    <ul className="adv-list">
                      {guide.securityBestPractices.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Performance Optimizations */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">⚡</span> Performance
                      Optimizations
                    </h6>
                    <ul className="adv-list">
                      {guide.performanceOptimizations.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Production Configs */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">⚙️</span> Production
                      Configuration
                    </h6>
                    <div className="adv-configs">
                      {guide.productionConfigs.map((cfg, i) => (
                        <details key={i} className="adv-config-details">
                          <summary className="adv-config-summary">
                            {cfg.title}
                          </summary>
                          <p className="adv-config-desc">{cfg.description}</p>
                          <pre className="adv-code-block">
                            <code>{cfg.code}</code>
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">💻</span> Code Examples
                    </h6>
                    <div className="adv-examples">
                      {guide.codeExamples.map((ex, i) => (
                        <details key={i} className="adv-config-details">
                          <summary className="adv-config-summary">
                            {ex.title}
                          </summary>
                          <pre className="adv-code-block">
                            <code>{ex.code}</code>
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Testing Strategy */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🧪</span> Testing
                      Strategy
                    </h6>
                    <p className="adv-text">{guide.testingStrategy}</p>
                  </div>

                  {/* Monitoring Strategy */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">📡</span> Monitoring
                      Strategy
                    </h6>
                    <p className="adv-text">{guide.monitoringStrategy}</p>
                  </div>

                  {/* Backup & Disaster Recovery */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">💾</span> Backup &
                      Disaster Recovery
                    </h6>
                    <p className="adv-text">{guide.backupDisasterRecovery}</p>
                  </div>

                  {/* Deployment Strategy */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🚀</span> Deployment
                      Strategy
                    </h6>
                    <p className="adv-text">{guide.deploymentStrategy}</p>
                  </div>

                  {/* Common Pitfalls */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">⚠️</span> Common
                      Pitfalls
                    </h6>
                    <div className="adv-pitfalls">
                      {guide.commonPitfalls.map((p, i) => (
                        <div key={i} className="adv-pitfall">
                          <div className="adv-pitfall-issue">
                            <span className="pitfall-icon">❌</span>
                            <span>{p.issue}</span>
                          </div>
                          <div className="adv-pitfall-solution">
                            <span className="pitfall-icon">✅</span>
                            <span>{p.solution}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scalability Patterns */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">📈</span> Scalability
                      Patterns
                    </h6>
                    <ul className="adv-list">
                      {guide.scalabilityPatterns.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cost Optimization */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">💰</span> Cost
                      Optimization
                    </h6>
                    <p className="adv-text">{guide.costOptimization}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* ─── Tab: Cost Estimator ─── */}
        {activeTab === "cost" &&
          (() => {
            const costData = calculateCost(selectedTools);
            const warnings = checkCompatibility(Object.values(selections));
            const totalScore = selectedTools.reduce((acc, t) => {
              const score = getToolScore(t.id);
              return acc + (score?.totalScore || 0);
            }, 0);
            const avgScore =
              selectedTools.length > 0
                ? (totalScore / selectedTools.length).toFixed(1)
                : "0";

            return (
              <div className="details-section">
                <h4>💰 Cost & Compatibility Analysis</h4>
                <p className="details-subtitle">
                  Estimated monthly infrastructure costs, compatibility checks,
                  and quality scores for your selected stack.
                </p>

                {/* Cost Summary */}
                <div className="cost-summary-cards">
                  <div className="cost-card free">
                    <span className="cost-card-label">Minimum Monthly</span>
                    <span className="cost-card-value">
                      ${costData.totalMonthly.min}
                    </span>
                    <span className="cost-card-note">
                      Using free tiers where possible
                    </span>
                  </div>
                  <div className="cost-card paid">
                    <span className="cost-card-label">Maximum Monthly</span>
                    <span className="cost-card-value">
                      ${costData.totalMonthly.max}
                    </span>
                    <span className="cost-card-note">
                      All tools on paid plans
                    </span>
                  </div>
                  <div className="cost-card annual">
                    <span className="cost-card-label">Annual Range</span>
                    <span className="cost-card-value">
                      ${costData.totalAnnual.min}–${costData.totalAnnual.max}
                    </span>
                    <span className="cost-card-note">
                      Estimated yearly cost
                    </span>
                  </div>
                  <div className="cost-card score">
                    <span className="cost-card-label">Stack Quality Score</span>
                    <span className="cost-card-value">{avgScore}/10</span>
                    <span className="cost-card-note">
                      Average across all tools
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div
                  className={`cost-recommendation ${costData.totalMonthly.max === 0 ? "free" : costData.totalMonthly.max <= 50 ? "low" : "high"}`}
                >
                  <span className="cost-rec-icon">
                    {costData.totalMonthly.max === 0
                      ? "🎉"
                      : costData.totalMonthly.max <= 50
                        ? "👍"
                        : "💡"}
                  </span>
                  <p>{costData.recommendation}</p>
                </div>

                {/* Compatibility Warnings */}
                {warnings.length > 0 && (
                  <div className="cost-warnings">
                    <h5>🔍 Compatibility Checks</h5>
                    <div className="warnings-list">
                      {warnings.map((w, i) => (
                        <div key={i} className={`warning-item ${w.type}`}>
                          <span className="warning-icon">
                            {w.type === "error"
                              ? "🚫"
                              : w.type === "warning"
                                ? "⚠️"
                                : "💡"}
                          </span>
                          <div className="warning-content">
                            <strong>{w.message}</strong>
                            <p>{w.recommendation}</p>
                            <div className="warning-tools">
                              {w.tools.map((tId) => {
                                const t = tools.find((t) => t.id === tId);
                                return t ? (
                                  <span key={tId} className="warning-tool-chip">
                                    {t.icon} {t.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-tool breakdown */}
                <div className="cost-breakdown">
                  <h5>📊 Per-Tool Cost Breakdown</h5>
                  <div className="cost-table">
                    <div className="cost-table-header">
                      <span>Tool</span>
                      <span>Free Tier</span>
                      <span>Monthly Cost</span>
                      <span>Upgrade Trigger</span>
                    </div>
                    {costData.breakdown.map((b) => (
                      <div key={b.toolId} className="cost-table-row">
                        <span className="cost-tool-name">
                          {b.toolIcon} {b.toolName}
                        </span>
                        <span className="cost-free-tier">{b.freeTier}</span>
                        <span
                          className={`cost-monthly ${b.monthlyCost.max === 0 ? "free" : ""}`}
                        >
                          {b.monthlyCost.min === 0 && b.monthlyCost.max === 0
                            ? "Free"
                            : `$${b.monthlyCost.min}–$${b.monthlyCost.max}/mo`}
                        </span>
                        <span className="cost-breakeven">
                          {b.breakEvenPoint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ethiopian Cost Note */}
                <div className="cost-ethiopian-section">
                  <h5>🇪🇹 Ethiopian Cost Considerations</h5>
                  <div className="ethiopian-cost-grid">
                    {costData.breakdown.map((b) => (
                      <div key={b.toolId} className="ethiopian-cost-item">
                        <strong>
                          {b.toolIcon} {b.toolName}
                        </strong>
                        <p>{b.ethiopianCostNote}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ─── Tab: Export Stack ─── */}
        {activeTab === "export" &&
          (() => {
            const [copySuccess, setCopySuccess] = useState<string | null>(null);

            const jsonExport = generateStackExport(selectedTools, "json");
            const mdExport = generateStackExport(selectedTools, "markdown");
            const envExport = generateStackExport(selectedTools, "env");

            const handleCopy = async (text: string, label: string) => {
              try {
                await navigator.clipboard.writeText(text);
                setCopySuccess(`${label} copied!`);
                setTimeout(() => setCopySuccess(null), 2000);
              } catch {
                setCopySuccess("Failed to copy");
              }
            };

            return (
              <div className="details-section">
                <h4>📤 Export Your Tech Stack</h4>
                <p className="details-subtitle">
                  Share your stack configuration with your team or save it for
                  reference.
                </p>

                {copySuccess && (
                  <div className="export-toast">{copySuccess}</div>
                )}

                {/* JSON Export */}
                <div className="export-block">
                  <div className="export-header">
                    <h5>📦 JSON Format</h5>
                    <button
                      className="btn solid"
                      onClick={() => handleCopy(jsonExport, "JSON")}
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="export-code">
                    <code>{jsonExport}</code>
                  </pre>
                </div>

                {/* Markdown Export */}
                <div className="export-block">
                  <div className="export-header">
                    <h5>📝 Markdown Summary</h5>
                    <button
                      className="btn solid"
                      onClick={() => handleCopy(mdExport, "Markdown")}
                    >
                      Copy Markdown
                    </button>
                  </div>
                  <pre className="export-code">
                    <code>{mdExport}</code>
                  </pre>
                </div>

                {/* .env Export */}
                <div className="export-block">
                  <div className="export-header">
                    <h5>🔧 Environment Variables</h5>
                    <button
                      className="btn solid"
                      onClick={() => handleCopy(envExport, "ENV")}
                    >
                      Copy .env
                    </button>
                  </div>
                  <pre className="export-code">
                    <code>{envExport}</code>
                  </pre>
                </div>

                {/* Tool Scores */}
                <div className="export-scores">
                  <h5>📊 Tool Quality Scores</h5>
                  <div className="scores-grid">
                    {selectedTools.map((t) => {
                      const score = getToolScore(t.id);
                      if (!score) return null;
                      const maxScore = Math.max(...Object.values(score.scores));
                      const minScore = Math.min(...Object.values(score.scores));
                      return (
                        <div key={t.id} className="score-card">
                          <div className="score-header">
                            <span className="score-icon">{t.icon}</span>
                            <span className="score-name">{t.name}</span>
                            <span className="score-total">
                              {score.totalScore}
                            </span>
                          </div>
                          <div className="score-bars">
                            {Object.entries(score.scores).map(([key, val]) => (
                              <div key={key} className="score-bar-item">
                                <span className="score-bar-label">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())}
                                </span>
                                <div className="score-bar-track">
                                  <div
                                    className={`score-bar-fill ${val >= 8 ? "high" : val >= 6 ? "mid" : "low"}`}
                                    style={{ width: `${val * 10}%` }}
                                  />
                                </div>
                                <span className="score-bar-value">
                                  {val}/10
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="score-traits">
                            <div className="score-strengths">
                              <strong>✅ Strengths</strong>
                              {score.strengths.map((s, i) => (
                                <span key={i}>{s}</span>
                              ))}
                            </div>
                            <div className="score-weaknesses">
                              <strong>⚠️ Weaknesses</strong>
                              {score.weaknesses.map((w, i) => (
                                <span key={i}>{w}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        {/* ─── Tab: Production Readiness ─── */}
        {activeTab === "production" && (
          <div className="details-section">
            <h4>✅ Production Readiness Checklist</h4>
            <p className="details-subtitle">
              Essential steps for taking your app from development to
              production.
            </p>

            {productionChecklist.map((category) => (
              <div key={category.category} className="prod-category">
                <h5>{category.category}</h5>
                <div className="prod-items">
                  {category.items.map((item, i) => (
                    <div
                      key={i}
                      className={`prod-item priority-${item.priority}`}
                    >
                      <div className="prod-item-header">
                        <span className={`priority-badge ${item.priority}`}>
                          {item.priority}
                        </span>
                        <strong>{item.title}</strong>
                      </div>
                      <p>{item.description}</p>
                      {item.tools.length > 0 && (
                        <div className="prod-tools">
                          {item.tools.map((tId) => {
                            const t = tools.find((t) => t.id === tId);
                            return t ? (
                              <span key={tId} className="prod-tool-chip">
                                {t.icon} {t.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Caching & Rate Limiting Section */}
            <div className="prod-category">
              <h5>⚡ Caching & Rate Limiting Strategy</h5>
              <div className="prod-card">
                <h6>Recommended Approach</h6>
                <div className="strategy-grid">
                  <div className="strategy-item">
                    <strong>API Rate Limiting</strong>
                    <p>Use Upstash Redis to rate-limit API routes:</p>
                    <pre className="strategy-code">
                      <code>{`import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// In your API route:
const { success, limit, remaining } = await ratelimit.limit(userId);
if (!success) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}`}</code>
                    </pre>
                  </div>
                  <div className="strategy-item">
                    <strong>Database Connection Pooling</strong>
                    <p>Supabase uses PgBouncer by default. For self-hosted:</p>
                    <pre className="strategy-code">
                      <code>{`# docker-compose.yml
services:
  pgbouncer:
    image: bitnami/pgbouncer:latest
    environment:
      - POSTGRESQL_HOST=postgres
      - POSTGRESQL_PORT=5432
      - PGBOUNCER_POOL_MODE=transaction
      - PGBOUNCER_MAX_CLIENT_CONN=100`}</code>
                    </pre>
                  </div>
                  <div className="strategy-item">
                    <strong>Frontend Caching</strong>
                    <p>Next.js ISR + CDN caching strategy:</p>
                    <pre className="strategy-code">
                      <code>{`// pages or API routes with caching
export const revalidate = 3600; // ISR: regenerate every hour

// Or for API routes:
res.setHeader(
  "Cache-Control",
  "public, s-maxage=60, stale-while-revalidate=300"
);`}</code>
                    </pre>
                  </div>
                  <div className="strategy-item">
                    <strong>Redis Caching Layer</strong>
                    <p>Cache expensive database queries:</p>
                    <pre className="strategy-code">
                      <code>{`const cache = await redis.get(\`course:\${id}\`);
if (cache) return JSON.parse(cache);

const data = await db.query.courses.findFirst({ where: eq(courses.id, id) });
await redis.set(\`course:\${id}\`, JSON.stringify(data), { ex: 300 });

return data;`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Ethiopian Adaptations ─── */}
        {activeTab === "ethiopia" && (
          <div className="details-section">
            <h4>🇪🇹 Ethiopian Market Adaptations</h4>
            <p className="details-subtitle">
              Special considerations for building platforms in and for the
              Ethiopian market.
            </p>

            <div className="ethiopia-grid">
              {ethiopianAdaptations.map((adapt) => (
                <div key={adapt.id} className="ethiopia-card">
                  <div className="ethiopia-card-header">
                    <span className={`ethiopia-category ${adapt.category}`}>
                      {adapt.category === "payment"
                        ? "💳"
                        : adapt.category === "hosting"
                          ? "☁️"
                          : adapt.category === "auth"
                            ? "🔐"
                            : adapt.category === "delivery"
                              ? "🚚"
                              : "📋"}{" "}
                      {adapt.category}
                    </span>
                  </div>
                  <h5>{adapt.title}</h5>
                  <p>{adapt.description}</p>
                  <div className="ethiopia-tools">
                    {adapt.tools.map((tId) => {
                      const t = tools.find((t) => t.id === tId);
                      return t ? (
                        <span key={tId} className="ethiopia-tool-chip">
                          {t.icon} {t.name}
                        </span>
                      ) : (
                        <span key={tId} className="ethiopia-tool-chip">
                          {tId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Screenshot Upload + Admin Approval Workflow */}
            <div className="ethiopia-workflow">
              <h5>📸 Screenshot Upload + Admin Approval Workflow</h5>
              <p>
                For Ethiopian businesses where manual payment confirmation is
                common (bank transfers, mobile money), implement this workflow:
              </p>
              <div className="workflow-steps">
                <div className="workflow-step">
                  <span className="workflow-num">1</span>
                  <div>
                    <strong>User makes payment</strong>
                    <p>Bank transfer, Telebirr, or other manual method</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">2</span>
                  <div>
                    <strong>Upload screenshot</strong>
                    <p>User uploads payment receipt/screenshot via the app</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">3</span>
                  <div>
                    <strong>Stored in Supabase Storage</strong>
                    <p>Image saved in private bucket with user_id metadata</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">4</span>
                  <div>
                    <strong>Admin review pending</strong>
                    <p>
                      Admin sees new payment request in dashboard with
                      screenshot
                    </p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">5</span>
                  <div>
                    <strong>Admin approves/rejects</strong>
                    <p>Admin reviews and approves or rejects with notes</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">6</span>
                  <div>
                    <strong>Membership activated</strong>
                    <p>User gets notified and premium features are unlocked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Business Recommendations ─── */}
        {activeTab === "recommendations" && projectType && (
          <div className="details-section">
            <h4>
              💡 {projectType.icon} {projectType.label} — Feature
              Recommendations
            </h4>
            <p className="details-subtitle">
              Essential features and functionality recommendations for your{" "}
              {projectType.label.toLowerCase()}.
            </p>

            {matchingStack && (
              <div className="matching-stack-banner">
                <span className="matching-stack-icon">★</span>
                <div>
                  <strong>Recommended Stack: {matchingStack.name}</strong>
                  <p>{matchingStack.description}</p>
                  <div className="matching-stack-meta">
                    <span className={`cost-badge ${matchingStack.cost}`}>
                      💰{" "}
                      {matchingStack.cost === "free"
                        ? "Free"
                        : matchingStack.cost === "low"
                          ? "Low Cost"
                          : matchingStack.cost === "medium"
                            ? "Medium Cost"
                            : "Higher Cost"}
                    </span>
                    <span
                      className={`difficulty-badge ${matchingStack.difficulty}`}
                    >
                      📊 {matchingStack.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="recommendations-grid">
              {projectType.businessFeatures.map((feature, i) => (
                <div key={i} className="recommendation-card">
                  <span className="rec-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p>{feature}</p>
                </div>
              ))}
            </div>

            <div className="recommendations-note">
              <h5>📌 Implementation Priority</h5>
              <ol>
                <li>
                  <strong>Core functionality</strong> — Build the main value
                  proposition first (courses, products, etc.)
                </li>
                <li>
                  <strong>User management</strong> — Authentication, profiles,
                  and dashboards
                </li>
                <li>
                  <strong>Payment integration</strong> — Chapa for Ethiopian
                  users, PayPal/Stripe for international
                </li>
                <li>
                  <strong>Engagement features</strong> — Ratings, comments,
                  notifications
                </li>
                <li>
                  <strong>Analytics & reporting</strong> — Track usage, revenue,
                  and growth
                </li>
                <li>
                  <strong>Performance optimization</strong> — Caching, CDN,
                  database optimization
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const categoryColorMap: Record<string, { border: string }> = {
  frontend: { border: "#1fb4b8" },
  backend: { border: "#0b7fd4" },
  database: { border: "#f4b24b" },
  auth: { border: "#c792ea" },
  storage: { border: "#22c55e" },
  deploy_frontend: { border: "#38bdf8" },
  deploy_backend: { border: "#d9614f" },
  cicd: { border: "#f4b24b" },
  payment: { border: "#22c55e" },
  email: { border: "#e879f9" },
  cache: { border: "#ef4444" },
  testing: { border: "#34d399" },
  monitoring: { border: "#facc15" },
};
