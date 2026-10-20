"use client";

import { useMemo, useState } from "react";
import { tools, type ProjectRequirements, type ToolOption } from ".";
import { calculateCost } from "./cost-estimator";
import { expectedUsersOptions } from "./project-requirements";

// ─── Props ──────────────────────────────────────────────
interface CostProjectionsProps {
  selections: Record<string, string>;
  projectRequirements?: ProjectRequirements | null;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ─── Component ──────────────────────────────────────────
export function CostProjections({
  selections,
  projectRequirements,
}: CostProjectionsProps) {
  const [growthMultiplier, setGrowthMultiplier] = useState(1);
  const [chartMode, setChartMode] = useState<
    "monthly" | "annual" | "comparison"
  >("monthly");

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter((tool): tool is ToolOption => Boolean(tool));
  }, [selections]);

  const estimate = useMemo(
    () =>
      calculateCost(
        selectedTools,
        projectRequirements
          ? { expectedUsers: projectRequirements.expectedUsers }
          : undefined,
      ),
    [projectRequirements, selectedTools],
  );

  // Generate 12-month projection data
  const monthlyData = useMemo(() => {
    // Simulate growth: costs increase gradually as usage scales
    const baseMin = estimate.totalMonthly.min;
    const baseMax = estimate.totalMonthly.max;
    return Array.from({ length: 12 }, (_, i) => {
      const growthFactor = 1 + (i / 11) * (growthMultiplier - 1);
      return {
        month: MONTHS[i],
        min: Math.round(baseMin * growthFactor),
        max: Math.round(baseMax * growthFactor),
        growthFactor,
      };
    });
  }, [estimate, growthMultiplier]);

  // Comparison scenarios
  const comparisonData = useMemo(() => {
    const lowerEstimate = estimate.breakdown.reduce(
      (sum, b) => sum + b.monthlyCost.min,
      0,
    );
    const upperEstimate = estimate.totalMonthly.max;
    const budgetWithReserve = Math.round(upperEstimate * 1.3);
    return { lowerEstimate, upperEstimate, budgetWithReserve };
  }, [estimate]);

  const planningAssumptions = useMemo(
    () => [
      {
        label: "Expected users",
        value:
          expectedUsersOptions.find(
            (option) =>
              option.value === projectRequirements?.expectedUsers,
          )?.label ?? "Not specified",
        note: "Used as context only; user counts are not converted into requests, storage, or bandwidth.",
      },
      {
        label: "Estimate basis",
        value: `${selectedTools.length} selected tools`,
        note: estimate.upgradePlanningNote,
      },
      {
        label: "Budget reserve",
        value: "30% planning buffer",
        note: "A budgeting assumption applied to the upper estimate, not a vendor price or forecast.",
      },
      {
        label: "Regional pricing",
        value: "Verify with providers",
        note: "Hosting availability, payment fees, currency conversion, and taxes vary by provider and country.",
      },
    ],
    [
      estimate.upgradePlanningNote,
      projectRequirements?.expectedUsers,
      selectedTools.length,
    ],
  );

  // Chart dimensions
  const chartW = 600;
  const chartH = 200;
  const barAreaH = 150;
  const barW = Math.min((chartW - 60) / monthlyData.length / 2 - 3, 30);
  const padL = 50;
  const padB = 30;

  const maxVal = Math.max(
    ...monthlyData.map((d) => d.max),
    comparisonData.budgetWithReserve,
    50,
  );
  const yScale = (val: number) => barAreaH - (val / maxVal) * barAreaH + 5;

  const hasSelections = Object.keys(selections).length > 0;

  if (!hasSelections) {
    return (
      <div className="cp-empty">
        <div className="cp-empty-icon">&#x1f4ca;</div>
        <h4>No Cost Data Yet</h4>
        <p>Select tools in the Tool Selector to see projected costs.</p>
      </div>
    );
  }

  return (
    <div className="cp-container">
      {/* Header */}
      <div className="cp-header">
        <h4>&#x1f4ca; Cost Projection Dashboard</h4>
        <p>
          Review catalogue-based cost ranges for the selected tools. The
          12-month curve applies your growth multiplier linearly; it is an
          illustrative scenario, not a traffic forecast or vendor quote.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="cp-summary-cards">
        <div className="cp-card free">
          <span className="cp-card-label">Monthly (Lower estimate)</span>
          <span className="cp-card-value">${estimate.totalMonthly.min}</span>
          <span className="cp-card-note">Catalogue lower range</span>
        </div>
        <div className="cp-card paid">
          <span className="cp-card-label">Monthly (Upper estimate)</span>
          <span className="cp-card-value">${estimate.totalMonthly.max}</span>
          <span className="cp-card-note">Catalogue upper range</span>
        </div>
        <div className="cp-card annual">
          <span className="cp-card-label">Annual Estimate</span>
          <span className="cp-card-value">${estimate.totalAnnual.min}</span>
          <span className="cp-card-note">- ${estimate.totalAnnual.max}</span>
        </div>
        <div className="cp-card score">
          <span className="cp-card-label">Budget with reserve</span>
          <span className="cp-card-value">
            ${comparisonData.budgetWithReserve}
          </span>
          <span className="cp-card-note">Upper estimate + 30% buffer</span>
        </div>
      </div>

      <div className="cp-advanced-layout">
        <div className="cp-advanced-panel">
          <div className="cp-panel-header">
            <span>Selected stack cost inputs</span>
            <span className="cp-pill">Current selection</span>
          </div>
          <div className="cp-template-grid">
            <div className="cp-template-card">
              <div className="cp-template-topline">
                <strong>
                  {projectRequirements?.projectName || "Current stack"}
                </strong>
                <span>
                  ${estimate.totalMonthly.min}–${estimate.totalMonthly.max}/mo
                </span>
              </div>
              <p>
                Range is calculated from the selected tools and the scale input
                when provided.
              </p>
              <ul>
                {selectedTools.map((tool) => (
                  <li key={tool.id}>
                    {tool.name} ({tool.category.replace(/_/g, " ")})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="cp-advanced-panel">
          <div className="cp-panel-header">
            <span>Estimate assumptions</span>
            <span className="cp-pill neutral">Model</span>
          </div>
          <div className="cp-assumptions-list">
            {planningAssumptions.map((assumption) => (
              <div key={assumption.label} className="cp-assumption-item">
                <div className="cp-assumption-label">{assumption.label}</div>
                <strong>{assumption.value}</strong>
                <small>{assumption.note}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="cp-mode-switcher">
        <button
          className={"cp-mode-btn" + (chartMode === "monthly" ? " active" : "")}
          onClick={() => setChartMode("monthly")}
        >
          &#x1f4c8; Monthly Projection
        </button>
        <button
          className={
            "cp-mode-btn" + (chartMode === "comparison" ? " active" : "")
          }
          onClick={() => setChartMode("comparison")}
        >
          &#x2696;&#xfe0f; Scenario Comparison
        </button>
      </div>

      {/* Growth Slider */}
      <div className="cp-slider-row">
        <span className="cp-slider-label">
          Growth multiplier: <strong>{growthMultiplier}x</strong>
        </span>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={growthMultiplier}
          onChange={(e) => setGrowthMultiplier(Number(e.target.value))}
          className="cp-slider"
        />
        <span className="cp-slider-hint">
          What if you get {growthMultiplier}x more users?
        </span>
      </div>

      {/* ─── Monthly Projection Chart ─── */}
      {chartMode === "monthly" && (
        <div className="cp-chart-area">
          <svg
            viewBox={"0 0 " + chartW + " " + (chartH + 10)}
            className="cp-svg"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = yScale(maxVal * pct);
              return (
                <g key={pct}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={chartW - 10}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                  <text
                    x={padL - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#8b988f"
                    fontSize="9"
                    fontFamily="var(--mono)"
                  >
                    ${Math.round(maxVal * pct)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {monthlyData.map((d, i) => {
              const x = padL + i * ((chartW - padL - 10) / monthlyData.length);
              const yMin = yScale(d.min);
              const yMax = yScale(d.max);
              const bw = Math.min(barW * 1.5, 20);
              return (
                <g key={d.month}>
                  {/* Lower estimate */}
                  <rect
                    x={x - bw / 2}
                    y={yMin}
                    width={bw}
                    height={barAreaH - yMin + 5}
                    rx="3"
                    fill="rgba(79,209,165,0.25)"
                    stroke="var(--teal)"
                    strokeWidth="1"
                  />
                  {/* Upper estimate */}
                  <rect
                    x={x + bw / 2 + 2}
                    y={yMax}
                    width={bw}
                    height={barAreaH - yMax + 5}
                    rx="3"
                    fill="rgba(244,178,75,0.2)"
                    stroke="var(--amber)"
                    strokeWidth="1"
                  />
                  {/* Month label */}
                  <text
                    x={x + bw / 2}
                    y={chartH - 5}
                    textAnchor="middle"
                    fill="#8b988f"
                    fontSize="8"
                    fontFamily="var(--mono)"
                  >
                    {d.month}
                  </text>
                  {/* Tooltip value on hover area */}
                  <rect
                    x={x - bw}
                    y={0}
                    width={bw * 3}
                    height={barAreaH + 10}
                    fill="transparent"
                    onMouseEnter={() => {}}
                  />
                </g>
              );
            })}

            {/* Legend */}
            <rect
              x={chartW - 140}
              y={5}
              width={12}
              height={12}
              rx="2"
              fill="rgba(79,209,165,0.3)"
              stroke="var(--teal)"
              strokeWidth="1"
            />
            <text
              x={chartW - 124}
              y={14}
              fill="#8b988f"
              fontSize="9"
              fontFamily="var(--mono)"
            >
              Lower estimate
            </text>
            <rect
              x={chartW - 140}
              y={22}
              width={12}
              height={12}
              rx="2"
              fill="rgba(244,178,75,0.2)"
              stroke="var(--amber)"
              strokeWidth="1"
            />
            <text
              x={chartW - 124}
              y={31}
              fill="#8b988f"
              fontSize="9"
              fontFamily="var(--mono)"
            >
              Upper estimate
            </text>
          </svg>
        </div>
      )}

      {/* ─── Scenario Comparison ─── */}
      {chartMode === "comparison" && (
        <div className="cp-compare-section">
          <div className="cp-compare-grid">
            {/* Lower estimate */}
            <div
              className="cp-compare-card"
              style={{ borderColor: "rgba(79,209,165,0.3)" }}
            >
              <div
                className="cp-compare-card-head"
                style={{ background: "rgba(79,209,165,0.06)" }}
              >
                <span className="cp-compare-icon">&#x1f381;</span>
                <strong>Lower estimate</strong>
              </div>
              <div className="cp-compare-body">
                <span className="cp-compare-price">
                  ${comparisonData.lowerEstimate}
                  <span className="cp-compare-period">/mo</span>
                </span>
                <span className="cp-compare-desc">
                  Sum of catalogue lower ranges for the selected tools.
                </span>
                <ul className="cp-compare-list">
                  <li>
                    {
                      estimate.breakdown.filter((b) => b.monthlyCost.min === 0)
                        .length
                    }{" "}
                    tools with a $0 lower range
                  </li>
                  <li>Actual usage may exceed the lower range</li>
                  <li>Check each provider's current pricing</li>
                </ul>
              </div>
            </div>

            {/* Upper estimate */}
            <div
              className="cp-compare-card cp-compare-popular"
              style={{ borderColor: "rgba(244,178,75,0.3)" }}
            >
              <div
                className="cp-compare-card-head"
                style={{ background: "rgba(244,178,75,0.06)" }}
              >
                <span className="cp-compare-icon">&#x2696;&#xfe0f;</span>
                <strong>Upper estimate</strong>
              </div>
              <div className="cp-compare-body">
                <span className="cp-compare-price">
                  ${comparisonData.upperEstimate}
                  <span className="cp-compare-period">/mo</span>
                </span>
                <span className="cp-compare-desc">
                  Sum of catalogue upper ranges for the selected tools.
                </span>
                <ul className="cp-compare-list">
                  <li>Usage and plan assumptions vary by provider</li>
                  <li>
                    {
                      estimate.breakdown.filter((b) => b.monthlyCost.max > 0)
                        .length
                    }{" "}
                    tools with a non-zero upper range
                  </li>
                  <li>
                    {estimate.hasFreeTierOptions
                      ? "Some selected tools may have free-tier options"
                      : "No selected tool has a free option listed"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Budget with reserve */}
            <div
              className="cp-compare-card"
              style={{ borderColor: "rgba(11,127,212,0.3)" }}
            >
              <div
                className="cp-compare-card-head"
                style={{ background: "rgba(11,127,212,0.06)" }}
              >
                <span className="cp-compare-icon">&#x1f680;</span>
                <strong>Budget with reserve</strong>
              </div>
              <div className="cp-compare-body">
                <span className="cp-compare-price">
                  ${comparisonData.budgetWithReserve}
                  <span className="cp-compare-period">/mo</span>
                </span>
                <span className="cp-compare-desc">
                  Upper estimate with a planning-only contingency.
                </span>
                <ul className="cp-compare-list">
                  <li>Includes a 30% budget reserve</li>
                  <li>Not a quoted provider plan</li>
                  <li>Adjust the reserve to your risk tolerance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison bar chart */}
          <div className="cp-bar-chart">
            {[
              {
                label: "Lower estimate",
                value: comparisonData.lowerEstimate,
                color: "var(--teal)",
                max: comparisonData.budgetWithReserve,
              },
              {
                label: "Upper estimate",
                value: comparisonData.upperEstimate,
                color: "var(--amber)",
                max: comparisonData.budgetWithReserve,
              },
              {
                label: "With reserve",
                value: comparisonData.budgetWithReserve,
                color: "#0b7fd4",
                max: comparisonData.budgetWithReserve,
              },
            ].map((item) => (
              <div key={item.label} className="cp-bar-row">
                <span className="cp-bar-label">{item.label}</span>
                <div className="cp-bar-track">
                  <div
                    className="cp-bar-fill"
                    style={{
                      width: (item.value / item.max) * 100 + "%",
                      background: item.color,
                    }}
                  />
                </div>
                <span className="cp-bar-value">${item.value}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional cost note */}
      <div className="cp-ethiopian-note">
        <strong>Regional pricing note</strong>
        <p>
          No regional discount is assumed. Compare current provider prices,
          availability, transaction fees, taxes, data-transfer costs, and
          currency conversion before choosing a hosting or payment provider.
        </p>
      </div>

      {/* Yearly Table */}
      <div className="cp-yearly-table">
        <h5>12-Month Cost Breakdown</h5>
        <div className="cp-table">
          <div className="cp-tr cp-tr-header">
            <span className="cp-td">Month</span>
            <span className="cp-td">Lower estimate</span>
            <span className="cp-td">Upper estimate</span>
            <span className="cp-td">Scenario factor</span>
          </div>
          {monthlyData.map((d) => (
            <div key={d.month} className="cp-tr">
              <span className="cp-td">{d.month}</span>
              <span className="cp-td cp-green">${d.min}</span>
              <span className="cp-td cp-amber">${d.max}</span>
              <span className="cp-td">
                {d.growthFactor.toFixed(2)}x
              </span>
            </div>
          ))}
          <div className="cp-tr cp-tr-total">
            <span className="cp-td">Total</span>
            <span className="cp-td cp-green">
              ${monthlyData.reduce((s, d) => s + d.min, 0)}
            </span>
            <span className="cp-td cp-amber">
              ${monthlyData.reduce((s, d) => s + d.max, 0)}
            </span>
            <span className="cp-td">{growthMultiplier}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
