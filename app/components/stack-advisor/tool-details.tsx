"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  tools,
  toolCategories,
  integrationEdges,
  ethiopianAdaptations,
  productionChecklist,
  recommendedStacks,
  projectTypes,
  advancedGuides,
  getProjectMapping,
  calculateCost,
  checkCompatibility,
  generateStackExport,
  getToolScore,
  type ToolOption,
  type AdvancedGuide,
} from ".";

// ─── Props ──────────────────────────────────────────────
interface ToolDetailsProps {
  selections: Record<string, string>;
  selectedProjectType?: string | null;
  onSelectionsChange?: (selections: Record<string, string>) => void;
}

type StrategyMode = "cheapest" | "fastest" | "scalable" | "ethiopia";

// ─── Component ──────────────────────────────────────────
export function ToolDetails({
  selections,
  selectedProjectType,
  onSelectionsChange,
}: ToolDetailsProps) {
  const [activeTab, setActiveTab] = useState<
    | "details"
    | "env"
    | "integration"
    | "advanced"
    | "templates"
    | "roadmap"
    | "presets"
    | "cost"
    | "export"
    | "production"
    | "ethiopia"
    | "recommendations"
    | "launch"
    | "scenarios"
    | "summary"
  >("details");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [strategyMode, setStrategyMode] = useState<StrategyMode>("fastest");
  const [presetName, setPresetName] = useState("My stack preset");
  const [savedPresets, setSavedPresets] = useState<
    Array<{
      id: string;
      name: string;
      selections: Record<string, string>;
      projectType: string | null;
      createdAt: string;
    }>
  >([]);
  const [budgetTarget, setBudgetTarget] = useState(80);
  const [copiedLaunchPlan, setCopiedLaunchPlan] = useState(false);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [checkedStakeholders, setCheckedStakeholders] = useState<string[]>([]);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<
    "mvp" | "growth" | "ethiopia" | "enterprise"
  >("mvp");

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean) as ToolOption[];
  }, [selections]);

  // Find the project type
  const projectType = useMemo(() => {
    if (!selectedProjectType) return null;
    return projectTypes.find((p) => p.id === selectedProjectType) || null;
  }, [selectedProjectType]);

  const projectMapping = useMemo(
    () =>
      selectedProjectType ? getProjectMapping(selectedProjectType) : undefined,
    [selectedProjectType],
  );

  const primaryRecommendedStack = useMemo(
    () =>
      projectType
        ? recommendedStacks.find(
            (stack) => stack.projectType === projectType.id && stack.isPrimary,
          )
        : null,
    [projectType],
  );

  const selectedCount = selectedTools.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("stack-advisor-presets");
      if (stored) {
        const parsed = JSON.parse(stored) as typeof savedPresets;
        setSavedPresets(parsed);
      }
    } catch {
      // Ignore invalid localStorage data
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "stack-advisor-presets",
      JSON.stringify(savedPresets),
    );
  }, [savedPresets]);

  const compatibilityWarnings = useMemo(
    () => checkCompatibility(Object.values(selections)),
    [selections],
  );

  const compatibilityScore = useMemo(() => {
    const severityWeight = compatibilityWarnings.reduce((score, warning) => {
      if (warning.type === "error") return score + 20;
      if (warning.type === "warning") return score + 10;
      return score + 4;
    }, 0);

    const score = Math.max(0, 100 - severityWeight);
    if (score >= 90) return { label: "Excellent", color: "#22c55e" };
    if (score >= 75) return { label: "Strong", color: "#38bdf8" };
    if (score >= 60) return { label: "Good", color: "#f4b24b" };
    return { label: "Needs refinement", color: "#ef4444" };
  }, [compatibilityWarnings]);

  const strategySummary = useMemo(() => {
    const projectLabel = projectType?.label || "your product";
    switch (strategyMode) {
      case "cheapest":
        return {
          title: "Budget-first MVP",
          description: `For ${projectLabel}, keep the core stack lean with free tiers, simple auth, and one reliable database to reduce runway cost.`,
          bullets: [
            "Use Next.js + Supabase for the fastest low-cost launch",
            "Prefer Chapa or Telebirr when Ethiopian payments matter",
            "Delay advanced monitoring and premium services until growth justifies them",
          ],
        };
      case "scalable":
        return {
          title: "Scalable production path",
          description: `For ${projectLabel}, build with a strong foundation that can expand without rewriting your architecture.`,
          bullets: [
            "Separate frontend, API, and data concerns early",
            "Add observability and staged deployment from the start",
            "Use a managed database plus a caching layer for growth",
          ],
        };
      case "ethiopia":
        return {
          title: "Ethiopia-ready launch",
          description: `For ${projectLabel}, prioritize local payment support, low-latency delivery, and simple onboarding for Ethiopian users.`,
          bullets: [
            "Add Chapa or Telebirr for local payments",
            "Use Bunny.net or a regional CDN strategy for better delivery",
            "Keep onboarding and support flows simple and mobile-first",
          ],
        };
      case "fastest":
      default:
        return {
          title: "Fastest launch path",
          description: `For ${projectLabel}, choose the stack that gets the first version live quickly with minimal setup.`,
          bullets: [
            "Start with a modern frontend and managed backend",
            "Use a single auth and database provider for the first release",
            "Focus on core features before deep infrastructure work",
          ],
        };
    }
  }, [projectType, strategyMode]);

  const stackCost = useMemo(
    () => calculateCost(selectedTools),
    [selectedTools],
  );

  const starterTemplate = useMemo(() => {
    const projectId = projectType?.id || "custom";

    if (projectId === "saas") {
      return {
        title: "SaaS dashboard starter",
        description:
          "A billing-aware dashboard with auth, subscriptions, and admin controls.",
        files: [
          {
            name: "app/dashboard/page.tsx",
            purpose: "Account and analytics shell",
          },
          {
            name: "app/api/billing/route.ts",
            purpose: "Subscription and billing logic",
          },
          {
            name: "app/components/pricing-card.tsx",
            purpose: "Plans and checkout experience",
          },
        ],
      };
    }

    if (projectId === "ecommerce") {
      return {
        title: "E-commerce storefront starter",
        description:
          "A product-first storefront with checkout flow and inventory management.",
        files: [
          {
            name: "app/products/[slug]/page.tsx",
            purpose: "Product detail experience",
          },
          { name: "app/cart/page.tsx", purpose: "Checkout-ready cart screen" },
          {
            name: "app/api/checkout/route.ts",
            purpose: "Order and payment processing",
          },
        ],
      };
    }

    if (projectId === "lms") {
      return {
        title: "Learning platform starter",
        description:
          "A course-first experience with lessons, progress tracking, and student dashboards.",
        files: [
          {
            name: "app/courses/page.tsx",
            purpose: "Course catalog and enrollment",
          },
          {
            name: "app/learn/[slug]/page.tsx",
            purpose: "Lesson viewer experience",
          },
          {
            name: "app/api/progress/route.ts",
            purpose: "Student progress tracking",
          },
        ],
      };
    }

    if (projectId === "fintech") {
      return {
        title: "Fintech operations starter",
        description:
          "A secure wallet and payment workflow foundation for regulated experiences.",
        files: [
          {
            name: "app/wallet/page.tsx",
            purpose: "Balance and transaction overview",
          },
          {
            name: "app/api/payments/route.ts",
            purpose: "Payment orchestration",
          },
        ],
      };
    }

    if (projectId === "social") {
      return {
        title: "Social network starter",
        description:
          "A community-first experience with posts, profiles, messaging, and engagement loops.",
        files: [
          {
            name: "app/feed/page.tsx",
            purpose: "Main activity feed and discovery",
          },
          {
            name: "app/profile/[username]/page.tsx",
            purpose: "User profiles and connections",
          },
          {
            name: "app/api/posts/route.ts",
            purpose: "Post creation, reactions, and timeline updates",
          },
        ],
      };
    }

    if (projectId === "erp") {
      return {
        title: "ERP operations starter",
        description:
          "A business operations foundation with finance, inventory, and reporting workflows.",
        files: [
          {
            name: "app/dashboard/page.tsx",
            purpose: "Overview of operational KPIs and tasks",
          },
          {
            name: "app/api/inventory/route.ts",
            purpose: "Inventory and stock management endpoints",
          },
          {
            name: "app/api/finance/route.ts",
            purpose: "Basic accounting and transaction flow",
          },
        ],
      };
    }

    if (projectId === "healthcare") {
      return {
        title: "Telemedicine starter",
        description:
          "A patient-first healthcare experience with appointments, consultations, and records.",
        files: [
          {
            name: "app/appointments/page.tsx",
            purpose: "Appointment booking and doctor availability",
          },
          {
            name: "app/patients/[id]/page.tsx",
            purpose: "Patient record and visit history",
          },
          {
            name: "app/api/appointments/route.ts",
            purpose: "Appointment scheduling and reminders",
          },
        ],
      };
    }

    if (projectId === "realestate") {
      return {
        title: "Real estate listing starter",
        description:
          "A property discovery experience with listings, search filters, and agent contact.",
        files: [
          {
            name: "app/properties/page.tsx",
            purpose: "Property listings and search",
          },
          {
            name: "app/properties/[slug]/page.tsx",
            purpose: "Property detail and inquiry flow",
          },
          {
            name: "app/api/inquiries/route.ts",
            purpose: "Contact requests and lead capture",
          },
        ],
      };
    }

    if (projectId === "content") {
      return {
        title: "Media publishing starter",
        description:
          "A content-first workflow with publishing, subscriptions, and engagement.",
        files: [
          {
            name: "app/articles/page.tsx",
            purpose: "Content listing and discovery",
          },
          {
            name: "app/articles/[slug]/page.tsx",
            purpose: "Content consumption and metadata",
          },
          {
            name: "app/api/newsletter/route.ts",
            purpose: "Newsletter signup and delivery",
          },
        ],
      };
    }

    if (projectId === "booking") {
      return {
        title: "Booking system starter",
        description:
          "A reservation and scheduling workflow designed for services, venues, or appointments.",
        files: [
          {
            name: "app/availability/page.tsx",
            purpose: "Calendar and availability search",
          },
          {
            name: "app/booking/[id]/page.tsx",
            purpose: "Reservation details and checkout",
          },
          {
            name: "app/api/reservations/route.ts",
            purpose: "Booking creation and reminders",
          },
        ],
      };
    }

    return {
      title: "Product starter blueprint",
      description:
        "A flexible starter plan for your chosen stack and core experience.",
      files: [
        {
          name: "app/page.tsx",
          purpose: "Main landing and entry experience",
        },
        {
          name: "app/api/route.ts",
          purpose: "Core backend API for your first release",
        },
        {
          name: "app/components/layout.tsx",
          purpose: "Shared UI shell and navigation",
        },
      ],
    };
  }, [projectType]);

  const implementationChecklist = useMemo(() => {
    const items = [
      {
        title: "Define the core user journey",
        description:
          "Create the single task that proves the product is valuable.",
        priority: "high",
      },
      {
        title: "Set up authentication and profile flows",
        description:
          "Users should be able to sign in and manage their identity safely.",
        priority: "high",
      },
      {
        title: "Connect the primary data layer",
        description:
          "Make sure your chosen database and API layer are wired correctly.",
        priority: "high",
      },
      {
        title: "Add observability before launch",
        description:
          "Logging, error tracking, and usage analytics should be ready early.",
        priority: "medium",
      },
      {
        title: "Plan deployment and rollback",
        description:
          "Have a staging environment and rollback strategy before going live.",
        priority: "medium",
      },
    ];

    if (
      selectedTools.some(
        (tool) => tool.id === "chapa" || tool.id === "telebirr",
      )
    ) {
      items.splice(2, 0, {
        title: "Prepare payment verification and reconciliation",
        description:
          "For local payment flows, add manual review and confirmation handling.",
        priority: "high",
      });
    }

    if (
      selectedTools.some(
        (tool) => tool.id === "bunny" || tool.id === "cloudinary",
      )
    ) {
      items.push({
        title: "Optimize media delivery",
        description:
          "Set up caching and proper transformations for images and video.",
        priority: "medium",
      });
    }

    return items;
  }, [selectedTools]);

  const budgetPlan = useMemo(() => {
    const currentCost = stackCost.totalMonthly.max;
    const delta = budgetTarget - currentCost;

    if (currentCost <= budgetTarget * 0.7) {
      return {
        label: "Lean and healthy",
        description:
          "Your stack is comfortably under budget and can support a focused launch.",
        tone: "good",
      };
    }

    if (delta >= 0) {
      return {
        label: "Within target",
        description:
          "Your stack fits the target budget, but you should still trim optional services early.",
        tone: "good",
      };
    }

    return {
      label: "Needs budgeting",
      description:
        "The current stack is above the target. Prioritize essentials and delay premium add-ons.",
      tone: "warning",
    };
  }, [budgetTarget, stackCost.totalMonthly.max]);

  const launchReadiness = useMemo(() => {
    let score = 48;
    const upgrades: string[] = [];

    const hasAuth = selectedTools.some((tool) =>
      ["supabase", "clerk", "auth0", "nextauth", "firebase"].includes(tool.id),
    );
    const hasData = selectedTools.some((tool) =>
      ["supabase", "postgres", "mongodb", "firebase"].includes(tool.id),
    );
    const hasMonitoring = selectedTools.some((tool) =>
      ["sentry", "posthog", "vercel", "upstash"].includes(tool.id),
    );
    const hasDeploy = selectedTools.some((tool) =>
      ["vercel", "netlify", "render", "railway", "digitalocean"].includes(
        tool.id,
      ),
    );
    const hasPayments = selectedTools.some((tool) =>
      ["chapa", "telebirr", "stripe", "paypal"].includes(tool.id),
    );
    const hasMedia = selectedTools.some((tool) =>
      ["cloudinary", "bunny", "imgix", "aws-s3"].includes(tool.id),
    );

    if (hasAuth) score += 14;
    else
      upgrades.push(
        "Add authentication so users can securely sign in and manage accounts.",
      );

    if (hasData) score += 12;
    else
      upgrades.push(
        "Connect a reliable data layer for persistence and API storage.",
      );

    if (hasMonitoring) score += 10;
    else upgrades.push("Add monitoring and analytics to catch issues earlier.");

    if (hasDeploy) score += 8;
    else upgrades.push("Prepare deployment with staging and rollback support.");

    if (hasPayments) score += 8;
    else if (
      projectType?.id &&
      ["saas", "ecommerce", "fintech"].includes(projectType.id)
    ) {
      upgrades.push("Add payments for real-world buying or billing flows.");
    }

    if (hasMedia) score += 6;
    else if (projectType?.id && ["ecommerce", "lms"].includes(projectType.id)) {
      upgrades.push("Add media delivery for images, videos, and file uploads.");
    }

    if (score >= 85) {
      return {
        score: Math.min(100, score),
        label: "Launch-ready",
        upgrades:
          upgrades.length > 0
            ? upgrades.slice(0, 3)
            : ["Keep the launch checklist tight and monitor feedback closely."],
      };
    }

    if (score >= 70) {
      return {
        score: Math.min(100, score),
        label: "Almost ready",
        upgrades:
          upgrades.length > 0
            ? upgrades.slice(0, 4)
            : ["Polish the last operational details before go-live."],
      };
    }

    return {
      score: Math.min(100, score),
      label: "Needs refinement",
      upgrades:
        upgrades.length > 0
          ? upgrades.slice(0, 5)
          : ["Add the core operational layers before launch."],
    };
  }, [projectType, selectedTools]);

  const launchTimeline = useMemo(() => {
    const projectLabel = projectType?.label || "your product";
    const baseDate = new Date();
    const phases = [
      {
        title: "Discovery and scope",
        window: "Week 1",
        date: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate() + 2,
        ).toLocaleDateString(),
        owner: "Product lead",
        outcome: `Confirm the core value for ${projectLabel}.`,
      },
      {
        title: "Prototype and validation",
        window: "Week 2",
        date: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate() + 7,
        ).toLocaleDateString(),
        owner: "Design + engineering",
        outcome: "Turn the core workflow into a usable, testable version.",
      },
      {
        title: "Launch readiness",
        window: "Week 3",
        date: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate() + 10,
        ).toLocaleDateString(),
        owner: "Ops + engineering",
        outcome:
          "Complete monitoring, deployment, support, and rollback checks.",
      },
      {
        title: "Public release",
        window: "Week 4",
        date: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate() + 14,
        ).toLocaleDateString(),
        owner: "Founder / team lead",
        outcome: "Go live with a controlled rollout and feedback loop.",
      },
    ];

    return phases;
  }, [projectType]);

  const stakeholderChecklist = useMemo(() => {
    const paymentEnabled = selectedTools.some(
      (tool) => tool.id === "chapa" || tool.id === "telebirr",
    );
    const mediaEnabled = selectedTools.some(
      (tool) => tool.id === "bunny" || tool.id === "cloudinary",
    );

    const items = [
      {
        id: "product",
        title: "Product owner",
        note: "Own clear success metrics and launch messaging.",
      },
      {
        id: "engineering",
        title: "Engineering lead",
        note: "Own implementation quality and release confidence.",
      },
      {
        id: "support",
        title: "Support / operations",
        note: "Own onboarding, incident handling, and user communication.",
      },
    ];

    if (paymentEnabled) {
      items.push({
        id: "payments",
        title: "Payments / finance",
        note: "Verify reconciliation, manual review, and payment recovery flow.",
      });
    }

    if (mediaEnabled) {
      items.push({
        id: "media",
        title: "Content / media",
        note: "Optimize uploads, caching, and delivery performance.",
      });
    }

    return items;
  }, [selectedTools]);

  const launchGate = useMemo(() => {
    const hasAuth = selectedTools.some((tool) =>
      ["supabase", "clerk", "auth0", "nextauth", "firebase"].includes(tool.id),
    );
    const hasData = selectedTools.some((tool) =>
      ["supabase", "postgres", "mongodb", "firebase"].includes(tool.id),
    );
    const hasMonitoring = selectedTools.some((tool) =>
      ["sentry", "posthog", "vercel", "upstash"].includes(tool.id),
    );
    const hasDeploy = selectedTools.some((tool) =>
      ["vercel", "netlify", "render", "railway", "digitalocean"].includes(
        tool.id,
      ),
    );

    const criteria = [
      { label: "Core user journey is clear", passed: selectedCount >= 3 },
      { label: "Authentication is in place", passed: hasAuth },
      { label: "Data layer is connected", passed: hasData },
      { label: "Monitoring is active", passed: hasMonitoring },
      { label: "Deployment plan exists", passed: hasDeploy },
    ];

    const passedCount = criteria.filter((criterion) => criterion.passed).length;
    const status =
      passedCount === criteria.length
        ? "Go"
        : passedCount >= 3
          ? "Conditional go"
          : "No-go";

    return { criteria, passedCount, total: criteria.length, status };
  }, [selectedCount, selectedTools]);

  const scenarioRecommendations = useMemo(() => {
    const paymentEnabled = selectedTools.some(
      (tool) => tool.id === "chapa" || tool.id === "telebirr",
    );
    const mediaEnabled = selectedTools.some(
      (tool) => tool.id === "bunny" || tool.id === "cloudinary",
    );
    const monitoringEnabled = selectedTools.some(
      (tool) => tool.id === "sentry" || tool.id === "posthog",
    );

    const scenarios = [
      {
        id: "mvp" as const,
        title: "Fast MVP",
        description: "Drive speed and simplicity for the first launch.",
        fitScore: 90,
        priorities: [
          "Keep the flow focused on one clear user outcome.",
          "Use the lightest viable auth and data stack.",
          "Delay non-essential features until the first users validate the idea.",
        ],
        recommendedTools: ["Next.js", "Supabase", "Vercel"],
      },
      {
        id: "growth" as const,
        title: "Growth-ready",
        description: "Prepare the stack for user growth and iteration.",
        fitScore: 84,
        priorities: [
          "Add analytics and error monitoring early.",
          "Separate core services so the platform can scale cleanly.",
          "Create a repeatable deployment and rollback process.",
        ],
        recommendedTools: ["PostHog", "Sentry", "Upstash"],
      },
      {
        id: "ethiopia" as const,
        title: "Ethiopia-ready",
        description:
          "Optimize for local payments, mobile-first usage, and delivery.",
        fitScore: paymentEnabled && mediaEnabled ? 92 : 81,
        priorities: [
          paymentEnabled
            ? "Keep payment reconciliation and admin approval workflows clear."
            : "Add a local payment method to support trust and conversion.",
          mediaEnabled
            ? "Keep media delivery fast and cache-friendly."
            : "Add a CDN or media delivery layer for faster uploads and browsing.",
          "Keep onboarding simple and mobile-optimized.",
        ],
        recommendedTools: ["Chapa", "Telebirr", "Bunny.net"],
      },
      {
        id: "enterprise" as const,
        title: "Enterprise-grade",
        description:
          "Strengthen resilience, compliance, and long-term maintainability.",
        fitScore: monitoringEnabled && selectedCount >= 4 ? 95 : 78,
        priorities: [
          "Introduce stronger observability and incident response practices.",
          "Protect data access with more deliberate security controls.",
          "Prepare a formal deployment and support workflow.",
        ],
        recommendedTools: ["Sentry", "Auth0", "Railway"],
      },
    ];

    return scenarios;
  }, [selectedCount, selectedTools]);

  const aiSummary = useMemo(() => {
    const projectLabel = projectType?.label || "your product";
    const toolNames = selectedTools.map((tool) => tool.name).join(", ");
    const coreStrengths = [] as string[];
    const projectGoals = projectType?.businessFeatures.slice(0, 3) ?? [];
    const projectNote = projectMapping?.note;
    const missingRequiredCategories =
      projectMapping?.forceRequiredCategories.filter(
        (categoryId) => !selections[categoryId],
      ) ?? [];
    const missingCategoryNotes = missingRequiredCategories.map(
      (categoryId) =>
        toolCategories.find((cat) => cat.id === categoryId)?.label ||
        categoryId,
    );

    if (selectedTools.length === 0 && primaryRecommendedStack) {
      coreStrengths.push(
        `Recommended baseline stack: ${primaryRecommendedStack.name}`,
      );
    }

    if (
      selectedTools.some((tool) =>
        ["nextjs", "react", "vite"].includes(tool.id),
      )
    ) {
      coreStrengths.push("rapid frontend delivery");
    }
    if (
      selectedTools.some((tool) =>
        ["supabase", "firebase", "postgres", "mongodb"].includes(tool.id),
      )
    ) {
      coreStrengths.push("a dependable data layer");
    }
    if (
      selectedTools.some((tool) =>
        ["vercel", "netlify", "railway", "render"].includes(tool.id),
      )
    ) {
      coreStrengths.push("a streamlined deployment flow");
    }
    if (
      selectedTools.some((tool) =>
        ["chapa", "telebirr", "stripe", "paypal"].includes(tool.id),
      )
    ) {
      coreStrengths.push("payment readiness");
    }
    if (selectedTools.some((tool) => ["sentry", "posthog"].includes(tool.id))) {
      coreStrengths.push("good observability and analytics");
    }

    const strengths =
      coreStrengths.length > 0
        ? coreStrengths
        : ["a clean and flexible foundation"];

    const projectSummary = projectGoals.length
      ? `Focus on ${projectGoals.join(", ").toLowerCase()}.`
      : "Focus on the core value proposition first.";
    const compatibilityValue = Math.max(
      0,
      100 -
        compatibilityWarnings.reduce((total, warning) => {
          if (warning.type === "error") return total + 20;
          if (warning.type === "warning") return total + 10;
          return total + 4;
        }, 0),
    );
    const executiveScore = Math.max(
      60,
      Math.min(
        95,
        Math.round(
          compatibilityValue * 0.4 +
            launchReadiness.score * 0.35 +
            (budgetPlan.tone === "good"
              ? 92
              : budgetPlan.tone === "warning"
                ? 72
                : 84) *
              0.25,
        ),
      ),
    );
    const recommendation = `${projectLabel} can be launched with a modern stack anchored around ${toolNames || "your selected tools"}. The combination is well-positioned for fast iteration, with strengths in ${strengths.join(", ")}. ${projectSummary} The most effective path is to keep the first release focused on one high-value user outcome, validate it early, and expand only once the feedback confirms there is real demand.`;
    const scoreLabel =
      executiveScore >= 85
        ? "High confidence"
        : executiveScore >= 75
          ? "Solid bet"
          : "Needs tightening";
    const strategicPosture =
      executiveScore >= 85
        ? "This is a strong launch candidate with room for quick iteration."
        : executiveScore >= 75
          ? "This is a practical path that can ship well with disciplined scope control."
          : "This path can work, but the team should tighten the stack before investing heavily.";
    const watchouts = [
      compatibilityWarnings.length === 0
        ? "Compatibility looks healthy and the selected tools should integrate cleanly."
        : `${compatibilityWarnings.length} compatibility items still deserve attention.`,
      budgetPlan.tone === "warning"
        ? "Budget pressure is present, so trim optional services early."
        : "Budget posture is healthy enough to support a focused launch.",
      launchReadiness.score < 80
        ? "Launch readiness would benefit from a stronger support and monitoring setup."
        : "Operational readiness is already moving in the right direction.",
      ...(missingCategoryNotes.length > 0
        ? [
            `Missing required categories for this project: ${missingCategoryNotes.join(", ")}.`,
          ]
        : []),
    ];

    return {
      headline: `An executive-ready foundation for ${projectLabel}`,
      projectSummary,
      summary: recommendation,
      score: executiveScore,
      scoreLabel,
      strategicPosture,
      watchouts,
      highlights: [
        `Selected stack: ${toolNames || "No tools selected yet"}`,
        `Estimated monthly spend: $${stackCost.totalMonthly.max}`,
        ...(projectGoals.length
          ? projectGoals.map((goal) => `Target outcome: ${goal.toLowerCase()}`)
          : []),
        compatibilityWarnings.length === 0
          ? "Compatibility looks healthy."
          : `${compatibilityWarnings.length} compatibility review items remain.`,
      ],
      nextActions: [
        "Validate the core experience with real users before adding more features.",
        "Secure deployment, monitoring, and support workflows before launch.",
        "Keep the first release narrow so the team can learn quickly and reduce risk.",
      ],
    };
  }, [
    budgetPlan.tone,
    compatibilityWarnings,
    launchReadiness.score,
    projectType,
    selectedTools,
    stackCost.totalMonthly.max,
    summaryRefreshKey,
  ]);

  const strategyComparison = useMemo(() => {
    const paymentReady = selectedTools.some((tool) =>
      ["chapa", "telebirr", "stripe", "paypal"].includes(tool.id),
    );
    const scaleReady = selectedTools.some((tool) =>
      ["sentry", "posthog", "upstash", "vercel", "railway"].includes(tool.id),
    );
    const localReady = selectedTools.some((tool) =>
      ["chapa", "telebirr", "bunny"].includes(tool.id),
    );

    return [
      {
        id: "current",
        title: "Current path",
        score: aiSummary.score,
        badge: aiSummary.scoreLabel,
        summary: `Stay with the current stack and tighten execution around ${projectType?.label || "the product"}.`,
        bestFor: "Teams that want a realistic launch path now.",
      },
      {
        id: "lean",
        title: "Lean MVP",
        score: Math.min(
          95,
          aiSummary.score - (budgetPlan.tone === "warning" ? 6 : 2),
        ),
        badge: "Best for speed",
        summary:
          "Reduce scope and keep the first release focused on the core win.",
        bestFor: "Founder-led launches and early validation.",
      },
      {
        id: "scale",
        title: "Scale-up path",
        score: Math.min(
          95,
          scaleReady ? aiSummary.score + 4 : aiSummary.score + 1,
        ),
        badge: "Best for growth",
        summary:
          "Add stronger monitoring and infrastructure discipline to support growth.",
        bestFor: "Products expected to expand quickly after launch.",
      },
      {
        id: "ethiopia",
        title: "Ethiopia-ready path",
        score: Math.min(95, localReady ? aiSummary.score + 3 : aiSummary.score),
        badge: "Best for local fit",
        summary:
          "Prioritize local payments, a mobile-first UX, and faster delivery for Ethiopian users.",
        bestFor: "Products where trust and local payment fit matter most.",
      },
    ];
  }, [
    aiSummary.score,
    aiSummary.scoreLabel,
    budgetPlan.tone,
    projectType?.label,
    selectedTools,
  ]);

  const recommendedStrategy = useMemo(() => {
    return strategyComparison.reduce(
      (best, current) => (current.score > best.score ? current : best),
      strategyComparison[0],
    );
  }, [strategyComparison]);

  const aiSummaryMarkdown = useMemo(() => {
    const lines = [
      `# ${aiSummary.headline}`,
      "",
      aiSummary.summary,
      "",
      `Recommendation score: ${aiSummary.score}/100 (${aiSummary.scoreLabel})`,
      "",
      "## Highlights",
      ...aiSummary.highlights.map((item) => `- ${item}`),
      "",
      "## Strategic options",
      ...strategyComparison.map(
        (option) =>
          `- ${option.title} (${option.score}/100): ${option.summary}`,
      ),
      "",
      "## Next actions",
      ...aiSummary.nextActions.map((item) => `- ${item}`),
    ];

    return lines.join("\n");
  }, [aiSummary, strategyComparison]);

  const launchPlan = useMemo(() => {
    const projectLabel = projectType?.label || "your product";
    const paymentEnabled = selectedTools.some(
      (tool) => tool.id === "chapa" || tool.id === "telebirr",
    );
    const mediaEnabled = selectedTools.some(
      (tool) => tool.id === "bunny" || tool.id === "cloudinary",
    );
    const hasMonitoring = selectedTools.some(
      (tool) => tool.id === "sentry" || tool.id === "posthog",
    );
    const projectLaunchFocus =
      projectType?.id === "ecommerce"
        ? "checkout reliability, catalog usability, and fulfillment workflows"
        : projectType?.id === "lms"
          ? "course delivery, progress tracking, and student onboarding"
          : projectType?.id === "fintech"
            ? "secure payments, compliance controls, and financial audit flows"
            : projectType?.id === "healthcare"
              ? "patient triage, appointment reliability, and privacy-safe records"
              : projectType?.id === "social"
                ? "real-time engagement, notifications, and media sharing"
                : `the core experience for ${projectLabel}`;

    const phases = [
      {
        title: "Validate the core journey",
        window: "Days 1-3",
        details: `Define the single task that proves value for ${projectLabel}.`,
      },
      {
        title: "Build the first release",
        window: "Days 4-10",
        details:
          "Implement auth, core workflow, and the main dashboard before adding extra features.",
      },
      {
        title: "Prepare launch operations",
        window: "Days 11-14",
        details:
          "Set up monitoring, deployment, backups, and support handoffs before go-live.",
      },
    ];

    const risks = [
      {
        title: "Sprawl during MVP",
        severity: "Medium",
        mitigation: "Keep the scope narrow and launch with one core outcome.",
      },
      {
        title: "Payment reliability",
        severity: paymentEnabled ? "High" : "Low",
        mitigation: paymentEnabled
          ? "Add reconciliation and manual review steps for local payment flows."
          : "Keep payment handling simple until you are ready to integrate a provider.",
      },
      {
        title: "Media delivery issues",
        severity: mediaEnabled ? "Medium" : "Low",
        mitigation: mediaEnabled
          ? "Configure caching and image transformations early to avoid slow page loads."
          : "Use standard media handling until your traffic justifies a dedicated CDN.",
      },
      {
        title: "Blind spots after launch",
        severity: hasMonitoring ? "Low" : "High",
        mitigation: hasMonitoring
          ? "Use your observability tooling to watch errors and user behavior."
          : "Add monitoring before the first public launch to reduce downtime risk.",
      },
    ];

    const roles = [
      {
        title: "Founder / Product lead",
        focus:
          "Clarify the value proposition, launch goals, and success metrics.",
      },
      {
        title: "Frontend engineer",
        focus:
          "Own the user experience, responsive flows, and early usability testing.",
      },
      {
        title: "Backend engineer",
        focus:
          "Own APIs, integrations, data validation, and authentication flows.",
      },
      {
        title: "Operations / support",
        focus:
          "Prepare onboarding, support, incident response, and refund handling.",
      },
    ];

    if (projectType?.id === "fintech") {
      roles.push({
        title: "Compliance / finance",
        focus:
          "Review transaction workflows, audit trails, and payment regulation controls.",
      });
    }

    if (projectType?.id === "ecommerce") {
      roles.push({
        title: "Payments / operations",
        focus:
          "Manage checkout reliability, orders, and reconciliation workflows.",
      });
    }
    if (projectType?.id === "lms") {
      roles.push({
        title: "Content operations",
        focus:
          "Ensure lessons, progress tracking, and course publishing are validated before launch.",
      });
    }

    return { phases, risks, roles };
  }, [projectType, selectedTools]);

  const savePreset = () => {
    const trimmedName = presetName.trim() || "My stack preset";
    const newPreset = {
      id: `${Date.now()}`,
      name: trimmedName,
      selections: { ...selections },
      projectType: selectedProjectType || null,
      createdAt: new Date().toISOString(),
    };
    setSavedPresets((prev) => [newPreset, ...prev].slice(0, 8));
    setPresetName(trimmedName);
  };

  const applyPreset = (preset: (typeof savedPresets)[number]) => {
    onSelectionsChange?.(preset.selections);
    setActiveTab("details");
  };

  const removePreset = (id: string) => {
    setSavedPresets((prev) => prev.filter((preset) => preset.id !== id));
  };

  const toggleStakeholder = (id: string) => {
    setCheckedStakeholders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const copyAiSummary = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(aiSummaryMarkdown);
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 1800);
    } catch {
      // Ignore clipboard copy failures
    }
  };

  const downloadAiSummary = () => {
    if (typeof window === "undefined") return;

    const blob = new Blob([aiSummaryMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(projectType?.label || "stack-summary").toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportAiSummaryPdf = async () => {
    if (typeof window === "undefined" || !summaryRef.current) return;

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `${(projectType?.label || "stack-summary").toLowerCase().replace(/\s+/g, "-")}.pdf`,
      );
    } catch (error) {
      console.error("PDF export failed", error);
      alert(
        "PDF export failed. Please try again or use the browser print dialog.",
      );
    }
  };

  const copyLaunchPlan = async () => {
    if (typeof window === "undefined") return;
    const text = [
      `Launch plan for ${projectType?.label || "your project"}`,
      "",
      "Timeline:",
      ...launchTimeline.map(
        (phase) =>
          `- ${phase.title} (${phase.window}, ${phase.date}): ${phase.outcome}`,
      ),
      "",
      "Milestones:",
      ...launchPlan.phases.map(
        (phase) => `- ${phase.title} (${phase.window}): ${phase.details}`,
      ),
      "",
      "Go/No-Go gate:",
      ...launchGate.criteria.map(
        (criterion) =>
          `- ${criterion.label}: ${criterion.passed ? "Pass" : "Needs attention"}`,
      ),
      `- Overall status: ${launchGate.status}`,
      "",
      "Risks:",
      ...launchPlan.risks.map(
        (risk) => `- ${risk.title} [${risk.severity}]: ${risk.mitigation}`,
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedLaunchPlan(true);
      window.setTimeout(() => setCopiedLaunchPlan(false), 1800);
    } catch {
      // Ignore clipboard copy failures
    }
  };

  // Get matching recommended stack
  const matchingStack = useMemo(() => {
    if (!selectedProjectType) return null;
    const stacks = recommendedStacks.filter(
      (s) => s.projectType === selectedProjectType,
    );
    // Check if selections match a recommended stack
    for (const stack of stacks) {
      const matches = Object.entries(stack.selections).every(
        ([cat, toolId]) => selections[cat] === toolId,
      );
      if (matches) return stack;
    }
    return null;
  }, [selectedProjectType, selections]);

  const recommendedProjectStack = useMemo(
    () => matchingStack ?? primaryRecommendedStack,
    [matchingStack, primaryRecommendedStack],
  );

  const projectScoreAdjustments = useMemo(() => {
    const requiredCategories = projectMapping?.forceRequiredCategories ?? [];
    const missingRequiredCategories = requiredCategories.filter(
      (categoryId) => !selections[categoryId],
    );

    const missingCategoryNotes = missingRequiredCategories.map(
      (categoryId) =>
        toolCategories.find((cat) => cat.id === categoryId)?.label ||
        categoryId,
    );

    return {
      requiredCategories,
      missingRequiredCategories,
      missingCategoryNotes,
    };
  }, [projectMapping, selections]);

  if (selectedCount === 0) return null;

  const getToolName = (id: string) =>
    tools.find((t) => t.id === id)?.name || id;
  const getCategoryName = (catId: string) =>
    toolCategories.find((c) => c.id === catId)?.label || catId;
  const getEdgeLabel = (from: string, to: string) =>
    integrationEdges.find((e) => e.from === from && e.to === to)?.label ||
    "Connects";

  return (
    <div className="stack-details-panel">
      {/* Tabs */}
      <div className="details-tabs">
        <button
          className={`details-tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          📋 Tool Details
        </button>
        <button
          className={`details-tab ${activeTab === "env" ? "active" : ""}`}
          onClick={() => setActiveTab("env")}
        >
          🔧 .env & Setup
        </button>
        <button
          className={`details-tab ${activeTab === "integration" ? "active" : ""}`}
          onClick={() => setActiveTab("integration")}
        >
          🔗 Integration Guide
        </button>
        <button
          className={`details-tab ${activeTab === "advanced" ? "active" : ""}`}
          onClick={() => setActiveTab("advanced")}
        >
          🧠 Advanced Guide
        </button>
        <button
          className={`details-tab ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          🧱 Templates
        </button>
        <button
          className={`details-tab ${activeTab === "roadmap" ? "active" : ""}`}
          onClick={() => setActiveTab("roadmap")}
        >
          🗺️ Roadmap
        </button>
        <button
          className={`details-tab ${activeTab === "presets" ? "active" : ""}`}
          onClick={() => setActiveTab("presets")}
        >
          💾 Presets
        </button>
        <button
          className={`details-tab ${activeTab === "cost" ? "active" : ""}`}
          onClick={() => setActiveTab("cost")}
        >
          💰 Cost Estimator
        </button>
        <button
          className={`details-tab ${activeTab === "export" ? "active" : ""}`}
          onClick={() => setActiveTab("export")}
        >
          📤 Export Stack
        </button>
        <button
          className={`details-tab ${activeTab === "production" ? "active" : ""}`}
          onClick={() => setActiveTab("production")}
        >
          ✅ Production Readiness
        </button>
        <button
          className={`details-tab ${activeTab === "ethiopia" ? "active" : ""}`}
          onClick={() => setActiveTab("ethiopia")}
        >
          🇪🇹 Ethiopian Adaptations
        </button>
        <button
          className={`details-tab ${activeTab === "launch" ? "active" : ""}`}
          onClick={() => setActiveTab("launch")}
        >
          🚀 Launch Planning
        </button>
        <button
          className={`details-tab ${activeTab === "scenarios" ? "active" : ""}`}
          onClick={() => setActiveTab("scenarios")}
        >
          🧭 Scenario Planner
        </button>
        <button
          className={`details-tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          ✨ AI Summary
        </button>
        {projectType && (
          <button
            className={`details-tab ${activeTab === "recommendations" ? "active" : ""}`}
            onClick={() => setActiveTab("recommendations")}
          >
            💡 Business Recommendations
          </button>
        )}
      </div>

      {projectType && projectMapping && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "1rem",
            margin: "1rem 0",
            background: "rgba(8, 15, 24, 0.8)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--muted)",
                  marginBottom: "0.3rem",
                }}
              >
                Advanced project guidance
              </div>
              <div style={{ fontWeight: 700 }}>
                {projectType.icon} {projectType.label}
              </div>
            </div>
            <div
              style={{
                padding: "0.55rem 0.9rem",
                borderRadius: "999px",
                background: "rgba(56, 189, 248, 0.12)",
                color: "#38bdf8",
                fontWeight: 700,
              }}
            >
              {primaryRecommendedStack?.name ?? "Review recommended stack"}
            </div>
          </div>
          <p style={{ color: "var(--muted)", marginTop: "0.75rem" }}>
            {projectMapping.note}
          </p>
          {projectScoreAdjustments.missingRequiredCategories.length > 0 && (
            <div
              style={{
                marginTop: "0.85rem",
                padding: "0.85rem",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <strong>Required category gap:</strong>{" "}
              {projectScoreAdjustments.missingCategoryNotes.join(", ")}.
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="details-content">
        {/* ─── Tab: Tool Details ─── */}
        {activeTab === "details" && (
          <div className="details-section">
            <h4>Selected Tech Stack ({selectedCount} tools)</h4>
            <div className="details-tool-list">
              {selectedTools.map((tool) => {
                const isExpanded = expandedTool === tool.id;
                const colors = categoryColorMap[tool.category] || {
                  border: "#666",
                };
                return (
                  <div
                    key={tool.id}
                    className={`details-tool-card ${isExpanded ? "expanded" : ""}`}
                    style={{ borderLeftColor: colors.border }}
                    onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                  >
                    <div className="details-tool-header">
                      <span className="details-tool-icon">{tool.icon}</span>
                      <div className="details-tool-meta">
                        <strong>{tool.name}</strong>
                        <span className="details-tool-category">
                          {getCategoryName(tool.category)}
                          {tool.recommended && (
                            <span className="recommended-tag">Recommended</span>
                          )}
                        </span>
                      </div>
                      <span className="details-expand-icon">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="details-tool-body">
                        <p>{tool.description}</p>

                        <div className="details-grid">
                          <div className="details-info-block">
                            <h5>💰 Pricing</h5>
                            <p>
                              <strong>Free Tier:</strong> {tool.freeTier}
                            </p>
                            <p>
                              <strong>Paid Plans:</strong> {tool.pricing}
                            </p>
                          </div>
                          <div className="details-info-block">
                            <h5>📈 Scalability</h5>
                            <p>{tool.scalability}</p>
                          </div>
                        </div>

                        <div className="details-info-block">
                          <h5>⚠️ Limitations</h5>
                          <ul>
                            {tool.limitations.map((lim, i) => (
                              <li key={i}>{lim}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="details-info-block">
                          <h5>🌍 Ethiopian Support</h5>
                          <p>{tool.ethiopianSupport}</p>
                        </div>

                        <a
                          href={tool.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="details-docs-link"
                        >
                          📖 View Documentation →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab: Environment Variables ─── */}
        {activeTab === "env" && (
          <div className="details-section">
            <h4>🔧 Environment Variables & Setup</h4>
            <p className="details-subtitle">
              Copy these into your <code>.env.local</code> file. Never commit
              secrets to Git.
            </p>

            <div className="env-total-block">
              <h5>Complete .env Template</h5>
              <pre className="env-code-block">
                <code>
                  {`# ─── Generated by Stack Advisor ───
# Project: ${selectedProjectType || "Custom"}
# ${new Date().toLocaleDateString()}

`}
                  {selectedTools
                    .flatMap((t) => t.config.envVars)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((v) => `${v}=""`)
                    .join("\n")}
                </code>
              </pre>
            </div>

            {selectedTools.map((tool) => (
              <div key={tool.id} className="env-tool-block">
                <h5>
                  {tool.icon} {tool.name}
                </h5>
                <div className="env-vars-list">
                  <p>
                    <strong>Environment Variables:</strong>
                  </p>
                  <div className="env-vars-grid">
                    {tool.config.envVars.map((v) => (
                      <code key={v} className="env-var">
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="env-setup">
                  <p>
                    <strong>Setup Steps:</strong>
                  </p>
                  <ol>
                    {tool.config.setupSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="env-packages">
                  <p>
                    <strong>Required Packages:</strong>
                  </p>
                  <div className="env-packages-grid">
                    {tool.config.packages.map((pkg) => (
                      <code key={pkg} className="env-pkg">
                        {pkg}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Tab: Integration Guide ─── */}
        {activeTab === "integration" && (
          <div className="details-section">
            <h4>🔗 Integration & Interaction Guide</h4>
            <p className="details-subtitle">
              How your selected tools connect, authenticate, and share data.
            </p>

            <div className="integration-list">
              {selectedTools.map((tool) => {
                const connectedEdges = integrationEdges.filter(
                  (e) =>
                    (e.from === tool.id &&
                      Object.values(selections).includes(e.to)) ||
                    (e.to === tool.id &&
                      Object.values(selections).includes(e.from)),
                );
                if (connectedEdges.length === 0) return null;

                return (
                  <div key={tool.id} className="integration-tool-block">
                    <h5>
                      {tool.icon} {tool.name}
                    </h5>
                    <p className="integration-note">{tool.integration.notes}</p>
                    <div className="integration-connections">
                      {connectedEdges.map((edge) => {
                        const otherId =
                          edge.from === tool.id ? edge.to : edge.from;
                        const otherTool = tools.find((t) => t.id === otherId);
                        if (!otherTool) return null;
                        const isOutgoing = edge.from === tool.id;
                        return (
                          <div
                            key={edge.label}
                            className={`integration-connection ${isOutgoing ? "outgoing" : "incoming"}`}
                          >
                            <span className="conn-direction">
                              {isOutgoing ? "→" : "←"}
                            </span>
                            <span className="conn-label">{edge.label}</span>
                            <span className="conn-type">
                              {edge.type.toUpperCase()}
                            </span>
                            <span className="conn-tool">
                              {otherTool.icon} {otherTool.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab: Launch Planning ─── */}
        {activeTab === "launch" && (
          <div className="details-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h4>🚀 Launch Planning</h4>
                <p className="details-subtitle">
                  A practical execution guide for taking this stack from
                  selection to go-live.
                </p>
              </div>
              <button className="btn" onClick={copyLaunchPlan}>
                {copiedLaunchPlan ? "✅ Copied" : "📋 Copy launch brief"}
              </button>
            </div>

            {projectMapping?.note && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <strong>Project launch focus:</strong> {projectMapping.note}
              </div>
            )}

            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "14px",
                  padding: "1rem",
                  background: "rgba(8,16,24,0.7)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h5>🚦 Launch readiness score</h5>
                    <div style={{ fontSize: "0.92rem", color: "var(--muted)" }}>
                      {launchReadiness.label}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800 }}>
                    {launchReadiness.score}/100
                  </div>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.1)",
                    overflow: "hidden",
                    marginTop: "0.8rem",
                  }}
                >
                  <div
                    style={{
                      width: `${launchReadiness.score}%`,
                      height: "100%",
                      background:
                        launchReadiness.score >= 85
                          ? "#22c55e"
                          : launchReadiness.score >= 70
                            ? "#38bdf8"
                            : "#f4b24b",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: "0.8rem",
                    display: "grid",
                    gap: "0.45rem",
                  }}
                >
                  {launchReadiness.upgrades.map((upgrade) => (
                    <div
                      key={upgrade}
                      style={{
                        borderLeft: "3px solid #38bdf8",
                        paddingLeft: "0.7rem",
                        fontSize: "0.95rem",
                      }}
                    >
                      {upgrade}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "14px",
                  padding: "1rem",
                  background: "rgba(8,16,24,0.7)",
                }}
              >
                <h5>🗓️ Launch timeline</h5>
                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    marginTop: "0.75rem",
                  }}
                >
                  {launchTimeline.map((phase) => (
                    <div
                      key={phase.title}
                      style={{
                        borderLeft: "3px solid #38bdf8",
                        paddingLeft: "0.8rem",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{phase.title}</div>
                      <div
                        style={{ fontSize: "0.9rem", color: "var(--muted)" }}
                      >
                        {phase.window} • {phase.date} • {phase.owner}
                      </div>
                      <div style={{ marginTop: "0.25rem" }}>
                        {phase.outcome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                }}
              >
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    padding: "1rem",
                    background: "rgba(8,16,24,0.7)",
                  }}
                >
                  <h5>👥 Stakeholder checklist</h5>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.7rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {stakeholderChecklist.map((item) => {
                      const checked = checkedStakeholders.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleStakeholder(item.id)}
                          style={{
                            textAlign: "left",
                            border: checked
                              ? "1px solid #22c55e"
                              : "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "10px",
                            padding: "0.7rem 0.8rem",
                            background: checked
                              ? "rgba(34, 197, 94, 0.12)"
                              : "rgba(255,255,255,0.03)",
                            color: "inherit",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>
                            {checked ? "✓" : "○"} {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "var(--muted)",
                              marginTop: "0.2rem",
                            }}
                          >
                            {item.note}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    padding: "1rem",
                    background: "rgba(8,16,24,0.7)",
                  }}
                >
                  <h5>✅ Go / No-Go gate</h5>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.7rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {launchGate.criteria.map((criterion) => (
                      <div
                        key={criterion.label}
                        style={{
                          borderLeft: criterion.passed
                            ? "3px solid #22c55e"
                            : "3px solid #f4b24b",
                          paddingLeft: "0.8rem",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{criterion.label}</div>
                        <div
                          style={{ fontSize: "0.9rem", color: "var(--muted)" }}
                        >
                          {criterion.passed ? "Pass" : "Needs attention"}
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: "0.35rem", fontWeight: 700 }}>
                      Overall decision: {launchGate.status}
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "var(--muted)" }}>
                      {launchGate.passedCount}/{launchGate.total} checks passed
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "14px",
                  padding: "1rem",
                  background: "rgba(8,16,24,0.7)",
                }}
              >
                <h5>🗓️ Milestones</h5>
                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    marginTop: "0.75rem",
                  }}
                >
                  {launchPlan.phases.map((phase) => (
                    <div
                      key={phase.title}
                      style={{
                        borderLeft: "3px solid #38bdf8",
                        paddingLeft: "0.8rem",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{phase.title}</div>
                      <div
                        style={{ fontSize: "0.9rem", color: "var(--muted)" }}
                      >
                        {phase.window}
                      </div>
                      <div style={{ marginTop: "0.2rem" }}>{phase.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    padding: "1rem",
                    background: "rgba(8,16,24,0.7)",
                  }}
                >
                  <h5>👥 Team roles</h5>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.7rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {launchPlan.roles.map((role) => (
                      <div
                        key={role.title}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{role.title}</div>
                        <div
                          style={{ fontSize: "0.9rem", color: "var(--muted)" }}
                        >
                          {role.focus}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    padding: "1rem",
                    background: "rgba(8,16,24,0.7)",
                  }}
                >
                  <h5>⚠️ Risks to track</h5>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.7rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {launchPlan.risks.map((risk) => (
                      <div
                        key={risk.title}
                        style={{
                          borderLeft: `3px solid ${risk.severity === "High" ? "#ef4444" : risk.severity === "Medium" ? "#f4b24b" : "#22c55e"}`,
                          paddingLeft: "0.8rem",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{risk.title}</div>
                        <div
                          style={{ fontSize: "0.85rem", color: "var(--muted)" }}
                        >
                          {risk.severity}
                        </div>
                        <div
                          style={{ marginTop: "0.2rem", fontSize: "0.92rem" }}
                        >
                          {risk.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Scenario Planner ─── */}
        {activeTab === "scenarios" && (
          <div className="details-section">
            <h4>🧭 Scenario Planner</h4>
            <p className="details-subtitle">
              Compare the strongest execution paths for your stack and choose
              the one that fits your stage best.
            </p>

            <div style={{ display: "grid", gap: "0.85rem" }}>
              {scenarioRecommendations.map((scenario) => {
                const active = selectedScenario === scenario.id;
                return (
                  <div
                    key={scenario.id}
                    style={{
                      border: active
                        ? "1px solid #38bdf8"
                        : "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "16px",
                      padding: "1rem",
                      background: active
                        ? "rgba(56, 189, 248, 0.10)"
                        : "rgba(8, 15, 24, 0.76)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>{scenario.title}</strong>
                        <div
                          style={{ color: "var(--muted)", marginTop: "0.2rem" }}
                        >
                          {scenario.description}
                        </div>
                      </div>
                      <button
                        className="btn"
                        onClick={() => setSelectedScenario(scenario.id)}
                      >
                        {active ? "Selected" : "View"}
                      </button>
                    </div>

                    {active && (
                      <div
                        style={{
                          marginTop: "0.85rem",
                          display: "grid",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            Fit score: {scenario.fitScore}/100
                          </span>
                          <div
                            style={{
                              height: "8px",
                              width: "180px",
                              borderRadius: "999px",
                              background: "rgba(255,255,255,0.1)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${scenario.fitScore}%`,
                                height: "100%",
                                background:
                                  scenario.fitScore >= 90
                                    ? "#22c55e"
                                    : scenario.fitScore >= 80
                                      ? "#38bdf8"
                                      : "#f4b24b",
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          {scenario.priorities.map((priority) => (
                            <div
                              key={priority}
                              style={{
                                borderLeft: "3px solid #38bdf8",
                                paddingLeft: "0.7rem",
                              }}
                            >
                              {priority}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div
                            style={{ fontWeight: 700, marginBottom: "0.35rem" }}
                          >
                            Recommended tools
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {scenario.recommendedTools.map((tool) => (
                              <span
                                key={tool}
                                style={{
                                  padding: "0.35rem 0.6rem",
                                  borderRadius: "999px",
                                  background: "rgba(255,255,255,0.06)",
                                }}
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab: AI Summary ─── */}
        {activeTab === "summary" && (
          <div className="details-section" ref={summaryRef}>
            <h4>✨ AI-Generated Stack Summary</h4>
            <p className="details-subtitle">
              A concise strategic brief that explains the current stack, its
              strengths, and how to proceed.
            </p>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <button
                  className="btn solid"
                  onClick={() => setSummaryRefreshKey((prev) => prev + 1)}
                >
                  Refresh summary
                </button>
                <button className="btn" onClick={copyAiSummary}>
                  {summaryCopied ? "Copied" : "Copy markdown"}
                </button>
                <button className="btn" onClick={downloadAiSummary}>
                  Download .md
                </button>
                <button className="btn" onClick={exportAiSummaryPdf}>
                  Export as PDF
                </button>
              </div>

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "20px",
                  padding: "1.1rem",
                  background:
                    "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(34, 197, 94, 0.08))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: "var(--muted)",
                      }}
                    >
                      Recommendation score
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        lineHeight: 1.1,
                      }}
                    >
                      {aiSummary.score}/100
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.55rem 0.8rem",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.12)",
                      fontWeight: 700,
                    }}
                  >
                    {aiSummary.scoreLabel}
                  </div>
                </div>
                <h5 style={{ marginTop: "0.85rem", marginBottom: "0.35rem" }}>
                  {aiSummary.headline}
                </h5>
                <p
                  style={{
                    color: "var(--muted)",
                    marginTop: "0.2rem",
                    marginBottom: 0,
                  }}
                >
                  {aiSummary.summary}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "0.8rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "0.95rem",
                    background: "rgba(8, 15, 24, 0.76)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>
                    Strategic posture
                  </div>
                  <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                    {aiSummary.strategicPosture}
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "0.95rem",
                    background: "rgba(8, 15, 24, 0.76)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>
                    Watchouts
                  </div>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {aiSummary.watchouts.map((watchout) => (
                      <div
                        key={watchout}
                        style={{
                          borderLeft: "3px solid #f4b24b",
                          paddingLeft: "0.7rem",
                          color: "var(--muted)",
                        }}
                      >
                        {watchout}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "1rem",
                  background: "rgba(8, 15, 24, 0.76)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    marginBottom: "0.7rem",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>Strategic comparison</div>
                  <div
                    style={{
                      padding: "0.35rem 0.65rem",
                      borderRadius: "999px",
                      background: "rgba(56, 189, 248, 0.16)",
                      color: "#38bdf8",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    Recommended: {recommendedStrategy.title}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  {strategyComparison.map((option) => {
                    const isRecommended = option.id === recommendedStrategy.id;
                    return (
                      <div
                        key={option.id}
                        style={{
                          border: isRecommended
                            ? "1px solid rgba(56, 189, 248, 0.45)"
                            : "1px solid rgba(255,255,255,0.10)",
                          borderRadius: "14px",
                          padding: "0.85rem",
                          background: isRecommended
                            ? "rgba(56, 189, 248, 0.10)"
                            : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {option.title}
                            </div>
                            <div
                              style={{
                                color: "var(--muted)",
                                marginTop: "0.2rem",
                              }}
                            >
                              {option.summary}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{ fontSize: "1.1rem", fontWeight: 800 }}
                            >
                              {option.score}/100
                            </div>
                            <div
                              style={{
                                color: "var(--muted)",
                                fontSize: "0.9rem",
                              }}
                            >
                              {option.badge}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: "0.45rem",
                            color: "var(--muted)",
                            fontSize: "0.92rem",
                          }}
                        >
                          {option.bestFor}
                        </div>
                        {isRecommended && (
                          <div
                            style={{
                              marginTop: "0.55rem",
                              display: "inline-block",
                              padding: "0.25rem 0.55rem",
                              borderRadius: "999px",
                              background: "rgba(34, 197, 94, 0.18)",
                              color: "#22c55e",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                            }}
                          >
                            Best match
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {aiSummary.highlights.map((item) => (
                  <div
                    key={item}
                    style={{
                      borderLeft: "3px solid #38bdf8",
                      paddingLeft: "0.8rem",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "1rem",
                  background: "rgba(8, 15, 24, 0.76)",
                }}
              >
                <h5>Next actions</h5>
                <div
                  style={{
                    display: "grid",
                    gap: "0.55rem",
                    marginTop: "0.6rem",
                  }}
                >
                  {aiSummary.nextActions.map((action) => (
                    <div
                      key={action}
                      style={{
                        borderLeft: "3px solid #22c55e",
                        paddingLeft: "0.8rem",
                      }}
                    >
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Advanced Guide ─── */}
        {activeTab === "advanced" && (
          <div className="details-section">
            <h4>🧠 Advanced Production Guide</h4>
            <p className="details-subtitle">
              Deep-dive architecture patterns, security best practices, code
              examples, and production strategies for each selected tool.
            </p>

            {selectedTools.map((tool) => {
              const guide = advancedGuides[tool.id] as
                | AdvancedGuide
                | undefined;
              if (!guide) {
                return (
                  <div key={tool.id} className="adv-tool-block">
                    <h5>
                      {tool.icon} {tool.name}
                    </h5>
                    <p className="adv-coming-soon">
                      Advanced guide coming soon for this tool.
                    </p>
                  </div>
                );
              }

              return (
                <div key={tool.id} className="adv-tool-block">
                  <div className="adv-tool-header">
                    <span className="adv-tool-icon">{tool.icon}</span>
                    <div>
                      <h5>{tool.name}</h5>
                      <span className="adv-tool-category">
                        {toolCategories.find((c) => c.id === tool.category)
                          ?.label || tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Architecture Patterns */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🏗️</span> Architecture
                      Patterns
                    </h6>
                    <div className="adv-pill-list">
                      {guide.architecturePatterns.map((p, i) => (
                        <span key={i} className="adv-pill">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security Best Practices */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🔒</span> Security Best
                      Practices
                    </h6>
                    <ul className="adv-list">
                      {guide.securityBestPractices.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Performance Optimizations */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">⚡</span> Performance
                      Optimizations
                    </h6>
                    <ul className="adv-list">
                      {guide.performanceOptimizations.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Production Configs */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">⚙️</span> Production
                      Configuration
                    </h6>
                    <div className="adv-configs">
                      {guide.productionConfigs.map((cfg, i) => (
                        <details key={i} className="adv-config-details">
                          <summary className="adv-config-summary">
                            {cfg.title}
                          </summary>
                          <p className="adv-config-desc">{cfg.description}</p>
                          <pre className="adv-code-block">
                            <code>{cfg.code}</code>
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">💻</span> Code Examples
                    </h6>
                    <div className="adv-examples">
                      {guide.codeExamples.map((ex, i) => (
                        <details key={i} className="adv-config-details">
                          <summary className="adv-config-summary">
                            {ex.title}
                          </summary>
                          <pre className="adv-code-block">
                            <code>{ex.code}</code>
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Testing Strategy */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🧪</span> Testing
                      Strategy
                    </h6>
                    <p className="adv-text">{guide.testingStrategy}</p>
                  </div>

                  {/* Monitoring Strategy */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">📡</span> Monitoring
                      Strategy
                    </h6>
                    <p className="adv-text">{guide.monitoringStrategy}</p>
                  </div>

                  {/* Backup & Disaster Recovery */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">💾</span> Backup &
                      Disaster Recovery
                    </h6>
                    <p className="adv-text">{guide.backupDisasterRecovery}</p>
                  </div>

                  {/* Deployment Strategy */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">🚀</span> Deployment
                      Strategy
                    </h6>
                    <p className="adv-text">{guide.deploymentStrategy}</p>
                  </div>

                  {/* Common Pitfalls */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">⚠️</span> Common
                      Pitfalls
                    </h6>
                    <div className="adv-pitfalls">
                      {guide.commonPitfalls.map((p, i) => (
                        <div key={i} className="adv-pitfall">
                          <div className="adv-pitfall-issue">
                            <span className="pitfall-icon">❌</span>
                            <span>{p.issue}</span>
                          </div>
                          <div className="adv-pitfall-solution">
                            <span className="pitfall-icon">✅</span>
                            <span>{p.solution}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scalability Patterns */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">📈</span> Scalability
                      Patterns
                    </h6>
                    <ul className="adv-list">
                      {guide.scalabilityPatterns.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cost Optimization */}
                  <div className="adv-section">
                    <h6>
                      <span className="adv-section-icon">💰</span> Cost
                      Optimization
                    </h6>
                    <p className="adv-text">{guide.costOptimization}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* ─── Tab: Templates ─── */}
        {activeTab === "templates" && (
          <div className="details-section">
            <h4>🧱 Starter Templates</h4>
            <p className="details-subtitle">
              Turn your selected stack into a practical starter blueprint for
              your product type.
            </p>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  background: "rgba(9, 17, 26, 0.76)",
                }}
              >
                <h5 style={{ marginBottom: "0.35rem" }}>
                  {starterTemplate.title}
                </h5>
                <p style={{ color: "var(--muted)", marginBottom: "0.75rem" }}>
                  {starterTemplate.description}
                </p>
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {starterTemplate.files.map((file) => (
                    <div
                      key={file.name}
                      style={{
                        padding: "0.7rem 0.8rem",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <strong>{file.name}</strong>
                      <div
                        style={{
                          color: "var(--muted)",
                          fontSize: "0.92rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {file.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  background: "rgba(6, 13, 22, 0.8)",
                }}
              >
                <h5 style={{ marginBottom: "0.4rem" }}>
                  Suggested build order
                </h5>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: "1.2rem",
                    color: "var(--muted)",
                    display: "grid",
                    gap: "0.4rem",
                  }}
                >
                  <li>
                    Define the core user journey and a single success metric.
                  </li>
                  <li>
                    Build the authenticated shell and key feature screens.
                  </li>
                  <li>Wire the data layer and payments before polishing UI.</li>
                  <li>
                    Launch with monitoring, backups, and a staging environment.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Roadmap ─── */}
        {activeTab === "roadmap" && (
          <div className="details-section">
            <h4>🗺️ Deployment Roadmap</h4>
            <p className="details-subtitle">
              Move from a working prototype to a reliable production system with
              a clear growth plan.
            </p>

            <div style={{ display: "grid", gap: "0.9rem" }}>
              {[
                {
                  phase: "MVP",
                  title: "Launch the core experience",
                  details:
                    "Focus on one primary user workflow, a polished landing page, and the essential onboarding path.",
                },
                {
                  phase: "Beta",
                  title: "Collect feedback and harden reliability",
                  details:
                    "Add analytics, error monitoring, and a small set of real-user tests before broad release.",
                },
                {
                  phase: "Production",
                  title: "Secure and automate deployment",
                  details:
                    "Introduce automated checks, backup plans, staging environments, and clear incident procedures.",
                },
                {
                  phase: "Scale",
                  title: "Optimize cost and performance",
                  details:
                    "Refine caching, database queries, and delivery paths while expanding feature coverage.",
                },
              ].map((item) => (
                <div
                  key={item.phase}
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "1rem",
                    background: "rgba(8, 15, 24, 0.78)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      alignItems: "center",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <strong>{item.phase}</strong>
                    <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      {item.title}
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Tab: Presets ─── */}
        {activeTab === "presets" && (
          <div className="details-section">
            <h4>💾 Stack Presets & Planning</h4>
            <p className="details-subtitle">
              Save your current stack, reuse it later, and keep a clean planning
              workflow as your product evolves.
            </p>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  background: "rgba(8, 15, 24, 0.76)",
                }}
              >
                <h5 style={{ marginBottom: "0.5rem" }}>Save current stack</h5>
                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    placeholder="Preset name"
                    style={{
                      flex: "1 1 220px",
                      padding: "0.7rem 0.8rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#fff",
                    }}
                  />
                  <button className="btn solid" onClick={savePreset}>
                    Save preset
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {savedPresets.length === 0 ? (
                  <div
                    style={{
                      padding: "1rem",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "16px",
                      background: "rgba(8, 15, 24, 0.76)",
                      color: "var(--muted)",
                    }}
                  >
                    No presets yet. Save your first stack to build a reusable
                    planning library.
                  </div>
                ) : (
                  savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      style={{
                        padding: "1rem",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "16px",
                        background: "rgba(8, 15, 24, 0.76)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>{preset.name}</strong>
                        <div
                          style={{
                            color: "var(--muted)",
                            fontSize: "0.92rem",
                            marginTop: "0.2rem",
                          }}
                        >
                          {preset.projectType
                            ? `Project: ${preset.projectType}`
                            : "Custom project"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn"
                          onClick={() => applyPreset(preset)}
                        >
                          Load
                        </button>
                        <button
                          className="btn"
                          onClick={() => removePreset(preset.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  background: "rgba(8, 15, 24, 0.76)",
                }}
              >
                <h5 style={{ marginBottom: "0.45rem" }}>
                  Implementation checklist
                </h5>
                <div style={{ display: "grid", gap: "0.65rem" }}>
                  {implementationChecklist.map((item) => (
                    <div
                      key={item.title}
                      style={{
                        padding: "0.75rem 0.8rem",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>{item.title}</strong>
                        <span
                          style={{
                            padding: "0.25rem 0.55rem",
                            borderRadius: "999px",
                            background:
                              item.priority === "high"
                                ? "rgba(239, 68, 68, 0.16)"
                                : "rgba(56, 189, 248, 0.16)",
                            color:
                              item.priority === "high" ? "#fda4af" : "#bae6fd",
                            fontSize: "0.8rem",
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p
                        style={{
                          color: "var(--muted)",
                          marginTop: "0.3rem",
                          marginBottom: 0,
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Cost Estimator ─── */}
        {activeTab === "cost" &&
          (() => {
            const costData = stackCost;
            const warnings = checkCompatibility(Object.values(selections));
            const totalScore = selectedTools.reduce((acc, t) => {
              const score = getToolScore(t.id);
              return acc + (score?.totalScore || 0);
            }, 0);
            const avgScore =
              selectedTools.length > 0
                ? (totalScore / selectedTools.length).toFixed(1)
                : "0";

            return (
              <div className="details-section">
                <h4>💰 Cost & Compatibility Analysis</h4>
                <p className="details-subtitle">
                  Estimated monthly infrastructure costs, compatibility checks,
                  and quality scores for your selected stack.
                </p>

                {/* Cost Summary */}
                <div className="cost-summary-cards">
                  <div className="cost-card free">
                    <span className="cost-card-label">Minimum Monthly</span>
                    <span className="cost-card-value">
                      ${costData.totalMonthly.min}
                    </span>
                    <span className="cost-card-note">
                      Using free tiers where possible
                    </span>
                  </div>
                  <div className="cost-card paid">
                    <span className="cost-card-label">Maximum Monthly</span>
                    <span className="cost-card-value">
                      ${costData.totalMonthly.max}
                    </span>
                    <span className="cost-card-note">
                      All tools on paid plans
                    </span>
                  </div>
                  <div className="cost-card annual">
                    <span className="cost-card-label">Annual Range</span>
                    <span className="cost-card-value">
                      ${costData.totalAnnual.min}–${costData.totalAnnual.max}
                    </span>
                    <span className="cost-card-note">
                      Estimated yearly cost
                    </span>
                  </div>
                  <div className="cost-card score">
                    <span className="cost-card-label">Stack Quality Score</span>
                    <span className="cost-card-value">{avgScore}/10</span>
                    <span className="cost-card-note">
                      Average across all tools
                    </span>
                  </div>
                  <div
                    className="cost-card"
                    style={{ borderColor: compatibilityScore.color }}
                  >
                    <span className="cost-card-label">Compatibility Grade</span>
                    <span
                      className="cost-card-value"
                      style={{ color: compatibilityScore.color }}
                    >
                      {compatibilityScore.label}
                    </span>
                    <span className="cost-card-note">
                      {warnings.length === 0
                        ? "No major issues detected"
                        : `${warnings.length} checks to review`}
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div
                  className={`cost-recommendation ${costData.totalMonthly.max === 0 ? "free" : costData.totalMonthly.max <= 50 ? "low" : "high"}`}
                >
                  <span className="cost-rec-icon">
                    {costData.totalMonthly.max === 0
                      ? "🎉"
                      : costData.totalMonthly.max <= 50
                        ? "👍"
                        : "💡"}
                  </span>
                  <p>{costData.recommendation}</p>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    background: "rgba(8, 15, 24, 0.76)",
                    display: "grid",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h5 style={{ margin: 0 }}>🎯 Strategy mode</h5>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        { id: "fastest", label: "Fastest" },
                        { id: "cheapest", label: "Cheapest" },
                        { id: "scalable", label: "Scalable" },
                        { id: "ethiopia", label: "Ethiopia" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          className="btn"
                          onClick={() =>
                            setStrategyMode(mode.id as StrategyMode)
                          }
                          style={{
                            padding: "0.45rem 0.75rem",
                            borderRadius: "999px",
                            border:
                              strategyMode === mode.id
                                ? "1px solid var(--teal)"
                                : "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>{strategySummary.title}</strong>
                    <p style={{ color: "var(--muted)", marginTop: "0.35rem" }}>
                      {strategySummary.description}
                    </p>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "1.2rem",
                      color: "var(--muted)",
                      display: "grid",
                      gap: "0.35rem",
                    }}
                  >
                    {strategySummary.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    background: "rgba(8, 15, 24, 0.76)",
                    display: "grid",
                    gap: "0.7rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h5 style={{ margin: 0 }}>💸 Budget planner</h5>
                    <span
                      style={{ fontSize: "0.92rem", color: "var(--muted)" }}
                    >
                      ${budgetTarget}/mo target
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={budgetTarget}
                    onChange={(event) =>
                      setBudgetTarget(Number(event.target.value))
                    }
                    style={{ width: "100%" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      color: "var(--muted)",
                    }}
                  >
                    <span>Lean MVP</span>
                    <span>Scale-ready</span>
                  </div>
                  <div
                    style={{
                      padding: "0.8rem 0.9rem",
                      borderRadius: "12px",
                      background:
                        budgetPlan.tone === "good"
                          ? "rgba(34, 197, 94, 0.14)"
                          : "rgba(244, 178, 75, 0.14)",
                    }}
                  >
                    <strong>{budgetPlan.label}</strong>
                    <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
                      {budgetPlan.description}
                    </p>
                  </div>
                </div>

                {/* Compatibility Warnings */}
                {warnings.length > 0 && (
                  <div className="cost-warnings">
                    <h5>🔍 Compatibility Checks</h5>
                    <div className="warnings-list">
                      {warnings.map((w, i) => (
                        <div key={i} className={`warning-item ${w.type}`}>
                          <span className="warning-icon">
                            {w.type === "error"
                              ? "🚫"
                              : w.type === "warning"
                                ? "⚠️"
                                : "💡"}
                          </span>
                          <div className="warning-content">
                            <strong>{w.message}</strong>
                            <p>{w.recommendation}</p>
                            <div className="warning-tools">
                              {w.tools.map((tId) => {
                                const t = tools.find((t) => t.id === tId);
                                return t ? (
                                  <span key={tId} className="warning-tool-chip">
                                    {t.icon} {t.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-tool breakdown */}
                <div className="cost-breakdown">
                  <h5>📊 Per-Tool Cost Breakdown</h5>
                  <div className="cost-table">
                    <div className="cost-table-header">
                      <span>Tool</span>
                      <span>Free Tier</span>
                      <span>Monthly Cost</span>
                      <span>Upgrade Trigger</span>
                    </div>
                    {costData.breakdown.map((b) => (
                      <div key={b.toolId} className="cost-table-row">
                        <span className="cost-tool-name">
                          {b.toolIcon} {b.toolName}
                        </span>
                        <span className="cost-free-tier">{b.freeTier}</span>
                        <span
                          className={`cost-monthly ${b.monthlyCost.max === 0 ? "free" : ""}`}
                        >
                          {b.monthlyCost.min === 0 && b.monthlyCost.max === 0
                            ? "Free"
                            : `$${b.monthlyCost.min}–$${b.monthlyCost.max}/mo`}
                        </span>
                        <span className="cost-breakeven">
                          {b.breakEvenPoint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ethiopian Cost Note */}
                <div className="cost-ethiopian-section">
                  <h5>🇪🇹 Ethiopian Cost Considerations</h5>
                  <div className="ethiopian-cost-grid">
                    {costData.breakdown.map((b) => (
                      <div key={b.toolId} className="ethiopian-cost-item">
                        <strong>
                          {b.toolIcon} {b.toolName}
                        </strong>
                        <p>{b.ethiopianCostNote}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ─── Tab: Export Stack ─── */}
        {activeTab === "export" &&
          (() => {
            const [copySuccess, setCopySuccess] = useState<string | null>(null);

            const jsonExport = generateStackExport(selectedTools, "json");
            const mdExport = generateStackExport(selectedTools, "markdown");
            const envExport = generateStackExport(selectedTools, "env");

            const handleCopy = async (text: string, label: string) => {
              try {
                await navigator.clipboard.writeText(text);
                setCopySuccess(`${label} copied!`);
                setTimeout(() => setCopySuccess(null), 2000);
              } catch {
                setCopySuccess("Failed to copy");
              }
            };

            return (
              <div className="details-section">
                <h4>📤 Export Your Tech Stack</h4>
                <p className="details-subtitle">
                  Share your stack configuration with your team or save it for
                  reference.
                </p>

                {copySuccess && (
                  <div className="export-toast">{copySuccess}</div>
                )}

                {/* JSON Export */}
                <div className="export-block">
                  <div className="export-header">
                    <h5>📦 JSON Format</h5>
                    <button
                      className="btn solid"
                      onClick={() => handleCopy(jsonExport, "JSON")}
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="export-code">
                    <code>{jsonExport}</code>
                  </pre>
                </div>

                {/* Markdown Export */}
                <div className="export-block">
                  <div className="export-header">
                    <h5>📝 Markdown Summary</h5>
                    <button
                      className="btn solid"
                      onClick={() => handleCopy(mdExport, "Markdown")}
                    >
                      Copy Markdown
                    </button>
                  </div>
                  <pre className="export-code">
                    <code>{mdExport}</code>
                  </pre>
                </div>

                {/* .env Export */}
                <div className="export-block">
                  <div className="export-header">
                    <h5>🔧 Environment Variables</h5>
                    <button
                      className="btn solid"
                      onClick={() => handleCopy(envExport, "ENV")}
                    >
                      Copy .env
                    </button>
                  </div>
                  <pre className="export-code">
                    <code>{envExport}</code>
                  </pre>
                </div>

                {/* Tool Scores */}
                <div className="export-scores">
                  <h5>📊 Tool Quality Scores</h5>
                  <div className="scores-grid">
                    {selectedTools.map((t) => {
                      const score = getToolScore(t.id);
                      if (!score) return null;
                      const maxScore = Math.max(...Object.values(score.scores));
                      const minScore = Math.min(...Object.values(score.scores));
                      return (
                        <div key={t.id} className="score-card">
                          <div className="score-header">
                            <span className="score-icon">{t.icon}</span>
                            <span className="score-name">{t.name}</span>
                            <span className="score-total">
                              {score.totalScore}
                            </span>
                          </div>
                          <div className="score-bars">
                            {Object.entries(score.scores).map(([key, val]) => (
                              <div key={key} className="score-bar-item">
                                <span className="score-bar-label">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())}
                                </span>
                                <div className="score-bar-track">
                                  <div
                                    className={`score-bar-fill ${val >= 8 ? "high" : val >= 6 ? "mid" : "low"}`}
                                    style={{ width: `${val * 10}%` }}
                                  />
                                </div>
                                <span className="score-bar-value">
                                  {val}/10
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="score-traits">
                            <div className="score-strengths">
                              <strong>✅ Strengths</strong>
                              {score.strengths.map((s, i) => (
                                <span key={i}>{s}</span>
                              ))}
                            </div>
                            <div className="score-weaknesses">
                              <strong>⚠️ Weaknesses</strong>
                              {score.weaknesses.map((w, i) => (
                                <span key={i}>{w}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        {/* ─── Tab: Production Readiness ─── */}
        {activeTab === "production" && (
          <div className="details-section">
            <h4>✅ Production Readiness Checklist</h4>
            <p className="details-subtitle">
              Essential steps for taking your app from development to
              production.
            </p>

            {projectScoreAdjustments.missingRequiredCategories.length > 0 && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <strong>Project fit alert:</strong> This project type needs
                selections for{" "}
                {projectScoreAdjustments.missingCategoryNotes.join(", ")} before
                it can be production-ready.
              </div>
            )}

            {productionChecklist.map((category) => (
              <div key={category.category} className="prod-category">
                <h5>{category.category}</h5>
                <div className="prod-items">
                  {category.items.map((item, i) => (
                    <div
                      key={i}
                      className={`prod-item priority-${item.priority}`}
                    >
                      <div className="prod-item-header">
                        <span className={`priority-badge ${item.priority}`}>
                          {item.priority}
                        </span>
                        <strong>{item.title}</strong>
                      </div>
                      <p>{item.description}</p>
                      {item.tools.length > 0 && (
                        <div className="prod-tools">
                          {item.tools.map((tId) => {
                            const t = tools.find((t) => t.id === tId);
                            return t ? (
                              <span key={tId} className="prod-tool-chip">
                                {t.icon} {t.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Caching & Rate Limiting Section */}
            <div className="prod-category">
              <h5>⚡ Caching & Rate Limiting Strategy</h5>
              <div className="prod-card">
                <h6>Recommended Approach</h6>
                <div className="strategy-grid">
                  <div className="strategy-item">
                    <strong>API Rate Limiting</strong>
                    <p>Use Upstash Redis to rate-limit API routes:</p>
                    <pre className="strategy-code">
                      <code>{`import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// In your API route:
const { success, limit, remaining } = await ratelimit.limit(userId);
if (!success) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}`}</code>
                    </pre>
                  </div>
                  <div className="strategy-item">
                    <strong>Database Connection Pooling</strong>
                    <p>Supabase uses PgBouncer by default. For self-hosted:</p>
                    <pre className="strategy-code">
                      <code>{`# docker-compose.yml
services:
  pgbouncer:
    image: bitnami/pgbouncer:latest
    environment:
      - POSTGRESQL_HOST=postgres
      - POSTGRESQL_PORT=5432
      - PGBOUNCER_POOL_MODE=transaction
      - PGBOUNCER_MAX_CLIENT_CONN=100`}</code>
                    </pre>
                  </div>
                  <div className="strategy-item">
                    <strong>Frontend Caching</strong>
                    <p>Next.js ISR + CDN caching strategy:</p>
                    <pre className="strategy-code">
                      <code>{`// pages or API routes with caching
export const revalidate = 3600; // ISR: regenerate every hour

// Or for API routes:
res.setHeader(
  "Cache-Control",
  "public, s-maxage=60, stale-while-revalidate=300"
);`}</code>
                    </pre>
                  </div>
                  <div className="strategy-item">
                    <strong>Redis Caching Layer</strong>
                    <p>Cache expensive database queries:</p>
                    <pre className="strategy-code">
                      <code>{`const cache = await redis.get(\`course:\${id}\`);
if (cache) return JSON.parse(cache);

const data = await db.query.courses.findFirst({ where: eq(courses.id, id) });
await redis.set(\`course:\${id}\`, JSON.stringify(data), { ex: 300 });

return data;`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Ethiopian Adaptations ─── */}
        {activeTab === "ethiopia" && (
          <div className="details-section">
            <h4>🇪🇹 Ethiopian Market Adaptations</h4>
            <p className="details-subtitle">
              Special considerations for building platforms in and for the
              Ethiopian market.
            </p>

            <div className="ethiopia-grid">
              {ethiopianAdaptations.map((adapt) => (
                <div key={adapt.id} className="ethiopia-card">
                  <div className="ethiopia-card-header">
                    <span className={`ethiopia-category ${adapt.category}`}>
                      {adapt.category === "payment"
                        ? "💳"
                        : adapt.category === "hosting"
                          ? "☁️"
                          : adapt.category === "auth"
                            ? "🔐"
                            : adapt.category === "delivery"
                              ? "🚚"
                              : "📋"}{" "}
                      {adapt.category}
                    </span>
                  </div>
                  <h5>{adapt.title}</h5>
                  <p>{adapt.description}</p>
                  <div className="ethiopia-tools">
                    {adapt.tools.map((tId) => {
                      const t = tools.find((t) => t.id === tId);
                      return t ? (
                        <span key={tId} className="ethiopia-tool-chip">
                          {t.icon} {t.name}
                        </span>
                      ) : (
                        <span key={tId} className="ethiopia-tool-chip">
                          {tId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Screenshot Upload + Admin Approval Workflow */}
            <div className="ethiopia-workflow">
              <h5>📸 Screenshot Upload + Admin Approval Workflow</h5>
              <p>
                For Ethiopian businesses where manual payment confirmation is
                common (bank transfers, mobile money), implement this workflow:
              </p>
              <div className="workflow-steps">
                <div className="workflow-step">
                  <span className="workflow-num">1</span>
                  <div>
                    <strong>User makes payment</strong>
                    <p>Bank transfer, Telebirr, or other manual method</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">2</span>
                  <div>
                    <strong>Upload screenshot</strong>
                    <p>User uploads payment receipt/screenshot via the app</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">3</span>
                  <div>
                    <strong>Stored in Supabase Storage</strong>
                    <p>Image saved in private bucket with user_id metadata</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">4</span>
                  <div>
                    <strong>Admin review pending</strong>
                    <p>
                      Admin sees new payment request in dashboard with
                      screenshot
                    </p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">5</span>
                  <div>
                    <strong>Admin approves/rejects</strong>
                    <p>Admin reviews and approves or rejects with notes</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-num">6</span>
                  <div>
                    <strong>Membership activated</strong>
                    <p>User gets notified and premium features are unlocked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Business Recommendations ─── */}
        {activeTab === "recommendations" && projectType && (
          <div className="details-section">
            <h4>
              💡 {projectType.icon} {projectType.label} — Feature
              Recommendations
            </h4>
            <p className="details-subtitle">
              Essential features and functionality recommendations for your{" "}
              {projectType.label.toLowerCase()}.
            </p>

            {recommendedProjectStack && (
              <div className="matching-stack-banner">
                <span className="matching-stack-icon">★</span>
                <div>
                  <strong>
                    Recommended Stack: {recommendedProjectStack.name}
                  </strong>
                  <p>{recommendedProjectStack.description}</p>
                  <div className="matching-stack-meta">
                    <span
                      className={`cost-badge ${recommendedProjectStack.cost}`}
                    >
                      💰{" "}
                      {recommendedProjectStack.cost === "free"
                        ? "Free"
                        : recommendedProjectStack.cost === "low"
                          ? "Low Cost"
                          : recommendedProjectStack.cost === "medium"
                            ? "Medium Cost"
                            : "Higher Cost"}
                    </span>
                    <span
                      className={`difficulty-badge ${recommendedProjectStack.difficulty}`}
                    >
                      📊 {recommendedProjectStack.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="recommendations-grid">
              {projectType.businessFeatures.map((feature, i) => (
                <div key={i} className="recommendation-card">
                  <span className="rec-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p>{feature}</p>
                </div>
              ))}
            </div>

            <div className="recommendations-note">
              <h5>📌 Implementation Priority</h5>
              <ol>
                <li>
                  <strong>Core functionality</strong> — Build the main value
                  proposition first (courses, products, etc.)
                </li>
                <li>
                  <strong>User management</strong> — Authentication, profiles,
                  and dashboards
                </li>
                <li>
                  <strong>Payment integration</strong> — Chapa for Ethiopian
                  users, PayPal/Stripe for international
                </li>
                <li>
                  <strong>Engagement features</strong> — Ratings, comments,
                  notifications
                </li>
                <li>
                  <strong>Analytics & reporting</strong> — Track usage, revenue,
                  and growth
                </li>
                <li>
                  <strong>Performance optimization</strong> — Caching, CDN,
                  database optimization
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const categoryColorMap: Record<string, { border: string }> = {
  frontend: { border: "#1fb4b8" },
  backend: { border: "#0b7fd4" },
  database: { border: "#f4b24b" },
  auth: { border: "#c792ea" },
  storage: { border: "#22c55e" },
  deploy_frontend: { border: "#38bdf8" },
  deploy_backend: { border: "#d9614f" },
  cicd: { border: "#f4b24b" },
  payment: { border: "#22c55e" },
  email: { border: "#e879f9" },
  cache: { border: "#ef4444" },
  testing: { border: "#34d399" },
  monitoring: { border: "#facc15" },
};
