import {
  getAdvisorProjectTypeId,
  projectCategoryOptions,
  requiredFeatureOptions,
  targetPlatformOptions,
} from "./project-requirements";
import { projectTypes } from "./project-types";
import { getProjectMapping, sortToolsForProject } from "./project-tool-mappings";
import { recommendedStacks } from "./recommended-stacks";
import { toolCategories } from "./tool-categories";
import { tools } from "./tools";
import type {
  ProjectCategory,
  RequiredFeature,
  TargetPlatform,
} from "./types";

export type ProjectDescriptionAnalysis = {
  projectCategory: ProjectCategory;
  projectType: string;
  summary: string;
  rationale: string;
  requiredFeatures: RequiredFeature[];
  targetPlatforms: TargetPlatform[];
  recommendedTools: Record<string, string>;
  recommendedToolReasons: Record<string, string>;
  confidence: "high" | "medium" | "low";
  source: "ai" | "local";
};

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

export function isProjectDescriptionAnalysis(
  value: unknown,
): value is Omit<ProjectDescriptionAnalysis, "source"> {
  if (typeof value !== "object" || value === null) return false;
  const analysis = value as Record<string, unknown>;
  const recommendedTools = analysis.recommendedTools;
  const recommendedToolReasons = analysis.recommendedToolReasons;
  const projectCategory = projectCategoryOptions.find(
    (option) => option.value === analysis.projectCategory,
  )?.value;
  return (
    projectCategory !== undefined &&
    projectTypes.some((project) => project.id === analysis.projectType) &&
    getAdvisorProjectTypeId(projectCategory) === analysis.projectType &&
    typeof analysis.summary === "string" &&
    analysis.summary.trim().length > 0 &&
    analysis.summary.length <= 1000 &&
    typeof analysis.rationale === "string" &&
    analysis.rationale.trim().length > 0 &&
    analysis.rationale.length <= 1000 &&
    Array.isArray(analysis.requiredFeatures) &&
    analysis.requiredFeatures.every((feature) =>
      requiredFeatureOptions.some((option) => option.value === feature),
    ) &&
    Array.isArray(analysis.targetPlatforms) &&
    analysis.targetPlatforms.every((platform) =>
      targetPlatformOptions.some((option) => option.value === platform),
    ) &&
    isStringRecord(recommendedTools) &&
    Object.entries(recommendedTools).every(([categoryId, toolId]) =>
      tools.some(
        (tool) => tool.category === categoryId && tool.id === toolId,
      ),
    ) &&
    isStringRecord(recommendedToolReasons) &&
    Object.entries(recommendedToolReasons).every(
      ([categoryId, reason]) =>
        typeof reason === "string" &&
        reason.trim().length > 0 &&
        reason.length <= 500 &&
        categoryId in recommendedTools,
    ) &&
    Object.keys(recommendedTools).every(
      (categoryId) => categoryId in recommendedToolReasons,
    ) &&
    ["high", "medium", "low"].includes(String(analysis.confidence))
  );
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function guessProjectCategory(description: string): ProjectCategory {
  const text = description.toLowerCase();

  if (
    includesAny(text, [
      "course",
      "student",
      "learning",
      "lesson",
      "lms",
      "classroom",
    ])
  )
    return "lms";
  if (includesAny(text, ["marketplace", "seller", "vendor", "buyer"]))
    return "marketplace";
  if (
    includesAny(text, [
      "shop",
      "store",
      "checkout",
      "product catalog",
      "e-commerce",
      "ecommerce",
    ])
  )
    return "ecommerce";
  if (
    includesAny(text, [
      "fintech",
      "wallet",
      "payment platform",
      "banking",
      "money transfer",
    ])
  )
    return "fintech";
  if (
    includesAny(text, [
      "clinic",
      "patient",
      "doctor",
      "telemedicine",
      "healthcare",
    ])
  )
    return "healthcare";
  if (
    includesAny(text, ["booking", "appointment", "reservation", "schedule"])
  )
    return "booking";
  if (includesAny(text, ["property listing", "real estate", "rental"]))
    return "realestate";
  if (
    includesAny(text, [
      "social network",
      "community",
      "messaging",
      "social platform",
    ])
  )
    return "social";
  if (
    includesAny(text, [
      "erp",
      "inventory",
      "human resources",
      "internal operations",
      "crm",
    ])
  )
    return "internal-business";
  if (includesAny(text, ["portfolio", "personal website", "showcase"]))
    return "portfolio";
  if (includesAny(text, ["api", "backend service", "microservice"]))
    return "api-backend";
  if (includesAny(text, ["mobile app", "ios app", "android app", "smartphone"]))
    return "mobile-app";
  if (
    includesAny(text, [
      "ai ",
      "artificial intelligence",
      "machine learning",
      "llm",
      "copilot",
    ])
  )
    return "ai-app";
  if (includesAny(text, ["subscription", "saas", "multi-tenant"])) return "saas";
  return "other";
}

function getStackProjectType(category: ProjectCategory, description: string) {
  const text = description.toLowerCase();
  if (category === "marketplace" || category === "ecommerce")
    return "ecommerce";
  if (category === "lms") return "lms";
  if (category === "social") return "social";
  if (category === "internal-business") return "erp";
  if (category === "portfolio") return "content";
  if (category === "mobile-app") return "mobile-app";
  if (category === "ai-app") return "ai-app";
  if (category === "api-backend") return "api-backend";
  if (category === "fintech") return "fintech";
  if (category === "healthcare") return "healthcare";
  if (category === "booking") return "booking";
  if (category === "realestate") return "realestate";
  return "saas";
}

function recommendTools(projectType: string): Record<string, string> {
  const mapping = getProjectMapping(projectType);
  const recommendedStack = recommendedStacks.find(
    (stack) => stack.projectType === projectType && stack.isPrimary,
  );

  return Object.fromEntries(
    toolCategories.flatMap((category) => {
      if (mapping?.hideCategories.includes(category.id)) return [];
      const available = sortToolsForProject(
        tools.filter((tool) => tool.category === category.id),
        category.id,
        mapping,
      );
      const suggestedId = recommendedStack?.selections[category.id];
      const suggested = available.find((tool) => tool.id === suggestedId);
      const fallback =
        suggested ??
        available.find((tool) => tool.recommended) ??
        available[0];

      return fallback ? [[category.id, fallback.id]] : [];
    }),
  );
}

export function buildLocalProjectDescriptionAnalysis(
  description: string,
): ProjectDescriptionAnalysis {
  const text = description.toLowerCase();
  const projectCategory = guessProjectCategory(description);
  const projectType = getStackProjectType(projectCategory, description);
  const requiredFeatures: RequiredFeature[] = includesAny(text, [
    "account",
    "login",
    "sign in",
    "user profile",
  ])
    ? ["authentication"]
    : [];

  const featureKeywords: Array<[RequiredFeature, string[]]> = [
    ["payments", ["payment", "checkout", "billing", "subscription", "wallet"]],
    ["file-uploads", ["upload", "file", "document", "image", "photo"]],
    ["video", ["video", "stream", "lecture"]],
    ["real-time-communication", ["chat", "messaging", "real-time", "live"]],
    ["notifications", ["notification", "reminder", "email"]],
    ["search", ["search", "filter", "discover"]],
    ["analytics", ["analytics", "report", "dashboard", "insight"]],
    [
      "ai",
      ["ai ", "artificial intelligence", "machine learning", "llm", "copilot"],
    ],
    ["background-jobs", ["background", "queue", "scheduled", "automation"]],
    ["admin-dashboard", ["admin", "manage", "management", "moderation"]],
    ["multi-tenancy", ["multi-tenant", "organizations", "multiple businesses"]],
  ];

  featureKeywords.forEach(([feature, keywords]) => {
    if (includesAny(text, keywords) && !requiredFeatures.includes(feature)) {
      requiredFeatures.push(feature);
    }
  });

  const targetPlatforms: TargetPlatform[] =
    /\bmobile\b.{0,24}\b(app|application|platform|shopping|store)\b|\b(ios|android|smartphone)\b/i.test(
      description,
    )
    ? ["mobile", "web"]
    : ["web"];
  const recommendedTools = recommendTools(projectType);

  const projectLabels: Record<ProjectCategory, string> = {
    saas: "SaaS platform",
    ecommerce: "E-commerce platform",
    lms: "Learning platform",
    marketplace: "Marketplace",
    social: "Social platform",
    "mobile-app": "Mobile application",
    "ai-app": "AI application",
    "internal-business": "Internal business application",
    portfolio: "Portfolio / content platform",
    "api-backend": "API / backend service",
    fintech: "Fintech platform",
    healthcare: "Healthcare platform",
    realestate: "Real estate platform",
    booking: "Booking / reservation platform",
    other: "Custom application",
  };

  return {
    projectCategory,
    projectType,
    summary: `This appears to be a ${projectLabels[projectCategory]} focused on: ${description.trim().slice(0, 220)}${description.trim().length > 220 ? "…" : ""}`,
    rationale:
      "This is an initial local suggestion because AI analysis is temporarily unavailable. Review the category and feature suggestions before continuing.",
    requiredFeatures,
    targetPlatforms,
    recommendedTools,
    recommendedToolReasons: Object.fromEntries(
      Object.entries(recommendedTools).map(([categoryId, toolId]) => [
        categoryId,
        `${toolId} is a sensible starting point for the ${categoryId.replace(/_/g, " ")} layer of this ${projectCategory} project.`,
      ]),
    ),
    confidence: "low",
    source: "local",
  };
}
