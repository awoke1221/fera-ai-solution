// ─── Membership Plan Card — Advanced Glassmorphic ────
"use client";

import { useRef, useState, useEffect } from "react";
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
  const isPopular = index === 1;
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const [countUp, setCountUp] = useState(0);

  const currencySymbol =
    plan.currency === "ETB"
      ? "ብር"
      : plan.currency === "USD"
        ? "$"
        : plan.currency;

  // ── 3D Tilt ─────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
    setGlowX((x / rect.width) * 100);
    setGlowY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
    setIsHovered(false);
    setVisibleFeatures([]);
  };

  // ── Staggered feature reveal on hover ───────────
  useEffect(() => {
    if (!isHovered) return;
    plan.features.forEach((_, i) => {
      setTimeout(() => setVisibleFeatures((prev) => [...prev, i]), i * 80);
    });
    return () => setVisibleFeatures([]);
  }, [isHovered, plan.features.length]);

  // ── Animated price counter ──────────────────────
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
      {/* ── Animated glow overlay ──────────────── */}
      <div
        className="card-glow"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(79,209,165,0.15), transparent 60%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* ── Floating particles on hover ───────── */}
      {isHovered && (
        <div className="card-particles">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

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

      {/* ── Staggered Features ────────────────── */}
      <ul className="membership-features">
        {plan.features.map((feature, i) => (
          <li
            key={i}
            className={`feature-item ${visibleFeatures.includes(i) || isPopular ? "visible" : ""}`}
            style={{
              transitionDelay: `${i * 60}ms`,
              opacity: isPopular ? 1 : visibleFeatures.includes(i) ? 1 : 0,
              transform: isPopular
                ? "translateX(0)"
                : visibleFeatures.includes(i)
                  ? "translateX(0)"
                  : "translateX(-12px)",
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
        <span className="cta-text">Get Started</span>
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
