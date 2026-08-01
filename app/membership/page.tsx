// ─── Membership Plans Page — Advanced UI/UX ──────────
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";
import { MembershipCard } from "@/app/components/membership-card";
import { RequireAuth } from "@/app/components/require-auth";
import type { MembershipPlan } from "@/lib/types";

// ── Animated Counter ─────────────────────────────────
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let frame: number;
          const start = performance.now();
          const duration = 1500;
          const animate = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(e * value));
            if (p < 1) frame = requestAnimationFrame(animate);
          };
          frame = requestAnimationFrame(animate);
          observer.disconnect();
          return () => cancelAnimationFrame(frame);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// ── Skeleton Card ────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-shape circle" />
      <div className="skeleton-shape line w-60" />
      <div className="skeleton-shape line w-80" />
      <div className="skeleton-shape line w-40" />
      <div className="skeleton-shape line w-90" />
      <div className="skeleton-shape line w-70" />
      <div className="skeleton-shape line w-50" />
      <div className="skeleton-shape line w-85" />
      <div className="skeleton-shape btn" />
    </div>
  );
}

// ── FAQ Item ─────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`faq-item ${open ? "open" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <button className="faq-trigger" type="button">
        <span className="faq-question-text">{question}</span>
        <span className={`faq-icon ${open ? "rotated" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        className="faq-answer-wrapper"
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="faq-answer">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ── Comparison Item ──────────────────────────────────
function CompareCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`compare-card ${visible ? "visible" : ""}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(30px) scale(0.95)",
      }}
    >
      <div className="compare-card-icon">
        <span>{icon}</span>
        <div className="compare-icon-glow" />
      </div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/membership/plans")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { value: 24, suffix: "/7", label: "Support" },
    { value: 10, suffix: "+", label: "AI tools" },
    { value: 500, suffix: "+", label: "Active Members" },
    { value: 98, suffix: "%", label: "Satisfaction" },
  ];

  return (
    <SiteShell>
      <RequireAuth>
        {/* ─── Hero Section ──────────────────────────── */}
        <div className="m-hero" ref={heroRef}>
          <div className="m-hero-bg">
            <div className="m-hero-grid" />
            <div className="m-orbe m-orbe-1" />
            <div className="m-orbe m-orbe-2" />
            <div className="m-orbe m-orbe-3" />
          </div>
          <div className="m-hero-content">
            <div className="wrap">
              <div className="m-hero-badge">🚀 Premium Learning Platform</div>
              <h1 className="m-hero-title">
                Invest in your{" "}
                <span className="gradient-text">engineering future</span>
              </h1>
              <p className="m-hero-sub">
                Unlock unlimited access to every Stack Guide and all AI support
                tools with a monthly membership designed for Ethiopian learners
                and diaspora professionals. Your subscription gives you full
                access to the premium learning experience without limits.
              </p>

              {/* ── Mini Stats ───────────────────── */}
              <div className="m-hero-stats">
                {stats.map((s, i) => (
                  <div key={i} className="m-hero-stat">
                    <span className="m-hero-stat-num">
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </span>
                    <span className="m-hero-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Plans Section ─────────────────────────── */}
        <section className="m-plans-section">
          <div className="wrap">
            {/* ── Section header ──────────────────── */}
            <div className="m-section-head">
              <div className="m-section-tag">Membership Access</div>
              <h2 className="m-section-title">
                Choose the plan that unlocks Stack Guides and AI support
              </h2>
              <p className="m-section-desc">
                Both memberships include unlimited access to every Stack Guide,
                architecture walkthroughs, and AI support tools. Ethiopian
                members pay 1000 birr per month, while diaspora members pay $10
                per month for the same premium experience and unlimited usage.
              </p>
            </div>

            {/* ── Loading Skeleton / Cards ────────── */}
            {loading ? (
              <div className="skeleton-grid">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div className="membership-plans-grid">
                {plans.map((plan, i) => (
                  <div
                    key={plan.id}
                    className="plan-card-wrapper"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    <MembershipCard plan={plan} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── What's Included ────────────────────────── */}
        <section className="m-included-section">
          <div className="wrap">
            <div className="m-section-head centered">
              <div className="m-section-tag">Everything You Get</div>
              <h2 className="m-section-title">
                Premium access unlocks your full potential
              </h2>
              <p className="m-section-desc">
                Get the tools, feedback, and guidance to architect systems with
                confidence.
              </p>
            </div>

            <div className="compare-grid">
              <CompareCard
                icon="🎨"
                title="Premium Templates"
                desc="Download production-ready architecture diagrams, design documents, and project blueprints."
                index={0}
              />
              <CompareCard
                icon="👨‍🏫"
                title="Project Reviews"
                desc="Get your system design reviewed by senior engineers with actionable feedback."
                index={1}
              />
              <CompareCard
                icon="🎯"
                title="Mentorship Calls"
                desc="Book 1-on-1 sessions with experienced architects to discuss your design challenges."
                index={2}
              />
            </div>
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────── */}
        <section className="m-faq-section">
          <div className="wrap">
            <div className="m-section-head centered">
              <div className="m-section-tag">Got Questions?</div>
              <h2 className="m-section-title">Frequently asked questions</h2>
            </div>

            <div className="faq-list">
              <FAQItem
                question="How does payment work?"
                answer="Local users can pay via mobile money (Telebirr/CBE Birr) or bank transfer, then upload a payment screenshot for admin approval. Global users can pay instantly via PayPal and get immediate access."
              />
              <FAQItem
                question="How long does approval take?"
                answer="Screenshot payments are typically reviewed within 24 hours by our admin team. PayPal payments are verified and activated instantly — no waiting required."
              />
              <FAQItem
                question="Can I upgrade or downgrade my plan?"
                answer="Absolutely. Contact our support team and we'll adjust your plan. Upgrades take effect immediately; downgrades apply at the next billing cycle."
              />
              <FAQItem
                question="What if I need a custom plan for my team?"
                answer="We offer custom enterprise plans for teams and organizations. Contact us for volume pricing, dedicated onboarding, and custom workshop sessions."
              />
            </div>
          </div>
        </section>

        {/* ─── Final CTA ──────────────────────────────── */}
        <section className="m-cta-section">
          <div className="wrap">
            <div className="m-cta-card">
              <div className="m-cta-bg">
                <div className="cta-orbe cta-orbe-1" />
                <div className="cta-orbe cta-orbe-2" />
              </div>
              <div className="m-cta-content">
                <h2>Ready to level up?</h2>
                <p>
                  Join a community of engineers building world-class systems.
                  Start with a free account, upgrade when you&apos;re ready.
                </p>
                <div className="m-cta-actions">
                  <Link href="/auth/signup" className="m-cta-primary">
                    Create Free Account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link href="/contact" className="m-cta-secondary">
                    Talk to Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RequireAuth>
    </SiteShell>
  );
}
