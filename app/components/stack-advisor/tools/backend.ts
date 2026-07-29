// ─── Backend & API Tools ──────────────────────────────
import type { ToolOption } from "../types";

export const backendTools: ToolOption[] = [
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
];
