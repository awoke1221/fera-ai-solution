// ─── FERA AI — floating AI chatbot assistant ─────────
// A floating chat widget powered by DeepSeek LLM.
// Appears on every page via SiteShell.
// Features:
//   - Animated toggle button with AI badge
//   - Slide-up chat panel with welcome message
//   - Quick suggestion buttons
//   - Typing indicator and markdown-like rendering
//   - Persistent conversation state per session

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "👋 Hi, I'm **FERA AI** — your intelligent assistant. I can help you learn about our services, process, and how we can help build your next product. What would you like to know?",
};

// ─── Quick-start suggestions shown before the first message ──
const SUGGESTIONS = [
  "What services do you offer?",
  "How does your process work?",
  "What tech stack do you use?",
  "How do I book a consultation?",
];

export function FeraAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [membershipStatus, setMembershipStatus] = useState<{
    hasPremium: boolean;
    user: any | null;
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, draft]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    fetch("/api/membership/status")
      .then((res) => res.json())
      .then((data) => {
        setMembershipStatus({
          hasPremium: data.hasPremium || false,
          user: data.user || null,
        });
      })
      .catch(() => setMembershipStatus({ hasPremium: false, user: null }));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMessage: ChatMessage = { role: "user", content: trimmed };
      const updated = [...messages, userMessage];
      setMessages(updated);
      setInput("");
      setLoading(true);
      setDraft("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updated.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();
        const reply: ChatMessage = {
          role: "assistant",
          content:
            data.content ||
            "I'm sorry, I couldn't process that. Please try again.",
        };
        setMessages((prev) => [...prev, reply]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting. Please try again or reach out via our [contact page](/contact).",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            className="fera-chat-link"
            target={match[2].startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
          >
            {match[1]}
          </a>
        );
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith("**") && bp.endsWith("**")) {
          return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
        }
        return <span key={`${i}-${j}`}>{bp}</span>;
      });
    });
  };

  if (membershipStatus && !membershipStatus.hasPremium) {
    return (
      <div className="fera-chat-gate">
        <div className="fera-chat-gate-icon">✨</div>
        <h3>Premium AI support</h3>
        <p>
          Unlock the complete Stack Guides experience and AI support with a
          monthly membership.
        </p>
        <div className="fera-chat-gate-actions">
          <Link href="/membership" className="btn solid">
            Join Membership
          </Link>
          {!membershipStatus.user && (
            <Link href="/auth/login?next=/membership" className="btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`fera-chat-toggle ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open FERA AI chat"}
      >
        {open ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <div className="fera-chat-toggle-inner">
            <img
              src="/fera-logo.jpg"
              alt="FERA AI"
              className="fera-chat-avatar-img"
            />
            <span className="fera-chat-ai-badge">AI</span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      <div className={`fera-chat-panel ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="fera-chat-header">
          <div className="fera-chat-header-brand">
            <div
              className="brand-logo-wrapper"
              style={{ width: 36, height: 36 }}
            >
              <img
                src="/fera-logo.jpg"
                alt="FERA AI"
                className="fera-chat-header-logo"
              />
              <span
                className="brand-ai-badge"
                style={{
                  fontSize: "0.5rem",
                  width: 16,
                  height: 16,
                  lineHeight: "16px",
                }}
              >
                AI
              </span>
            </div>
            <div>
              <strong>FERA AI</strong>
              <span className="fera-chat-status">
                <span className="fera-chat-dot" /> Online
              </span>
            </div>
          </div>
          <button
            className="fera-chat-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="fera-chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`fera-chat-msg ${msg.role}`}>
              {msg.role === "assistant" && (
                <img
                  src="/fera-logo.jpg"
                  alt="FERA AI"
                  className="fera-chat-msg-avatar"
                />
              )}
              <div className="fera-chat-bubble">
                {renderContent(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="fera-chat-msg assistant">
              <img
                src="/fera-logo.jpg"
                alt="FERA AI"
                className="fera-chat-msg-avatar"
              />
              <div className="fera-chat-bubble fera-chat-typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && !loading && (
          <div className="fera-chat-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="fera-chat-suggestion"
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="fera-chat-input-bar" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FERA AI anything..."
            disabled={loading}
          />
          <button
            type="submit"
            className="fera-chat-send"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
