// ─── Integration Edge Mapping ──────────────────────────
import type { IntegrationEdge } from "./types";

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
