// ─── Vibe Coder's Tech Stack Advisor — Complete Data Taxonomy ──
// This file defines every project type, tool category, tool option,
// integration rules, Ethiopian-specific adaptations, and
// business recommendations.

// ============================================================
// 1. PROJECT TYPES
// ============================================================
export type ProjectType = {
  id: string;
  label: string;
  icon: string;
  description: string;
  businessFeatures: string[]; // business-specific feature recommendations
};

export const projectTypes: ProjectType[] = [
  {
    id: "lms",
    label: "LMS / Learning Platform",
    icon: "🎓",
    description:
      "A learning management system with courses, quizzes, progress tracking, video lectures, and student management.",
    businessFeatures: [
      "Course creation & management dashboard",
      "Video lecture hosting with progress tracking",
      "Quiz & assessment engine with auto-grading",
      "Student enrollment & cohort management",
      "Certificates & completion tracking",
      "Course ratings & reviews system",
      "Discussion forums & Q&A",
      "Live session scheduling (Zoom/Meet integration)",
      "Assignment submission & grading",
      "Gamification (badges, leaderboards, XP)",
      "Content drip scheduling",
      "Multi-instructor support with revenue splits",
    ],
  },
  {
    id: "ecommerce",
    label: "E-Commerce / Marketplace",
    icon: "🛒",
    description:
      "An online store or marketplace with product listings, cart, checkout, payments, and order management.",
    businessFeatures: [
      "Product catalog with categories & variants",
      "Shopping cart & wishlist",
      "Secure checkout with multiple payment gateways",
      "Order tracking & management",
      "Inventory management & stock alerts",
      "Seller/vendor dashboard (for marketplaces)",
      "Product reviews & ratings",
      "Discount coupons & promotional campaigns",
      "Shipping & delivery tracking",
      "Abandoned cart recovery",
      "Multi-currency & multi-language support",
      "Returns & refunds management",
    ],
  },
  {
    id: "saas",
    label: "SaaS Platform",
    icon: "☁️",
    description:
      "A subscription-based software service with user accounts, billing, and scalable cloud infrastructure.",
    businessFeatures: [
      "User onboarding wizard & tutorials",
      "Subscription & billing management (Stripe/PayPal)",
      "Multi-tenant architecture",
      "Role-based access control (RBAC)",
      "Usage analytics & dashboards",
      "API access & developer portal",
      "Team/collaboration features",
      "White-labeling options",
      "Feature flags & A/B testing",
      "Automated email notifications",
      "Data export & reporting",
      "SSO & enterprise authentication",
    ],
  },
  {
    id: "social",
    label: "Social Media / Community",
    icon: "💬",
    description:
      "A social platform with user profiles, posts, feeds, messaging, and community features.",
    businessFeatures: [
      "User profiles with avatars & bios",
      "News feed with algorithmic or chronological排序",
      "Posts, likes, comments & shares",
      "Direct messaging & chat",
      "Groups & communities",
      "Content moderation tools",
      "Notifications (push & email)",
      "Stories & temporary content",
      "Follow/unfollow system",
      "Hashtags & content discovery",
      "Live streaming capabilities",
      "Analytics for content creators",
    ],
  },
  {
    id: "erp",
    label: "Enterprise ERP System",
    icon: "🏢",
    description:
      "An enterprise resource planning system integrating finance, HR, inventory, operations, and reporting.",
    businessFeatures: [
      "Financial management (GL, AP, AR, reconciliation)",
      "Human resources & payroll management",
      "Inventory & supply chain management",
      "Project management & timesheets",
      "Customer relationship management (CRM)",
      "Purchase order & procurement",
      "Asset management",
      "Business intelligence dashboards",
      "Multi-branch/branch management",
      "Compliance & audit trails",
      "Approval workflows",
      "Document management system",
    ],
  },
  {
    id: "fintech",
    label: "Fintech / Payment Platform",
    icon: "💳",
    description:
      "A financial technology platform handling payments, transfers, wallets, and financial data.",
    businessFeatures: [
      "Digital wallet & balance management",
      "Peer-to-peer transfers",
      "Bill payments & utilities",
      "Transaction history & receipts",
      "Mobile money integration (Chapa, Telebirr)",
      "Bank transfer reconciliation",
      "Multi-currency support",
      "Recurring payments & subscriptions",
      "KYC & identity verification",
      "Fraud detection & prevention",
      "Admin approval workflows for large transactions",
      "Financial reporting & analytics",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare / Telemedicine",
    icon: "🏥",
    description:
      "A healthcare platform with patient management, appointments, telemedicine, and medical records.",
    businessFeatures: [
      "Patient registration & medical records",
      "Appointment scheduling & reminders",
      "Video consultations (telemedicine)",
      "E-prescriptions & pharmacy integration",
      "Lab results & diagnostic uploads",
      "HIPAA/GDPR compliance features",
      "Doctor availability & scheduling",
      "Payment & insurance processing",
      "Health analytics & reporting",
      "Patient portal & self-service",
      "Multi-clinic/hospital management",
      "Emergency alert system",
    ],
  },
  {
    id: "realestate",
    label: "Real Estate Platform",
    icon: "🏠",
    description:
      "A real estate platform with property listings, virtual tours, agent management, and client inquiries.",
    businessFeatures: [
      "Property listing with images & virtual tours",
      "Advanced search & filters (location, price, type)",
      "Interactive maps & neighborhood data",
      "Agent/broker profiles & management",
      "Mortgage calculator & affordability tools",
      "Property comparison tool",
      "Inquiry & appointment booking",
      "Favorite/saved properties",
      "Market analytics & price trends",
      "Virtual open house scheduling",
      "Rental management & lease tracking",
      "Document signing & workflow",
    ],
  },
  {
    id: "content",
    label: "Content / Media Platform",
    icon: "📺",
    description:
      "A content platform for blogs, videos, podcasts, or digital media with subscriptions and monetization.",
    businessFeatures: [
      "Content management system (CMS)",
      "Video/audio streaming & hosting",
      "Subscription & paywall system",
      "Content categorization & tags",
      "SEO optimization tools",
      "Reader/viewer analytics",
      "Comments & community engagement",
      "Newsletter & email digests",
      "Ad management & revenue tracking",
      "Multi-author support",
      "Content scheduling & publishing workflow",
      "Membership tiers & exclusive content",
    ],
  },
  {
    id: "booking",
    label: "Booking / Reservation System",
    icon: "📅",
    description:
      "A booking platform for services, hotels, restaurants, or appointments with availability management.",
    businessFeatures: [
      "Service/resource catalog",
      "Real-time availability calendar",
      "Online booking & reservation",
      "Payment at booking or deposit",
      "Automated confirmation & reminders",
      "Staff/resource management",
      "Cancellation & rescheduling policy",
      "Waitlist management",
      "Review & rating system",
      "Multi-location management",
      "POS integration for on-site payments",
      "Analytics & revenue reporting",
    ],
  },
];

// ============================================================
// 2. TECH STACK CATEGORIES & OPTIONS
// ============================================================

export type ToolCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  required: boolean;
};

export const toolCategories: ToolCategory[] = [
  {
    id: "frontend",
    label: "Frontend Framework",
    icon: "🖥️",
    description: "The UI framework for building the user interface",
    required: true,
  },
  {
    id: "backend",
    label: "Backend / API",
    icon: "⚙️",
    description: "Server-side runtime and API framework",
    required: true,
  },
  {
    id: "database",
    label: "Database",
    icon: "🗄️",
    description: "Primary data storage and query engine",
    required: true,
  },
  {
    id: "auth",
    label: "Authentication & Authorization",
    icon: "🔐",
    description: "User identity, login, and access control",
    required: true,
  },
  {
    id: "storage",
    label: "File & Media Storage",
    icon: "📁",
    description: "Image, video, and file hosting",
    required: false,
  },
  {
    id: "deploy_frontend",
    label: "Frontend Deployment",
    icon: "🚀",
    description: "Hosting and delivery of the frontend app",
    required: true,
  },
  {
    id: "deploy_backend",
    label: "Backend Deployment",
    icon: "☁️",
    description: "Server hosting and infrastructure",
    required: true,
  },
  {
    id: "cicd",
    label: "CI/CD Pipeline",
    icon: "🔄",
    description: "Automated testing, building, and deployment",
    required: false,
  },
  {
    id: "payment",
    label: "Payment Gateway",
    icon: "💳",
    description: "Payment processing and money handling",
    required: false,
  },
  {
    id: "email",
    label: "Email Service",
    icon: "📧",
    description: "Transactional and marketing emails",
    required: false,
  },
  {
    id: "cache",
    label: "Caching & Rate Limiting",
    icon: "⚡",
    description: "Performance optimization and request throttling",
    required: false,
  },
  {
    id: "testing",
    label: "Testing Framework",
    icon: "🧪",
    description: "Automated testing for quality assurance",
    required: false,
  },
  {
    id: "monitoring",
    label: "Monitoring & Analytics",
    icon: "📊",
    description: "Application monitoring, logging, and analytics",
    required: false,
  },
];

// ============================================================
// 3. TOOL DEFINITIONS
// ============================================================

export type ToolOption = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  recommended: boolean;
  freeTier: string;
  pricing: string;
  scalability: string;
  config: {
    envVars: string[];
    setupSteps: string[];
    packages: string[];
  };
  integration: {
    connectsTo: string[]; // tool IDs it integrates with
    notes: string;
  };
  ethiopianSupport: string;
  limitations: string[];
  docsUrl: string;
};

export const tools: ToolOption[] = [
  // ─── FRONTEND ───
  {
    id: "nextjs",
    name: "Next.js",
    icon: "▲",
    description:
      "React framework with SSR, SSG, API routes, and file-based routing. Best for full-stack apps.",
    category: "frontend",
    recommended: true,
    freeTier: "Fully open-source, free to use",
    pricing: "Free — Vercel hosting has pay-as-you-go plans",
    scalability:
      "Excellent — supports ISR, edge functions, CDN caching, auto-scaling on Vercel",
    config: {
      envVars: [
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "DATABASE_URL",
      ],
      setupSteps: [
        "npx create-next-app@latest my-app --typescript --tailwind",
        "Configure next.config.js for images, rewrites, etc.",
        "Set up layout.tsx with fonts and metadata",
        "Create pages under app/ directory using App Router",
      ],
      packages: ["next", "react", "react-dom", "@types/node", "typescript"],
    },
    integration: {
      connectsTo: ["supabase", "vercel", "github_actions", "react"],
      notes:
        "Next.js integrates seamlessly with Supabase via @supabase/ssr package. Deploy on Vercel for optimal performance with automatic ISR and edge functions.",
    },
    ethiopianSupport:
      "Fully supported. Host on Vercel (global) or Ethiopian hosts like Habesha Host.",
    limitations: [
      "Serverless functions have 10s timeout on Vercel Hobby plan",
      "ISR has 60s minimum revalidation on Vercel",
    ],
    docsUrl: "https://nextjs.org/docs",
  },
  {
    id: "react",
    name: "React.js",
    icon: "⚛️",
    description: "Popular UI library for building component-based interfaces.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Good — requires additional tooling for SSR/SSG (Next.js, Gatsby, or Remix)",
    config: {
      envVars: [
        "REACT_APP_API_URL",
        "REACT_APP_SUPABASE_URL",
        "REACT_APP_SUPABASE_ANON_KEY",
      ],
      setupSteps: [
        "npx create-react-app my-app --template typescript",
        "Configure proxy for API in package.json",
        "Set up routing with react-router-dom",
        "Configure environment variables with REACT_APP_ prefix",
      ],
      packages: ["react", "react-dom", "react-router-dom", "typescript"],
    },
    integration: {
      connectsTo: ["supabase", "netlify", "github_actions"],
      notes:
        "React pairs well with Supabase for real-time features. Deploy on Netlify or Vercel.",
    },
    ethiopianSupport:
      "Fully supported. Deploy on Netlify (free tier available) or any static host.",
    limitations: [
      "No built-in SSR — needs Next.js or Remix for SEO",
      "CRA is deprecated; use Vite for new projects",
    ],
    docsUrl: "https://react.dev",
  },
  {
    id: "vite_react",
    name: "Vite + React",
    icon: "⚡",
    description:
      "Fast build tool for React with HMR, optimized builds, and TypeScript support.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability: "Good — fast builds and optimized production bundles",
    config: {
      envVars: ["VITE_API_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
      setupSteps: [
        "npm create vite@latest my-app -- --template react-ts",
        "Configure vite.config.ts for proxy and aliases",
        "Install and configure Tailwind CSS",
        "Set up routing with react-router-dom",
      ],
      packages: ["vite", "react", "react-dom", "react-router-dom"],
    },
    integration: {
      connectsTo: ["supabase", "netlify", "github_actions"],
      notes:
        "Vite is the modern replacement for CRA. Fast dev server with HMR.",
    },
    ethiopianSupport:
      "Fully supported. Deploy on Netlify, Vercel, or Cloudflare Pages.",
    limitations: [
      "No SSR — use with a separate backend or add Astro/Next.js",
      "Smaller ecosystem than Next.js for full-stack",
    ],
    docsUrl: "https://vitejs.dev",
  },
  {
    id: "angular",
    name: "Angular",
    icon: "🅰️",
    description:
      "Full-featured framework with built-in routing, forms, HTTP client, and state management.",
    category: "frontend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Excellent — enterprise-grade with strong typing, DI, and module system",
    config: {
      envVars: ["API_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"],
      setupSteps: [
        "ng new my-app --routing --style=scss",
        "Generate components, services, and modules",
        "Configure environment files",
        "Set up Angular Material or Tailwind CSS",
      ],
      packages: [
        "@angular/core",
        "@angular/router",
        "@angular/forms",
        "@angular/common",
      ],
    },
    integration: {
      connectsTo: ["supabase", "firebase", "github_actions"],
      notes:
        "Angular + Supabase works well for enterprise apps with complex forms.",
    },
    ethiopianSupport:
      "Fully supported. Larger bundle size — consider Ethiopian internet speeds.",
    limitations: [
      "Steeper learning curve",
      "Heavier bundle size compared to React/Vue",
    ],
    docsUrl: "https://angular.dev",
  },

  // ─── BACKEND ───
  {
    id: "node",
    name: "Node.js + Express",
    icon: "🟢",
    description:
      "JavaScript runtime with Express framework for building REST APIs and server-side logic.",
    category: "backend",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free — hosting costs apply",
    scalability:
      "Good — horizontal scaling with load balancers, clustering, and PM2",
    config: {
      envVars: [
        "PORT",
        "DATABASE_URL",
        "JWT_SECRET",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "CORS_ORIGIN",
      ],
      setupSteps: [
        "npm init -y && npm install express cors dotenv",
        "Create server.js with middleware setup",
        "Set up route handlers and controllers",
        "Connect to database with Prisma or Drizzle ORM",
        "Implement authentication middleware",
      ],
      packages: [
        "express",
        "cors",
        "dotenv",
        "prisma",
        "@prisma/client",
        "jsonwebtoken",
      ],
    },
    integration: {
      connectsTo: [
        "supabase",
        "mongodb",
        "postgresql",
        "vercel",
        "railway",
        "github_actions",
      ],
      notes:
        "Node.js works with any database. Use Prisma ORM for type-safe DB access. Deploy on Railway, Render, or Fly.io.",
    },
    ethiopianSupport:
      "Fully supported. Deploy on Railway (free tier) or Ethiopian VPS (Habesha Host).",
    limitations: [
      "Single-threaded — CPU-intensive tasks block the event loop",
      "Callback hell without proper async/await patterns",
    ],
    docsUrl: "https://expressjs.com",
  },
  {
    id: "nextjs_api",
    name: "Next.js API Routes",
    icon: "▲",
    description:
      "API routes built directly into Next.js — no separate backend server needed.",
    category: "backend",
    recommended: true,
    freeTier: "Free on Vercel Hobby plan",
    pricing:
      "Vercel Hobby: Free (100k edge functions/mo). Pro: $20/mo (1M functions)",
    scalability:
      "Excellent — auto-scales with Vercel edge/serverless functions",
    config: {
      envVars: [
        "DATABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "JWT_SECRET",
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
      ],
      setupSteps: [
        "Create route files under app/api/ directory",
        "Use NextRequest/NextResponse for request handling",
        "Implement middleware for auth and rate limiting",
        "Connect to database using Supabase or ORM",
      ],
      packages: [
        "next",
        "@supabase/supabase-js",
        "@supabase/ssr",
        "jsonwebtoken",
      ],
    },
    integration: {
      connectsTo: [
        "supabase",
        "nextjs",
        "vercel",
        "postgresql",
        "github_actions",
      ],
      notes:
        "Best for full-stack Next.js apps. Keep API logic in route handlers. Use middleware.ts for global auth.",
    },
    ethiopianSupport:
      "Fully supported. Combined frontend+backend reduces deployment complexity.",
    limitations: [
      "10s execution timeout on Vercel Hobby (60s on Pro)",
      "Not ideal for WebSocket-heavy apps",
    ],
    docsUrl:
      "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
  },
  {
    id: "python_fastapi",
    name: "Python FastAPI",
    icon: "🐍",
    description:
      "Modern Python framework for building fast APIs with automatic OpenAPI docs and async support.",
    category: "backend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free — hosting costs apply",
    scalability:
      "Excellent — async by default, high throughput, auto-documentation",
    config: {
      envVars: [
        "DATABASE_URL",
        "SECRET_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "ALLOWED_ORIGINS",
      ],
      setupSteps: [
        "pip install fastapi uvicorn sqlalchemy asyncpg",
        "Create main.py with FastAPI app",
        "Define Pydantic models for request/response",
        "Set up database with SQLAlchemy async session",
        "Implement authentication with JWT",
      ],
      packages: [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "asyncpg",
        "python-jose",
        "passlib",
      ],
    },
    integration: {
      connectsTo: ["postgresql", "supabase", "railway", "docker"],
      notes:
        "FastAPI + Supabase is great for AI/ML backends. Deploy on Railway or Render.",
    },
    ethiopianSupport:
      "Fully supported. Python is popular in Ethiopian universities — easier to find devs.",
    limitations: [
      "Smaller job market for Python web devs in Ethiopia",
      "Async SQLAlchemy has a learning curve",
    ],
    docsUrl: "https://fastapi.tiangolo.com",
  },
  {
    id: "django",
    name: "Django",
    icon: "🎸",
    description:
      "High-level Python web framework with batteries included — admin panel, ORM, auth.",
    category: "backend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free — hosting costs apply",
    scalability:
      "Good — caching, DB replication, CDN integration. Can handle high traffic with proper architecture.",
    config: {
      envVars: [
        "DATABASE_URL",
        "SECRET_KEY",
        "DEBUG",
        "ALLOWED_HOSTS",
        "CORS_ALLOWED_ORIGINS",
      ],
      setupSteps: [
        "pip install django djangorestframework django-cors-headers",
        "django-admin startproject myproject",
        "Configure settings.py for database and installed apps",
        "Create models, serializers, and views",
        "Set up Django REST Framework for API endpoints",
      ],
      packages: [
        "django",
        "djangorestframework",
        "django-cors-headers",
        "psycopg2-binary",
      ],
    },
    integration: {
      connectsTo: ["postgresql", "heroku", "docker", "github_actions"],
      notes:
        "Django admin panel is great for internal tools. DRF for REST APIs.",
    },
    ethiopianSupport:
      "Fully supported. Many Ethiopian devs know Django. Good for ERP systems.",
    limitations: [
      "Heavier than FastAPI — not fully async",
      "ORM can be slow for complex queries",
    ],
    docsUrl: "https://www.djangoproject.com",
  },

  // ─── DATABASE ───
  {
    id: "supabase_db",
    name: "Supabase (PostgreSQL)",
    icon: "⚡",
    description:
      "Hosted PostgreSQL with real-time subscriptions, Row Level Security, and auto-generated REST/GraphQL APIs.",
    category: "database",
    recommended: true,
    freeTier:
      "Free plan: 500MB database, 50,000 monthly active users, 2GB bandwidth",
    pricing: "Pro: $25/mo (8GB DB, 100K MAU, 250GB bandwidth). Team: $599/mo",
    scalability:
      "Excellent — PostgreSQL power, connection pooling with PgBouncer, read replicas on larger plans",
    config: {
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_DB_URL",
      ],
      setupSteps: [
        "Create project at supabase.com",
        "Run schema.sql in SQL Editor",
        "Install @supabase/supabase-js and @supabase/ssr",
        "Set up RLS policies for row-level security",
        "Configure auth providers (email, Google, etc.)",
      ],
      packages: ["@supabase/supabase-js", "@supabase/ssr"],
    },
    integration: {
      connectsTo: [
        "nextjs",
        "react",
        "node",
        "nextjs_api",
        "python_fastapi",
        "vercel",
      ],
      notes:
        "Supabase provides auth, DB, storage, and real-time in one platform. Use RLS for per-user data access. The @supabase/ssr package handles cookie-based auth for Next.js.",
    },
    ethiopianSupport:
      "Excellent — free tier is generous for Ethiopian startups. Hosted globally (US/EU). For local hosting, consider self-hosted PostgreSQL.",
    limitations: [
      "Free tier DB size limited to 500MB",
      "No read replicas on Free/Pro plans",
      "RLS policies can be complex for nested queries",
    ],
    docsUrl: "https://supabase.com/docs",
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    icon: "🍃",
    description:
      "NoSQL document database with flexible schema, excellent for rapid prototyping and JSON-like data.",
    category: "database",
    recommended: false,
    freeTier: "Free M0 cluster: 512MB storage, shared RAM",
    pricing:
      "M2: $9/mo (2GB). M10: $57/mo (2GB RAM, 10GB storage). Serverless: pay-per-use",
    scalability:
      "Good — horizontal sharding, replica sets, auto-scaling with Atlas",
    config: {
      envVars: [
        "MONGODB_URI",
        "MONGODB_DB_NAME",
        "MONGODB_USER",
        "MONGODB_PASSWORD",
      ],
      setupSteps: [
        "Create cluster at mongodb.com/atlas",
        "Whitelist IP addresses",
        "Connect using mongoose or native driver",
        "Define schemas and models",
        "Set up indexes for query performance",
      ],
      packages: ["mongoose", "mongodb"],
    },
    integration: {
      connectsTo: ["node", "python_fastapi", "vercel", "railway"],
      notes:
        "Best for apps with flexible/unstructured data. Use Mongoose ODM for schema validation.",
    },
    ethiopianSupport:
      "Fully supported. Free tier is good for prototyping. Consider data residency requirements.",
    limitations: [
      "No ACID transactions (single-document only)",
      "JOINs are manual (aggregation pipeline)",
      "512MB free tier fills quickly",
    ],
    docsUrl: "https://www.mongodb.com/docs/atlas/",
  },
  {
    id: "postgresql",
    name: "PostgreSQL (Self-hosted / VPS)",
    icon: "🐘",
    description:
      "Powerful open-source relational database with advanced features, extensions, and ACID compliance.",
    category: "database",
    recommended: false,
    freeTier: "Free — self-hosted on your own server",
    pricing:
      "Free (self-hosted). VPS costs: $5-20/mo on DigitalOcean, Linode, or Ethiopian VPS",
    scalability:
      "Excellent — read replicas, partitioning, connection pooling (PgBouncer), sharding",
    config: {
      envVars: [
        "DATABASE_URL",
        "PGHOST",
        "PGPORT",
        "PGUSER",
        "PGPASSWORD",
        "PGDATABASE",
      ],
      setupSteps: [
        "Install PostgreSQL on VPS or local",
        "CREATE DATABASE and CREATE USER",
        "Configure pg_hba.conf for connections",
        "Set up PgBouncer for connection pooling",
        "Run migrations with Prisma or raw SQL",
      ],
      packages: ["pg", "prisma", "@prisma/client", "drizzle-orm"],
    },
    integration: {
      connectsTo: ["node", "python_fastapi", "django", "nextjs_api", "railway"],
      notes:
        "Full control over database. Use Prisma for type-safe queries. Good for data-intensive apps.",
    },
    ethiopianSupport:
      "Ideal for Ethiopian businesses needing local data residency. Host on Ethiopian VPS providers like Habesha Host.",
    limitations: [
      "Requires DevOps knowledge for setup and maintenance",
      "No built-in real-time (needs Supabase or pg_notify)",
    ],
    docsUrl: "https://www.postgresql.org/docs/",
  },
  {
    id: "planetscale",
    name: "PlanetScale (MySQL)",
    icon: "🌍",
    description:
      "MySQL-compatible serverless database with branching, non-blocking schema changes, and auto-scaling.",
    category: "database",
    recommended: false,
    freeTier: "Free plan: 1GB storage, 5M row reads/mo, 1M row writes/mo",
    pricing: "Scaler: $39/mo (10GB, 50M reads). Pro: $99/mo (100GB)",
    scalability:
      "Excellent — serverless auto-scaling, connection pooling, read-only replicas",
    config: {
      envVars: [
        "DATABASE_URL",
        "DATABASE_HOST",
        "DATABASE_USERNAME",
        "DATABASE_PASSWORD",
      ],
      setupSteps: [
        "Create account at planetscale.com",
        "Create database and branch",
        "Connect with Prisma or PlanetScale CLI",
        "Use deploy requests for schema changes",
      ],
      packages: ["@prisma/client", "mysql2"],
    },
    integration: {
      connectsTo: ["node", "nextjs_api", "vercel", "railway"],
      notes:
        "Great for serverless apps. Branching enables safe schema migrations.",
    },
    ethiopianSupport:
      "Fully supported but hosted globally. Not ideal for Ethiopian data residency requirements.",
    limitations: [
      "MySQL — no PostgreSQL-specific features like arrays, JSONB",
      "Free tier row limits are restrictive for growing apps",
    ],
    docsUrl: "https://planetscale.com/docs",
  },

  // ─── AUTHENTICATION ───
  {
    id: "supabase_auth",
    name: "Supabase Auth",
    icon: "⚡",
    description:
      "Built-in auth with email/password, Google, GitHub, magic link, phone, and SSO. Row Level Security included.",
    category: "auth",
    recommended: true,
    freeTier: "Free: 50,000 monthly active users, unlimited API requests",
    pricing:
      "Pro: $25/mo (100K MAU). Team: $599/mo. Additional MAU: $0.00325/user",
    scalability:
      "Excellent — scales with Supabase. RLS offloads auth logic to DB layer.",
    config: {
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXT_PUBLIC_SITE_URL",
      ],
      setupSteps: [
        "Enable auth providers in Supabase dashboard",
        "Set up @supabase/ssr for Next.js cookie-based auth",
        "Create signup/login pages with supabase.auth.signUp/signIn",
        "Configure RLS policies for database tables",
        "Set up auth callback route for OAuth",
      ],
      packages: ["@supabase/supabase-js", "@supabase/ssr"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "supabase_db", "node", "nextjs_api"],
      notes:
        "Supabase Auth is tightly integrated with the database via RLS. Perfect for Next.js apps. The @supabase/ssr package handles server-side auth seamlessly.",
    },
    ethiopianSupport:
      "Excellent — email/password works without SMS gateways. Google OAuth widely accessible.",
    limitations: [
      "Limited social login providers compared to Auth0",
      "No built-in MFA on Free plan (available on Pro)",
    ],
    docsUrl: "https://supabase.com/docs/guides/auth",
  },
  {
    id: "nextauth",
    name: "NextAuth.js (Auth.js)",
    icon: "🔑",
    description:
      "Authentication for Next.js with 80+ providers, session management, and database adapters.",
    category: "auth",
    recommended: true,
    freeTier: "Free and open-source",
    pricing: "Free (self-hosted). Auth.js Cloud: coming soon",
    scalability:
      "Excellent — works with any database adapter, JWT or database sessions",
    config: {
      envVars: [
        "AUTH_SECRET",
        "AUTH_URL",
        "AUTH_GITHUB_ID",
        "AUTH_GITHUB_SECRET",
        "AUTH_GOOGLE_ID",
        "AUTH_GOOGLE_SECRET",
        "DATABASE_URL",
      ],
      setupSteps: [
        "npm install next-auth@beta",
        "Create auth.ts with configuration",
        "Set up database adapter (Prisma, Drizzle, Supabase)",
        "Create API route handler",
        "Add middleware.ts for protected routes",
      ],
      packages: ["next-auth@beta", "@auth/prisma-adapter", "@auth/core"],
    },
    integration: {
      connectsTo: [
        "nextjs",
        "nextjs_api",
        "supabase_db",
        "postgresql",
        "mongodb",
      ],
      notes:
        "NextAuth v5 (Auth.js) is the standard for Next.js apps. Supports credentials, OAuth, and magic links.",
    },
    ethiopianSupport:
      "Excellent — supports any OAuth provider. Email magic links work well.",
    limitations: [
      "NextAuth v5 is still in beta",
      "Database session setup requires adapter configuration",
    ],
    docsUrl: "https://authjs.dev",
  },
  {
    id: "firebase_auth",
    name: "Firebase Authentication",
    icon: "🔥",
    description:
      "Google's auth service with 20+ providers, phone auth, and multi-platform SDKs.",
    category: "auth",
    recommended: false,
    freeTier: "Free: 10,000 MAU (email/password), 10,000 MAU (Google/Apple)",
    pricing:
      "Spark (Free): above limits. Blaze: pay-as-you-go ~$0.026/MAU beyond free tier",
    scalability: "Excellent — fully managed by Google, auto-scales globally",
    config: {
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_ADMIN_PRIVATE_KEY",
        "FIREBASE_ADMIN_CLIENT_EMAIL",
      ],
      setupSteps: [
        "Create Firebase project in Google Console",
        "Enable authentication providers",
        "Install firebase and firebase-admin packages",
        "Initialize Firebase app in client",
        "Set up auth state listener and protected routes",
      ],
      packages: ["firebase", "firebase-admin"],
    },
    integration: {
      connectsTo: ["react", "node", "mongodb", "firebase_db"],
      notes:
        "Firebase Auth is easy to set up but harder to integrate with custom backends than Supabase.",
    },
    ethiopianSupport:
      "Supported but Google services may be slower in Ethiopia. Phone auth may not work with Ethiopian numbers.",
    limitations: [
      "Vendor lock-in — harder to migrate away",
      "Phone auth may not support Ethiopian carriers",
      "More expensive at scale than Supabase Auth",
    ],
    docsUrl: "https://firebase.google.com/docs/auth",
  },

  // ─── STORAGE ───
  {
    id: "supabase_storage",
    name: "Supabase Storage",
    icon: "⚡",
    description:
      "S3-compatible file storage with built-in image optimization, CDN, and RLS policies.",
    category: "storage",
    recommended: true,
    freeTier:
      "Free: 1GB storage, 10GB bandwidth, 50,000 file transformations/mo",
    pricing:
      "Pro: $25/mo (100GB storage, 200GB bandwidth, 200K transformations)",
    scalability:
      "Excellent — backed by S3, CDN via Supabase CDN (resend.io), auto-scaling",
    config: {
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ],
      setupSteps: [
        "Create buckets in Supabase dashboard",
        "Set up RLS policies for bucket access",
        "Use supabase.storage.from('bucket').upload()",
        "Set up image transformations with ?transform= URL param",
        "Configure public/private bucket access",
      ],
      packages: ["@supabase/supabase-js"],
    },
    integration: {
      connectsTo: ["supabase_db", "supabase_auth", "nextjs"],
      notes:
        "Storage integrates with RLS — only authenticated users can upload. Image transformations resize on-the-fly.",
    },
    ethiopianSupport:
      "Good — global CDN. For Ethiopian users, consider latency to US/EU regions.",
    limitations: [
      "No dedicated CDN on Free plan",
      "1GB free storage is limited for video-heavy apps",
    ],
    docsUrl: "https://supabase.com/docs/guides/storage",
  },
  {
    id: "bunny",
    name: "Bunny.net Storage & CDN",
    icon: "🐰",
    description:
      "Storage and CDN with edge caching, video streaming, and very affordable pricing worldwide.",
    category: "storage",
    recommended: false,
    freeTier: "No free tier — pay-as-you-go starting at $0.01/GB",
    pricing:
      "Storage: $0.01/GB/mo. CDN: $0.01/GB for standard. Video: $0.01/GB delivered",
    scalability:
      "Excellent — global CDN with 100+ PoPs, edge rules, auto-scaling",
    config: {
      envVars: [
        "BUNNY_STORAGE_ZONE",
        "BUNNY_STORAGE_API_KEY",
        "BUNNY_CDN_URL",
        "BUNNY_PULL_ZONE",
      ],
      setupSteps: [
        "Create Bunny.net account",
        "Set up storage zone",
        "Configure pull zone for CDN",
        "Use Bunny SDK or REST API for uploads",
        "Set up video player for streaming",
      ],
      packages: ["@bunny.net/sdk"],
    },
    integration: {
      connectsTo: ["nextjs", "node", "react"],
      notes:
        "Best for video-heavy apps (LMS with video lectures). Bunny CDN has excellent global coverage including Africa.",
    },
    ethiopianSupport:
      "Excellent — Bunny CDN has edge servers in South Africa and Europe, providing good speeds for Ethiopian users.",
    limitations: [
      "No free tier — requires credit card",
      "More manual setup than Supabase Storage",
    ],
    docsUrl: "https://docs.bunny.net",
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    icon: "☁️",
    description:
      "Cloud-based image and video management with automated optimization, transformations, and CDN delivery.",
    category: "storage",
    recommended: false,
    freeTier: "Free: 25GB storage, 25GB bandwidth, 25GB transformations/mo",
    pricing:
      "Plus: $89/mo (300GB storage, 300GB bandwidth). Advanced: custom pricing",
    scalability:
      "Excellent — enterprise-grade CDN, automatic format optimization (WebP/AVIF), AI-powered cropping",
    config: {
      envVars: [
        "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "CLOUDINARY_UPLOAD_PRESET",
      ],
      setupSteps: [
        "Create Cloudinary account",
        "Configure upload presets",
        "Install @cloudinary/next and @cloudinary/react",
        "Set up CldImage component for optimized images",
        "Use upload widget for user uploads",
      ],
      packages: ["cloudinary", "@cloudinary/next", "@cloudinary/react"],
    },
    integration: {
      connectsTo: ["nextjs", "react", "node"],
      notes:
        "Best for image-heavy apps. Automatic optimization saves bandwidth. CldImage component replaces next/image.",
    },
    ethiopianSupport:
      "Good — global CDN. Free tier is generous for prototyping.",
    limitations: [
      "Free tier fills quickly with video content",
      "Expensive at scale compared to Bunny.net or Supabase Storage",
    ],
    docsUrl: "https://cloudinary.com/documentation",
  },

  // ─── FRONTEND DEPLOYMENT ───
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

  // ─── BACKEND DEPLOYMENT ───
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

// ============================================================
// 4. INTEGRATION MAPPING
// ============================================================

export type IntegrationEdge = {
  from: string;
  to: string;
  label: string;
  type: "api" | "sdk" | "webhook" | "direct" | "auth" | "deploy";
};

export const integrationEdges: IntegrationEdge[] = [
  // Frontend → Backend
  {
    from: "nextjs",
    to: "supabase_db",
    label: "SDK (supabase-js)",
    type: "sdk",
  },
  { from: "nextjs", to: "node", label: "REST API / GraphQL", type: "api" },
  {
    from: "nextjs",
    to: "nextjs_api",
    label: "Direct function call",
    type: "direct",
  },
  { from: "react", to: "node", label: "REST API / GraphQL", type: "api" },
  { from: "react", to: "supabase_db", label: "SDK (supabase-js)", type: "sdk" },
  { from: "vite_react", to: "node", label: "REST API", type: "api" },
  {
    from: "vite_react",
    to: "supabase_db",
    label: "SDK (supabase-js)",
    type: "sdk",
  },
  { from: "nextjs", to: "python_fastapi", label: "REST API", type: "api" },
  { from: "nextjs", to: "django", label: "REST API (DRF)", type: "api" },

  // Backend → Database
  {
    from: "node",
    to: "supabase_db",
    label: "Prisma / supabase-js",
    type: "sdk",
  },
  { from: "node", to: "mongodb", label: "Mongoose ODM", type: "sdk" },
  { from: "node", to: "postgresql", label: "Prisma / raw SQL", type: "direct" },
  { from: "node", to: "planetscale", label: "Prisma / mysql2", type: "sdk" },
  { from: "nextjs_api", to: "supabase_db", label: "supabase-js", type: "sdk" },
  {
    from: "nextjs_api",
    to: "postgresql",
    label: "Prisma / Drizzle",
    type: "sdk",
  },
  { from: "nextjs_api", to: "planetscale", label: "Prisma", type: "sdk" },
  {
    from: "python_fastapi",
    to: "postgresql",
    label: "SQLAlchemy",
    type: "sdk",
  },
  {
    from: "python_fastapi",
    to: "supabase_db",
    label: "supabase-py",
    type: "sdk",
  },
  {
    from: "python_fastapi",
    to: "mongodb",
    label: "Beanie / Motor",
    type: "sdk",
  },
  { from: "django", to: "postgresql", label: "Django ORM", type: "sdk" },
  { from: "django", to: "supabase_db", label: "psycopg2", type: "sdk" },

  // Auth
  { from: "nextjs", to: "supabase_auth", label: "@supabase/ssr", type: "auth" },
  { from: "nextjs", to: "nextauth", label: "Auth.js SDK", type: "auth" },
  { from: "react", to: "supabase_auth", label: "supabase-js", type: "auth" },
  { from: "react", to: "firebase_auth", label: "Firebase SDK", type: "auth" },
  {
    from: "node",
    to: "supabase_auth",
    label: "Service Role Key",
    type: "auth",
  },
  { from: "node", to: "firebase_auth", label: "firebase-admin", type: "auth" },
  { from: "node", to: "nextauth", label: "Auth.js adapters", type: "auth" },

  // Storage
  {
    from: "nextjs",
    to: "supabase_storage",
    label: "supabase-js upload",
    type: "sdk",
  },
  { from: "nextjs", to: "bunny", label: "Bunny SDK / API", type: "api" },
  { from: "nextjs", to: "cloudinary", label: "CldImage / upload", type: "sdk" },
  {
    from: "node",
    to: "supabase_storage",
    label: "Service Role Key",
    type: "sdk",
  },
  { from: "node", to: "bunny", label: "FTP / REST API", type: "api" },

  // Payment
  { from: "nextjs", to: "chapa", label: "Chapa API / webhook", type: "api" },
  { from: "nextjs", to: "paypal", label: "PayPal SDK", type: "sdk" },
  { from: "nextjs", to: "stripe", label: "Stripe.js", type: "sdk" },
  { from: "node", to: "chapa", label: "Webhook handler", type: "webhook" },
  { from: "node", to: "paypal", label: "Order capture API", type: "api" },
  { from: "node", to: "stripe", label: "Stripe SDK", type: "sdk" },

  // Email
  { from: "nextjs", to: "resend", label: "Resend API", type: "api" },
  { from: "node", to: "resend", label: "Resend SDK", type: "sdk" },
  { from: "node", to: "sendgrid", label: "SendGrid SDK", type: "sdk" },

  // Cache
  { from: "nextjs", to: "redis_upstash", label: "REST API", type: "api" },
  { from: "nextjs_api", to: "redis_upstash", label: "REST API", type: "api" },
  { from: "node", to: "redis_self", label: "ioredis", type: "sdk" },

  // Deploy
  {
    from: "nextjs",
    to: "vercel",
    label: "Git push → auto-deploy",
    type: "deploy",
  },
  {
    from: "react",
    to: "netlify",
    label: "Git push → auto-deploy",
    type: "deploy",
  },
  {
    from: "vite_react",
    to: "netlify",
    label: "Git push → auto-deploy",
    type: "deploy",
  },
  {
    from: "vite_react",
    to: "cloudflare_pages",
    label: "Git push → deploy",
    type: "deploy",
  },
  { from: "node", to: "railway", label: "Git push → deploy", type: "deploy" },
  { from: "node", to: "render", label: "Git push → deploy", type: "deploy" },
  {
    from: "python_fastapi",
    to: "railway",
    label: "Git push → deploy",
    type: "deploy",
  },
  {
    from: "python_fastapi",
    to: "render",
    label: "Git push → deploy",
    type: "deploy",
  },
  { from: "django", to: "railway", label: "Git push → deploy", type: "deploy" },
  {
    from: "docker_vps",
    to: "postgresql",
    label: "Same VPS / Docker network",
    type: "direct",
  },
  {
    from: "docker_vps",
    to: "redis_self",
    label: "Docker network",
    type: "direct",
  },

  // CI/CD
  {
    from: "github_actions",
    to: "vercel",
    label: "Vercel CLI deploy",
    type: "deploy",
  },
  {
    from: "github_actions",
    to: "railway",
    label: "Railway CLI deploy",
    type: "deploy",
  },
  {
    from: "github_actions",
    to: "docker_vps",
    label: "SSH deploy",
    type: "deploy",
  },
];

// ============================================================
// 5. ETHIOPIAN-SPECIFIC ADAPTATIONS
// ============================================================

export type EthiopianAdaptation = {
  id: string;
  title: string;
  description: string;
  tools: string[];
  category: "payment" | "hosting" | "auth" | "delivery" | "compliance";
};

export const ethiopianAdaptations: EthiopianAdaptation[] = [
  {
    id: "eth_payment_chapa",
    title: "Chapa Payment Gateway",
    description:
      "Chapa is the leading Ethiopian payment gateway supporting Telebirr, CB Birr, CBE, Amole, and bank transfers. Integrate via REST API with webhook callbacks. No monthly fees — only per-transaction pricing (3.5% + 5 ETB).",
    tools: ["chapa", "telebirr"],
    category: "payment",
  },
  {
    id: "eth_payment_telebirr",
    title: "Telebirr Mobile Money",
    description:
      "Telebirr by Ethio Telecom is the most widely used digital payment in Ethiopia with millions of active users. Works on any phone (no smartphone required). Can be integrated directly or through Chapa's API.",
    tools: ["telebirr", "chapa"],
    category: "payment",
  },
  {
    id: "eth_payment_screenshot",
    title: "Screenshot Upload + Admin Approval",
    description:
      "For Ethiopian businesses where manual payment confirmation is common, implement a screenshot upload workflow: user uploads payment screenshot → admin reviews → admin approves/rejects → membership/content is activated. This is handled via the existing admin dashboard.",
    tools: ["supabase_storage", "supabase_db", "supabase_auth"],
    category: "payment",
  },
  {
    id: "eth_hosting",
    title: "Ethiopian VPS Hosting",
    description:
      "For apps requiring Ethiopian data residency, use Habesha Host or Ethio Telecom's data centers. Deploy with Docker on VPS for full control. Combined with Cloudflare CDN for global performance.",
    tools: ["docker_vps", "postgresql", "redis_self"],
    category: "hosting",
  },
  {
    id: "eth_auth",
    title: "Ethiopian Phone Auth",
    description:
      "For Ethiopian users, email + password auth (via Supabase) is most accessible. SMS-based auth can be implemented via Ethio Telecom APIs or third-party SMS gateways. Google OAuth works for users with Google accounts.",
    tools: ["supabase_auth", "nextauth"],
    category: "auth",
  },
  {
    id: "eth_delivery",
    title: "Ethiopian Delivery & Logistics",
    description:
      "For e-commerce platforms, integrate with Ethiopian logistics providers (Ethio Express, Qongo, or local courier services). Implement order tracking with status updates and SMS notifications.",
    tools: ["node", "supabase_db", "resend"],
    category: "delivery",
  },
  {
    id: "eth_compliance",
    title: "Ethiopian Business Compliance",
    description:
      "For Ethiopian businesses: include receipt generation with Ethiopian tax requirements, invoice numbering per Ethiopian standards, and reporting for Ethiopian tax authority. Consider NID (National ID) verification for KYC.",
    tools: ["supabase_db", "node", "nextjs"],
    category: "compliance",
  },
];

// ============================================================
// 6. RECOMMENDED STACKS BY PROJECT TYPE
// ============================================================

export type RecommendedStack = {
  projectType: string;
  name: string;
  description: string;
  selections: Record<string, string>; // categoryId → toolId
  isPrimary: boolean;
  cost: "free" | "low" | "medium" | "high";
  difficulty: "beginner" | "intermediate" | "advanced";
};

export const recommendedStacks: RecommendedStack[] = [
  // LMS
  {
    projectType: "lms",
    name: "Next.js + Supabase (Recommended)",
    description:
      "Full-stack Next.js with Supabase for auth, database, and storage. Bunny.net for video hosting. Deploy on Vercel.",
    selections: {
      frontend: "nextjs",
      backend: "nextjs_api",
      database: "supabase_db",
      auth: "supabase_auth",
      storage: "bunny",
      deploy_frontend: "vercel",
      deploy_backend: "vercel",
      cicd: "github_actions",
      payment: "chapa",
      email: "resend",
      cache: "redis_upstash",
      testing: "playwright",
      monitoring: "sentry",
    },
    isPrimary: true,
    cost: "low",
    difficulty: "intermediate",
  },
  {
    projectType: "lms",
    name: "React + Node.js (Alternative)",
    description:
      "React frontend with Node.js/Express backend. MongoDB for flexible course data. Firebase auth.",
    selections: {
      frontend: "vite_react",
      backend: "node",
      database: "mongodb",
      auth: "firebase_auth",
      storage: "cloudinary",
      deploy_frontend: "netlify",
      deploy_backend: "railway",
      cicd: "github_actions",
      payment: "paypal",
      email: "sendgrid",
      cache: "redis_self",
      testing: "jest",
      monitoring: "posthog",
    },
    isPrimary: false,
    cost: "low",
    difficulty: "intermediate",
  },

  // E-Commerce
  {
    projectType: "ecommerce",
    name: "Next.js + Supabase + Stripe",
    description:
      "Next.js storefront with Supabase backend and Stripe/Chapa for payments. Bunny CDN for product images.",
    selections: {
      frontend: "nextjs",
      backend: "nextjs_api",
      database: "supabase_db",
      auth: "supabase_auth",
      storage: "cloudinary",
      deploy_frontend: "vercel",
      deploy_backend: "vercel",
      cicd: "github_actions",
      payment: "chapa",
      email: "resend",
      cache: "redis_upstash",
      testing: "playwright",
      monitoring: "sentry",
    },
    isPrimary: true,
    cost: "low",
    difficulty: "intermediate",
  },

  // SaaS
  {
    projectType: "saas",
    name: "Next.js + Supabase + Vercel",
    description:
      "Production-ready SaaS with Next.js, Supabase auth/DB, Stripe subscriptions, and Vercel deployment.",
    selections: {
      frontend: "nextjs",
      backend: "nextjs_api",
      database: "supabase_db",
      auth: "supabase_auth",
      storage: "supabase_storage",
      deploy_frontend: "vercel",
      deploy_backend: "vercel",
      cicd: "github_actions",
      payment: "stripe",
      email: "resend",
      cache: "redis_upstash",
      testing: "playwright",
      monitoring: "sentry",
    },
    isPrimary: true,
    cost: "medium",
    difficulty: "intermediate",
  },

  // ERP
  {
    projectType: "erp",
    name: "Next.js + Django + PostgreSQL",
    description:
      "Enterprise ERP with Django admin panel, Next.js frontend, PostgreSQL database, and Docker deployment on Ethiopian VPS.",
    selections: {
      frontend: "nextjs",
      backend: "django",
      database: "postgresql",
      auth: "nextauth",
      storage: "supabase_storage",
      deploy_frontend: "vercel",
      deploy_backend: "docker_vps",
      cicd: "github_actions",
      payment: "chapa",
      email: "resend",
      cache: "redis_self",
      testing: "jest",
      monitoring: "sentry",
    },
    isPrimary: true,
    cost: "medium",
    difficulty: "advanced",
  },

  // Fintech
  {
    projectType: "fintech",
    name: "Next.js + FastAPI + PostgreSQL",
    description:
      "High-performance fintech backend with FastAPI, Next.js frontend, PostgreSQL with strong consistency, and Chapa/Telebirr payments.",
    selections: {
      frontend: "nextjs",
      backend: "python_fastapi",
      database: "postgresql",
      auth: "supabase_auth",
      storage: "supabase_storage",
      deploy_frontend: "vercel",
      deploy_backend: "railway",
      cicd: "github_actions",
      payment: "chapa",
      email: "resend",
      cache: "redis_upstash",
      testing: "playwright",
      monitoring: "sentry",
    },
    isPrimary: true,
    cost: "medium",
    difficulty: "advanced",
  },
];

// ============================================================
// 7. PRODUCTION READINESS CHECKLIST
// ============================================================

export type ProductionChecklistItem = {
  category: string;
  items: {
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
    tools: string[];
  }[];
};

export const productionChecklist: ProductionChecklistItem[] = [
  {
    category: "Security",
    items: [
      {
        title: "HTTPS everywhere",
        description:
          "Enable SSL/TLS for all domains. Vercel/Railway provide auto-SSL. For VPS, use Certbot with Nginx.",
        priority: "critical",
        tools: ["vercel", "railway", "docker_vps"],
      },
      {
        title: "Environment variables",
        description:
          "Never hardcode secrets. Use .env.local for dev and platform env vars for production.",
        priority: "critical",
        tools: [],
      },
      {
        title: "Row Level Security (RLS)",
        description:
          "Enable RLS on all Supabase tables. Each query must respect user ownership.",
        priority: "critical",
        tools: ["supabase_db", "supabase_auth"],
      },
      {
        title: "Rate limiting",
        description:
          "Implement rate limiting on API routes to prevent abuse. Use Upstash Redis for serverless.",
        priority: "high",
        tools: ["redis_upstash", "redis_self"],
      },
      {
        title: "CORS configuration",
        description:
          "Restrict API access to your frontend domain only. Configure CORS in backend middleware.",
        priority: "high",
        tools: ["node", "python_fastapi", "django"],
      },
      {
        title: "Input validation",
        description:
          "Validate all user inputs server-side. Use Zod (TypeScript) or Pydantic (Python).",
        priority: "high",
        tools: [],
      },
    ],
  },
  {
    category: "Performance",
    items: [
      {
        title: "Database indexing",
        description:
          "Create indexes on frequently queried columns (user_id, email, created_at, foreign keys).",
        priority: "critical",
        tools: ["supabase_db", "postgresql", "mongodb", "planetscale"],
      },
      {
        title: "Connection pooling",
        description:
          "Use PgBouncer (Supabase has it built-in) or Prisma's connection pool for efficient DB connections.",
        priority: "high",
        tools: ["supabase_db", "postgresql", "node"],
      },
      {
        title: "Image optimization",
        description:
          "Use Next.js Image or Cloudinary for automatic WebP/AVIF conversion, resizing, and CDN delivery.",
        priority: "high",
        tools: ["nextjs", "cloudinary", "supabase_storage"],
      },
      {
        title: "Caching strategy",
        description:
          "Cache API responses with Upstash Redis or ISR for static pages. Set appropriate TTLs.",
        priority: "high",
        tools: ["redis_upstash", "redis_self", "nextjs"],
      },
      {
        title: "Code splitting & lazy loading",
        description:
          "Lazy load non-critical components. Use dynamic imports for heavy libraries.",
        priority: "medium",
        tools: ["nextjs", "react", "vite_react"],
      },
    ],
  },
  {
    category: "Database Optimization",
    items: [
      {
        title: "N+1 query prevention",
        description:
          "Use Prisma's include/select or SQL JOINs to avoid N+1 queries. Monitor with Prisma Studio.",
        priority: "critical",
        tools: ["supabase_db", "postgresql", "node"],
      },
      {
        title: "Query optimization",
        description:
          "Use EXPLAIN ANALYZE to identify slow queries. Add missing indexes. Consider materialized views for reports.",
        priority: "high",
        tools: ["postgresql", "supabase_db", "node"],
      },
      {
        title: "Database backup strategy",
        description:
          "Enable automated backups. Supabase has daily backups. Self-hosted: use pg_dump cron job.",
        priority: "high",
        tools: ["supabase_db", "postgresql"],
      },
      {
        title: "Read replicas",
        description:
          "For high-traffic apps, set up read replicas for analytics queries. Available on Supabase Pro+.",
        priority: "low",
        tools: ["supabase_db", "postgresql"],
      },
    ],
  },
  {
    category: "Testing & Quality",
    items: [
      {
        title: "Unit tests for critical logic",
        description:
          "Write Jest tests for authentication, payment processing, and data validation logic.",
        priority: "high",
        tools: ["jest", "node", "nextjs_api"],
      },
      {
        title: "E2E tests for critical flows",
        description:
          "Use Playwright to test signup, login, payment, and content access flows.",
        priority: "high",
        tools: ["playwright"],
      },
      {
        title: "CI/CD pipeline",
        description:
          "Run linting, type checking, and tests on every PR. Auto-deploy on main branch merge.",
        priority: "high",
        tools: ["github_actions", "vercel", "railway"],
      },
      {
        title: "Error monitoring",
        description:
          "Set up Sentry for real-time error tracking. Catch and log errors with context.",
        priority: "high",
        tools: ["sentry"],
      },
    ],
  },
  {
    category: "Deployment & DevOps",
    items: [
      {
        title: "Staging environment",
        description:
          "Create a staging deployment that mirrors production. Test all changes before deploying to production.",
        priority: "high",
        tools: ["vercel", "railway", "github_actions"],
      },
      {
        title: "Health checks & uptime monitoring",
        description:
          "Set up health check endpoints. Use UptimeRobot or Better Uptime for free monitoring.",
        priority: "medium",
        tools: ["node", "nextjs_api", "vercel"],
      },
      {
        title: "Graceful error pages",
        description:
          "Custom 404, 500 pages. Handle API errors with meaningful error messages.",
        priority: "medium",
        tools: ["nextjs"],
      },
      {
        title: "Logging strategy",
        description:
          "Log important events (signups, payments, errors). Use structured logging with context.",
        priority: "medium",
        tools: ["sentry", "posthog"],
      },
    ],
  },
];
