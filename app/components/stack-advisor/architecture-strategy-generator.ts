/**
 * Architecture Strategy Generator
 * Generates three architecture strategies (MVP, Balanced, Enterprise) based on project requirements
 */

import {
  ArchitectureStrategy,
  ArchitectureComparison,
  type StrategyTier,
  type EstimatedComplexity,
  type DevelopmentSpeed,
  type Scalability,
} from "./architecture-strategy-types";
import type { ProjectRequirements, RequirementsAnalysisResult } from "./types";

interface StrategyContext {
  isFastMVP: boolean;
  isDevelopingForEnterprise: boolean;
  needsHighScalability: boolean;
  hasLimitedBudget: boolean;
  isBeginnerTeam: boolean;
  isEthiopianMarket: boolean;
  projectScale: string;
  estimatedUsers: number;
}

function buildStrategyContext(
  requirements: ProjectRequirements,
): StrategyContext {
  // Map expected users to estimated number
  const estimatedUsers =
    requirements.expectedUsers === "100000-plus"
      ? 1000000
      : requirements.expectedUsers === "10000-100000"
        ? 50000
        : requirements.expectedUsers === "1000-10000"
          ? 5000
          : requirements.expectedUsers === "100-1000"
            ? 500
            : 50;

  return {
    isFastMVP: requirements.developmentPriority === "fast-mvp",
    isDevelopingForEnterprise: requirements.targetUsers === "enterprise",
    needsHighScalability:
      requirements.developmentPriority === "max-scalability" ||
      requirements.expectedUsers === "100000-plus" ||
      requirements.expectedUsers === "10000-100000",
    hasLimitedBudget:
      requirements.budget === "free" || requirements.budget === "under-50",
    isBeginnerTeam: requirements.developerExperience === "beginner",
    isEthiopianMarket: requirements.targetMarketCountry
      .toLowerCase()
      .includes("eth"),
    projectScale: requirements.expectedUsers,
    estimatedUsers,
  };
}

/**
 * Generate MVP / Fast Launch strategy
 */
function generateMVPStrategy(
  context: StrategyContext,
  requirements: ProjectRequirements,
): ArchitectureStrategy {
  return {
    id: "mvp",
    tier: "mvp",
    name: "MVP / Fast Launch",
    tagline: "Get to market in days, not months",
    description:
      "Minimal infrastructure focused on validation. Perfect for testing ideas quickly with manageable operational overhead. Single deployment, managed services handle scaling.",

    techStack: {
      frontend: ["Next.js 14", "React", "Tailwind CSS"],
      backend: ["Next.js API Routes", "TypeScript"],
      database: ["Supabase (PostgreSQL)"],
      cache: ["Redis (optional, via Upstash)"],
      deployment: ["Vercel"],
      monitoring: ["Vercel Analytics", "LogRocket (optional)"],
      other: ["Stripe or Chapa (payments)", "Resend (email)"],
    },

    layers: [
      {
        tier: "Frontend",
        technologies: ["Next.js", "React", "Tailwind CSS"],
        purpose: "User interface and client logic",
      },
      {
        tier: "Backend",
        technologies: ["Next.js API Routes"],
        purpose: "API endpoints and business logic",
      },
      {
        tier: "Database",
        technologies: ["Supabase (PostgreSQL)"],
        purpose: "Data persistence with built-in auth",
      },
      {
        tier: "Deployment",
        technologies: ["Vercel"],
        purpose: "Hosting, CDN, and auto-scaling",
      },
    ],

    architecturePattern: "Monolithic (Next.js Full-Stack)",
    architectureDiagram: `
┌─────────────────────────────────────┐
│     Vercel CDN + Deployment         │
├─────────────────────────────────────┤
│   Next.js App (Frontend + Backend)  │
│  ┌──────────────┐  ┌──────────────┐ │
│  │   React UI   │  │ API Routes   │ │
│  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────┤
│      Supabase (PostgreSQL)          │
│  ┌──────────┐  ┌──────────┐        │
│  │ Database │  │   Auth   │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
    `,

    estimatedComplexity: "low",
    developmentSpeed: "very-fast",
    developmentTimeWeeks: 2,
    scalability: "small-scale",
    maintenanceComplexity: "minimal",

    monthlyOperatingCost: {
      compute: 0, // Vercel free tier
      database: 0, // Supabase free tier initially
      storage: 0,
      cdn: 0, // Vercel included
      services: 10, // Email, etc.
      total: 10,
    },

    securityLevel: "basic",
    securityConsiderations: [
      {
        aspect: "Authentication",
        implementation: "Supabase Auth with JWT tokens",
        risk: "low",
      },
      {
        aspect: "Data Encryption",
        implementation: "TLS in transit, encryption at rest via Supabase",
        risk: "low",
      },
      {
        aspect: "CORS & API Security",
        implementation: "Row Level Security (RLS) policies",
        risk: "medium",
      },
    ],

    dataRetention: "No backups configured initially",
    backupStrategy: "Rely on Supabase automatic backups",
    disasterRecovery: "Limited - requires manual restoration",

    advantages: [
      "Deploy in minutes",
      "Zero DevOps overhead",
      "Excellent developer experience",
      "Built-in auth and real-time features",
      "Preview deployments for every change",
      "Cost-effective for low traffic",
      "Easy to upgrade components later",
    ],

    disadvantages: [
      "Vendor lock-in to Vercel and Supabase",
      "Limited to monolithic architecture",
      "Database connection limits at scale",
      "Requires careful query optimization",
      "Not ideal for heavy background jobs",
      "Limited fine-grained infrastructure control",
    ],

    tradeoffs: [
      "Speed vs. flexibility - choose speed",
      "Cost vs. features - basic features only",
      "Simplicity vs. complexity - keep it simple",
    ],

    whenToUse:
      "Validating a business idea, solo developers, early-stage startups, prototype development",

    bestFor: "Solo developers, small teams (<5), rapid prototyping",

    suitableProjectSize: {
      min: 0,
      max: 10000,
      description: "Up to ~10K concurrent users with proper optimization",
    },

    teamRequirements: {
      minSize: 1,
      skills: [
        "React/Next.js",
        "TypeScript",
        "SQL basics",
        "API design patterns",
      ],
      experienceLevel: "beginner",
      description:
        "Single developer or small team with modern JavaScript knowledge",
    },

    migrationPath: {
      nextTier: "balanced",
      effort: "medium",
      description:
        "Add Node.js backend, PostgreSQL, and Redis as complexity increases",
    },

    isProduction: true,
    isPlatformLocked: true,
  };
}

/**
 * Generate Balanced Production strategy
 */
function generateBalancedStrategy(
  context: StrategyContext,
  requirements: ProjectRequirements,
): ArchitectureStrategy {
  return {
    id: "balanced",
    tier: "balanced",
    name: "Balanced Production",
    tagline: "Production-ready with room to grow",
    description:
      "Separate backend services with proper database and caching. Good balance between operational complexity and scalability. Suitable for growing products with moderate traffic.",

    techStack: {
      frontend: ["Next.js 14", "React", "TypeScript", "Tailwind CSS"],
      backend: ["Node.js", "Express", "TypeScript"],
      database: ["PostgreSQL"],
      cache: ["Redis"],
      deployment: ["Railway or Render", "Vercel (frontend)"],
      monitoring: ["Prometheus", "Grafana", "Sentry"],
      other: ["Docker", "Docker Compose"],
    },

    layers: [
      {
        tier: "Frontend (CDN)",
        technologies: ["Vercel", "Next.js"],
        purpose: "Static assets and client rendering",
      },
      {
        tier: "API Gateway",
        technologies: ["Express"],
        purpose: "Request routing and middleware",
      },
      {
        tier: "Services",
        technologies: ["Node.js services"],
        purpose: "Business logic (auth, payments, etc.)",
      },
      {
        tier: "Cache Layer",
        technologies: ["Redis"],
        purpose: "Session management and performance",
      },
      {
        tier: "Database",
        technologies: ["PostgreSQL"],
        purpose: "Primary data storage",
      },
    ],

    architecturePattern: "Layered (Monolith with separation of concerns)",
    architectureDiagram: `
┌──────────────────────────────────────┐
│      Vercel (Frontend)               │
│   Next.js App → Static Assets        │
└──────────────────┬───────────────────┘
                   │ API Calls (HTTPS)
┌──────────────────▼───────────────────┐
│      Railway / Render (Backend)      │
│  ┌────────────────────────────────┐  │
│  │  Express API Gateway           │  │
│  ├────────────────────────────────┤  │
│  │  Auth Service │ Payment Service│  │
│  │  Business Services             │  │
│  └────────────────────────────────┘  │
└──────────────────┬───────────────────┘
        ┌──────────┼──────────┐
        │          │          │
   ┌────▼──┐   ┌──▼───┐   ┌──▼─────┐
   │PostgreSQL │ Redis │ Backups  │
   └─────────┘   └──────┘   └────────┘
    `,

    estimatedComplexity: "medium",
    developmentSpeed: "fast",
    developmentTimeWeeks: 4,
    scalability: "medium-scale",
    maintenanceComplexity: "moderate",

    monthlyOperatingCost: {
      compute: 25, // Railway/Render basic plan
      database: 15, // Managed PostgreSQL
      storage: 5,
      cdn: 0, // Vercel included
      services: 20, // Redis, monitoring, etc.
      total: 65,
    },

    securityLevel: "standard",
    securityConsiderations: [
      {
        aspect: "Authentication",
        implementation: "JWT + secure sessions, refresh tokens",
        risk: "low",
      },
      {
        aspect: "Data Encryption",
        implementation:
          "TLS in transit, encryption at rest, PII handling standards",
        risk: "low",
      },
      {
        aspect: "Network Security",
        implementation:
          "Private database connections, environment-based secrets",
        risk: "medium",
      },
      {
        aspect: "API Security",
        implementation: "Rate limiting, input validation, CORS policies",
        risk: "low",
      },
    ],

    dataRetention: "Daily automated backups for 7 days",
    backupStrategy: "Managed PostgreSQL backups, point-in-time recovery",
    disasterRecovery: "Moderate - database can be restored to recent point",

    advantages: [
      "Clear separation of frontend and backend",
      "Horizontal scalability for backend services",
      "Better performance with Redis caching",
      "Standard DevOps practices apply",
      "Good for team collaboration",
      "Monitoring and alerting built-in",
      "Better error tracking and logging",
      "Mid-size product suitable",
    ],

    disadvantages: [
      "More infrastructure to manage",
      "Higher operational complexity",
      "Requires DevOps knowledge",
      "More moving parts to troubleshoot",
      "Docker/container knowledge needed",
      "Cost increases with scale",
    ],

    tradeoffs: [
      "Simplicity vs. scalability - choose scalability",
      "Speed vs. features - more features available",
      "Cost vs. reliability - moderate cost for good reliability",
    ],

    whenToUse:
      "Growing startups, products with 10K-100K users, teams with DevOps support, products with complex requirements",

    bestFor:
      "Small teams (5-15), growth-stage startups, moderately complex apps",

    suitableProjectSize: {
      min: 1000,
      max: 100000,
      description: "~10K to 100K concurrent users with proper optimization",
    },

    teamRequirements: {
      minSize: 3,
      skills: [
        "Full-stack JavaScript/TypeScript",
        "Node.js/Express",
        "PostgreSQL",
        "Redis basics",
        "Docker",
        "Linux/server basics",
      ],
      experienceLevel: "intermediate",
      description: "Team with backend development and basic DevOps experience",
    },

    migrationPath: {
      nextTier: "enterprise",
      effort: "high",
      description:
        "Transition to microservices, Kubernetes, multi-region deployment",
    },

    isProduction: true,
    isPlatformLocked: false,
  };
}

/**
 * Generate Enterprise / High Scale strategy
 */
function generateEnterpriseStrategy(
  context: StrategyContext,
  requirements: ProjectRequirements,
): ArchitectureStrategy {
  return {
    id: "enterprise",
    tier: "enterprise",
    name: "High Scale / Enterprise",
    tagline: "Built for millions of users",
    description:
      "Distributed architecture with microservices, multiple databases, and advanced DevOps. Designed for massive scale, high availability, and complex operational requirements.",

    techStack: {
      frontend: ["Next.js 14", "React", "TypeScript", "GraphQL Client"],
      backend: [
        "Node.js",
        "Go (performance-critical services)",
        "Python (data processing)",
      ],
      database: [
        "PostgreSQL (primary)",
        "MongoDB (document storage)",
        "Elasticsearch (search/analytics)",
      ],
      cache: ["Redis Cluster", "Memcached"],
      deployment: ["Kubernetes", "Docker"],
      monitoring: [
        "Prometheus",
        "Grafana",
        "ELK Stack",
        "Datadog/New Relic",
        "Sentry",
      ],
      other: ["API Gateway (Kong/Traefik)", "Message Queue (RabbitMQ/Kafka)"],
    },

    layers: [
      {
        tier: "CDN",
        technologies: ["CloudFlare", "AWS CloudFront"],
        purpose: "Global content delivery",
      },
      {
        tier: "Frontend",
        technologies: ["Next.js", "React"],
        purpose: "Client application",
      },
      {
        tier: "API Gateway",
        technologies: ["Kong", "Traefik"],
        purpose: "Request routing, load balancing",
      },
      {
        tier: "Services",
        technologies: [
          "Auth Service",
          "Payment Service",
          "User Service",
          "Content Service",
        ],
        purpose: "Microservices for each domain",
      },
      {
        tier: "Data Layer",
        technologies: [
          "PostgreSQL",
          "MongoDB",
          "Elasticsearch",
          "Redis Cluster",
        ],
        purpose: "Multiple databases for different use cases",
      },
      {
        tier: "Message Queue",
        technologies: ["Kafka", "RabbitMQ"],
        purpose: "Async processing and event streaming",
      },
    ],

    architecturePattern: "Microservices with event-driven architecture",
    architectureDiagram: `
┌─────────────────────────────────────────────────┐
│           CloudFlare CDN (Global)               │
├─────────────────────────────────────────────────┤
│      API Gateway (Kong) - Load Balancer         │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│ │ Frontend │ │Auth Svc  │ │ Payment Service  │ │
│ │(Next.js) │ │(Node.js) │ │                  │ │
│ └──────────┘ └──────────┘ └──────────────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│ │ User Svc │ │Content   │ │ Search Service   │ │
│ │(Go)      │ │Service   │ │(Elasticsearch)   │ │
│ └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │      Message Queue (Kafka/RabbitMQ)      │   │
│ └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│ ┌────────┐ ┌──────────┐ ┌──────────────────┐   │
│ │PostgreSQL│ │  MongoDB │ │ Redis Cluster    │   │
│ │ (Primary)│ │(Document)│ │(Cache/Sessions)  │   │
│ └────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────┘
    `,

    estimatedComplexity: "very-high",
    developmentSpeed: "slow" as const,
    developmentTimeWeeks: 12,
    scalability: "unlimited",
    maintenanceComplexity: "very-high",

    monthlyOperatingCost: {
      compute: 500, // Kubernetes cluster
      database: 300, // Multiple managed databases
      storage: 100,
      cdn: 50, // CloudFlare, AWS CloudFront
      services: 300, // Monitoring, logging, message queues
      total: 1250,
    },

    securityLevel: "enterprise",
    securityConsiderations: [
      {
        aspect: "Authentication",
        implementation:
          "OAuth 2.0 + SAML, mTLS for service-to-service communication",
        risk: "low",
      },
      {
        aspect: "Data Encryption",
        implementation:
          "TLS 1.3 in transit, AES-256 at rest, HSM for key management",
        risk: "low",
      },
      {
        aspect: "Network Security",
        implementation: "VPC isolation, WAF, DDoS protection, network policies",
        risk: "low",
      },
      {
        aspect: "API Security",
        implementation:
          "Rate limiting, request signing, API versioning, security scanning",
        risk: "low",
      },
      {
        aspect: "Compliance",
        implementation: "SOC 2, GDPR, HIPAA ready (if needed)",
        risk: "low",
      },
    ],

    dataRetention: "Continuous replication with point-in-time recovery",
    backupStrategy:
      "Multi-region replication, daily snapshots, 30-day retention",
    disasterRecovery:
      "Comprehensive - RTO < 1 hour, RPO < 5 minutes, tested regularly",

    advantages: [
      "Handles millions of concurrent users",
      "Independent service scaling",
      "Resilient to partial failures",
      "Advanced monitoring and alerting",
      "Multi-region deployment",
      "Excellent performance at scale",
      "Supports complex business logic",
      "Event-driven architecture enables flexibility",
      "Advanced security compliance ready",
    ],

    disadvantages: [
      "Very high operational complexity",
      "Significant infrastructure cost",
      "Requires expert DevOps/SRE team",
      "Long deployment time",
      "Difficult to debug distributed systems",
      "Steep learning curve",
      "Over-engineered for most projects",
      "Requires 24/7 monitoring and support",
    ],

    tradeoffs: [
      "Complexity vs. scale - choose scale",
      "Cost vs. reliability - high cost for high reliability",
      "Speed vs. robustness - prioritize robustness",
    ],

    whenToUse:
      "Large companies, products with millions of users, mission-critical systems, global scale requirements, complex regulatory needs",

    bestFor: "Large teams (20+), established companies, massive scale products",

    suitableProjectSize: {
      min: 100000,
      max: 1000000000,
      description:
        "100K to 1 billion+ concurrent users with proper architecture",
    },

    teamRequirements: {
      minSize: 20,
      skills: [
        "Expert full-stack engineers",
        "DevOps/SRE engineers",
        "Kubernetes administration",
        "Distributed systems knowledge",
        "Database administration",
        "Security engineering",
        "Performance optimization",
      ],
      experienceLevel: "advanced",
      description:
        "Large team with deep expertise in distributed systems, DevOps, and high-scale architecture",
    },

    migrationPath: {
      nextTier: null,
      effort: "high",
      description: "This is the final tier - further optimization is custom",
    },

    isProduction: true,
    isPlatformLocked: false,
  };
}

/**
 * Main export: Generate all three architecture strategies
 */
export function generateArchitectureStrategies(
  requirements: ProjectRequirements,
  analysis: RequirementsAnalysisResult,
): ArchitectureComparison {
  const context = buildStrategyContext(requirements);

  const strategies = [
    generateMVPStrategy(context, requirements),
    generateBalancedStrategy(context, requirements),
    generateEnterpriseStrategy(context, requirements),
  ];

  // Determine recommended tier
  let recommendedTier: StrategyTier = "balanced";
  let recommendationReasoning = "";

  if (context.isFastMVP || context.hasLimitedBudget) {
    recommendedTier = "mvp";
    recommendationReasoning =
      "Fast validation needed. Start with MVP to test the market quickly and cost-effectively.";
  } else if (
    context.needsHighScalability ||
    context.isDevelopingForEnterprise
  ) {
    recommendedTier = "enterprise";
    recommendationReasoning =
      "Large scale or enterprise requirements detected. Use Enterprise architecture to handle growth and complex operational needs.";
  } else {
    recommendedTier = "balanced";
    recommendationReasoning =
      "Good middle ground for your project. Balanced provides production-ready infrastructure with reasonable operational complexity.";
  }

  return {
    strategies,
    recommendedTier,
    recommendationReasoning,
    projectContext: {
      type: requirements.projectCategory,
      scale: requirements.expectedUsers,
      budget: requirements.budget,
      teamSize:
        requirements.developerExperience === "beginner"
          ? "Small/Solo"
          : requirements.developerExperience === "intermediate"
            ? "Medium Team"
            : "Large Team",
    },
  };
}
