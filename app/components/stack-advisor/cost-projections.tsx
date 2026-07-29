"use client";

import { useMemo, useState } from "react";
import { tools } from ".";
import { calculateCost, type CostBreakdown } from "./cost-estimator";

// ─── Props ──────────────────────────────────────────────
interface CostProjectionsProps {
  selections: Record<string, string>;
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
export function CostProjections({ selections }: CostProjectionsProps) {
  const [growthMultiplier, setGrowthMultiplier] = useState(1);
  const [chartMode, setChartMode] = useState<
    "monthly" | "annual" | "comparison"
  >("monthly");

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean);
  }, [selections]);

  const estimate = useMemo(
    () => calculateCost(selectedTools as any[]),
    [selectedTools],
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
        label: "M" + (i + 1),
      };
    });
  }, [estimate, growthMultiplier]);

  // Comparison scenarios
  const comparisonData = useMemo(() => {
    // "Free" scenario: only free-tier tools (min costs)
    const freeTotal = estimate.breakdown.reduce(
      (sum, b) => sum + b.monthlyCost.min,
      0,
    );
    // "Hybrid" scenario: current selection (max costs)
    const hybridTotal = estimate.totalMonthly.max;
    // "Pro" scenario: everything at max + 30% buffer
    const proTotal = Math.round(hybridTotal * 1.3);
    return { freeTotal, hybridTotal, proTotal };
  }, [estimate]);

  // Chart dimensions
  const chartW = 600;
  const chartH = 200;
  const barAreaH = 150;
  const barW = Math.min((chartW - 60) / monthlyData.length / 2 - 3, 30);
  const padL = 50;
  const padB = 30;

  const maxVal = Math.max(
    ...monthlyData.map((d) => d.max),
    comparisonData.proTotal,
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
          Visualize your monthly infrastructure costs and compare pricing
          scenarios.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="cp-summary-cards">
        <div className="cp-card free">
          <span className="cp-card-label">Monthly (Free Tier)</span>
          <span className="cp-card-value">${estimate.totalMonthly.min}</span>
          <span className="cp-card-note">Minimum with free tiers</span>
        </div>
        <div className="cp-card paid">
          <span className="cp-card-label">Monthly (Scaled)</span>
          <span className="cp-card-value">${estimate.totalMonthly.max}</span>
          <span className="cp-card-note">Estimated at scale</span>
        </div>
        <div className="cp-card annual">
          <span className="cp-card-label">Annual Estimate</span>
          <span className="cp-card-value">${estimate.totalAnnual.min}</span>
          <span className="cp-card-note">- ${estimate.totalAnnual.max}</span>
        </div>
        <div className="cp-card score">
          <span className="cp-card-label">Ethiopian-Optimized</span>
          <span className="cp-card-value">
            ${Math.round(estimate.totalMonthly.max * 0.7)}
          </span>
          <span className="cp-card-note">~30% savings with local hosting</span>
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
                  {/* Min bar (free tier) */}
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
                  {/* Max bar (scaled) */}
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
              Free Tier
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
              Scaled
            </text>
          </svg>
        </div>
      )}

      {/* ─── Scenario Comparison ─── */}
      {chartMode === "comparison" && (
        <div className="cp-compare-section">
          <div className="cp-compare-grid">
            {/* Free tier scenario */}
            <div
              className="cp-compare-card"
              style={{ borderColor: "rgba(79,209,165,0.3)" }}
            >
              <div
                className="cp-compare-card-head"
                style={{ background: "rgba(79,209,165,0.06)" }}
              >
                <span className="cp-compare-icon">&#x1f381;</span>
                <strong>All Free Tier</strong>
              </div>
              <div className="cp-compare-body">
                <span className="cp-compare-price">
                  ${comparisonData.freeTotal}
                  <span className="cp-compare-period">/mo</span>
                </span>
                <span className="cp-compare-desc">
                  Strictly free-tier limits. Best for MVPs and prototypes.
                </span>
                <ul className="cp-compare-list">
                  <li>
                    {
                      estimate.breakdown.filter((b) => b.monthlyCost.max === 0)
                        .length
                    }{" "}
                    tools at $0
                  </li>
                  <li>No monthly commitments</li>
                  <li>Ideal for early-stage Ethiopian startups</li>
                </ul>
              </div>
            </div>

            {/* Hybrid scenario */}
            <div
              className="cp-compare-card cp-compare-popular"
              style={{ borderColor: "rgba(244,178,75,0.3)" }}
            >
              <div className="cp-compare-popular-badge">
                &#9733; Recommended
              </div>
              <div
                className="cp-compare-card-head"
                style={{ background: "rgba(244,178,75,0.06)" }}
              >
                <span className="cp-compare-icon">&#x2696;&#xfe0f;</span>
                <strong>Hybrid (Current)</strong>
              </div>
              <div className="cp-compare-body">
                <span className="cp-compare-price">
                  ${comparisonData.hybridTotal}
                  <span className="cp-compare-period">/mo</span>
                </span>
                <span className="cp-compare-desc">
                  Your current selection with realistic scaling.
                </span>
                <ul className="cp-compare-list">
                  <li>Mix of free and paid tools</li>
                  <li>
                    {
                      estimate.breakdown.filter((b) => b.monthlyCost.max > 0)
                        .length
                    }{" "}
                    paid tools included
                  </li>
                  <li>
                    {estimate.freeTierSufficient
                      ? "Free tier sufficient for launch"
                      : "May need upgrades at scale"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro scenario */}
            <div
              className="cp-compare-card"
              style={{ borderColor: "rgba(11,127,212,0.3)" }}
            >
              <div
                className="cp-compare-card-head"
                style={{ background: "rgba(11,127,212,0.06)" }}
              >
                <span className="cp-compare-icon">&#x1f680;</span>
                <strong>All Pro</strong>
              </div>
              <div className="cp-compare-body">
                <span className="cp-compare-price">
                  ${comparisonData.proTotal}
                  <span className="cp-compare-period">/mo</span>
                </span>
                <span className="cp-compare-desc">
                  Everything at maximum tier with 30% buffer.
                </span>
                <ul className="cp-compare-list">
                  <li>All tools at premium tiers</li>
                  <li>Enterprise-grade scalability</li>
                  <li>Best for production at scale</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison bar chart */}
          <div className="cp-bar-chart">
            {[
              {
                label: "Free Tier",
                value: comparisonData.freeTotal,
                color: "var(--teal)",
                max: comparisonData.proTotal,
              },
              {
                label: "Hybrid",
                value: comparisonData.hybridTotal,
                color: "var(--amber)",
                max: comparisonData.proTotal,
              },
              {
                label: "Pro",
                value: comparisonData.proTotal,
                color: "#0b7fd4",
                max: comparisonData.proTotal,
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

      {/* Ethiopian Cost Note */}
      <div className="cp-ethiopian-note">
        <strong>&#x1f1ea;&#x1f1f9; Ethiopian Cost Optimization</strong>
        <p>
          Running your stack on Ethiopian VPS providers (Habesha Host, Ethio
          Telecom) can reduce hosting costs by ~30-50%. Chapa and Telebirr have
          no monthly fees — only per-transaction. Self-hosted PostgreSQL and
          Redis eliminate subscription costs entirely.
        </p>
      </div>

      {/* Yearly Table */}
      <div className="cp-yearly-table">
        <h5>12-Month Cost Breakdown</h5>
        <div className="cp-table">
          <div className="cp-tr cp-tr-header">
            <span className="cp-td">Month</span>
            <span className="cp-td">Free Tier</span>
            <span className="cp-td">Scaled</span>
            <span className="cp-td">Growth Factor</span>
          </div>
          {monthlyData.map((d) => (
            <div key={d.month} className="cp-tr">
              <span className="cp-td">{d.month}</span>
              <span className="cp-td cp-green">${d.min}</span>
              <span className="cp-td cp-amber">${d.max}</span>
              <span className="cp-td">
                {Math.round((d.max / estimate.totalMonthly.max) * 100)}%
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
