// ─── Infrastructure Tools: Deploy, CI/CD, Payment, Email, Cache, Testing, Monitoring ──
import type { ToolOption } from "../types";

export const infraTools: ToolOption[] = [
  // ─── FRONTEND DEPLOY ───
  {
    id: "vercel",
    name: "Vercel",
    icon: "▲",
    description:
      "Best-in-class hosting for Next.js and frontend apps with automatic CI/CD, ISR, and edge functions.",
    category: "deploy_frontend",
    recommended: true,
    freeTier:
      "Hobby: Free (100GB bandwidth, 100k edge function invocations, 6000 build mins/mo)",
    pricing:
      "Pro: $20/mo/user (1TB bandwidth, 1M edge function invocations). Enterprise: custom",
    scalability:
      "Excellent — auto-scales globally, edge network in 100+ locations, zero-downtime deployments",
    config: {
      envVars: [
        "VERCEL_ENV",
        "VERCEL_URL",
        "NEXT_PUBLIC_VERCEL_URL",
        "VERCEL_GIT_COMMIT_SHA",
      ],
      setupSteps: [
        "Connect GitHub repo to Vercel",
        "Configure environment variables in Vercel dashboard",
        "Set up custom domain",
        "Configure build settings (framework preset auto-detects Next.js)",
        "Set up preview deployments for PRs",
      ],
      packages: [],
    },
    integration: {
      connectsTo: [
        "nextjs",
        "github_actions",
        "supabase_db",
        "nextjs_api",
        "planetscale",
      ],
      notes:
        "Vercel is purpose-built for Next.js. Automatic ISR, edge functions, and analytics. Preview deployments for every PR.",
    },
    ethiopianSupport:
      "Good — global CDN. Free tier is generous for Ethiopian startups.",
    limitations: [
      "Serverless function 10s timeout on Hobby plan",
      "Build minutes limited to 6,000/mo on free tier",
      "Bandwidth overage can be expensive ($40/100GB)",
    ],
    docsUrl: "https://vercel.com/docs",
  },
  {
    id: "netlify",
    name: "Netlify",
    icon: "🌐",
    description:
      "Hosting platform for static sites and serverless functions with built-in CI/CD and forms.",
    category: "deploy_frontend",
    recommended: false,
    freeTier: "Free: 100GB bandwidth, 300 build minutes/mo, 1 concurrent build",
    pricing:
      "Pro: $19/mo (500GB bandwidth, 1000 build minutes, 3 concurrent builds)",
    scalability:
      "Good — global CDN, edge functions, auto-scaling for static content",
    config: {
      envVars: ["SITE_URL", "NETLIFY_ENV", "NETLIFY_URL"],
      setupSteps: [
        "Connect GitHub repo to Netlify",
        "Configure build command and publish directory",
        "Set up environment variables",
        "Configure redirects in _redirects or netlify.toml",
        "Set up custom domain with HTTPS",
      ],
      packages: ["@netlify/functions"],
    },
    integration: {
      connectsTo: ["react", "vite_react", "github_actions", "supabase_db"],
      notes:
        "Best for static React/Vite apps. Netlify Forms handles form submissions without a backend.",
    },
    ethiopianSupport: "Good — global CDN. Free tier is generous.",
    limitations: [
      "Not optimized for Next.js (no ISR support on free tier)",
      "Build minutes limited on free plan",
    ],
    docsUrl: "https://docs.netlify.com",
  },
  {
    id: "cloudflare_pages",
    name: "Cloudflare Pages",
    icon: "☁️",
    description:
      "Fast, global hosting for static and server-rendered apps on Cloudflare's edge network.",
    category: "deploy_frontend",
    recommended: false,
    freeTier:
      "Free: 500 builds/mo, unlimited bandwidth (fair use), 1 concurrent build",
    pricing: "Pro: $20/mo (5000 builds, 10 concurrent builds, early hints)",
    scalability:
      "Excellent — Cloudflare's global edge network (330+ locations), DDoS protection, Argo Smart Routing",
    config: {
      envVars: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
      setupSteps: [
        "Create Cloudflare account",
        "Connect GitHub repo to Cloudflare Pages",
        "Configure build settings",
        "Set up custom domain with Cloudflare DNS",
        "Enable Web Analytics for free",
      ],
      packages: [],
    },
    integration: {
      connectsTo: ["react", "vite_react", "github_actions"],
      notes:
        "Great for JAMstack apps. Unlimited bandwidth on free tier is rare and valuable.",
    },
    ethiopianSupport:
      "Excellent — Cloudflare has the largest global edge network including South African PoPs, great for Ethiopia.",
    limitations: [
      "Limited serverless function support",
      "Build times can be slow",
    ],
    docsUrl: "https://developers.cloudflare.com/pages/",
  },

  // ─── BACKEND DEPLOY ───
  {
    id: "railway",
    name: "Railway",
    icon: "🚂",
    description:
      "Modern deployment platform with database provisioning, Docker support, and auto-scaling.",
    category: "deploy_backend",
    recommended: true,
    freeTier: "Free: $5 credit (no monthly card), limited usage",
    pricing:
      "Developer: $5/mo ($5 credit included). Pro: $20/mo ($20 credit). Custom: enterprise",
    scalability:
      "Good — auto-scaling, load-balanced, multi-region deploy, zero-downtime updates",
    config: {
      envVars: [
        "RAILWAY_ENVIRONMENT",
        "RAILWAY_SERVICE_NAME",
        "RAILWAY_PUBLIC_DOMAIN",
      ],
      setupSteps: [
        "Connect GitHub repo to Railway",
        "Choose template or configure Docker/nixpacks",
        "Add database plugins (PostgreSQL, MySQL, Redis)",
        "Configure environment variables",
        "Set up custom domain",
      ],
      packages: [],
    },
    integration: {
      connectsTo: [
        "node",
        "python_fastapi",
        "django",
        "postgresql",
        "mongodb",
        "redis",
      ],
      notes:
        "Railway simplifies deployment with database plugins and automatic HTTPS. Great for Node.js and Python backends.",
    },
    ethiopianSupport:
      "Good — global hosting. Free $5 credit is enough for small projects.",
    limitations: [
      "No free forever tier (only $5 initial credit)",
      "CPU/memory limits on Developer plan",
    ],
    docsUrl: "https://docs.railway.app",
  },
  {
    id: "render",
    name: "Render",
    icon: "🖼️",
    description:
      "Unified cloud platform for web services, databases, cron jobs, and static sites with free tier.",
    category: "deploy_backend",
    recommended: false,
    freeTier:
      "Free web services: 512MB RAM, 0.1 CPU, 30 min idle spin-down (sleeps after inactivity)",
    pricing:
      "Starter: $7/mo (512MB RAM, 0.5 CPU, no spin-down). Pro: $20/mo (2GB RAM, 1 CPU)",
    scalability:
      "Good — auto-scaling, multiple instance types, blue-green deployments",
    config: {
      envVars: [
        "RENDER_EXTERNAL_URL",
        "RENDER_INTERNAL_URL",
        "RENDER_INSTANCE_ID",
      ],
      setupSteps: [
        "Connect GitHub repo to Render",
        "Select web service or static site",
        "Configure build and start commands",
        "Set up environment variables",
        "Add managed database (PostgreSQL, Redis)",
      ],
      packages: [],
    },
    integration: {
      connectsTo: [
        "node",
        "python_fastapi",
        "django",
        "postgresql",
        "mongodb",
        "redis",
      ],
      notes:
        "Free tier web services spin down after 30 min — not suitable for production. Good for staging/demo.",
    },
    ethiopianSupport:
      "Good — US/EU regions. Free tier works for demos but not production.",
    limitations: [
      "Free services sleep after 30 min of inactivity",
      "No Ethiopian/African regions",
    ],
    docsUrl: "https://render.com/docs",
  },
  {
    id: "docker_vps",
    name: "Docker on VPS (Ethiopian Host)",
    icon: "🐳",
    description:
      "Deploy with Docker on a VPS hosted locally in Ethiopia or globally, giving full control over infrastructure.",
    category: "deploy_backend",
    recommended: false,
    freeTier: "No free tier — pay for VPS only",
    pricing:
      "Ethiopian VPS: $10-30/mo (Habesha Host, Ethio Telecom). Global VPS: $5-20/mo (DigitalOcean, Linode)",
    scalability:
      "Excellent — full control, horizontal scaling with Docker Swarm/K8s, load balancers",
    config: {
      envVars: ["NODE_ENV", "PORT", "DATABASE_URL", "REDIS_URL", "JWT_SECRET"],
      setupSteps: [
        "Write Dockerfile and docker-compose.yml",
        "Provision VPS (Ethiopian or global provider)",
        "Install Docker and Docker Compose",
        "Set up Nginx reverse proxy with SSL (Certbot)",
        "Configure CI/CD to deploy via GitHub Actions",
      ],
      packages: ["docker", "docker-compose"],
    },
    integration: {
      connectsTo: [
        "node",
        "python_fastapi",
        "django",
        "postgresql",
        "mongodb",
        "redis",
        "github_actions",
      ],
      notes:
        "Best for apps requiring Ethiopian data residency, or when full control is needed. More DevOps work required.",
    },
    ethiopianSupport:
      "Best option for Ethiopian data residency. Habesha Host provides VPS in Ethiopia with local support.",
    limitations: [
      "Requires DevOps knowledge",
      "No managed scaling — manual setup needed",
      "Higher maintenance overhead",
    ],
    docsUrl: "https://docs.docker.com",
  },

  // ─── CI/CD ───
  {
    id: "github_actions",
    name: "GitHub Actions",
    icon: "🔄",
    description:
      "Built-in CI/CD in GitHub repos with 50M free minutes/year for public repos.",
    category: "cicd",
    recommended: true,
    freeTier:
      "Free: 2000 min/mo (private repos), unlimited (public repos), 500MB storage",
    pricing: "Team: $4/mo (3000 min). Enterprise: $21/mo (50000 min)",
    scalability:
      "Excellent — matrix builds, self-hosted runners, reusable workflows, caching",
    config: {
      envVars: ["ACTIONS_RUNNER_DEBUG", "NODE_VERSION", "DEPLOY_TOKEN"],
      setupSteps: [
        "Create .github/workflows/deploy.yml",
        "Set up checkout, node setup, and install steps",
        "Add linting and testing steps",
        "Configure deployment to Vercel/Railway/Render",
        "Add secrets in GitHub repo settings",
      ],
      packages: [],
    },
    integration: {
      connectsTo: [
        "nextjs",
        "react",
        "node",
        "python_fastapi",
        "vercel",
        "railway",
        "docker_vps",
      ],
      notes:
        "GitHub Actions can deploy to any platform. Use Vercel CLI, Railway CLI, or SSH deploy for Ethiopian VPS.",
    },
    ethiopianSupport: "Excellent — free for public repos. Works globally.",
    limitations: [
      "2000 min/mo free for private repos (runs out fast)",
      "Workflow complexity grows with multi-service apps",
    ],
    docsUrl: "https://docs.github.com/en/actions",
  },

  // ─── PAYMENT ───
  {
    id: "chapa",
    name: "Chapa (Ethiopian Payment)",
    icon: "🇪🇹",
    description:
      "Ethiopian payment gateway supporting Telebirr, CB Birr, CBE, Amole, mobile money, and bank transfers.",
    category: "payment",
    recommended: true,
    freeTier: "No monthly fees — per-transaction pricing only",
    pricing:
      "3.5% + 5 ETB per transaction (local cards/mobile money). 5% for international cards",
    scalability:
      "Good — handles growing transaction volumes, no monthly commitments",
    config: {
      envVars: [
        "CHAPA_SECRET_KEY",
        "CHAPA_API_KEY",
        "NEXT_PUBLIC_CHAPA_CALLBACK_URL",
      ],
      setupSteps: [
        "Create Chapa merchant account (chapa.co)",
        "Get API keys from dashboard",
        "Install Chapa SDK or use REST API",
        "Implement checkout flow with webhook handler",
        "Test in sandbox mode before going live",
      ],
      packages: ["chapa-nodejs"],
    },
    integration: {
      connectsTo: ["nextjs", "node", "nextjs_api", "supabase_db"],
      notes:
        "Chapa is the leading Ethiopian payment gateway. Supports Telebirr, Amole, CBE Birr, and more. Webhook for payment confirmation.",
    },
    ethiopianSupport:
      "Purpose-built for Ethiopia — supports Telebirr, CB Birr, CBE, Amole, and bank transfers. Local support available.",
    limitations: [
      "Ethiopian Birr only (no multi-currency)",
      "Requires Ethiopian business license",
      "Payouts in ETB to Ethiopian bank accounts",
    ],
    docsUrl: "https://developer.chapa.co",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "💸",
    description:
      "Global payment gateway supporting credit/debit cards, PayPal balance, and 200+ countries.",
    category: "payment",
    recommended: false,
    freeTier: "No monthly fees",
    pricing:
      "3.49% + $0.49 per transaction (standard). 2.99% + $0.49 (Merchant rates after volume)",
    scalability:
      "Excellent — handles global payments, fraud protection, dispute resolution",
    config: {
      envVars: [
        "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
        "PAYPAL_CLIENT_SECRET",
        "PAYPAL_WEBHOOK_ID",
      ],
      setupSteps: [
        "Create PayPal Developer account",
        "Create REST API app for client ID and secret",
        "Install @paypal/react-paypal-js for frontend",
        "Implement server-side order capture",
        "Set up webhooks for payment events",
      ],
      packages: ["@paypal/react-paypal-js", "@paypal/checkout-server-sdk"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "nextjs_api"],
      notes:
        "PayPal is good for international customers. For Ethiopian customers, combine with Chapa for local payments.",
    },
    ethiopianSupport:
      "Limited — PayPal doesn't directly serve Ethiopia. Ethiopian customers need international accounts.",
    limitations: [
      "Not directly available in Ethiopia",
      "Higher fees for cross-border transactions",
      "Account holds/freezes common for Ethiopian merchants",
    ],
    docsUrl: "https://developer.paypal.com",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "💳",
    description:
      "Global payment infrastructure supporting 135+ currencies, subscriptions, and marketplace payouts.",
    category: "payment",
    recommended: false,
    freeTier: "No monthly fees",
    pricing:
      "2.9% + $0.30 per transaction (standard cards). 2.7% + $0.30 (Amex). International: +1.5%",
    scalability:
      "Excellent — enterprise-grade, global scaling, Stripe Connect for marketplaces",
    config: {
      envVars: [
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "STRIPE_PRICE_ID",
      ],
      setupSteps: [
        "Create Stripe account",
        "Get API keys from dashboard",
        "Install stripe-js and stripe packages",
        "Implement checkout with Stripe Checkout or Elements",
        "Set up webhook endpoint for payment events",
      ],
      packages: ["stripe", "@stripe/stripe-js"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "nextjs_api", "vercel"],
      notes:
        "Best for subscription-based apps. Stripe Checkout is quick to implement. Stripe Connect for marketplace payouts.",
    },
    ethiopianSupport:
      "Not available for Ethiopian merchants. Use Chapa for Ethiopian payments, Stripe for international customers.",
    limitations: [
      "Not available in Ethiopia (no Stripe account for Ethiopian businesses)",
      "Complex payout setup for African markets",
    ],
    docsUrl: "https://stripe.com/docs",
  },
  {
    id: "telebirr",
    name: "Telebirr (Ethiopian Mobile Money)",
    icon: "📱",
    description:
      "Ethio Telecom's mobile money service — the most widely used digital payment in Ethiopia.",
    category: "payment",
    recommended: true,
    freeTier: "No monthly fees — per-transaction pricing",
    pricing:
      "1% per transaction (typically capped at ~50 ETB). Merchant settlement: 1-2 business days",
    scalability:
      "Good — millions of Ethiopian users, growing rapidly. Best reach in Ethiopia.",
    config: {
      envVars: [
        "TELEBIRR_API_KEY",
        "TELEBIRR_MERCHANT_ID",
        "TELEBIRR_CALLBACK_URL",
        "TELEBIRR_SECRET",
      ],
      setupSteps: [
        "Register as Telebirr merchant (via Ethio Telecom)",
        "Receive API credentials",
        "Implement Telebirr payment widget",
        "Handle callback and webhook for payment confirmation",
        "Implement payment verification endpoint",
      ],
      packages: [],
    },
    integration: {
      connectsTo: ["nextjs", "node", "nextjs_api", "chapa"],
      notes:
        "Telebirr is the most accessible payment method in Ethiopia (mobile-based). Chapa wraps Telebirr for easier integration.",
    },
    ethiopianSupport:
      "The best option for Ethiopian users — works on any phone, no smartphone required. Nearly every Ethiopian adult has Telebirr.",
    limitations: [
      "Requires Ethiopian business registration",
      "Integration requires direct partnership with Ethio Telecom",
      "Can be handled through Chapa API instead of direct integration",
    ],
    docsUrl: "https://www.ethiotelecom.et/telebirr/",
  },

  // ─── EMAIL ───
  {
    id: "resend",
    name: "Resend",
    icon: "📨",
    description:
      "Modern email API for developers with high deliverability, React email support, and analytics.",
    category: "email",
    recommended: true,
    freeTier: "Free: 100 emails/day, 3,000 emails/month",
    pricing:
      "Pro: $20/mo (50K emails). Bulk: $50/mo (250K emails). Enterprise: custom",
    scalability:
      "Excellent — high deliverability, dedicated IPs on higher tiers, webhooks for tracking",
    config: {
      envVars: ["RESEND_API_KEY", "RESEND_AUDIENCE_ID", "RESEND_FROM_EMAIL"],
      setupSteps: [
        "Create Resend account",
        "Verify domain for sending",
        "Install resend package",
        "Create email templates with React Email",
        "Set up API endpoint for sending",
      ],
      packages: ["resend", "@react-email/components"],
    },
    integration: {
      connectsTo: ["nextjs", "node", "supabase_db"],
      notes:
        "Resend integrates natively with Next.js. Use React Email for beautiful, responsive email templates.",
    },
    ethiopianSupport:
      "Good — works globally with high deliverability to Ethiopian email providers.",
    limitations: [
      "100 emails/day free tier is limited",
      "No free tier on higher volumes",
    ],
    docsUrl: "https://resend.com/docs",
  },
  {
    id: "sendgrid",
    name: "SendGrid (Twilio)",
    icon: "✉️",
    description:
      "Proven email service with 99.9% uptime, 40+ billion emails/month, and advanced analytics.",
    category: "email",
    recommended: false,
    freeTier: "Free: 100 emails/day forever, 2,000 contacts for marketing",
    pricing: "Essentials: $19.95/mo (50K emails). Pro: $89.95/mo (100K emails)",
    scalability:
      "Excellent — enterprise-grade, dedicated IPs, sub-user management, webhook event tracking",
    config: {
      envVars: [
        "SENDGRID_API_KEY",
        "SENDGRID_FROM_EMAIL",
        "SENDGRID_TEMPLATE_ID",
      ],
      setupSteps: [
        "Create SendGrid account",
        "Verify sender identity (single sender or domain)",
        "Generate API key",
        "Create email templates in SendGrid dashboard",
        "Implement send via @sendgrid/mail",
      ],
      packages: ["@sendgrid/mail"],
    },
    integration: {
      connectsTo: ["node", "nextjs_api", "python_fastapi"],
      notes:
        "SendGrid is battle-tested but the API is older. Resend is more modern but SendGrid is more proven.",
    },
    ethiopianSupport:
      "Good — reliable delivery to Ethiopian email providers (Ethio Telecom, Gmail, Yahoo).",
    limitations: [
      "100 emails/day free tier is very limited",
      "API is more complex than Resend",
      "IP reputation can be an issue on free plan",
    ],
    docsUrl: "https://docs.sendgrid.com",
  },

  // ─── CACHE ───
  {
    id: "redis_upstash",
    name: "Upstash Redis",
    icon: "🔴",
    description:
      "Serverless Redis with REST API, durable storage, and global replication. No persistent connection needed.",
    category: "cache",
    recommended: true,
    freeTier:
      "Free: 10,000 commands/day, 256MB storage, 20 concurrent connections",
    pricing:
      "Pay-as-you-go: $0.3/100K commands. Pro: $19/mo (1M commands/day, 1GB storage)",
    scalability:
      "Excellent — serverless auto-scaling, global replication, no connection limits",
    config: {
      envVars: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
      setupSteps: [
        "Create Upstash account",
        "Create Redis database",
        "Copy REST URL and token to .env",
        "Install @upstash/redis package",
        "Implement caching with get/set pattern",
      ],
      packages: ["@upstash/redis"],
    },
    integration: {
      connectsTo: ["nextjs", "nextjs_api", "node", "vercel"],
      notes:
        "Upstash Redis works with serverless/edge functions (no persistent connection needed). Use for caching, rate limiting, session storage.",
    },
    ethiopianSupport:
      "Good — global infrastructure. REST API works everywhere.",
    limitations: [
      "10,000 commands/day free tier is limited",
      "REST API adds latency vs direct Redis connections",
    ],
    docsUrl: "https://docs.upstash.com/redis",
  },
  {
    id: "redis_self",
    name: "Self-Hosted Redis",
    icon: "💾",
    description:
      "In-memory data store for caching, rate limiting, session management, and pub/sub messaging.",
    category: "cache",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free (self-hosted). VPS: $5-10/mo for a Redis-optimized server",
    scalability:
      "Excellent — Redis Cluster, sentinel for HA, read replicas, Lua scripting",
    config: {
      envVars: ["REDIS_URL", "REDIS_PASSWORD", "REDIS_PORT", "REDIS_HOST"],
      setupSteps: [
        "Install Redis on VPS or use Docker: docker run -d redis",
        "Configure redis.conf for persistence and security",
        "Set up Redis Cluster for high availability if needed",
        "Connect with ioredis or node-redis",
      ],
      packages: ["ioredis", "redis"],
    },
    integration: {
      connectsTo: ["node", "python_fastapi", "django", "docker_vps"],
      notes:
        "Full control over Redis configuration. Best for apps needing pub/sub or complex caching strategies.",
    },
    ethiopianSupport:
      "Best for Ethiopian hosting — run on local VPS for low latency. Full control over data residency.",
    limitations: [
      "Requires DevOps setup and maintenance",
      "Memory-only (RDB/AOF for persistence has trade-offs)",
    ],
    docsUrl: "https://redis.io/documentation",
  },

  // ─── TESTING ───
  {
    id: "jest",
    name: "Jest + React Testing Library",
    icon: "🧪",
    description:
      "Popular testing framework for JavaScript/TypeScript with React component testing and code coverage.",
    category: "testing",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — parallel test execution, watch mode, snapshot testing, code coverage reports",
    config: {
      envVars: ["JEST_ENV", "CI", "COVERAGE_THRESHOLD"],
      setupSteps: [
        "npm install -D jest @testing-library/react jest-environment-jsdom",
        "Configure jest.config.ts for React and TypeScript",
        "Write unit tests for components and utilities",
        "Set up GitHub Actions to run tests on push",
        "Add coverage thresholds to enforce quality",
      ],
      packages: [
        "jest",
        "@testing-library/react",
        "@testing-library/jest-dom",
        "jest-environment-jsdom",
        "ts-jest",
      ],
    },
    integration: {
      connectsTo: ["nextjs", "react", "github_actions", "node"],
      notes:
        "Jest is the standard for React testing. Combine with React Testing Library for component tests.",
    },
    ethiopianSupport:
      "Fully supported — works globally. No regional limitations.",
    limitations: [
      "Configuration can be complex for Next.js",
      "Slow on large codebases without optimization",
    ],
    docsUrl: "https://jestjs.io",
  },
  {
    id: "playwright",
    name: "Playwright",
    icon: "🎭",
    description:
      "End-to-end testing framework supporting Chromium, Firefox, and WebKit with auto-waiting.",
    category: "testing",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — parallel test execution across browsers, trace viewer, codegen, CI integration",
    config: {
      envVars: ["PLAYWRIGHT_BASE_URL", "CI"],
      setupSteps: [
        "npm install -D @playwright/test",
        "npx playwright install",
        "Configure playwright.config.ts",
        "Write E2E tests for critical user flows",
        "Add to GitHub Actions workflow",
      ],
      packages: ["@playwright/test"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "github_actions", "vercel"],
      notes:
        "Playwright tests real user flows in real browsers. Use for critical paths: signup, checkout, etc.",
    },
    ethiopianSupport:
      "Fully supported — works globally. No regional limitations.",
    limitations: [
      "Slower than unit tests (runs real browsers)",
      "Requires more CI resources",
    ],
    docsUrl: "https://playwright.dev",
  },

  // ─── MONITORING ───
  {
    id: "sentry",
    name: "Sentry",
    icon: "📡",
    description:
      "Error tracking and performance monitoring for web apps with real-time alerts and issue management.",
    category: "monitoring",
    recommended: true,
    freeTier: "Free: 5K events/month, 1 user, 30-day retention",
    pricing:
      "Team: $26/mo (50K events, 3 users, 90-day retention). Business: $80/mo",
    scalability:
      "Excellent — handles millions of events, performance tracing, custom dashboards",
    config: {
      envVars: [
        "NEXT_PUBLIC_SENTRY_DSN",
        "SENTRY_ORG",
        "SENTRY_PROJECT",
        "SENTRY_AUTH_TOKEN",
      ],
      setupSteps: [
        "Create Sentry account",
        "Create project for your framework",
        "Install @sentry/nextjs package",
        "Run npx @sentry/wizard to configure",
        "Set up source maps for error context",
      ],
      packages: ["@sentry/nextjs"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "vercel"],
      notes:
        "Sentry is essential for production apps. Catch errors in real-time with full stack traces and user context.",
    },
    ethiopianSupport:
      "Good — global service. Errors are logged regardless of user location.",
    limitations: [
      "5K events/month free tier is very limited",
      "Performance monitoring is a paid feature",
    ],
    docsUrl: "https://docs.sentry.io",
  },
  {
    id: "posthog",
    name: "PostHog",
    icon: "🦔",
    description:
      "Open-source product analytics, session recording, feature flags, and heatmaps — self-hosted or cloud.",
    category: "monitoring",
    recommended: false,
    freeTier:
      "Cloud: 1M events/month free. Self-hosted: free (own infrastructure)",
    pricing:
      "Cloud Scale: $0.00035/event. Enterprise: custom. Self-hosted: free (infra costs)",
    scalability:
      "Excellent — scales to millions of events, session replay, feature flags, experiments",
    config: {
      envVars: [
        "NEXT_PUBLIC_POSTHOG_KEY",
        "NEXT_PUBLIC_POSTHOG_HOST",
        "POSTHOG_API_KEY",
      ],
      setupSteps: [
        "Create PostHog account (cloud.posthog.com)",
        "Get project API key",
        "Install posthog-js and posthog-node",
        "Set up PostHog provider in layout.tsx",
        "Configure autocapture and custom events",
      ],
      packages: ["posthog-js", "posthog-node"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node", "supabase_db"],
      notes:
        "PostHog is an all-in-one analytics platform. Session recording shows exactly how users interact.",
    },
    ethiopianSupport:
      "Good — cloud version works globally. Self-hosted option for data residency concerns.",
    limitations: [
      "Self-hosted requires infrastructure",
      "Cloud version has data residency concerns",
    ],
    docsUrl: "https://posthog.com/docs",
  },
];
