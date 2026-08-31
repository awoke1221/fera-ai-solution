import type { ProjectRequirements } from "./types";

export type AdvancedStackInsight = {
  category: "Architecture" | "Security" | "Delivery" | "Growth";
  headline: string;
  detail: string;
  recommendation: string;
  priority: "low" | "medium" | "high";
};

export function buildAdvancedStackInsights(
  requirements: ProjectRequirements,
): AdvancedStackInsight[] {
  const features = new Set(requirements.requiredFeatures);
  const isHighScale =
    requirements.expectedUsers === "10000-100000" ||
    requirements.expectedUsers === "100000-plus";
  const isComplex =
    features.has("ai") ||
    features.has("payments") ||
    features.has("video") ||
    features.has("multi-tenancy") ||
    features.has("real-time-communication");
  const isEthiopianMarket = requirements.targetMarketCountry
    .toLowerCase()
    .includes("ethiopia");
  const isMobileFirst = requirements.targetPlatforms.includes("mobile");
  const isFastLaunch = requirements.developmentPriority === "fast-mvp";

  const insights: AdvancedStackInsight[] = [
    {
      category: "Architecture",
      headline:
        "Architecture Strategy: split product concerns into clear layers",
      detail:
        isComplex || isHighScale
          ? "Separate the web experience, business APIs, data layer, and background jobs so each layer can evolve without locking the whole product together. This keeps the stack resilient as features like payments, media, and AI grow."
          : "Keep the architecture modular even for a lean MVP: a frontend layer, a business API layer, and a managed data layer are enough to maintain clarity as the product grows.",
      recommendation: isComplex
        ? "Use a modular Next.js + API + managed database setup with background workers and explicit service boundaries."
        : "Start with a single app shell and extract services only when usage or complexity demands it.",
      priority: isComplex ? "high" : "medium",
    },
    {
      category: "Security",
      headline: "Security guardrails should be built before launch",
      detail:
        features.has("payments") || features.has("authentication")
          ? "Authentication, role controls, secrets management, and transaction auditing are essential for trust, especially when payments or sensitive user data are involved."
          : "Protect user accounts, admin workflows, and uploaded content with baseline security controls so the product can scale without high-risk gaps.",
      recommendation:
        isEthiopianMarket && features.has("payments")
          ? "Add strong payment validation, webhook verification, audit logs, and explicit retry handling for local gateways and mobile money flows."
          : "Enable multi-factor auth for admins, centralized secret storage, and strict permission checks for every API route.",
      priority: "high",
    },
    {
      category: "Delivery",
      headline: "Delivery plan: validate fast, then expand deliberately",
      detail: isFastLaunch
        ? "Ship the core user journey first, measure real adoption, and only add advanced infrastructure after the data shows where friction exists."
        : "A phased rollout helps the team stay focused on the highest-value business flow and keep the roadmap aligned with growth and technical constraints.",
      recommendation:
        requirements.teamSize === "solo" || requirements.teamSize === "2-5"
          ? "Launch a focused MVP in one milestone, then add analytics, background jobs, and scale improvements in a second milestone."
          : "Sequence the roadmap into core product, operational hardening, and scale-up workstreams so delivery stays predictable.",
      priority: "medium",
    },
    {
      category: "Growth",
      headline: "Growth strategy: optimize for adoption before overbuilding",
      detail:
        isMobileFirst || requirements.targetPlatforms.length > 1
          ? "Multi-platform delivery creates more opportunities, but it raises the cost of maintenance. Keep the product experience coherent and share as much business logic as possible across platforms."
          : "The best growth plan is not always a larger stack. It is a stack that makes onboarding, retention, and performance easy enough to improve over time.",
      recommendation: isHighScale
        ? "Add caching, observability, and performance budgets early to avoid large rework once traffic grows."
        : "Track activation, conversion, and feature usage so future investments are driven by data, not guesswork.",
      priority: isHighScale ? "high" : "medium",
    },
  ];

  if (features.has("ai") || features.has("video")) {
    insights.push({
      category: "Growth",
      headline: "AI and media workloads need a separate execution path",
      detail:
        "Inference, media processing, and file-heavy experiences should not be chained into the main application request flow. They need asynchronous processing, storage, and clear cost controls.",
      recommendation:
        "Move heavy AI or media jobs into queues and background workers, keep the app web responsive, and add usage limits to protect cost and performance.",
      priority: "high",
    });
  }

  return insights;
}
