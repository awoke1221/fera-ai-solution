"use client";

import React, { useState } from "react";
import type { TechExplanation } from "./technology-explanation-types";
import { getComplexityLabel } from "./architecture-strategy-types";

interface TechExplanationComponentProps {
  explanation: TechExplanation;
  expandable?: boolean;
}

/**
 * Component to display technology recommendations with decision traces
 */
export function TechExplanationCard({
  explanation,
  expandable = true,
}: TechExplanationComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    tech,
    decisionTrace,
    contextualAdvantages,
    contextualDisadvantages,
    whenToChoose,
    whenToAvoid,
  } = explanation;

  return (
    <div className="tech-explanation-card">
      {/* Header with technology name and fit score */}
      <div className="tech-exp-header">
        <div className="tech-exp-title-area">
          <h3 className="tech-exp-technology">{tech.technology}</h3>
          {tech.version && (
            <span className="tech-exp-version">{tech.version}</span>
          )}
        </div>
        <div className="tech-exp-score">
          <div className="tech-exp-fit-score">
            <div className="tech-exp-score-value">{decisionTrace.fitScore}</div>
            <div className="tech-exp-score-label">Fit Score</div>
          </div>
          <div className="tech-exp-score-explanation">
            {decisionTrace.fitExplanation}
          </div>
        </div>
      </div>

      {/* Decision Trace Visualization */}
      <div className="tech-exp-decision-trace">
        <div className="tech-exp-trace-title">Why This Technology?</div>
        <div className="tech-exp-trace-steps">
          {decisionTrace.steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`tech-exp-trace-step tech-exp-step-${step.level}`}
              >
                <div className="tech-exp-step-icon">{step.icon}</div>
                <div className="tech-exp-step-content">
                  <div className="tech-exp-step-label">
                    {step.level === "requirement" && "Project Requirement"}
                    {step.level === "technical-need" && "Technical Need"}
                    {step.level === "technology" && "Technology Choice"}
                    {step.level === "reason" && "Reason"}
                  </div>
                  <div className="tech-exp-step-text">{step.content}</div>
                </div>
              </div>
              {idx < decisionTrace.steps.length - 1 && (
                <div className="tech-exp-trace-arrow">↓</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Key Info - always visible */}
      <div className="tech-exp-key-info">
        <div className="tech-exp-key-item">
          <span className="tech-exp-key-label">Maturity:</span>
          <span className="tech-exp-key-value">{tech.maturityLevel}</span>
        </div>
        <div className="tech-exp-key-item">
          <span className="tech-exp-key-label">Scalability:</span>
          <span className="tech-exp-key-value">{tech.scalabilityRating}%</span>
        </div>
        <div className="tech-exp-key-item">
          <span className="tech-exp-key-label">Learnability:</span>
          <span className="tech-exp-key-value">{tech.learnabilityRating}%</span>
        </div>
        <div className="tech-exp-key-item">
          <span className="tech-exp-key-label">Cost:</span>
          <span className="tech-exp-key-value">{tech.costProfile}</span>
        </div>
      </div>

      {/* Advantages and Disadvantages */}
      <div className="tech-exp-pros-cons">
        <div className="tech-exp-advantages">
          <h5>✓ Advantages</h5>
          <ul>
            {contextualAdvantages.slice(0, 4).map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>
        <div className="tech-exp-disadvantages">
          <h5>✗ Tradeoffs</h5>
          <ul>
            {contextualDisadvantages.slice(0, 4).map((dis, i) => (
              <li key={i}>{dis}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expandable section */}
      {expandable && (
        <>
          <button
            className="tech-exp-expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▼ Hide Details" : "▶ Show Details"}
          </button>

          {expanded && (
            <div className="tech-exp-expanded">
              {/* Alternatives */}
              {tech.alternatives.length > 0 && (
                <div className="tech-exp-section">
                  <h5>Alternative Options</h5>
                  <div className="tech-exp-alternatives">
                    {tech.alternatives.map((alt, i) => (
                      <div key={i} className="tech-exp-alternative">
                        <strong>{alt.technology}</strong>
                        <p className="tech-exp-alt-reason">{alt.reason}</p>
                        <p className="tech-exp-alt-when">
                          When to use: {alt.whenToUse}
                        </p>
                        <p className="tech-exp-alt-tradeoff">
                          Tradeoff: {alt.tradeoffs}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to Choose / Avoid */}
              <div className="tech-exp-guidance">
                <div className="tech-exp-guidance-item">
                  <h5>✓ When to Choose</h5>
                  <p>{whenToChoose}</p>
                </div>
                <div className="tech-exp-guidance-item">
                  <h5>✗ When to Avoid</h5>
                  <p>{whenToAvoid}</p>
                </div>
              </div>

              {/* Full advantages list */}
              <div className="tech-exp-section">
                <h5>Complete Advantages</h5>
                <ul className="tech-exp-full-list">
                  {tech.advantages.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>

              {/* Full disadvantages list */}
              <div className="tech-exp-section">
                <h5>Complete Tradeoffs</h5>
                <ul className="tech-exp-full-list">
                  {tech.disadvantages.map((dis, i) => (
                    <li key={i}>{dis}</li>
                  ))}
                </ul>
              </div>

              {/* When to replace */}
              <div className="tech-exp-section">
                <h5>Future Considerations</h5>
                <p>{tech.whenToReplace}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
