"use client";

import React from "react";
import type {
  ArchitectureStrategy,
  ArchitectureComparison,
} from "./architecture-strategy-types";
import {
  getStrategyLabel,
  formatCost,
  getComplexityLabel,
} from "./architecture-strategy-types";

interface ArchitectureComparisonProps {
  comparison: ArchitectureComparison;
  selectedStrategy?: string;
  onSelectStrategy?: (strategyId: string) => void;
  onChooseArchitecture?: (strategy: ArchitectureStrategy) => void;
}

/**
 * Component to display three architecture strategies with comparison table
 */
export function ArchitectureComparison({
  comparison,
  selectedStrategy,
  onSelectStrategy,
  onChooseArchitecture,
}: ArchitectureComparisonProps) {
  return (
    <div className="arch-comparison-container">
      {/* Recommendation Banner */}
      <div className="arch-recommendation-banner">
        <div className="arch-banner-content">
          <div className="arch-banner-icon">💡</div>
          <div className="arch-banner-text">
            <h4>Recommended Strategy</h4>
            <p>
              <strong>{getStrategyLabel(comparison.recommendedTier)}:</strong>{" "}
              {comparison.recommendationReasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Cards Grid */}
      <div className="arch-strategies-grid">
        {comparison.strategies.map((strategy) => (
          <ArchitectureStrategyCard
            key={strategy.id}
            strategy={strategy}
            isRecommended={strategy.tier === comparison.recommendedTier}
            isSelected={selectedStrategy === strategy.id}
            onSelect={() => onSelectStrategy?.(strategy.id)}
            onChoose={() => onChooseArchitecture?.(strategy)}
          />
        ))}
      </div>

      {/* Comparison Table */}
      <div className="arch-comparison-section">
        <h3>📊 Detailed Comparison</h3>
        <div className="arch-comparison-table-wrapper">
          <table className="arch-comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                {comparison.strategies.map((strategy) => (
                  <th key={strategy.id}>{getStrategyLabel(strategy.tier)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Development Time */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Dev Time</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    {strategy.developmentTimeWeeks} weeks
                  </td>
                ))}
              </tr>

              {/* Complexity */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Complexity</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    <span
                      className={`arch-complexity-badge ${strategy.estimatedComplexity}`}
                    >
                      {getComplexityLabel(strategy.estimatedComplexity)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Monthly Cost */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Monthly Cost</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id} className="arch-cost-cell">
                    <strong>
                      {formatCost(strategy.monthlyOperatingCost.total)}
                    </strong>
                    <small>/month</small>
                  </td>
                ))}
              </tr>

              {/* Scalability */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Scalability</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    <span
                      className={`arch-scalability-badge ${strategy.scalability}`}
                    >
                      {strategy.scalability === "small-scale"
                        ? "Small Scale"
                        : strategy.scalability === "medium-scale"
                          ? "Medium Scale"
                          : strategy.scalability === "large-scale"
                            ? "Large Scale"
                            : "Unlimited"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Maintenance */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Maintenance</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    {strategy.maintenanceComplexity === "minimal"
                      ? "Minimal"
                      : strategy.maintenanceComplexity === "low"
                        ? "Low"
                        : strategy.maintenanceComplexity === "moderate"
                          ? "Moderate"
                          : strategy.maintenanceComplexity === "high"
                            ? "High"
                            : "Very High"}
                  </td>
                ))}
              </tr>

              {/* Security Level */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Security</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    <span
                      className={`arch-security-badge ${strategy.securityLevel}`}
                    >
                      {strategy.securityLevel === "basic"
                        ? "Basic"
                        : strategy.securityLevel === "standard"
                          ? "Standard"
                          : strategy.securityLevel === "advanced"
                            ? "Advanced"
                            : "Enterprise"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Team Size */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Min Team Size</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    {strategy.teamRequirements.minSize} people
                  </td>
                ))}
              </tr>

              {/* Architecture Pattern */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Architecture</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>{strategy.architecturePattern}</td>
                ))}
              </tr>

              {/* Max Users */}
              <tr>
                <td className="arch-metric-label">
                  <strong>Max Users</strong>
                </td>
                {comparison.strategies.map((strategy) => (
                  <td key={strategy.id}>
                    {strategy.suitableProjectSize.description}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="arch-cost-breakdown-section">
        <h3>💰 Cost Breakdown</h3>
        <div className="arch-cost-grid">
          {comparison.strategies.map((strategy) => (
            <div key={strategy.id} className="arch-cost-breakdown-card">
              <h4>{getStrategyLabel(strategy.tier)}</h4>
              <div className="arch-cost-items">
                <div className="arch-cost-item">
                  <span>Compute:</span>
                  <strong>
                    {formatCost(strategy.monthlyOperatingCost.compute)}
                  </strong>
                </div>
                <div className="arch-cost-item">
                  <span>Database:</span>
                  <strong>
                    {formatCost(strategy.monthlyOperatingCost.database)}
                  </strong>
                </div>
                <div className="arch-cost-item">
                  <span>Storage:</span>
                  <strong>
                    {formatCost(strategy.monthlyOperatingCost.storage)}
                  </strong>
                </div>
                <div className="arch-cost-item">
                  <span>CDN:</span>
                  <strong>
                    {formatCost(strategy.monthlyOperatingCost.cdn)}
                  </strong>
                </div>
                <div className="arch-cost-item">
                  <span>Services:</span>
                  <strong>
                    {formatCost(strategy.monthlyOperatingCost.services)}
                  </strong>
                </div>
                <div className="arch-cost-item arch-cost-total">
                  <span>Total:</span>
                  <strong>
                    {formatCost(strategy.monthlyOperatingCost.total)}/mo
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Paths */}
      <div className="arch-migration-section">
        <h3>🔄 Migration Paths</h3>
        <div className="arch-migration-grid">
          {comparison.strategies.map((strategy) => (
            <div key={strategy.id} className="arch-migration-card">
              <h4>{getStrategyLabel(strategy.tier)}</h4>
              {strategy.migrationPath.nextTier ? (
                <div>
                  <p className="arch-migration-arrow">↓</p>
                  <p>
                    Upgrade to{" "}
                    <strong>
                      {getStrategyLabel(strategy.migrationPath.nextTier)}
                    </strong>
                  </p>
                  <p className="arch-migration-effort">
                    Effort: <span>{strategy.migrationPath.effort}</span>
                  </p>
                  <p className="arch-migration-desc">
                    {strategy.migrationPath.description}
                  </p>
                </div>
              ) : (
                <div>
                  <p>Final tier - custom optimization only</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual strategy card with details
 */
interface ArchitectureStrategyCardProps {
  strategy: ArchitectureStrategy;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onChoose: () => void;
}

function ArchitectureStrategyCard({
  strategy,
  isRecommended,
  isSelected,
  onSelect,
  onChoose,
}: ArchitectureStrategyCardProps) {
  return (
    <div
      className={`arch-strategy-card ${isRecommended ? "arch-recommended" : ""} ${isSelected ? "arch-selected" : ""}`}
      onClick={onSelect}
    >
      {/* Header */}
      {isRecommended && (
        <div className="arch-recommended-badge">⭐ Recommended</div>
      )}

      <div className="arch-card-header">
        <h3>{strategy.name}</h3>
        <p className="arch-card-tagline">{strategy.tagline}</p>
      </div>

      {/* Key Metrics */}
      <div className="arch-key-metrics">
        <div className="arch-metric">
          <span className="arch-metric-icon">⚡</span>
          <span className="arch-metric-title">Dev Time</span>
          <span className="arch-metric-value">
            {strategy.developmentTimeWeeks}w
          </span>
        </div>
        <div className="arch-metric">
          <span className="arch-metric-icon">💰</span>
          <span className="arch-metric-title">Monthly</span>
          <span className="arch-metric-value">
            {formatCost(strategy.monthlyOperatingCost.total)}
          </span>
        </div>
        <div className="arch-metric">
          <span className="arch-metric-icon">📈</span>
          <span className="arch-metric-title">Scale</span>
          <span className="arch-metric-value">{strategy.scalability}</span>
        </div>
      </div>

      {/* Description */}
      <p className="arch-card-description">{strategy.description}</p>

      {/* Tech Stack */}
      <div className="arch-tech-section">
        <h5>Tech Stack</h5>
        <div className="arch-tech-tags">
          {[
            ...strategy.techStack.frontend,
            ...strategy.techStack.backend,
            ...strategy.techStack.database,
          ]
            .slice(0, 6)
            .map((tech, idx) => (
              <span key={idx} className="arch-tech-tag">
                {tech}
              </span>
            ))}
          {(
            Object.values(strategy.techStack).reduce(
              (acc: string[], arr) => acc.concat(arr),
              [],
            ) as string[]
          ).length > 6 && (
            <span className="arch-tech-tag arch-more">+more</span>
          )}
        </div>
      </div>

      {/* Advantages */}
      <div className="arch-advantages-section">
        <h5>✓ Advantages</h5>
        <ul className="arch-advantages-list">
          {strategy.advantages.slice(0, 3).map((advantage, idx) => (
            <li key={idx}>{advantage}</li>
          ))}
        </ul>
      </div>

      {/* Disadvantages */}
      <div className="arch-disadvantages-section">
        <h5>✗ Disadvantages</h5>
        <ul className="arch-disadvantages-list">
          {strategy.disadvantages.slice(0, 3).map((disadvantage, idx) => (
            <li key={idx}>{disadvantage}</li>
          ))}
        </ul>
      </div>

      {/* Best For */}
      <div className="arch-best-for">
        <span className="arch-best-for-label">Best For:</span>
        <span className="arch-best-for-value">{strategy.bestFor}</span>
      </div>

      {/* Action Buttons */}
      <div className="arch-card-actions">
        <button
          className={`arch-details-btn ${isSelected ? "arch-selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? "📋 Details Open" : "📋 View Details"}
        </button>
        <button
          className="arch-choose-btn"
          onClick={(e) => {
            e.stopPropagation();
            onChoose();
          }}
        >
          ✓ Choose This Architecture
        </button>
      </div>
    </div>
  );
}
