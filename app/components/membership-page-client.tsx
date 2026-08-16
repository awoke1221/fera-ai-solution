"use client";

import { useEffect, useRef, useState } from "react";
import { MembershipCard } from "@/app/components/membership-card";
import type { MembershipPlan } from "@/lib/types";

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
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          frame = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`faq-item ${open ? "open" : ""}`}
      onClick={() => setOpen((current) => !current)}
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
          maxHeight: open ? (contentRef.current?.scrollHeight ?? 180) : 0,
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

export function MembershipPageClient() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const stats = [
    { value: 24, suffix: "/7", label: "Support" },
    { value: 10, suffix: "+", label: "AI tools" },
    { value: 500, suffix: "+", label: "Active Members" },
    { value: 98, suffix: "%", label: "Satisfaction" },
  ];

  useEffect(() => {
    let mounted = true;

    fetch("/api/membership/plans")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setPlans(data.plans || []);
      })
      .catch(() => {
        if (!mounted) return;
        setPlans([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="m-hero">
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

      <section className="m-plans-section">
        <div className="wrap">
          <div className="m-section-head">
            <div className="m-section-tag">Membership Access</div>
            <h2 className="m-section-title">
              Choose the plan that unlocks Stack Guides and AI support
            </h2>
            <p className="m-section-desc">
              Both memberships include unlimited access to every Stack Guide,
              architecture walkthroughs, and AI support tools. Ethiopian members
              pay 1000 birr per month, while diaspora members pay $10 per month
              for the same premium experience and unlimited usage.
            </p>
          </div>

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

      <section className="m-included-section">
        <div className="wrap">
          <div className="m-section-head">
            <div className="m-section-tag">What You Get</div>
            <h2 className="m-section-title">A premium stack-learning system</h2>
          </div>
          <div className="m-included-grid">
            <div className="m-feature-box">
              <span className="m-feature-icon">✅</span>
              <h3>Unlimited Stack Guides</h3>
              <p>
                Access architecture patterns, tooling choices, and
                implementation guides.
              </p>
            </div>
            <div className="m-feature-box">
              <span className="m-feature-icon">🤖</span>
              <h3>AI assistance</h3>
              <p>
                Use AI support to validate design decisions, generate
                architecture ideas, and optimize delivery.
              </p>
            </div>
            <div className="m-feature-box">
              <span className="m-feature-icon">📈</span>
              <h3>Growth support</h3>
              <p>
                Get hands-on guidance for production systems, tool selection,
                and workflows that scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="m-faq-section">
        <div className="wrap">
          <div className="m-section-head">
            <div className="m-section-tag">FAQ</div>
            <h2 className="m-section-title">Common questions</h2>
          </div>
          <div className="faq-list">
            <FAQItem
              question="How quickly do I get access?"
              answer="As soon as your payment is confirmed, your stack access is activated and you can begin using the premium content immediately."
            />
            <FAQItem
              question="Can I change plans later?"
              answer="Yes. You can upgrade or switch plans at any time. Your subscription remains flexible based on your current needs."
            />
            <FAQItem
              question="Is the same access available for diaspora members?"
              answer="Yes. The diaspora plan includes the same premium content and AI support, with secure PayPal billing."
            />
          </div>
        </div>
      </section>
    </>
  );
}
