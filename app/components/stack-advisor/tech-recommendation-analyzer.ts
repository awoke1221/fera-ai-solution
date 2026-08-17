// ─── Tech Stack Recommendation Analyzer ───
// Builds structured, non-generic tech recommendations based on ProjectRequirements
// and RequirementsAnalysis. This engine avoids overengineering and makes
// deliberate choices about what to recommend and what to explicitly NOT recommend.

import type { ProjectRequirements, RequirementsAnalysisResult } from "./types";
import type {
  StructuredTechStackRecommendation,
  TechRecommendation,
  ArchitectureRecommendation,
  RecommendationTier,
} from "./tech-recommendation-types";

interface RecommenderContext {
  requirements: ProjectRequirements;
  analysis: RequirementsAnalysisResult;
  isDevelopingForEnterprise: boolean;
  needsHighScalability: boolean;
  hasLimitedBudget: boolean;
  isBeginnerTeam: boolean;
  isFastMVP: boolean;
}

function buildContext(
  requirements: ProjectRequirements,
  analysis: RequirementsAnalysisResult,
): RecommenderContext {
  return {
    requirements,
    analysis,
    isDevelopingForEnterprise: requirements.targetUsers === "enterprise",
    needsHighScalability:
      analysis.scoring.scalabilityScore > 70 ||
      requirements.developmentPriority === "max-scalability",
    hasLimitedBudget:
      requirements.budget === "free" || requirements.budget === "under-50",
    isBeginnerTeam: requirements.developerExperience === "beginner",
    isFastMVP: requirements.developmentPriority === "fast-mvp",
  };
}

function recommendFrontend(ctx: RecommenderContext): TechRecommendation {
  const isMultiPlatform =
    ctx.requirements.targetPlatforms.includes("multiple") ||
    ctx.requirements.targetPlatforms.includes("mobile");

  if (isMultiPlatform && !ctx.isFastMVP) {
    return {
      id: "nextjs-14",
      category: "frontend",
      technology: "Next.js",
      version: "14.x",
      provider: "Vercel",
      confidenceScore: 94,
      whyRecommended:
        "Next.js App Router provides SSR/SSG, excellent API routes, and seamless full-stack development. Ideal for fast iteration and scalability.",
      advantages: [
        "Built-in API routes eliminate separate backend server",
        "File-based routing and automatic code splitting",
        "Image optimization and font optimization built-in",
        "Incremental Static Regeneration for dynamic content",
        "Native TypeScript support with excellent DX",
        "Edge function support for global deployment",
      ],
      disadvantages: [
        "Vendor lock-in to Vercel for optimal experience",
        "Steeper learning curve than vanilla React for beginners",
        "Server components require mental model shift",
      ],
      alternatives: [
        {
          technology: "React + Vite",
          reason: "Lighter, faster builds, more control",
          whenToUse:
            "When you need a separate backend or want maximum flexibility",
          tradeoffs: "Requires separate backend server and more configuration",
        },
        {
          technology: "Remix",
          reason: "Web standards-first, nested routes",
          whenToUse:
            "If you need advanced form handling and better progressive enhancement",
          tradeoffs:
            "Smaller ecosystem than Next.js, less third-party integrations",
        },
      ],
      whenToReplace:
        "If your frontend becomes UI-only (decoupled from backend), consider standalone React + Vite with a separate API.",
      maturityLevel: "stable",
      ecosystemStrength: 95,
      costProfile: "free",
      scalabilityRating: 92,
      learnabilityRating: 78,
      productionReadiness: 98,
    };
  }

  if (ctx.isFastMVP || ctx.isBeginnerTeam) {
    return {
      id: "nextjs-14",
      category: "frontend",
      technology: "Next.js",
      version: "14.x",
      provider: "Vercel",
      confidenceScore: 96,
      whyRecommended:
        "Next.js gives you the fastest path to a deployed, production-ready app. Minimal setup, maximum results.",
      advantages: [
        "Full-stack in one framework — no context switching",
        "Vercel deployment is one click and extremely reliable",
        "Built-in API routes means no backend server needed initially",
        "Great documentation and enormous community",
        "TypeScript by default keeps you safe",
      ],
      disadvantages: [
        "Less control over bundling and build process",
        "Vercel deployment costs can add up if you get high traffic",
      ],
      alternatives: [
        {
          technology: "Create React App + Express",
          reason: "More familiar React setup",
          whenToUse:
            "If you are already comfortable with CRA and want separate frontend/backend",
          tradeoffs: "More boilerplate, slower deployment iteration",
        },
      ],
      whenToReplace:
        "Stick with Next.js until you have specific scaling or architectural needs that it doesn't meet.",
      maturityLevel: "stable",
      ecosystemStrength: 95,
      costProfile: "free",
      scalabilityRating: 90,
      learnabilityRating: 85,
      productionReadiness: 96,
    };
  }

  return {
    id: "nextjs-14",
    category: "frontend",
    technology: "Next.js",
    version: "14.x",
    provider: "Vercel",
    confidenceScore: 92,
    whyRecommended:
      "Balanced choice for most modern web applications. Full-stack framework with excellent SSR/SSG support.",
    advantages: [
      "Best-in-class SSR and SSG capabilities",
      "Native TypeScript support",
      "Optimized performance with automatic code splitting",
      "Great DX with fast refresh and file-based routing",
    ],
    disadvantages: [
      "Requires Node.js runtime",
      "Can be overkill for static sites",
    ],
    alternatives: [
      {
        technology: "Astro",
        reason: "Zero-JS by default, great for content",
        whenToUse: "If content is primary and interactivity is secondary",
        tradeoffs: "Less flexible for dynamic interactive apps",
      },
    ],
    whenToReplace:
      "Consider alternatives if your app is primarily static content or requires pure client-side rendering only.",
    maturityLevel: "stable",
    ecosystemStrength: 95,
    costProfile: "free",
    scalabilityRating: 90,
    learnabilityRating: 80,
    productionReadiness: 97,
  };
}

function recommendBackend(ctx: RecommenderContext): TechRecommendation {
  // For most projects, recommend Node.js + Next.js API routes to avoid complexity
  if (!ctx.isDevelopingForEnterprise) {
    return {
      id: "nextjs-api-routes",
      category: "backend",
      technology: "Next.js API Routes",
      version: "14.x",
      confidenceScore: 95,
      whyRecommended:
        "Eliminates the need for a separate backend server. API routes run on the same infrastructure, reducing operational complexity.",
      advantages: [
        "No separate deployment or monitoring needed",
        "Shared TypeScript types between frontend and backend",
        "Serverless by default on Vercel",
        "Fast to iterate — one codebase",
        "Built-in middleware and error handling",
      ],
      disadvantages: [
        "Not ideal for compute-heavy workloads",
        "Tied to Next.js/Vercel ecosystem",
        "Limited horizontal scaling without Vercel Pro",
      ],
      alternatives: [
        {
          technology: "Express.js",
          reason: "Explicit backend server with more control",
          whenToUse: "For complex microservices or high compute workloads",
          tradeoffs:
            "Requires separate deployment, monitoring, and scaling infrastructure",
        },
        {
          technology: "Python FastAPI",
          reason: "High performance, async-first",
          whenToUse: "For AI/ML workloads or data-heavy operations",
          tradeoffs:
            "Different language, separate deployment, larger team ramp-up",
        },
      ],
      whenToReplace:
        "Once your API routes are handling > 10k concurrent requests or you need sophisticated load balancing, consider a dedicated backend.",
      maturityLevel: "stable",
      ecosystemStrength: 90,
      costProfile: "free",
      scalabilityRating: 75,
      learnabilityRating: 90,
      productionReadiness: 95,
    };
  }

  // For enterprise, recommend dedicated backend for control and scalability
  return {
    id: "nodejs-express",
    category: "backend",
    technology: "Node.js + Express.js",
    version: "20.x LTS",
    confidenceScore: 88,
    whyRecommended:
      "Gives you explicit control over the backend with proven enterprise patterns. Full control over scaling, middleware, and architecture.",
    advantages: [
      "Explicit, well-understood architecture",
      "Massive ecosystem of battle-tested packages",
      "Easy to scale horizontally with load balancers",
      "Great for team collaboration with clear boundaries",
      "Proven in enterprise deployments for 10+ years",
    ],
    disadvantages: [
      "Requires separate deployment and infrastructure management",
      "More boilerplate and configuration than API routes",
      "Operational overhead for monitoring and scaling",
    ],
    alternatives: [
      {
        technology: "Go + Gin",
        reason: "High performance, compiled binaries",
        whenToUse: "For extreme performance requirements or microservices",
        tradeoffs: "Different language, smaller ecosystem than Node.js",
      },
    ],
    whenToReplace:
      "If you need <100ms response times globally or very high concurrency, consider Go or Rust.",
    maturityLevel: "stable",
    ecosystemStrength: 98,
    costProfile: "free",
    scalabilityRating: 94,
    learnabilityRating: 82,
    productionReadiness: 97,
  };
}

function recommendDatabase(ctx: RecommenderContext): TechRecommendation {
  if (ctx.isFastMVP || ctx.isBeginnerTeam || !ctx.isDevelopingForEnterprise) {
    return {
      id: "supabase",
      category: "database",
      technology: "Supabase",
      version: "latest",
      confidenceScore: 94,
      whyRecommended:
        "PostgreSQL + auth + storage + real-time in one platform. Perfect for fast iteration without vendor fragmentation. Ethiopian-friendly with self-hosted option.",
      advantages: [
        "PostgreSQL reliability with modern DX",
        "Built-in authentication with RLS (row-level security)",
        "Real-time subscriptions out of the box",
        "File storage integrated",
        "Self-hosted option for data residency",
        "Excellent documentation and community",
        "Free tier generous for testing",
      ],
      disadvantages: [
        "Smaller team compared to AWS/GCP",
        "Real-time features can have latency",
        "Limited query optimization compared to raw PostgreSQL",
      ],
      alternatives: [
        {
          technology: "Firebase",
          reason: "Fastest setup, all Google services",
          whenToUse: "For teams already invested in Google Cloud",
          tradeoffs: "Expensive at scale, vendor lock-in, less control",
        },
        {
          technology: "PlanetScale",
          reason: "MySQL serverless with branching",
          whenToUse: "If you prefer MySQL or need branching for CI/CD",
          tradeoffs:
            "Less integrated than Supabase, some advanced features are paid",
        },
      ],
      whenToReplace:
        "If you need sub-millisecond latency or must use a specific database system your enterprise mandates.",
      maturityLevel: "stable",
      ecosystemStrength: 85,
      costProfile: "freemium",
      scalabilityRating: 88,
      learnabilityRating: 88,
      productionReadiness: 92,
      Ethiopian: true,
    };
  }

  return {
    id: "postgresql",
    category: "database",
    technology: "PostgreSQL",
    version: "15+",
    confidenceScore: 90,
    whyRecommended:
      "Industry standard ACID-compliant relational database. Maximum flexibility and proven at any scale.",
    advantages: [
      "ACID compliance guarantees data integrity",
      "Full SQL support with advanced features (JSONB, arrays, etc.)",
      "Proven at massive scale (Uber, Airbnb, etc.)",
      "Open source with strong community",
      "Self-hosted option for complete control",
      "Wide hosting options (RDS, Neon, Render, etc.)",
    ],
    disadvantages: [
      "Requires more operational knowledge",
      "Horizontal scaling is complex",
      "Backup and recovery are manual",
    ],
    alternatives: [
      {
        technology: "MongoDB",
        reason: "Flexible schema, easier horizontal scaling",
        whenToUse: "For highly unstructured data or rapid schema changes",
        tradeoffs:
          "Less ACID guarantees, can be more expensive, eventual consistency",
      },
    ],
    whenToReplace:
      "Only if you have specific requirements that PostgreSQL cannot meet (e.g., time-series data at petabyte scale).",
    maturityLevel: "stable",
    ecosystemStrength: 99,
    costProfile: "free",
    scalabilityRating: 96,
    learnabilityRating: 75,
    productionReadiness: 99,
  };
}

function recommendAuth(ctx: RecommenderContext): TechRecommendation {
  if (
    ctx.requirements.projectCategory === "lms" ||
    ctx.isDevelopingForEnterprise
  ) {
    return {
      id: "supabase-auth",
      category: "auth",
      technology: "Supabase Auth",
      confidenceScore: 92,
      whyRecommended:
        "Built-in with Supabase, provides RLS integration. Perfect for LMS and enterprise with user isolation needs.",
      advantages: [
        "Integrated with database RLS",
        "Multiple auth providers (Google, GitHub, email)",
        "JWT tokens, flexible and secure",
        "Self-hosted option available",
      ],
      disadvantages: [
        "Limited SSO compared to Auth0",
        "Smaller ecosystem of integrations",
      ],
      alternatives: [
        {
          technology: "Clerk",
          reason: "Beautiful UI, modern integrations",
          whenToUse: "For fast consumer-grade auth with minimal customization",
          tradeoffs: "Expensive at scale, less flexible",
        },
      ],
      whenToReplace: "If you need enterprise SSO or SAML, consider Auth0.",
      maturityLevel: "stable",
      ecosystemStrength: 82,
      costProfile: "free",
      scalabilityRating: 87,
      learnabilityRating: 85,
      productionReadiness: 90,
      Ethiopian: true,
    };
  }

  return {
    id: "nextauth",
    category: "auth",
    technology: "NextAuth.js",
    confidenceScore: 93,
    whyRecommended:
      "Self-hosted auth for Next.js. Full control, flexible, and open source. Perfect for most startups and independent projects.",
    advantages: [
      "Flexible and fully customizable",
      "Open source and community-driven",
      "Works great with Next.js API routes",
      "Supports many providers (Google, GitHub, OAuth2)",
      "Session and JWT strategies",
    ],
    disadvantages: [
      "Requires more setup than managed solutions",
      "Session management needs careful handling",
    ],
    alternatives: [
      {
        technology: "Supabase Auth",
        reason: "Managed, integrated with database",
        whenToUse: "If you're already using Supabase",
        tradeoffs: "Less customization, but less operational burden",
      },
    ],
    whenToReplace:
      "Stick with NextAuth until your auth needs become very complex.",
    maturityLevel: "stable",
    ecosystemStrength: 88,
    costProfile: "free",
    scalabilityRating: 85,
    learnabilityRating: 80,
    productionReadiness: 93,
  };
}

function recommendPayment(ctx: RecommenderContext): TechRecommendation | null {
  if (!ctx.requirements.requiredFeatures.includes("payments")) {
    return null;
  }

  const isEthiopia = ctx.requirements.targetMarketCountry
    .toLowerCase()
    .includes("eth");

  if (isEthiopia) {
    return {
      id: "chapa",
      category: "payment",
      technology: "Chapa",
      confidenceScore: 96,
      whyRecommended:
        "Best payment solution for Ethiopia. Local payment methods (Telebirr, CBE, Awash Bank) with low fees. Designed for Ethiopian businesses.",
      advantages: [
        "Telebirr, CBE, and other Ethiopian payment methods",
        "Lower fees than international gateways",
        "Local support and documentation in English",
        "Excellent for Ethiopian startups",
      ],
      disadvantages: [
        "Limited international card support",
        "Smaller ecosystem compared to Stripe",
      ],
      alternatives: [
        {
          technology: "Stripe",
          reason: "Global reach and enterprise features",
          whenToUse: "If you need international cards and advanced features",
          tradeoffs:
            "Higher fees, more complex setup, less local payment methods",
        },
      ],
      whenToReplace:
        "Add Stripe alongside Chapa when you need international card support.",
      maturityLevel: "stable",
      ecosystemStrength: 78,
      costProfile: "paid",
      Ethiopian: true,
      scalabilityRating: 85,
      learnabilityRating: 88,
      productionReadiness: 88,
    };
  }

  return {
    id: "stripe",
    category: "payment",
    technology: "Stripe",
    confidenceScore: 94,
    whyRecommended:
      "Global standard for online payments. Excellent API, documentation, and support. Works everywhere.",
    advantages: [
      "Best-in-class payment API",
      "Global card acceptance",
      "Subscriptions, invoicing, tax handling",
      "Webhooks and event system",
      "Dashboard and reporting",
    ],
    disadvantages: [
      "Higher fees than local gateways",
      "Overkill for simple one-time payments",
    ],
    alternatives: [
      {
        technology: "PayPal",
        reason: "Consumer brand recognition",
        whenToUse: "For B2C e-commerce where PayPal adds conversion",
        tradeoffs: "Less developer-friendly, integration complexity",
      },
    ],
    whenToReplace:
      "Use Stripe for first 100k in revenue. Negotiate with them after.",
    maturityLevel: "stable",
    ecosystemStrength: 98,
    costProfile: "paid",
    scalabilityRating: 98,
    learnabilityRating: 85,
    productionReadiness: 99,
  };
}

function recommendStorage(ctx: RecommenderContext): TechRecommendation | null {
  if (
    !ctx.requirements.requiredFeatures.includes("file-uploads") &&
    !ctx.requirements.requiredFeatures.includes("video")
  ) {
    return null;
  }

  if (ctx.requirements.requiredFeatures.includes("video")) {
    return {
      id: "bunnynet",
      category: "storage",
      technology: "Bunny.net",
      confidenceScore: 93,
      whyRecommended:
        "CDN + storage combined. Excellent for video streaming with African PoPs. Ethiopian-friendly with competitive pricing.",
      advantages: [
        "Global CDN with African presence",
        "Video streaming optimized",
        "Affordable compared to Cloudflare",
        "Excellent for Ethiopia region",
      ],
      disadvantages: [
        "Smaller ecosystem than Cloudflare",
        "Image optimization is basic",
      ],
      alternatives: [
        {
          technology: "Cloudinary",
          reason: "Image optimization and transformations",
          whenToUse: "If you need advanced image operations",
          tradeoffs: "More expensive, primarily for images",
        },
      ],
      whenToReplace: "Only if you need image transformation at scale.",
      maturityLevel: "stable",
      ecosystemStrength: 80,
      costProfile: "paid",
      Ethiopian: true,
      scalabilityRating: 92,
      learnabilityRating: 85,
      productionReadiness: 90,
    };
  }

  return {
    id: "supabase-storage",
    category: "storage",
    technology: "Supabase Storage",
    confidenceScore: 92,
    whyRecommended:
      "S3-compatible storage built into Supabase. Simple, integrated, and secure with RLS.",
    advantages: [
      "Integrated with Supabase",
      "S3-compatible API",
      "RLS for fine-grained access control",
      "Simple pricing",
    ],
    disadvantages: [
      "No image transformation",
      "Limited CDN features compared to Bunny.net",
    ],
    alternatives: [
      {
        technology: "AWS S3",
        reason: "Most features and scale",
        whenToUse: "For enterprise deployments",
        tradeoffs: "Complex pricing, requires AWS account",
      },
    ],
    whenToReplace: "If you need image transformation, add Cloudinary on top.",
    maturityLevel: "stable",
    ecosystemStrength: 85,
    costProfile: "freemium",
    Ethiopian: true,
    scalabilityRating: 90,
    learnabilityRating: 88,
    productionReadiness: 90,
  };
}

function recommendDeployment(ctx: RecommenderContext): TechRecommendation {
  if (ctx.isFastMVP || !ctx.isDevelopingForEnterprise) {
    return {
      id: "vercel",
      category: "deployment",
      technology: "Vercel",
      confidenceScore: 95,
      whyRecommended:
        "Optimized for Next.js with zero-config deployment. Auto-scaling, CDN included, perfect for fast iteration.",
      advantages: [
        "Deploy from GitHub in seconds",
        "Automatic HTTPS and CDN",
        "Auto-scaling and load balancing",
        "Preview deployments for every PR",
        "Built-in analytics and monitoring",
        "Free tier generous",
      ],
      disadvantages: [
        "Vendor lock-in to Vercel",
        "Can get expensive at high traffic",
        "Limited customization of infrastructure",
      ],
      alternatives: [
        {
          technology: "Railway",
          reason: "More control, still simple",
          whenToUse: "If you need more infrastructure customization",
          tradeoffs: "Slightly more setup, smaller team",
        },
      ],
      whenToReplace:
        "If you need custom infrastructure or are hitting Vercel cost limits.",
      maturityLevel: "stable",
      ecosystemStrength: 92,
      costProfile: "freemium",
      scalabilityRating: 85,
      learnabilityRating: 95,
      productionReadiness: 97,
    };
  }

  return {
    id: "railway",
    category: "deployment",
    technology: "Railway",
    confidenceScore: 88,
    whyRecommended:
      "Modern platform that gives you infrastructure control while keeping deployment simple. Great for scaling beyond Vercel.",
    advantages: [
      "Docker support out of the box",
      "PostgreSQL and Redis included",
      "Transparent pricing",
      "Environment management",
      "Custom domains and SSL",
    ],
    disadvantages: [
      "Smaller ecosystem than Vercel",
      "More configuration needed",
    ],
    alternatives: [
      {
        technology: "Render",
        reason: "Good middle ground",
        whenToUse: "Similar feature set with good pricing",
        tradeoffs: "Similar ecosystem size",
      },
    ],
    whenToReplace: "Stick until your team is comfortable with Kubernetes.",
    maturityLevel: "stable",
    ecosystemStrength: 80,
    costProfile: "paid",
    scalabilityRating: 88,
    learnabilityRating: 82,
    productionReadiness: 90,
  };
}

export function analyzeAndRecommend(
  requirements: ProjectRequirements,
  analysis: RequirementsAnalysisResult,
): StructuredTechStackRecommendation {
  const ctx = buildContext(requirements, analysis);

  const frontend = recommendFrontend(ctx);
  const backend = recommendBackend(ctx);
  const database = recommendDatabase(ctx);
  const auth = recommendAuth(ctx);
  const payment = recommendPayment(ctx);
  const storage = recommendStorage(ctx);
  const deployment = recommendDeployment(ctx);

  const recommendedStack: TechRecommendation[] = [
    frontend,
    backend,
    database,
    auth,
  ];

  if (payment) recommendedStack.push(payment);
  if (storage) recommendedStack.push(storage);
  recommendedStack.push(deployment);

  const architecture: ArchitectureRecommendation = {
    pattern: ctx.isFastMVP ? "Monolithic MVP" : "Full-Stack",
    description: ctx.isFastMVP
      ? "Single Next.js app serving frontend and API. Simplest deployment model."
      : "Frontend (Next.js), Backend (Node.js or API Routes), Database (PostgreSQL), integrated services.",
    layers: [
      {
        tier: "frontend",
        technologies: ["Next.js 14", "React 18", "TailwindCSS"],
        rationale:
          "Single unified framework for fast development and deployment.",
      },
      {
        tier: "backend",
        technologies: ctx.isFastMVP
          ? ["Next.js API Routes"]
          : ["Node.js", "Express"],
        rationale: ctx.isFastMVP
          ? "Integrated API routes keep deployment simple."
          : "Explicit backend for control and scalability.",
      },
      {
        tier: "database",
        technologies: [ctx.isFastMVP ? "Supabase (PostgreSQL)" : "PostgreSQL"],
        rationale: ctx.isFastMVP
          ? "Supabase gives you auth and storage too."
          : "PostgreSQL gives you maximum flexibility.",
      },
      {
        tier: "auth",
        technologies: [ctx.isFastMVP ? "Supabase Auth" : "NextAuth.js"],
        rationale: ctx.isFastMVP
          ? "Integrated and simple."
          : "Self-hosted and customizable.",
      },
    ],
    scalabilityApproach: ctx.needsHighScalability
      ? "Load balancer → API servers (horizontal) → Read replicas (PostgreSQL) → Cache layer (Redis) → CDN"
      : "Start monolithic. Add caching and CDN once you hit 10k concurrent users.",
    securityApproach:
      "Environment variables for secrets. HTTPS only. RLS for database. Validate all inputs. Rate limiting on API.",
    observabilityApproach: ctx.isFastMVP
      ? "Sentry for errors, basic monitoring"
      : "Logs (structured JSON), metrics (Prometheus), traces (optional), alerts",
  };

  return {
    projectSummary: {
      projectName: requirements.projectName,
      category: requirements.projectCategory,
      targetAudience: requirements.targetUsers,
      expectedScale: requirements.expectedUsers,
      criticalRequirements: requirements.requiredFeatures.slice(0, 5),
      constraints: [
        `Budget: ${requirements.budget}`,
        `Timeline: ${requirements.timeToLaunch}`,
        `Team: ${requirements.teamSize}`,
      ],
      marketContext: requirements.targetMarketCountry,
    },
    recommendedArchitecture: architecture,
    recommendedStack,
    alternatives: [],
    reasoning: {
      overengineering: ctx.isFastMVP
        ? "Avoided microservices, Kubernetes, and complex infrastructure. Stick to one Next.js app until you have real scaling needs."
        : ctx.isDevelopingForEnterprise
          ? "Chosen systems that scale to enterprise. Avoided Vercel/serverless; explicit infrastructure gives control."
          : "Balanced simplicity with scalability. Can grow to 100k users with this stack.",
      avoided: ctx.isFastMVP
        ? [
            "Kubernetes — not needed for MVP",
            "Kafka — over-engineering for message queues",
            "Microservices — monolith is faster to iterate",
            "Complex caching — stick to database caching first",
          ]
        : ctx.isDevelopingForEnterprise
          ? [
              "Serverless — need predictable infrastructure",
              "Firebase — too limited for enterprise",
            ]
          : [
              "Kubernetes — too much overhead",
              "Complex event systems — use webhooks instead",
            ],
      keyDecisions: [
        `Frontend: ${frontend.technology} for unified full-stack development`,
        `Backend: ${backend.technology} to ${ctx.isFastMVP ? "keep it simple" : "maintain control"}`,
        `Database: ${database.technology} for reliability`,
      ],
      whyNotOthers: [
        "Not recommending Ruby on Rails: Node.js has larger ecosystem and better cloud integration",
        "Not recommending Firebase: Gives you less control and more vendor lock-in than PostgreSQL + auth service",
      ],
    },
    tradeoffs: [],
    risks: [
      {
        risk: "Vercel pricing scaling with traffic",
        severity: ctx.isFastMVP ? "medium" : "low",
        mitigation:
          "Monitor invocation count. Migrate to Railway or self-hosted if costs exceed budget.",
      },
      {
        risk: "Database connection limits",
        severity: "medium",
        mitigation: "Use connection pooling (PgBouncer). Upgrade as needed.",
      },
    ],
    securityRecommendations: {
      authentication: auth.technology,
      dataProtection:
        "Encrypt at rest (database default). TLS in transit (HTTPS everywhere).",
      apiSecurity:
        "Validate all inputs. Use CORS appropriately. Rate limit API routes.",
      deploymentSecurity:
        "Use environment variables. Never commit secrets. Use managed secrets store (Vercel Secrets or Railway Secrets).",
      considerations: [
        "Enable HTTPS only",
        "Set secure cookies (HttpOnly, Secure, SameSite)",
        "Use RLS for database access control",
        "Implement rate limiting on auth endpoints",
      ],
    },
    scalabilityRecommendations: {
      currentPhase: `Start with ${deployment.technology}. All services in one region. Database auto-backups.`,
      phase2: `Add Redis cache for hot data. Optimize queries. Add CDN for static assets. Split backend if needed.`,
      phase3: `Load balancer. Multiple backend regions. Database read replicas. Advanced monitoring.`,
      bottlenecks: [
        "Database connection limits — fix with pooling",
        "Static asset delivery — fix with CDN",
        "API response time — fix with caching and query optimization",
      ],
      scalingStrategy: `Vertical scaling first (bigger database, more memory). Horizontal scaling only after hitting limits. Cache everything that doesn't change frequently.`,
    },
    estimatedComplexity: {
      overallComplexity: ctx.isFastMVP ? "low" : "moderate",
      developmentTime: ctx.isFastMVP ? "4-8 weeks" : "8-16 weeks",
      teamSize: ctx.isFastMVP ? "1-2 developers" : "2-5 developers",
      mainChallenges: [
        "Database schema design",
        "Authentication flow integration",
        ctx.requirements.requiredFeatures.includes("payments")
          ? "Payment integration testing"
          : null,
        ctx.requirements.requiredFeatures.includes("video")
          ? "Video delivery and optimization"
          : null,
      ].filter(Boolean) as string[],
      keyRisks: [
        "Scope creep — stick to core features for MVP",
        "Under-estimating auth complexity",
      ],
    },
    recommendedNextSteps: [
      {
        phase: "Week 1-2: Setup",
        description: "Create Next.js project, set up database, configure auth",
        duration: "2 weeks",
        priority: "critical",
        actions: [
          `Create Next.js project with TypeScript`,
          `Set up ${database.technology}`,
          `Configure ${auth.technology}`,
          `Deploy to ${deployment.technology}`,
        ],
      },
      {
        phase: "Week 3-4: Core Features",
        description: "Build main product features",
        duration: "2 weeks",
        priority: "critical",
        actions: [
          "Implement user onboarding flow",
          "Build core feature set",
          "Set up error tracking (Sentry)",
        ],
      },
      {
        phase: "Week 5-6: Polish",
        description: "Add payment, performance optimization, testing",
        duration: "2 weeks",
        priority: "high",
        actions: [
          requirements.requiredFeatures.includes("payments")
            ? `Integrate ${payment?.technology || "payment provider"}`
            : "Implement advanced features",
          "Performance optimization and caching",
          "Write unit and integration tests",
        ],
      },
      {
        phase: "Week 7+: Launch",
        description: "Beta testing, feedback, launch prep",
        duration: "1-2 weeks",
        priority: "high",
        actions: [
          "Beta launch to early users",
          "Collect feedback and fix issues",
          "Public launch and marketing",
        ],
      },
    ],
    timestamp: new Date().toISOString(),
    confidenceLevel: ctx.isFastMVP ? "high" : "high",
    validationStatus: "valid",
  };
}
