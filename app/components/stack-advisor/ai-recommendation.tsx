"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  analyzeProjectRequirements,
  projectTypes,
  tools,
  calculateCost,
  type ProjectType,
  type StructuredTechStackRecommendation,
  generateArchitectureStrategies,
  type ArchitectureComparison,
  type ArchitectureStrategy,
  ArchitectureComparisonComponent,
  TechExplanationCard,
  generateTechExplanation,
  ArchitectureDiagramComponent,
  generateArchitectureDiagram,
  SecurityReportComponent,
  generateSecurityAnalysis,
} from ".";

// ─── Types ──────────────────────────────────────────────
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RecommendationResponse = {
  type: "structured" | "chat" | "error";
  data?: StructuredTechStackRecommendation;
  role?: "assistant" | "user";
  content?: string;
  error?: string;
};

type Suggestion = {
  text: string;
  icon: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    text: "I'm building an e-commerce platform for Ethiopian handmade goods — what stack works best?",
    icon: "🛒",
  },
  { text: "What's the cheapest free-tier stack for a SaaS MVP?", icon: "💰" },
  {
    text: "I need a fintech app with Chapa and Telebirr integration — recommend a stack",
    icon: "💳",
  },
  {
    text: "Compare Next.js + Supabase vs Django + PostgreSQL for an ERP system",
    icon: "⚖️",
  },
  {
    text: "What's the best stack for an LMS with video streaming in Ethiopia?",
    icon: "🎓",
  },
  {
    text: "I already have React + Node.js — should I migrate to Next.js?",
    icon: "🔄",
  },
];

// ─── Props ──────────────────────────────────────────────
interface AiRecommendationProps {
  selections: Record<string, string>;
  selectedProject?: ProjectType | null;
  projectRequirements?: import(".").ProjectRequirements | null;
}

// ─── Component ──────────────────────────────────────────
export function AiRecommendation({
  selections,
  selectedProject,
  projectRequirements,
}: AiRecommendationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] =
    useState<StructuredTechStackRecommendation | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [architectureComparison, setArchitectureComparison] =
    useState<ArchitectureComparison | null>(null);
  const [selectedArchitectureId, setSelectedArchitectureId] = useState<
    string | undefined
  >();
  const [securityReport, setSecurityReport] = useState<ReturnType<
    typeof generateSecurityAnalysis
  > | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxRetries = 3;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, recommendation]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-generate recommendation if we have project requirements
  useEffect(() => {
    if (projectRequirements && !recommendation && messages.length === 0) {
      generateStructuredRecommendation();
    }
  }, [projectRequirements?.projectName]);

  const generateStructuredRecommendation = useCallback(async () => {
    if (!projectRequirements) return;

    setLoading(true);
    setError(null);

    try {
      const analysis = analyzeProjectRequirements(projectRequirements);

      const res = await fetch("/api/ai-stack-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: selectedProject?.id || null,
          selections,
          projectRequirements,
          requirementsAnalysis: analysis,
          message: null,
          conversation: null,
        }),
      });

      const data: RecommendationResponse = await res.json();

      if (data.type === "structured" && data.data) {
        setRecommendation(data.data);

        // Also generate architecture strategies for this project
        const analysis = analyzeProjectRequirements(projectRequirements);
        const archComparison = generateArchitectureStrategies(
          projectRequirements,
          analysis,
        );
        setArchitectureComparison(archComparison);
        setSelectedArchitectureId(archComparison.recommendedTier);
      } else if (data.error) {
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000),
          );
          generateStructuredRecommendation();
        } else {
          setError(data.error || "Failed to generate recommendation");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to connect. Please try again.";
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000),
        );
        generateStructuredRecommendation();
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [projectRequirements, selectedProject, selections, retryCount]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || loading) return;

      const newMessage: ChatMessage = {
        role: "user",
        content: userMessage.trim(),
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai-stack-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectType: selectedProject?.id || null,
            selections,
            message: userMessage.trim(),
            conversation: updatedMessages
              .slice(-6)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data: RecommendationResponse = await res.json();

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content:
            data.content ||
            "I couldn't process that request. Please try again.",
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setError("Failed to connect. Please check your network.");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, selectedProject, selections],
  );

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Render markdown-like content as HTML
  const renderContent = (content: string) => {
    // Bold
    let html = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Inline code
    html = html.replace(/`(.+?)`/g, "<code class='ai-inline-code'>$1</code>");
    // Code blocks
    html = html.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      "<pre class='ai-code-block'><code>$2</code></pre>",
    );
    // Line breaks
    html = html.replace(/\n/g, "<br/>");
    return html;
  };

  const hasSelections = Object.keys(selections).length > 0;

  const selectedTools = useMemo(
    () =>
      Object.values(selections)
        .map((toolId) => tools.find((tool) => tool.id === toolId))
        .filter(Boolean),
    [selections],
  );

  const projectCostEstimate = useMemo(
    () =>
      calculateCost(selectedTools as any[], projectRequirements ?? undefined),
    [projectRequirements, selectedTools],
  );

  return (
    <div className="ai-recommend-container">
      {/* Header */}
      <div className="ai-recommend-header">
        <div className="ai-recommend-header-left">
          <span className="ai-recommend-avatar">🤖</span>
          <div>
            <strong>FERA AI Stack Advisor</strong>
            <span className="ai-recommend-status">
              <span className="ai-status-dot" /> AI Ready
            </span>
          </div>
        </div>
        <div className="ai-recommend-header-actions">
          {(messages.length > 0 || recommendation) && (
            <button
              className="ai-clear-btn"
              onClick={() => {
                clearChat();
                setRecommendation(null);
                setRetryCount(0);
              }}
              title="Clear all"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Context badge */}
      {selectedProject && (
        <div className="ai-context-badge">
          {selectedProject.icon} {selectedProject.label}
          {hasSelections && (
            <span className="ai-context-count">
              &middot; {Object.keys(selections).length} tools selected
            </span>
          )}
        </div>
      )}

      {/* Messages and Recommendation Body */}
      <div className="ai-recommend-body">
        {loading && !recommendation && messages.length === 0 ? (
          // Loading state for initial recommendation
          <div className="ai-loading-state">
            <div className="ai-loading-spinner">⟳</div>
            <h4>Generating tech stack recommendation...</h4>
            <p>Analyzing your project requirements...</p>
            {retryCount > 0 && (
              <p className="ai-retry-notice">
                Attempt {retryCount + 1} of {maxRetries + 1}...
              </p>
            )}
          </div>
        ) : recommendation ? (
          // Structured recommendation view
          <div className="ai-recommendation-view">
            {/* Project Summary */}
            <section className="ai-rec-section">
              <h3>📋 Project Summary</h3>
              <div className="ai-rec-summary">
                <div className="ai-summary-item">
                  <span className="ai-summary-label">Project:</span>
                  <span>{recommendation.projectSummary.projectName}</span>
                </div>
                <div className="ai-summary-item">
                  <span className="ai-summary-label">Category:</span>
                  <span className="ai-badge">
                    {recommendation.projectSummary.category}
                  </span>
                </div>
                <div className="ai-summary-item">
                  <span className="ai-summary-label">Expected Scale:</span>
                  <span>{recommendation.projectSummary.expectedScale}</span>
                </div>
                <div className="ai-summary-item">
                  <span className="ai-summary-label">Estimated Cost:</span>
                  <span>${projectCostEstimate.totalMonthly.max}/mo</span>
                </div>
                <div className="ai-summary-item">
                  <span className="ai-summary-label">Overview:</span>
                  <span>{recommendation.projectSummary.marketContext}</span>
                </div>
              </div>
            </section>

            {/* Recommended Stack */}
            <section className="ai-rec-section">
              <h3>🛠️ Recommended Stack</h3>
              <div className="ai-stack-explanations">
                {recommendation.recommendedStack.map((tech) => {
                  if (!projectRequirements) return null;

                  const techExplanation = generateTechExplanation(tech, {
                    requirements: projectRequirements,
                    analysis: analyzeProjectRequirements(projectRequirements),
                    category: tech.category,
                  });

                  return (
                    <TechExplanationCard
                      key={tech.id}
                      explanation={techExplanation}
                      expandable={true}
                    />
                  );
                })}
              </div>
            </section>

            {/* Architecture */}
            <section className="ai-rec-section">
              <h3>🏗️ Architecture</h3>
              <div className="ai-architecture">
                <h4>{recommendation.recommendedArchitecture.pattern}</h4>
                <p>{recommendation.recommendedArchitecture.description}</p>
                <div className="ai-layers">
                  {recommendation.recommendedArchitecture.layers.map(
                    (layer, i) => (
                      <div key={i} className="ai-layer">
                        <strong>{layer.tier}</strong>
                        <p>{layer.technologies.join(", ")}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* Complexity Estimate */}
            <section className="ai-rec-section">
              <h3>📊 Complexity & Timeline</h3>
              <div className="ai-complexity">
                <div className="ai-complexity-item">
                  <span className="ai-label">Overall:</span>
                  <span className="ai-value ai-complexity-badge">
                    {recommendation.estimatedComplexity.overallComplexity}
                  </span>
                </div>
                <div className="ai-complexity-item">
                  <span className="ai-label">Dev Time:</span>
                  <span className="ai-value">
                    {recommendation.estimatedComplexity.developmentTime}
                  </span>
                </div>
                <div className="ai-complexity-item">
                  <span className="ai-label">Team Size:</span>
                  <span className="ai-value">
                    {recommendation.estimatedComplexity.teamSize}
                  </span>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section className="ai-rec-section">
              <h3>🚀 Next Steps</h3>
              <div className="ai-next-steps">
                {recommendation.recommendedNextSteps.map((step, i) => (
                  <div key={i} className="ai-step">
                    <h5>{step.phase}</h5>
                    <p>{step.description}</p>
                    <small>{step.duration}</small>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture Strategies Comparison */}
            {architectureComparison && (
              <section className="ai-rec-section">
                <h3>🏛️ Architecture Strategy Options</h3>
                <p className="ai-strategies-intro">
                  Here are three architecture strategies tailored to your
                  project needs. Each offers a different balance of speed, cost,
                  and scalability.
                </p>
                <ArchitectureComparisonComponent
                  comparison={architectureComparison}
                  selectedStrategy={selectedArchitectureId}
                  onSelectStrategy={setSelectedArchitectureId}
                  onChooseArchitecture={(strategy: ArchitectureStrategy) => {
                    console.log("Selected architecture:", strategy.id);
                    // Sync with parent component if needed
                    setSelectedArchitectureId(strategy.id);
                    // Could emit custom event or update parent state here
                  }}
                />
              </section>
            )}

            {/* Interactive Architecture Diagram */}
            {architectureComparison && selectedArchitectureId && (
              <section className="ai-rec-section">
                <h3>🔗 Data Flow Diagram</h3>
                <p className="ai-strategies-intro">
                  Interactive visualization showing how your system components
                  connect and communicate. Click nodes to see details, scroll to
                  zoom, and drag the canvas to pan.
                </p>
                {(() => {
                  const selectedStrategy =
                    architectureComparison.strategies.find(
                      (s) => s.id === selectedArchitectureId,
                    );
                  if (!selectedStrategy) return null;

                  const diagram = generateArchitectureDiagram(selectedStrategy);
                  return <ArchitectureDiagramComponent diagram={diagram} />;
                })()}
              </section>
            )}

            {/* Security Advisor */}
            {architectureComparison && selectedArchitectureId && (
              <section className="ai-rec-section">
                <h3>🔒 Security Analysis</h3>
                <p className="ai-strategies-intro">
                  Comprehensive security evaluation of your selected
                  architecture across 15 security categories. Identify issues,
                  get prioritized remediation guidance, and understand
                  compliance requirements.
                </p>
                {(() => {
                  const selectedStrategy =
                    architectureComparison.strategies.find(
                      (s) => s.id === selectedArchitectureId,
                    );
                  if (!selectedStrategy) return null;

                  const securityAnalysis = generateSecurityAnalysis({
                    architectureStrategy: selectedStrategy,
                    projectRequirements: projectRequirements || undefined,
                    selectedTechStack: [
                      ...selectedStrategy.techStack.frontend,
                      ...selectedStrategy.techStack.backend,
                      ...selectedStrategy.techStack.database,
                      ...selectedStrategy.techStack.cache,
                      ...selectedStrategy.techStack.deployment,
                      ...selectedStrategy.techStack.monitoring,
                      ...selectedStrategy.techStack.other,
                    ],
                  });

                  return <SecurityReportComponent report={securityAnalysis} />;
                })()}
              </section>
            )}
          </div>
        ) : messages.length === 0 ? (
          // Welcome state
          <div className="ai-welcome">
            <div className="ai-welcome-icon">🤖</div>
            <h4>FERA AI Stack Advisor</h4>
            <p>
              Ask me anything about your tech stack! I can recommend tools,
              compare frameworks, estimate costs, or review your current
              selections.
            </p>

            {/* Suggestions */}
            <div className="ai-suggestions">
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  className="ai-suggestion-btn"
                  onClick={() => handleSuggestion(s.text)}
                  disabled={loading}
                >
                  <span className="ai-suggestion-icon">{s.icon}</span>
                  <span className="ai-suggestion-text">{s.text}</span>
                </button>
              ))}
            </div>
            <div className="ai-suggestions ai-suggestions-secondary">
              {SUGGESTIONS.slice(3).map((s, i) => (
                <button
                  key={i + 3}
                  className="ai-suggestion-btn"
                  onClick={() => handleSuggestion(s.text)}
                  disabled={loading}
                >
                  <span className="ai-suggestion-icon">{s.icon}</span>
                  <span className="ai-suggestion-text">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat messages view
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={"ai-msg " + msg.role}>
                <div className="ai-msg-avatar">
                  {msg.role === "assistant" ? "🤖" : "👤"}
                </div>
                <div
                  className="ai-msg-bubble"
                  dangerouslySetInnerHTML={{
                    __html: renderContent(msg.content),
                  }}
                />
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="ai-msg assistant">
                <div className="ai-msg-avatar">🤖</div>
                <div className="ai-msg-bubble ai-typing">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="ai-error-msg">
                ⚠️ {error}
                {retryCount < maxRetries && (
                  <button
                    className="ai-retry-btn"
                    onClick={generateStructuredRecommendation}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error state at bottom */}
        {error && recommendation && (
          <div className="ai-error-msg">⚠️ {error}</div>
        )}
      </div>

      {/* Input bar */}
      <form className="ai-recommend-input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            recommendation
              ? "Ask a follow-up question..."
              : selectedProject
                ? `Ask about ${selectedProject.label} stack...`
                : "Describe your project for a stack recommendation..."
          }
          disabled={loading}
          className="ai-recommend-input"
        />
        <button
          type="submit"
          className="ai-recommend-send"
          disabled={loading || !input.trim()}
        >
          {loading ? "⏳" : "→"}
        </button>
      </form>
    </div>
  );
}
