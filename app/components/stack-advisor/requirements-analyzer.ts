import type {
  ProjectCategory,
  ProjectRequirements,
  RequirementCategory,
  RequirementItem,
  RequirementsAnalysisResult,
  RequirementsAnalysisScore,
} from "./types";

const projectCategoryLabels: Record<ProjectCategory, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  lms: "LMS",
  marketplace: "Marketplace",
  social: "Social platform",
  "mobile-app": "Mobile application",
  "ai-app": "AI application",
  "internal-business": "Internal business application",
  portfolio: "Portfolio",
  "api-backend": "API / backend",
  other: "Other",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function scoreRangeFromValue(value: string | undefined): number {
  switch (value) {
    case "under-100":
      return 25;
    case "100-1000":
      return 40;
    case "1000-10000":
      return 60;
    case "10000-100000":
      return 80;
    case "100000-plus":
      return 100;
    default:
      return 50;
  }
}

function computeComplexityScore(requirements: ProjectRequirements): number {
  let score = 20;

  if (requirements.requiredFeatures.includes("ai")) score += 18;
  if (requirements.requiredFeatures.includes("payments")) score += 12;
  if (requirements.requiredFeatures.includes("video")) score += 10;
  if (requirements.requiredFeatures.includes("real-time-communication"))
    score += 12;
  if (requirements.requiredFeatures.includes("background-jobs")) score += 10;
  if (requirements.requiredFeatures.includes("multi-tenancy")) score += 12;
  if (requirements.requiredFeatures.includes("analytics")) score += 8;
  if (requirements.targetPlatforms.includes("multiple")) score += 10;
  if (requirements.targetPlatforms.includes("mobile")) score += 8;
  if (requirements.targetUsers === "enterprise") score += 8;
  if (requirements.developerExperience === "beginner") score -= 6;
  if (requirements.developmentPriority === "max-scalability") score += 10;
  if (requirements.developmentPriority === "fast-mvp") score -= 6;
  if (requirements.budget === "free" || requirements.budget === "under-50")
    score -= 4;

  score += Math.round(scoreRangeFromValue(requirements.expectedUsers) / 10);

  return clamp(score, 15, 100);
}

function computeScalabilityScore(requirements: ProjectRequirements): number {
  let score = 35;

  if (
    requirements.projectCategory === "saas" ||
    requirements.projectCategory === "lms"
  )
    score += 20;
  if (requirements.requiredFeatures.includes("multi-tenancy")) score += 15;
  if (requirements.requiredFeatures.includes("background-jobs")) score += 12;
  if (requirements.requiredFeatures.includes("analytics")) score += 8;
  if (requirements.requiredFeatures.includes("search")) score += 8;
  if (requirements.requiredFeatures.includes("ai")) score += 12;
  if (requirements.expectedUsers === "100000-plus") score += 20;
  if (requirements.expectedUsers === "10000-100000") score += 10;
  if (requirements.developmentPriority === "max-scalability") score += 15;
  if (requirements.developmentPriority === "fast-mvp") score -= 10;

  return clamp(score, 10, 100);
}

function computeSecurityBaselineScore(
  requirements: ProjectRequirements,
): number {
  let score = 45;

  if (requirements.requiredFeatures.includes("authentication")) score += 20;
  if (requirements.requiredFeatures.includes("payments")) score += 20;
  if (requirements.requiredFeatures.includes("file-uploads")) score += 10;
  if (requirements.requiredFeatures.includes("ai")) score += 8;
  if (requirements.targetUsers === "enterprise") score += 10;
  if (requirements.developmentPriority === "lowest-cost") score -= 8;
  if (requirements.projectCategory === "portfolio") score -= 5;

  return clamp(score, 20, 100);
}

function makeRequirement(
  id: string,
  title: string,
  category: RequirementCategory,
  priority: "low" | "medium" | "high" | "critical",
  rationale: string,
): RequirementItem {
  return { id, title, category, priority, rationale };
}

function buildFunctionalRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  if (requirements.requiredFeatures.includes("authentication")) {
    items.push(
      makeRequirement(
        "auth",
        "Authentication",
        "functional",
        "critical",
        "User identity and access control are required for a secure user experience.",
      ),
    );
  }

  if (requirements.projectCategory === "lms") {
    items.push(
      makeRequirement(
        "course-management",
        "Course management",
        "functional",
        "high",
        "A learning platform needs content creation, publishing, and enrollment workflows.",
      ),
      makeRequirement(
        "video-lessons",
        "Video lessons",
        "functional",
        "high",
        "Video-based delivery is a core learning experience for students and cohorts.",
      ),
      makeRequirement(
        "progress-tracking",
        "Progress tracking",
        "functional",
        "high",
        "Learners must track completion and achievement across lessons and assessments.",
      ),
    );
  }

  if (
    requirements.projectCategory === "ecommerce" ||
    requirements.requiredFeatures.includes("payments")
  ) {
    items.push(
      makeRequirement(
        "payments",
        "Payments",
        "functional",
        "critical",
        "Checkout and payment processing are required to support transactions and revenue flows.",
      ),
    );
  }

  if (
    requirements.projectCategory === "saas" ||
    requirements.projectCategory === "internal-business"
  ) {
    items.push(
      makeRequirement(
        "dashboard",
        "Admin dashboard",
        "functional",
        "high",
        "A usable operator dashboard is essential for management and reporting.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("file-uploads")) {
    items.push(
      makeRequirement(
        "file-uploads",
        "File uploads",
        "functional",
        "high",
        "Users need to upload, review, and manage files or media content.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("video")) {
    items.push(
      makeRequirement(
        "video-streaming",
        "Video streaming",
        "functional",
        "high",
        "Video playback and delivery are a core feature for engagement or training.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("search")) {
    items.push(
      makeRequirement(
        "search",
        "Search",
        "functional",
        "medium",
        "Search accelerates content discovery and reduces friction in product workflows.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("analytics")) {
    items.push(
      makeRequirement(
        "analytics",
        "Analytics",
        "functional",
        "medium",
        "Usage, conversion, and operational analytics help track product performance.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("ai")) {
    items.push(
      makeRequirement(
        "ai-features",
        "AI-assisted workflows",
        "functional",
        "medium",
        "AI features require structured prompts, model integration, and evaluation flows.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("notifications")) {
    items.push(
      makeRequirement(
        "notifications",
        "Notifications",
        "functional",
        "medium",
        "User notifications support engagement, reminders, and operational updates.",
      ),
    );
  }

  return items;
}

function buildNonFunctionalRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  if (requirements.expectedUsers !== "under-100") {
    items.push(
      makeRequirement(
        "high-availability",
        "High availability",
        "non-functional",
        "high",
        "Growing user volume requires resilient services and better failover planning.",
      ),
    );
  }

  items.push(
    makeRequirement(
      "responsive-ui",
      "Responsive UI",
      "non-functional",
      "high",
      "Users expect a smooth product experience across devices and screen sizes.",
    ),
    makeRequirement(
      "secure-auth",
      "Secure authentication",
      "non-functional",
      "critical",
      "Identity and access controls must be protected with strong defaults and auditing.",
    ),
  );

  if (requirements.targetUsers === "enterprise") {
    items.push(
      makeRequirement(
        "auditability",
        "Auditability",
        "non-functional",
        "high",
        "Enterprise environments require stronger operational traceability and user activity visibility.",
      ),
    );
  }

  if (requirements.expectedUsers === "100000-plus") {
    items.push(
      makeRequirement(
        "global-resilience",
        "Global resilience",
        "non-functional",
        "high",
        "Large-scale products need multi-region and failover-aware architecture patterns.",
      ),
    );
  }

  return items;
}

function buildInfrastructureRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  items.push(
    makeRequirement(
      "application-hosting",
      "Application hosting",
      "infrastructure",
      "high",
      "A reliable hosting layer is required for the application runtime and deployment pipeline.",
    ),
  );

  if (
    requirements.projectCategory === "lms" ||
    requirements.requiredFeatures.includes("video")
  ) {
    items.push(
      makeRequirement(
        "cdn",
        "CDN / media delivery",
        "infrastructure",
        "high",
        "Media-heavy workloads need edge delivery and effective buffering or stream optimization.",
      ),
      makeRequirement(
        "object-storage",
        "Object storage",
        "infrastructure",
        "high",
        "Large media or file workloads require durable storage and scale-friendly delivery.",
      ),
    );
  }

  if (
    requirements.requiredFeatures.includes("background-jobs") ||
    requirements.requiredFeatures.includes("ai")
  ) {
    items.push(
      makeRequirement(
        "job-workers",
        "Background worker infrastructure",
        "infrastructure",
        "medium",
        "Async jobs, workers, and queue processing can help decouple heavy processing from the web layer.",
      ),
    );
  }

  if (requirements.expectedUsers !== "under-100") {
    items.push(
      makeRequirement(
        "monitoring",
        "Monitoring and observability",
        "infrastructure",
        "high",
        "As traffic grows, the platform needs logs, alerts, and application metrics to maintain stability.",
      ),
    );
  }

  return items;
}

function buildDataRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  items.push(
    makeRequirement(
      "database",
      "Relational or document database",
      "data",
      "critical",
      "A data layer is essential for storing users, transactions, content, and operational records.",
    ),
  );

  if (
    requirements.requiredFeatures.includes("file-uploads") ||
    requirements.requiredFeatures.includes("video")
  ) {
    items.push(
      makeRequirement(
        "media-data-model",
        "Media metadata and asset management",
        "data",
        "high",
        "The platform must track file metadata, storage location, access permissions, and lifecycle policies.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("analytics")) {
    items.push(
      makeRequirement(
        "event-data",
        "Event and analytics data",
        "data",
        "medium",
        "The app needs clean event collection and reporting to track product usage and performance.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("multi-tenancy")) {
    items.push(
      makeRequirement(
        "tenant-data-isolation",
        "Tenant-aware data isolation",
        "data",
        "high",
        "Multi-tenant systems need strong boundaries between organizations, resources, and access rights.",
      ),
    );
  }

  return items;
}

function buildSecurityRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  items.push(
    makeRequirement(
      "rbac",
      "Role-based access control",
      "security",
      "critical",
      "The application should protect the right data and actions for different user roles.",
    ),
    makeRequirement(
      "secret-management",
      "Secure secret management",
      "security",
      "high",
      "Configuration secrets, API keys, and environment values must not be hard-coded or exposed.",
    ),
  );

  if (requirements.requiredFeatures.includes("payments")) {
    items.push(
      makeRequirement(
        "payment-security",
        "Payment security",
        "security",
        "critical",
        "Payment flows should enforce PCI-conscious practices and protect user financial data.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("file-uploads")) {
    items.push(
      makeRequirement(
        "file-validation",
        "File validation and scanning",
        "security",
        "high",
        "Uploads should be validated for type, size, and malicious content to reduce platform risk.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("ai")) {
    items.push(
      makeRequirement(
        "prompt-safety",
        "Prompt and model safety checks",
        "security",
        "medium",
        "AI workflows should protect prompts, sensitive data, and model access boundaries.",
      ),
    );
  }

  return items;
}

function buildScalabilityRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  if (requirements.expectedUsers !== "under-100") {
    items.push(
      makeRequirement(
        "horizontal-scaling",
        "Horizontal scaling readiness",
        "scalability",
        "high",
        "The architecture should support scale-out patterns as traffic and demand increase.",
      ),
    );
  }

  if (
    requirements.requiredFeatures.includes("search") ||
    requirements.requiredFeatures.includes("analytics")
  ) {
    items.push(
      makeRequirement(
        "search-scaling",
        "Search and analytics scaling",
        "scalability",
        "medium",
        "Large content or event volumes require indexing and query strategies that scale.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("multi-tenancy")) {
    items.push(
      makeRequirement(
        "tenant-scaling",
        "Tenant growth strategy",
        "scalability",
        "high",
        "Multi-tenant workloads must scale without cross-tenant performance degradation.",
      ),
    );
  }

  if (
    requirements.developmentPriority === "max-scalability" ||
    requirements.expectedUsers === "100000-plus"
  ) {
    items.push(
      makeRequirement(
        "caching",
        "Caching and query optimization",
        "scalability",
        "high",
        "Caching and intelligent query design are essential for improving throughput and response time.",
      ),
    );
  }

  return items;
}

function buildPerformanceRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  items.push(
    makeRequirement(
      "fast-response-times",
      "Fast response times",
      "performance",
      "high",
      "Users expect a smooth interface and quick results in both reading and writing flows.",
    ),
  );

  if (
    requirements.requiredFeatures.includes("video") ||
    requirements.projectCategory === "lms"
  ) {
    items.push(
      makeRequirement(
        "streaming-quality",
        "Video streaming performance",
        "performance",
        "high",
        "Video delivery needs bandwidth awareness, buffering strategy, and higher-quality edge caching.",
      ),
    );
  }

  if (
    requirements.requiredFeatures.includes("search") ||
    requirements.requiredFeatures.includes("analytics")
  ) {
    items.push(
      makeRequirement(
        "query-performance",
        "Query performance",
        "performance",
        "medium",
        "Search and analytics flows should remain responsive even as data volume increases.",
      ),
    );
  }

  return items;
}

function buildIntegrationRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  if (requirements.requiredFeatures.includes("payments")) {
    items.push(
      makeRequirement(
        "payment-provider",
        "Payment gateway integration",
        "integration",
        "critical",
        "The platform must support secure and reliable payment provider integration with reconciliation flows.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("notifications")) {
    items.push(
      makeRequirement(
        "notification-provider",
        "Notification integration",
        "integration",
        "medium",
        "Delivery, SMS, push, or email providers should be integrated for user alerts and status updates.",
      ),
    );
  }

  if (requirements.requiredFeatures.includes("ai")) {
    items.push(
      makeRequirement(
        "llm-or-model-integration",
        "LLM / model integration",
        "integration",
        "medium",
        "AI features should integrate with a model provider and handle failures or latency gracefully.",
      ),
    );
  }

  if (requirements.projectCategory === "ecommerce") {
    items.push(
      makeRequirement(
        "inventory-sync",
        "Inventory and fulfillment integration",
        "integration",
        "medium",
        "E-commerce systems often require integration with stock, delivery, or order-management services.",
      ),
    );
  }

  return items;
}

function buildDevOpsRequirements(
  requirements: ProjectRequirements,
): RequirementItem[] {
  const items: RequirementItem[] = [];

  items.push(
    makeRequirement(
      "ci-cd",
      "CI/CD pipeline",
      "devops",
      "high",
      "A repeatable deployment process reduces release risk and increases delivery confidence.",
    ),
    makeRequirement(
      "environment-management",
      "Environment management",
      "devops",
      "high",
      "The team needs isolated environments for development, staging, and production.",
    ),
  );

  if (requirements.expectedUsers !== "under-100") {
    items.push(
      makeRequirement(
        "observability-pipeline",
        "Observability pipeline",
        "devops",
        "high",
        "Production systems need alerts, logs, metrics, and proper health checks for support and uptime.",
      ),
    );
  }

  if (
    requirements.targetPlatforms.includes("mobile") ||
    requirements.targetPlatforms.includes("desktop")
  ) {
    items.push(
      makeRequirement(
        "release-management",
        "Release management",
        "devops",
        "medium",
        "Mobile or desktop targets need versioning, store distribution, and update workflows.",
      ),
    );
  }

  return items;
}

function inferProjectClassification(
  requirements: ProjectRequirements,
): RequirementsAnalysisResult["projectClassification"] {
  const categoryKey = requirements.projectCategory;
  return {
    project: projectCategoryLabels[categoryKey] || "Project",
    category: categoryKey,
    summary: `${projectCategoryLabels[categoryKey] || "This project"} is being shaped around ${requirements.expectedUsers} users, ${requirements.targetPlatforms.join(", ") || "web"} target platforms, and a ${requirements.developmentPriority.replace("-", " ")} delivery focus.`,
    confidence: "high",
  };
}

function calculateScoring(
  requirements: ProjectRequirements,
): RequirementsAnalysisScore {
  const requirementScore = Math.round(
    ((requirements.requiredFeatures.length / 13) * 35 +
      scoreRangeFromValue(requirements.expectedUsers) * 0.4 +
      (requirements.targetPlatforms.length / 5) * 20 +
      (requirements.developmentPriority ? 15 : 0)) *
      1.2,
  );

  const complexityScore = computeComplexityScore(requirements);
  const scalabilityScore = computeScalabilityScore(requirements);
  const securityBaselineScore = computeSecurityBaselineScore(requirements);

  const readinessScore = clamp(
    Math.round(
      (requirementScore +
        complexityScore +
        scalabilityScore +
        securityBaselineScore) /
        4,
    ),
    0,
    100,
  );

  return {
    requirementScore: clamp(requirementScore, 0, 100),
    complexityScore,
    scalabilityScore,
    securityBaselineScore,
    readinessScore,
  };
}

export function analyzeProjectRequirements(
  requirements: ProjectRequirements,
): RequirementsAnalysisResult {
  const projectClassification = inferProjectClassification(requirements);

  const functionalRequirements = buildFunctionalRequirements(requirements);
  const nonFunctionalRequirements =
    buildNonFunctionalRequirements(requirements);
  const infrastructureRequirements =
    buildInfrastructureRequirements(requirements);
  const dataRequirements = buildDataRequirements(requirements);
  const securityRequirements = buildSecurityRequirements(requirements);
  const scalabilityRequirements = buildScalabilityRequirements(requirements);
  const performanceRequirements = buildPerformanceRequirements(requirements);
  const integrationRequirements = buildIntegrationRequirements(requirements);
  const devOpsRequirements = buildDevOpsRequirements(requirements);

  const scoring = calculateScoring(requirements);

  return {
    projectClassification,
    functionalRequirements,
    nonFunctionalRequirements,
    infrastructureRequirements,
    dataRequirements,
    securityRequirements,
    scalabilityRequirements,
    performanceRequirements,
    integrationRequirements,
    devOpsRequirements,
    scoring,
  };
}
