import type { ProjectRequirements } from "./types";

export type CloudProviderOption = {
  provider: string;
  fit: string;
  strengths: string[];
  watchouts: string[];
  idealFor: string;
  monthlyCostBand: string;
};

export type DecisionMetric = {
  metric: string;
  weighting: string;
  summary: string;
};

export type CloudDeploymentRecommendation = {
  primaryProvider: string[];
  providerOptions: CloudProviderOption[];
  costSummary: string[];
  decisionMatrix: DecisionMetric[];
  strategicRecommendation: string[];
};

export function buildCloudDeploymentRecommendation(
  requirements: ProjectRequirements,
): CloudDeploymentRecommendation {
  const features = new Set(requirements.requiredFeatures);
  const isEnterprise = requirements.targetUsers === "enterprise";
  const isHighScale =
    requirements.expectedUsers === "10000-100000" ||
    requirements.expectedUsers === "100000-plus";
  const hasAI = features.has("ai");
  const hasBackgroundJobs = features.has("background-jobs");
  const hasUploads = features.has("file-uploads");
  const hasRealtime = features.has("real-time-communication");

  const primaryProvider =
    isEnterprise || isHighScale || hasAI || hasBackgroundJobs
      ? [
          "AWS",
          "AWS is the strongest fit for a serious production deployment because it offers mature managed services, security controls, global scale, and enterprise-grade operating patterns.",
          "Use ECS, EKS, Lambda, RDS, S3, CloudFront, and CloudWatch together if the platform requires operational flexibility and higher control.",
        ]
      : [
          "Vercel",
          "Vercel or a managed app platform is ideal for a fast-moving product if the system is not deeply regulated or operationally complex.",
          "Use a managed database and static asset delivery layer first, then move to a broader platform only when traffic and operational complexity justify it.",
        ];

  const providerOptions: CloudProviderOption[] = [
    {
      provider: "AWS",
      fit: "Best for enterprise growth, complex workloads, security, and platform maturity",
      strengths: [
        "Deep service ecosystem and strongest enterprise governance",
        "High control over networking, storage, identity, and compliance",
        "Excellent fit for multi-service apps and large operational teams",
        "Strong logs, metrics, backups, and incident tooling",
      ],
      watchouts: [
        "More operational complexity than simpler platforms",
        "Architecture must be deliberate to avoid unnecessary cost",
        "Needs stronger engineering discipline for governance and cost control",
      ],
      idealFor:
        "Large SaaS products, enterprise systems, regulated workloads, and multi-service backends",
      monthlyCostBand: "$300–$3,000+ depending on scale and services",
    },
    {
      provider: "Azure",
      fit: "Very strong for enterprise identity, hybrid environments, and corporate governance",
      strengths: [
        "Excellent Microsoft ecosystem fit and identity integration",
        "Good support for enterprise networking and compliance workflows",
        "Strong platform maturity for managed services and hybrid adoption",
      ],
      watchouts: [
        "Costs can rise quickly without careful monitoring",
        "Operational patterns need disciplined design for platform consistency",
      ],
      idealFor:
        "Corporate internal tools, enterprise user bases, and hybrid or Microsoft-centric environments",
      monthlyCostBand: "$250–$2,500+",
    },
    {
      provider: "Google Cloud",
      fit: "A good choice for AI, analytics, and modern data-heavy products",
      strengths: [
        "Strong AI and data tooling ecosystem",
        "Good fit for analytics pipelines and cross-service architecture",
        "Solid networking and managed compute experience",
      ],
      watchouts: [
        "Operational maturity can be more nuanced for smaller teams",
        "May require deeper skill investment depending on the architecture",
      ],
      idealFor:
        "AI-driven products, analytical platforms, and data-rich customer experiences",
      monthlyCostBand: "$200–$2,200+",
    },
    {
      provider: "Vercel / Managed App Platforms",
      fit: "Best for rapid launch and product teams prioritizing speed over deep infra control",
      strengths: [
        "Very fast deployment cycles and simple DX",
        "Outstanding for frontend-heavy and SaaS MVP use cases",
        "Strong preview environments and deployment automation",
      ],
      watchouts: [
        "Less control for deep custom infrastructure patterns",
        "Can become expensive at larger scale or when deeply coupled to many services",
      ],
      idealFor:
        "MVPs, growth-stage SaaS products, and teams that want zero-friction delivery",
      monthlyCostBand: "$0–$500+ depending on usage and scale",
    },
  ];

  const costSummary = [
    "Cost should be treated as a design decision, not an afterthought; platform choice directly affects long-term operating cost.",
    "Managed platforms reduce up-front operational cost but can become more expensive as scale, edge traffic, and custom services increase.",
    "Enterprise and regulated products should allocate budget for protection layers, backups, access control, and active monitoring.",
    "AI and media-heavy workloads should reserve explicit budget for queue processing, storage, and throughput management.",
  ];

  const decisionMatrix = [
    {
      metric: "Operational control",
      weighting: "Very high",
      summary:
        isEnterprise || isHighScale
          ? "AWS and Azure offer the most mature operational and governance controls for enterprise-scale rollouts."
          : "Managed app platforms are enough if the product is not yet deeply operationally complex.",
    },
    {
      metric: "Deployment speed",
      weighting: "High",
      summary:
        "Managed platforms lead in ship speed, while AWS and Azure are better when the team is ready to manage more infrastructure discipline.",
    },
    {
      metric: "Security and compliance",
      weighting: "Very high",
      summary:
        "Enterprises and payment-heavy systems should prioritize network controls, identity enforcement, auditing, and secret management before launch.",
    },
    {
      metric: "AI and media workloads",
      weighting: "High",
      summary:
        hasAI || hasBackgroundJobs || hasUploads
          ? "Separate compute from the web tier and use queue-based processing so inference, uploads, and document jobs do not degrade app responsiveness."
          : "Typical web and API workloads can stay relatively simple and still remain efficient.",
    },
  ];

  const strategicRecommendation = [
    "Use a managed cloud platform for the main application while building a separate worker layer for background jobs, AI workloads, and bulk processing.",
    "For products with enterprise maturity or higher risk, adopt a formal cloud reference architecture with security baselines, observability, and stricter access controls.",
    "Never select the platform only on marketing appeal; the right choice is the one that matches team maturity, compliance needs, and operational scale.",
    "Document the production architecture before launch with explicit backup, recovery, scaling, and incident response practices.",
  ];

  return {
    primaryProvider,
    providerOptions,
    costSummary,
    decisionMatrix,
    strategicRecommendation,
  };
}
