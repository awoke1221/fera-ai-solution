import type { ProjectRequirements } from "./types";

export type DeploymentOption = {
  title: string;
  summary: string;
  advantages: string[];
  readinessChecklist: string[];
  bestFor: string;
};

export type DeploymentReadinessAssessment = {
  overallScore: number;
  recommendedStrategy: string[];
  readyForProduction: string[];
  deploymentOptions: DeploymentOption[];
  riskNotes: string[];
  rolloutPlan: string[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function buildDeploymentReadinessAssessment(
  requirements: ProjectRequirements,
): DeploymentReadinessAssessment {
  const featureSet = new Set(requirements.requiredFeatures);

  const isHighScale =
    requirements.expectedUsers === "10000-100000" ||
    requirements.expectedUsers === "100000-plus";
  const hasPayments = featureSet.has("payments");
  const hasAI = featureSet.has("ai");
  const hasRealtime = featureSet.has("real-time-communication");
  const hasVideo = featureSet.has("video");
  const mobileFirst = requirements.targetPlatforms.includes("mobile");
  const isEnterprise = requirements.targetUsers === "enterprise";

  let score = 58;
  if (hasPayments) score += 12;
  if (hasAI) score += 8;
  if (hasRealtime) score += 6;
  if (hasVideo) score += 4;
  if (mobileFirst) score += 5;
  if (isEnterprise) score += 8;
  if (isHighScale) score += 8;
  if (requirements.budget === "free" || requirements.budget === "under-50")
    score -= 10;
  if (requirements.developerExperience === "beginner") score -= 6;
  if (requirements.timeToLaunch === "under-2-weeks") score -= 8;

  const overallScore = clamp(score, 25, 96);

  const recommendedStrategy = [
    "Use a production-ready hosting model with a managed app runtime, managed database, and a dedicated edge layer for static assets and caching.",
    "Separate the public application from background services so payment, AI, and asynchronous jobs do not interfere with the user experience.",
    "Add CI/CD, automated health checks, and staged log aggregation before launch to ensure reliable deployment.",
  ];

  const readyForProduction = [
    "Production environment variables are isolated from local secrets and stored in a managed secret store.",
    "Health checks, rollback automation, and zero-downtime release process are configured.",
    "Database backups, retention policies, and restore testing are defined and validated.",
    "Observability is enabled with request tracing, error capture, and system metrics from day one.",
    "Load balancing, WAF, and rate limiting are designed for external exposure if the app is internet-facing.",
  ];

  const deploymentOptions: DeploymentOption[] = [
    {
      title: "Managed modern platform",
      summary:
        "The best default model for SaaS, e-commerce, and product teams that want rapid shipping with strong operational reliability.",
      advantages: [
        "Fastest path to production and lower ops burden",
        "Built-in scaling, CDN, and deployment automation",
        "Simple rollback and preview environment workflow",
        "Strong fit for modern frontend and API architectures",
      ],
      readinessChecklist: [
        "App is containerized or deploys through the platform runtime",
        "Managed database and object storage are provisioned",
        "Domain, TLS, and WAF rules are configured",
        "CI/CD pipeline deploys automatically on protected branches",
      ],
      bestFor:
        "MVPs, SaaS products, growth-stage apps, and teams that want velocity without a large ops team",
    },
    {
      title: "Containerized multi-service platform",
      summary:
        "The preferred model for more sophisticated products with queue workers, AI processing, complex APIs, or a need for custom runtime control.",
      advantages: [
        "Clear service boundaries for core app and worker jobs",
        "Portable deployment across clouds and edge environments",
        "Better for long-term optimization and internal platform controls",
        "Supports multi-region rollout and governance requirements",
      ],
      readinessChecklist: [
        "Service mesh or internal network segmentation is planned",
        "Worker queues and task retries are implemented",
        "Container image signing and vulnerability scanning are active",
        "Runtime health and scaling policies are in place",
      ],
      bestFor:
        "High-complexity products, AI workflows, B2B systems, and teams with strong engineering maturity",
    },
    {
      title: "Hybrid edge + app platform",
      summary:
        "A strong option when performance, regional delivery, geography-specific compliance, or marketing traffic spikes are a priority.",
      advantages: [
        "Lower latency through compute closer to users",
        "Better handling of bursty traffic and regional traffic spikes",
        "Flexible setup for multi-region or country-level expansion",
        "Supports global delivery without sacrificing core performance",
      ],
      readinessChecklist: [
        "Regional latency and availability targets are defined",
        "Origin caching and invalidation strategy is documented",
        "Monitoring covers edge or regional failures clearly",
        "CDN and DNS failover are tested before launch",
      ],
      bestFor:
        "Global products, consumer services, mobile-heavy apps, and regional growth strategies",
    },
    {
      title: "Enterprise regulated deployment",
      summary:
        "A formal pattern for environments with strict compliance, auditability, or business-critical operations needs.",
      advantages: [
        "Strong governance and reproducible infrastructure",
        "Compliance-friendly logging, access controls, and change tracking",
        "A more resilient operating model for regulated sectors",
        "Predictable cost and security posture at scale",
      ],
      readinessChecklist: [
        "Governance policies, change management, and approval workflows are in place",
        "Detailed security review and backup recovery drill are completed",
        "Infrastructure is version-controlled and reproducible",
        "Support model and escalation plan are documented",
      ],
      bestFor:
        "Enterprise applications, finance workflows, internal business systems, and compliance-heavy launches",
    },
  ];

  const riskNotes = [
    "Do not deploy with debug mode, public admin routes, or unrestricted CORS settings in production.",
    "If payments are in scope, validate provider webhook signatures, idempotency, and retry behavior before public release.",
    "If AI or video workloads are included, add request throttling, queueing, and cost guardrails to avoid runaway spend.",
    "For multi-region or mobile-heavy usage, define latency budgets and region failover before the launch window.",
  ];

  const rolloutPlan = [
    "Phase 1: deploy an internal or staging environment that mirrors production topology and traffic patterns.",
    "Phase 2: test production readiness with smoke checks, payment verification, secret rotation, and observability validation.",
    "Phase 3: release a limited production audience, monitor KPIs and incidents, and gradually expand rollout.",
    "Phase 4: complete production hardening, cost review, and automation for recurring platform operations.",
  ];

  return {
    overallScore,
    recommendedStrategy,
    readyForProduction,
    deploymentOptions,
    riskNotes,
    rolloutPlan,
  };
}
