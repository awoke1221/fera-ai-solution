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

  // ─── NEW FRONTEND ├ëdges ──────────────────────────
  { from: "vue", to: "supabase_db", label: "@nuxtjs/supabase", type: "sdk" },
  { from: "vue", to: "node", label: "REST API / GraphQL", type: "api" },
  { from: "vue", to: "python_fastapi", label: "REST API", type: "api" },
  { from: "svelte", to: "supabase_db", label: "supabase-js", type: "sdk" },
  { from: "svelte", to: "node", label: "REST API", type: "api" },
  { from: "remix", to: "supabase_db", label: "supabase-js", type: "sdk" },
  { from: "remix", to: "node", label: "Remix loaders", type: "direct" },
  { from: "remix", to: "postgresql", label: "Prisma", type: "sdk" },
  { from: "astro", to: "supabase_db", label: "astro-integration", type: "sdk" },
  { from: "astro", to: "node", label: "REST API", type: "api" },
  {
    from: "nextjs_pages",
    to: "supabase_db",
    label: "supabase-js",
    type: "sdk",
  },
  { from: "nextjs_pages", to: "node", label: "REST API", type: "api" },
  { from: "vue", to: "vercel", label: "Nuxt on Vercel", type: "deploy" },
  { from: "svelte", to: "vercel", label: "SvelteKit adapter", type: "deploy" },
  { from: "remix", to: "vercel", label: "Remix adapter", type: "deploy" },
  { from: "astro", to: "vercel", label: "Astro adapter", type: "deploy" },
  {
    from: "astro",
    to: "cloudflare_pages",
    label: "Astro adapter",
    type: "deploy",
  },

  // ─── NEW BACKEND ├ëdges ───────────────────────────
  { from: "go_gin", to: "postgresql", label: "pgx / GORM", type: "sdk" },
  { from: "go_gin", to: "supabase_db", label: "supabase-go", type: "sdk" },
  { from: "go_gin", to: "mongodb", label: "mongo-go-driver", type: "sdk" },
  { from: "go_gin", to: "docker_vps", label: "Binary deploy", type: "deploy" },
  { from: "go_gin", to: "railway", label: "Docker deploy", type: "deploy" },
  { from: "laravel", to: "postgresql", label: "Eloquent ORM", type: "sdk" },
  { from: "laravel", to: "mongodb", label: "MongoDB Laravel", type: "sdk" },
  {
    from: "laravel",
    to: "redis_self",
    label: "Laravel cache/queue",
    type: "sdk",
  },
  { from: "laravel", to: "docker_vps", label: "Forge / VPS", type: "deploy" },
  { from: "rails", to: "postgresql", label: "Active Record", type: "sdk" },
  { from: "rails", to: "mongodb", label: "Mongoid", type: "sdk" },
  { from: "rails", to: "redis_self", label: "Sidekiq / cache", type: "sdk" },
  { from: "rails", to: "railway", label: "Rails deploy", type: "deploy" },
  { from: "bun", to: "postgresql", label: "Prisma / Drizzle", type: "sdk" },
  { from: "bun", to: "supabase_db", label: "supabase-js", type: "sdk" },
  { from: "bun", to: "railway", label: "Docker deploy", type: "deploy" },
  { from: "bun", to: "docker_vps", label: "Binary deploy", type: "deploy" },
  { from: "nextjs", to: "go_gin", label: "REST API", type: "api" },
  { from: "nextjs", to: "laravel", label: "REST API", type: "api" },
  { from: "nextjs", to: "rails", label: "REST API", type: "api" },
  { from: "nextjs", to: "bun", label: "REST API", type: "api" },

  // ─── NEW DATABASE ├ëdges ─────────────────────────
  { from: "node", to: "neon", label: "Prisma / pg", type: "sdk" },
  { from: "node", to: "turso", label: "@libsql/client", type: "sdk" },
  { from: "node", to: "sqlite", label: "better-sqlite3", type: "sdk" },
  { from: "node", to: "pinecone", label: "@pinecone-database", type: "sdk" },
  { from: "nextjs_api", to: "neon", label: "Prisma / pg", type: "sdk" },
  { from: "nextjs_api", to: "turso", label: "@libsql/client", type: "sdk" },
  { from: "python_fastapi", to: "neon", label: "SQLAlchemy", type: "sdk" },
  {
    from: "python_fastapi",
    to: "pinecone",
    label: "pinecone-client",
    type: "sdk",
  },
  { from: "nextjs", to: "neon", label: "Prisma", type: "sdk" },
  {
    from: "d1",
    to: "cloudflare_pages",
    label: "Wrangler binding",
    type: "direct",
  },

  // ─── CSS/UI ├ëdges ───────────────────────────────
  { from: "nextjs", to: "tailwind", label: "PostCSS plugin", type: "sdk" },
  { from: "nextjs", to: "shadcn", label: "Components", type: "direct" },
  { from: "react", to: "tailwind", label: "PostCSS plugin", type: "sdk" },
  { from: "react", to: "shadcn", label: "Components", type: "direct" },
  { from: "vue", to: "tailwind", label: "PostCSS plugin", type: "sdk" },
  { from: "svelte", to: "tailwind", label: "PostCSS plugin", type: "sdk" },

  // ─── STATE MANAGEMENT ├ëdges ──────────────────────
  { from: "nextjs", to: "tanstack_query", label: "React Query", type: "sdk" },
  { from: "react", to: "tanstack_query", label: "React Query", type: "sdk" },
  { from: "nextjs", to: "zustand", label: "Store hooks", type: "sdk" },
  { from: "react", to: "zustand", label: "Store hooks", type: "sdk" },

  // ─── SEARCH ├ëdges ───────────────────────────────
  {
    from: "nextjs",
    to: "meilisearch",
    label: "instant-meilisearch",
    type: "sdk",
  },
  { from: "nextjs", to: "algolia", label: "react-instantsearch", type: "sdk" },
  { from: "nextjs", to: "typesense", label: "typesense-adapters", type: "sdk" },
  { from: "node", to: "meilisearch", label: "meilisearch SDK", type: "sdk" },
  { from: "node", to: "algolia", label: "algoliasearch", type: "sdk" },
  { from: "node", to: "typesense", label: "typesense SDK", type: "sdk" },

  // ─── MOBILE ├ëdges ───────────────────────────────
  {
    from: "react_native",
    to: "supabase_db",
    label: "supabase-js",
    type: "sdk",
  },
  { from: "react_native", to: "node", label: "REST API", type: "api" },
  { from: "react_native", to: "nextjs_api", label: "REST API", type: "api" },
  {
    from: "flutter",
    to: "supabase_db",
    label: "supabase_flutter",
    type: "sdk",
  },
  { from: "flutter", to: "node", label: "REST API", type: "api" },
  { from: "flutter", to: "python_fastapi", label: "REST API", type: "api" },

  // ─── AUTH EXTRA ├ëdges ───────────────────────────
  { from: "nextjs", to: "clerk", label: "@clerk/nextjs", type: "auth" },
  { from: "nextjs", to: "auth0", label: "@auth0/nextjs", type: "auth" },
  { from: "react", to: "clerk", label: "@clerk/clerk-react", type: "auth" },
  { from: "react", to: "auth0", label: "@auth0/auth0-react", type: "auth" },
  { from: "node", to: "clerk", label: "clerk-sdk-node", type: "auth" },
  { from: "node", to: "auth0", label: "auth0 SDK", type: "auth" },
];
