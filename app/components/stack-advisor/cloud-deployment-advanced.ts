import type { ProjectRequirements } from "./types";

export type CloudCostEntry = {
  provider: string;
  architecture: string;
  monthlyEstimate: string;
  notes: string[];
};

export type ProviderBlueprint = {
  provider: string;
  architecture: string[];
  services: string[];
  reason: string;
  estimatedCost: string;
};

export type DeploymentRoadmapPhase = {
  title: string;
  objective: string;
  focus: string[];
  outcome: string;
};

export type DeploymentDecisionBoardEntry = {
  recommendedPhase: string;
  targetProvider: string;
  rolloutWindow: string;
  riskLevel: "Low" | "Moderate" | "High";
  investmentProfile: string;
  reasoning: string;
};

export type DeploymentPattern = {
  title: string;
  summary: string;
  recommendedArchitecture: string[];
  whenToUse: string[];
  providerBlueprints: ProviderBlueprint[];
  roadmap: DeploymentRoadmapPhase[];
  decisionBoard: DeploymentDecisionBoardEntry[];
};

export function buildCloudCostComparison(
  requirements: ProjectRequirements,
  selectedToolIds: string[] = [],
): CloudCostEntry[] {
  const features = new Set(requirements.requiredFeatures);
  const isHighScale =
    requirements.expectedUsers === "10000-100000" ||
    requirements.expectedUsers === "100000-plus";
  const hasAI = features.has("ai");
  const hasBackgroundJobs = features.has("background-jobs");
  const hasUploads = features.has("file-uploads");
  const hasPayments = features.has("payments");
  const needsExtraCapacityPlanning =
    isHighScale || hasAI || hasBackgroundJobs || hasUploads || hasPayments;
  const selectedDeploymentName: Record<string, string> = {
    vercel: "Vercel",
    netlify: "Netlify",
    railway: "Railway",
    render: "Render",
    docker_vps: "Docker on VPS",
  };
  const selectedDeployment = selectedToolIds
    .map((toolId) => selectedDeploymentName[toolId])
    .find(Boolean);

  const baseEntries: CloudCostEntry[] = [
    {
      provider: "AWS",
      architecture: "EKS + RDS + S3 + CloudFront + ALB + Redis + SQS",
      monthlyEstimate: "Requires workload-specific pricing",
      notes: [
        "Best for enterprise-scale reliability and operational control",
        "Strong security baseline and orchestration maturity",
        "Higher engineering overhead but most resilient at scale",
        "Estimate with region, instance sizes, traffic, storage, backups, and support tier",
      ],
    },
    {
      provider: "Azure",
      architecture:
        "AKS + PostgreSQL + Blob Storage + Front Door + Redis + Service Bus",
      monthlyEstimate: "Requires workload-specific pricing",
      notes: [
        "Very strong for enterprise identity and compliance flows",
        "Good hybrid platform fit for regulated customers",
        "Predictable and mature for corporate environments",
        "Estimate with region, instance sizes, traffic, storage, backups, and support tier",
      ],
    },
    {
      provider: "Google Cloud",
      architecture: "GKE + Cloud SQL + GCS + Cloud CDN + Memorystore + Pub/Sub",
      monthlyEstimate: "Requires workload-specific pricing",
      notes: [
        "Excellent for AI and analytics-heavy products",
        "Strong managed data and compute story",
        "Requires stronger platform design discipline for some workloads",
        "Estimate with region, instance sizes, traffic, storage, backups, and support tier",
      ],
    },
    {
      provider: "Managed App Platform",
      architecture: "Vercel + Postgres + object storage + queue workers + CDN",
      monthlyEstimate: "Requires workload-specific pricing",
      notes: [
        "Fastest deployment path and smallest ops burden",
        "Best for MVPs, rapid shipping, and lean product teams",
        "Less control for highly complex infra or strict enterprise security",
        "Estimate using selected services, region, bandwidth, and managed database pricing",
        ...(selectedDeployment
          ? [`Selected deployment layer includes ${selectedDeployment}; confirm service boundaries and provider fit.`]
          : []),
      ],
    },
  ];

  if (needsExtraCapacityPlanning) {
    return baseEntries.map((entry) => ({
      ...entry,
      notes: [
        ...entry.notes,
        "Capacity planning is especially important for this scope; estimate storage, queueing, observability, and request protection from actual workloads.",
      ],
    }));
  }

  return baseEntries;
}

export function selectDeploymentPattern(
  requirements: ProjectRequirements,
  selectedToolIds: string[] = [],
): DeploymentPattern {
  const features = new Set(requirements.requiredFeatures);
  const isEnterprise = requirements.targetUsers === "enterprise";
  const isHighScale =
    requirements.expectedUsers === "10000-100000" ||
    requirements.expectedUsers === "100000-plus";
  const hasAI = features.has("ai");
  const hasBackgroundJobs = features.has("background-jobs");
  const hasUploads = features.has("file-uploads");
  const hasRealtime = features.has("real-time-communication");
  const selectedDeploymentName: Record<string, string> = {
    vercel: "Vercel",
    netlify: "Netlify",
    railway: "Railway",
    render: "Render",
    docker_vps: "Docker on VPS",
  };
  const selectedDeployment = selectedToolIds
    .map((toolId) => selectedDeploymentName[toolId])
    .find(Boolean);
  const recommendedProvider =
    selectedDeployment ??
    (isEnterprise ||
    isHighScale ||
    hasAI ||
    hasBackgroundJobs ||
    hasRealtime
      ? "AWS"
      : "Managed App Platform");

  const blueprints: ProviderBlueprint[] = [
    {
      provider: "AWS",
      architecture: [
        "Elastic Load Balancing + ECS or EKS for app runtime",
        "RDS or Aurora for transactional data",
        "S3 + CloudFront for static assets and uploads",
        "SQS + ECS workers for async job processing",
      ],
      services: ["EKS/ECS", "RDS", "S3", "CloudFront", "SQS", "CloudWatch"],
      reason:
        "AWS is the strongest default for serious scale, enterprise security, and production-grade operational control.",
      estimatedCost: "Requires workload-specific pricing",
    },
    {
      provider: "Azure",
      architecture: [
        "AKS or App Service for runtime",
        "Azure Database for PostgreSQL",
        "Azure Blob Storage + Front Door",
        "Service Bus + background worker services",
      ],
      services: [
        "AKS",
        "Azure Database",
        "Blob Storage",
        "Front Door",
        "Service Bus",
      ],
      reason:
        "Azure is an excellent fit for enterprise identity, compliance, and hybrid environments with strong governance requirements.",
      estimatedCost: "Requires workload-specific pricing",
    },
    {
      provider: "Google Cloud",
      architecture: [
        "GKE or Cloud Run for app runtime",
        "Cloud SQL for transactional workloads",
        "Cloud Storage + Cloud CDN for asset delivery",
        "Pub/Sub + Cloud Run workers for asynchronous tasks",
      ],
      services: ["GKE", "Cloud SQL", "Cloud Storage", "Cloud CDN", "Pub/Sub"],
      reason:
        "Google Cloud works especially well for AI, analytics, and modern data-rich workloads with managed service depth.",
      estimatedCost: "Requires workload-specific pricing",
    },
  ];

  const roadmap: DeploymentRoadmapPhase[] = [
    {
      title: "MVP launch",
      objective:
        "Ship the first production version with the smallest sustainable operational footprint.",
      focus: [
        "Managed deployment for the app and API layer",
        "Minimal but reliable database and secret management",
        "CI/CD, staging, rollback, and observability from day one",
      ],
      outcome:
        "Rapid validation with a stable foundation that can be upgraded without a rewrite.",
    },
    {
      title: "Scale-up phase",
      objective:
        "Handle growth in traffic, complexity, and user expectations without service degradation.",
      focus: [
        "Autoscaling, queue-based background workers, and performance budgets",
        "Caching, CDN, and database optimization for traffic spikes",
        "Operational dashboards, alerts, and incident response rollbooks",
      ],
      outcome:
        "Predictable user experience and controlled infrastructure cost as volume increases.",
    },
    {
      title: "Enterprise production hardening",
      objective:
        "Protect the platform against security, resilience, and governance failures before broad enterprise usage.",
      focus: [
        "Strict identity controls, audit logs, and least-privilege access",
        "Backup testing, disaster recovery, rate limiting, and WAF policies",
        "Platform standards for configuration, compliance, and release approvals",
      ],
      outcome:
        "Trustworthy production operations with stronger governance and incident readiness.",
    },
    {
      title: "Multi-region / cloud resilience strategy",
      objective:
        "Design for regional failures, latency, and continuity across deployment zones.",
      focus: [
        "Region-aware traffic routing, failover, and backup replication",
        "Storage, queue, and database continuity across multiple regions",
        "Disaster recovery drills, rollback playbooks, and business continuity testing",
      ],
      outcome:
        "A tested design aims to reduce impact from regional outages, data-loss events, and broader service disruptions.",
    },
  ];

  const decisionBoard: DeploymentDecisionBoardEntry[] = [
    {
      recommendedPhase: "MVP launch",
      targetProvider: recommendedProvider,
      rolloutWindow: "Initial deployment",
      riskLevel: "Moderate",
      investmentProfile: "Lean but scalable",
      reasoning:
        `Start with the selected deployment pattern; use ${recommendedProvider} as a planning direction, then validate provider fit against team capability and project requirements.`,
    },
    {
      recommendedPhase: "Scale-up phase",
      targetProvider: recommendedProvider,
      rolloutWindow: "After validating growth and service limits",
      riskLevel: "Moderate",
      investmentProfile: "Balanced expansion",
      reasoning:
        "Introduce autoscaling, queue workers, and more resilient data and delivery layers to support business growth without degrading reliability.",
    },
    {
      recommendedPhase: "Enterprise production hardening",
      targetProvider: recommendedProvider,
      rolloutWindow: "Before enterprise adoption",
      riskLevel: "High",
      investmentProfile: "Enterprise-grade control",
      reasoning:
        "Prioritize auditability, access management, backup integrity, and recovery readiness before broader enterprise rollout or regulated adoption.",
    },
    {
      recommendedPhase: "Multi-region / cloud resilience strategy",
      targetProvider: recommendedProvider,
      rolloutWindow: "When resilience requirements justify multi-region",
      riskLevel: "High",
      investmentProfile: "Resilience-first capital",
      reasoning:
        "When the product becomes commercially critical, add region failover, backup continuity, and resilient service routing to protect uptime and trust.",
    },
  ];

  if (isEnterprise || hasAI || hasBackgroundJobs || hasRealtime) {
    return {
      title: "Distributed production architecture",
      summary:
        "Use a front-end app layer, API layer, data layer, and worker layer with explicit service boundaries. This pattern is ideal when reliability, throughput, and operational control matter more than minimal deployment complexity.",
      recommendedArchitecture: [
        "Public web/API tier with autoscaling and edge delivery",
        "Managed relational database with backups and replication",
        "Queue-based background workers for AI, uploads, notifications, and sync tasks",
        "Observability stack with metrics, traces, logs, and alerting",
      ],
      whenToUse: [
        "Large or growing product user base",
        "Enterprise, B2B, or regulated workloads",
        "AI or asynchronous processing is part of the product",
        "The team can support a more mature platform operating model",
      ],
      providerBlueprints: blueprints,
      roadmap,
      decisionBoard,
    };
  }

  if (hasUploads || requirements.projectCategory === "ecommerce") {
    return {
      title: "Managed app + storage + queue pattern",
      summary:
        "Keep the core app simple and let the platform handle hosting and lifecycle management while you isolate a separate storage and worker path for heavy or asynchronous resource use.",
      recommendedArchitecture: [
        "Managed app runtime for the storefront or product UI",
        "Object storage and CDN for uploads and media",
        "Asynchronous job layer for processing, notifications, and sync tasks",
        "Monitoring and health checks across app and storage layers",
      ],
      whenToUse: [
        "Commerce, media-heavy, or file-heavy products",
        "Smaller operational teams with a need for speed",
        "Products that are growing but still need a lean platform",
      ],
      providerBlueprints: [
        ...blueprints.slice(0, 2),
        {
          provider: "Managed App Platform",
          architecture: [
            "Vercel or similar app-hosting platform",
            "Serverless or managed database for app data",
            "Object storage for media and uploads",
            "Background workers for webhook and queue processing",
          ],
          services: [
            "Vercel",
            "Managed Postgres",
            "Object storage",
            "Queue workers",
          ],
          reason:
            "For faster launches and smaller teams, a managed app platform provides the fastest path while still allowing controlled expansion later.",
          estimatedCost: "Requires workload-specific pricing",
        },
      ],
      roadmap,
      decisionBoard,
    };
  }

  return {
    title: "Lean managed deployment pattern",
    summary:
      "For smaller and medium products, keep the deployment model straightforward and optimize for launch speed while retaining the ability to expand later without a painful platform rewrite.",
    recommendedArchitecture: [
      "Managed frontend and API platform",
      "Managed database with backup automation",
      "Edge delivery or CDN for performance",
      "Basic monitoring and alerts with a staged rollback process",
    ],
    whenToUse: [
      "Fast MVPs and lean launches",
      "Small or medium teams with limited ops overhead",
      "Products before large enterprise scale or operational maturity",
    ],
    providerBlueprints: [
      {
        provider: "Managed App Platform",
        architecture: [
          "Frontend and API runtime on a managed platform",
          "Managed relational database with automated backups",
          "CDN for edge delivery and static assets",
          "Basic worker queue for non-blocking processing",
        ],
        services: ["Vercel", "Managed Postgres", "CDN", "Queue workers"],
        reason:
          "This pattern minimizes operational drag while keeping a clear upgrade path as the product matures.",
        estimatedCost: "Requires workload-specific pricing",
      },
      ...blueprints.slice(0, 2),
    ],
    roadmap,
    decisionBoard,
  };
}

export function generateDeploymentChecklist(
  requirements: ProjectRequirements,
): string[] {
  const features = new Set(requirements.requiredFeatures);
  const isEnterprise = requirements.targetUsers === "enterprise";

  const checklist = [
    "Production deployment checklist",
    "Infrastructure and deployment",
    "Environment variables and secrets management",
    "CI/CD pipeline with protected release flow",
    "Domain, TLS, DNS, and CDN configuration",
    "Security and access",
    "Authentication and role-based authorization",
    "Rate limiting and WAF rules",
    "Secrets rotation and audit protections",
    "Database and backup strategy",
    "Automated backup, retention, and restore testing",
    "Application performance and scaling",
    "Autoscaling and health checks",
    "Monitoring, alerting, and latency budgets",
    "Queue or worker handling for async jobs",
  ];

  if (features.has("payments")) {
    checklist.push(
      "Payment provider webhook validation and idempotent retries",
    );
  }

  if (features.has("ai")) {
    checklist.push("AI cost guardrails and inference request throttling");
  }

  if (features.has("file-uploads")) {
    checklist.push("Object storage lifecycle rules and upload validation");
  }

  if (isEnterprise) {
    checklist.push(
      "Enterprise governance, approval flow, and incident escalation model",
    );
  }

  return checklist;
}
