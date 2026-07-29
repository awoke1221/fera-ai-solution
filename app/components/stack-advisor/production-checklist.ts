// ─── Production Readiness Checklist ──────────────────
import type { ProductionChecklistItem } from "./types";

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
