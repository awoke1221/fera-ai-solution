// ─── Database, Auth & Storage Tools ───────────────────
import type { ToolOption } from "../types";

export const dataLayerTools: ToolOption[] = [
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

  // ─── AUTH ───
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
];
