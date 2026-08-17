"use client";

import { useState } from "react";
import type {
  SecurityReport,
  SecuritySeverity,
  SecurityIssue,
} from "./security-types";

interface SecurityReportProps {
  report: SecurityReport;
}

export function SecurityReportComponent({ report }: SecurityReportProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "top5" | "categories" | "issues" | "roadmap" | "compliance"
  >("overview");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const severityColors: Record<SecuritySeverity, string> = {
    CRITICAL: "var(--severity-critical)",
    HIGH: "var(--severity-high)",
    MEDIUM: "var(--severity-medium)",
    LOW: "var(--severity-low)",
    PASS: "var(--severity-pass)",
  };

  const severityBgColors: Record<SecuritySeverity, string> = {
    CRITICAL: "var(--severity-critical-bg)",
    HIGH: "var(--severity-high-bg)",
    MEDIUM: "var(--severity-medium-bg)",
    LOW: "var(--severity-low-bg)",
    PASS: "var(--severity-pass-bg)",
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    if (score >= 40) return "#ef4444"; // red
    return "#dc2626"; // dark red
  };

  return (
    <div className="security-report-container">
      {/* Header with Score */}
      <div className="security-report-header">
        <div className="security-header-left">
          <h2>🔒 Security Advisor</h2>
          <p className="security-tier-label">
            {report.architectureName} Architecture
          </p>
        </div>

        <div className="security-score-display">
          <div
            className="security-score-circle"
            style={{
              background: `conic-gradient(
                ${getScoreColor(report.overallSecurityScore)} ${
                  report.overallSecurityScore * 3.6
                }deg,
                var(--bg-tertiary) 0deg
              )`,
            }}
          >
            <div className="security-score-inner">
              <span className="security-score-value">
                {report.overallSecurityScore}
              </span>
              <span className="security-score-label">Score</span>
            </div>
          </div>

          <div className="security-score-breakdown">
            <div className="score-item critical">
              <span className="score-count">
                {report.issuesBySeverity.CRITICAL.length}
              </span>
              <span className="score-label">Critical</span>
            </div>
            <div className="score-item high">
              <span className="score-count">
                {report.issuesBySeverity.HIGH.length}
              </span>
              <span className="score-label">High</span>
            </div>
            <div className="score-item medium">
              <span className="score-count">
                {report.issuesBySeverity.MEDIUM.length}
              </span>
              <span className="score-label">Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="security-tabs">
        <button
          className={`security-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📋 Overview
        </button>
        <button
          className={`security-tab ${activeTab === "top5" ? "active" : ""}`}
          onClick={() => setActiveTab("top5")}
        >
          ⚠️ Top 5 Issues
        </button>
        <button
          className={`security-tab ${
            activeTab === "categories" ? "active" : ""
          }`}
          onClick={() => setActiveTab("categories")}
        >
          🏷️ By Category
        </button>
        <button
          className={`security-tab ${activeTab === "issues" ? "active" : ""}`}
          onClick={() => setActiveTab("issues")}
        >
          🔍 All Issues
        </button>
        <button
          className={`security-tab ${activeTab === "roadmap" ? "active" : ""}`}
          onClick={() => setActiveTab("roadmap")}
        >
          🗺️ Roadmap
        </button>
        <button
          className={`security-tab ${
            activeTab === "compliance" ? "active" : ""
          }`}
          onClick={() => setActiveTab("compliance")}
        >
          ⚖️ Compliance
        </button>
      </div>

      {/* Tab Content */}
      <div className="security-tab-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="security-overview">
            {/* Summary */}
            <section className="security-section">
              <h3>Summary</h3>

              {report.summary.strengths.length > 0 && (
                <div className="security-summary-box strengths">
                  <h4>✅ Strengths</h4>
                  <ul>
                    {report.summary.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.summary.majorGaps.length > 0 && (
                <div className="security-summary-box gaps">
                  <h4>⚠️ Major Gaps</h4>
                  <ul>
                    {report.summary.majorGaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Issue Count */}
            <section className="security-section">
              <h3>Issues Summary</h3>
              <div className="security-issue-summary">
                <div className="issue-count-card critical">
                  <span className="count">
                    {report.issuesBySeverity.CRITICAL.length}
                  </span>
                  <span className="label">Critical Issues</span>
                  <span className="desc">
                    Fix immediately before production
                  </span>
                </div>
                <div className="issue-count-card high">
                  <span className="count">
                    {report.issuesBySeverity.HIGH.length}
                  </span>
                  <span className="label">High Priority</span>
                  <span className="desc">Fix in first 1-3 months</span>
                </div>
                <div className="issue-count-card medium">
                  <span className="count">
                    {report.issuesBySeverity.MEDIUM.length}
                  </span>
                  <span className="label">Medium Priority</span>
                  <span className="desc">Fix within 3-6 months</span>
                </div>
                <div className="issue-count-card low">
                  <span className="count">
                    {report.issuesBySeverity.LOW.length}
                  </span>
                  <span className="label">Low Priority</span>
                  <span className="desc">Nice to have improvements</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Top 5 Issues Tab */}
        {activeTab === "top5" && (
          <div className="security-top5">
            <section className="security-section">
              <h3>Top 5 Things to Fix Before Production</h3>
              <div className="top5-list">
                {report.topFiveIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="top5-item"
                    onClick={() =>
                      setExpandedIssue(
                        expandedIssue === `top5-${idx}` ? null : `top5-${idx}`,
                      )
                    }
                  >
                    <div className="top5-header">
                      <div className="top5-rank">#{issue.rank}</div>
                      <div className="top5-info">
                        <h4>{issue.issue}</h4>
                        <p className="top5-category">
                          Category: {issue.category.replace("-", " ")}
                        </p>
                      </div>
                      <div
                        className="top5-severity"
                        style={{
                          background: severityBgColors[issue.priority],
                          color: severityColors[issue.priority],
                        }}
                      >
                        {issue.priority}
                      </div>
                    </div>

                    {expandedIssue === `top5-${idx}` && (
                      <div className="top5-expanded">
                        <div className="top5-impact">
                          <h5>Why It Matters</h5>
                          <p>{issue.impact}</p>
                        </div>
                        <div className="top5-quickstart">
                          <h5>Quick Start (First 3 Steps)</h5>
                          <ol>
                            {issue.quickStartGuide.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="security-categories">
            <section className="security-section">
              <h3>Security by Category</h3>
              <div className="categories-grid">
                {report.categoriesAnalysis.map((category) => (
                  <div
                    key={category.category}
                    className="category-card"
                    style={{
                      borderLeftColor: severityColors[category.severityLevel],
                    }}
                  >
                    <div className="category-header">
                      <h4>{category.categoryLabel}</h4>
                      <span
                        className="category-severity"
                        style={{
                          background: severityBgColors[category.severityLevel],
                          color: severityColors[category.severityLevel],
                        }}
                      >
                        {category.severityLevel}
                      </span>
                    </div>

                    <p className="category-description">
                      {category.description}
                    </p>

                    {category.strengths.length > 0 && (
                      <div className="category-strengths">
                        <h5>✅ Strengths</h5>
                        <ul>
                          {category.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {category.findings.length > 0 && (
                      <div className="category-findings">
                        <h5>⚠️ Findings ({category.findings.length})</h5>
                        <ul>
                          {category.findings.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {category.recommendations.length > 0 && (
                      <div className="category-recommendations">
                        <h5>💡 Recommendations</h5>
                        <ul>
                          {category.recommendations.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* All Issues Tab */}
        {activeTab === "issues" && (
          <div className="security-all-issues">
            <section className="security-section">
              <h3>All Security Issues ({report.allIssues.length})</h3>

              <div className="issues-list">
                {report.allIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="issue-item"
                    onClick={() =>
                      setExpandedIssue(
                        expandedIssue === issue.id ? null : issue.id,
                      )
                    }
                  >
                    <div className="issue-header">
                      <div className="issue-title">
                        <h4>{issue.problem}</h4>
                        <span className="issue-category">
                          {issue.category.replace("-", " ")}
                        </span>
                      </div>

                      <div
                        className="issue-severity"
                        style={{
                          background: severityBgColors[issue.severity],
                          color: severityColors[issue.severity],
                        }}
                      >
                        {issue.severity}
                      </div>
                    </div>

                    {expandedIssue === issue.id && (
                      <div className="issue-expanded">
                        <div className="issue-detail">
                          <h5>Why It Matters</h5>
                          <p>{issue.whyItMatters}</p>
                        </div>

                        <div className="issue-detail">
                          <h5>Recommended Solution</h5>
                          <p>{issue.recommendedSolution}</p>
                        </div>

                        <div className="issue-detail">
                          <h5>Implementation Guidance</h5>
                          <ol>
                            {issue.implementationGuidance.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="issue-detail meta">
                          <span className="effort-badge">
                            Effort: {issue.estimatedEffort}
                          </span>
                          {issue.relatedTechnology && (
                            <span className="tech-badge">
                              {issue.relatedTechnology}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === "roadmap" && (
          <div className="security-roadmap">
            <section className="security-section">
              <h3>Remediation Roadmap</h3>
              <p className="roadmap-intro">
                Prioritized timeline for fixing security issues:
              </p>

              <div className="roadmap-timeline">
                {report.remediationRoadmap.map((phase, idx) => (
                  <div key={idx} className="roadmap-phase">
                    <div className="phase-header">
                      <h4>{phase.phaseName}</h4>
                      <span className="phase-timeframe">{phase.timeframe}</span>
                      <span className="phase-hours">
                        ~{phase.totalEstimatedHours}h
                      </span>
                    </div>

                    <div className="phase-issues">
                      {phase.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="phase-issue"
                          style={{
                            borderLeftColor: severityColors[issue.severity],
                          }}
                        >
                          <span
                            className="phase-severity"
                            style={{
                              background: severityBgColors[issue.severity],
                              color: severityColors[issue.severity],
                            }}
                          >
                            {issue.severity}
                          </span>
                          <span className="phase-problem">{issue.problem}</span>
                        </div>
                      ))}
                      {phase.issues.length === 0 && (
                        <p className="phase-empty">No issues in this phase</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <div className="security-compliance">
            <section className="security-section">
              <h3>Compliance & Frameworks</h3>

              <div className="compliance-grid">
                <div className="compliance-card">
                  <h4>📋 Data Protection</h4>
                  <p>{report.complianceNotes.dataProtection}</p>
                </div>

                <div className="compliance-card">
                  <h4>💾 Backup Requirements</h4>
                  <p>{report.complianceNotes.backupRequirements}</p>
                </div>

                <div className="compliance-card">
                  <h4>📊 Auditing Requirements</h4>
                  <p>{report.complianceNotes.auditingRequirements}</p>
                </div>

                <div className="compliance-card">
                  <h4>🎯 Recommended Frameworks</h4>
                  <ul>
                    {report.complianceNotes.recommendedFrameworks.map(
                      (fw, i) => (
                        <li key={i}>{fw}</li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="security-footer">
        <p className="security-footer-text">
          Report generated: {new Date(report.generatedAt).toLocaleString()}
        </p>
        <p className="security-footer-disclaimer">
          ⚠️ This security report identifies risks based on architecture
          analysis. Conduct professional security audits and penetration testing
          before production deployment.
        </p>
      </div>
    </div>
  );
}
