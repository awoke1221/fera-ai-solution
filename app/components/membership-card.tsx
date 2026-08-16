// ─── Membership Plan Card — Advanced Glassmorphic ────
"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
};

export function MembershipCard({ plan, index }: { plan: Plan; index: number }) {
  // Mark the Local Stack Guides plan as the most popular explicitly
  const isPopular = plan.slug === "local-stack-guides";
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseMovePendingRef = useRef(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [countUp, setCountUp] = useState(0);

  const currencySymbol = useMemo(
    () =>
      plan.currency === "ETB"
        ? "ብር"
        : plan.currency === "USD"
          ? "$"
          : plan.currency,
    [plan.currency],
  );

  const isLocalPlan = useMemo(
    () => plan.slug === "local-stack-guides",
    [plan.slug],
  );
  const isDiasporaPlan = useMemo(
    () => plan.slug === "diaspora-stack-guides",
    [plan.slug],
  );
  const labelText = useMemo(
    () =>
      isLocalPlan
        ? "Local access"
        : isDiasporaPlan
          ? "Diaspora access"
          : "Premium access",
    [isLocalPlan, isDiasporaPlan],
  );

  // ── Throttled 3D Tilt ─────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || mouseMovePendingRef.current) return;

    mouseMovePendingRef.current = true;
    requestAnimationFrame(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setRotateX(((y - centerY) / centerY) * -8);
      setRotateY(((x - centerX) / centerX) * 8);

      // Update CSS custom properties for glow instead of state
      cardRef.current?.style.setProperty(
        "--glow-x",
        `${(x / rect.width) * 100}%`,
      );
      cardRef.current?.style.setProperty(
        "--glow-y",
        `${(y / rect.height) * 100}%`,
      );

      mouseMovePendingRef.current = false;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.setProperty("--glow-x", "50%");
      cardRef.current.style.setProperty("--glow-y", "50%");
    }
  }, []);

  // ── Initialize CSS custom properties ───────────────
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.setProperty("--glow-x", "50%");
      cardRef.current.style.setProperty("--glow-y", "50%");
    }
  }, []);

  // ── Animated price counter (only first render) ──────────────────────
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 800;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountUp(Math.round(eased * plan.price));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [plan.price]);

  const icons = ["🚀", "💎", "🏢"];

  return (
    <div
      ref={cardRef}
      className={`membership-card ${isPopular ? "popular" : ""} ${isHovered ? "hovered" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isHovered ? -12 : 0}px)`,
        transition: isHovered
          ? "transform 0.08s linear"
          : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* ── Optimized glow using CSS custom properties ─────────── */}
      <div
        className="card-glow"
        style={{
          background: `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(79,209,165,0.15), transparent 60%)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      />

      {/* ── Minimal particle effect (CSS-based pulse instead of DOM) ─ */}
      {isHovered && <div className="card-particles-pulse" />}

      {/* ── Popular badge ─────────────────────── */}
      {isPopular && (
        <div className="popular-badge">
          <span className="badge-pulse" />
          Most Popular
        </div>
      )}

      {/* ── Header ────────────────────────────── */}
      <div className="membership-card-header">
        <div className={`plan-icon-wrapper ${isPopular ? "popular-icon" : ""}`}>
          <span className="plan-icon">{icons[index]}</span>
          <div className="icon-ring" />
        </div>
        <span className="membership-plan-label">{labelText}</span>
        <h3>{plan.name}</h3>
        <p className="membership-desc">{plan.description}</p>
      </div>

      {/* ── Animated Price ────────────────────── */}
      <div className="membership-price">
        <span className="price-currency">{currencySymbol}</span>
        <span className="price-amount">{countUp}</span>
        <span className="price-period">
          / {plan.duration_days === 30 ? "month" : `${plan.duration_days}d`}
        </span>
      </div>
      <div className="membership-plan-meta">
        <span>
          {isLocalPlan
            ? "Telebirr, CBE Birr, or bank transfer"
            : "PayPal monthly billing"}
        </span>
      </div>

      {/* ── Features with CSS-based animation ────────────────── */}
      <ul
        className={`membership-features ${isHovered || isPopular ? "revealed" : ""}`}
      >
        {plan.features.map((feature, i) => (
          <li
            key={i}
            className="feature-item"
            style={{
              transitionDelay: `${i * 40}ms`,
            }}
          >
            <span className="feature-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* ── CTA ───────────────────────────────── */}
      <Link
        href={`/membership/join?plan=${plan.id}`}
        className={`membership-cta-btn ${isPopular ? "primary" : ""}`}
      >
        <span className="cta-text">Join this plan</span>
        <span className="cta-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}
