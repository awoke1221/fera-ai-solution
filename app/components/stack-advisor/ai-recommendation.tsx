"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { projectTypes, tools, type ProjectType } from ".";

// ─── Types ──────────────────────────────────────────────
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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
}

// ─── Component ──────────────────────────────────────────
export function AiRecommendation({
  selections,
  selectedProject,
}: AiRecommendationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
            conversation: messages
              .slice(-6)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json();

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
          {messages.length > 0 && (
            <button
              className="ai-clear-btn"
              onClick={clearChat}
              title="Clear chat"
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

      {/* Messages */}
      <div className="ai-recommend-body">
        {messages.length === 0 ? (
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
            {error && <div className="ai-error-msg">⚠️ {error}</div>}

            <div ref={messagesEndRef} />
          </div>
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
            selectedProject
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
