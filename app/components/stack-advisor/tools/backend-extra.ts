// ─── Extra Backend Frameworks ─────────────────────────
import type { ToolOption } from "../types";

export const backendExtraTools: ToolOption[] = [
  {
    id: "go_gin",
    name: "Go + Gin Framework",
    icon: "🔵",
    description:
      "High-performance Go web framework with zero-allocation routing, middleware chaining, and built-in validation.",
    category: "backend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing:
      "Free — hosting costs apply. Go binaries are self-contained, cheaper to host.",
    scalability:
      "Excellent — Go compiles to native binaries, handles 10K+ concurrent connections with minimal memory",
    config: {
      envVars: ["PORT", "DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN", "GO_ENV"],
      setupSteps: [
        "go mod init my-app",
        "go get github.com/gin-gonic/gin",
        "Create main.go with router setup",
        "Define handlers and middleware",
        "Connect to PostgreSQL with pgx or GORM",
        "Build and deploy binary",
      ],
      packages: [
        "github.com/gin-gonic/gin",
        "github.com/jackc/pgx/v5",
        "gorm.io/gorm",
      ],
    },
    integration: {
      connectsTo: [
        "postgresql",
        "supabase_db",
        "mongodb",
        "docker_vps",
        "railway",
      ],
      notes:
        "Go is ideal for high-throughput APIs, microservices, and real-time apps. Gin is the most popular Go web framework.",
    },
    ethiopianSupport:
      "Excellent — Go binaries are self-contained and run on minimal VPS resources. Perfect for Ethiopian VPS hosting.",
    limitations: [
      "Steeper learning curve for JS/Python devs",
      "Fewer Go developers available in Ethiopia",
      "More boilerplate for simple CRUD apps",
    ],
    docsUrl: "https://gin-gonic.com/docs/",
  },
  {
    id: "laravel",
    name: "Laravel",
    icon: "",
    description:
      "PHP web framework with elegant syntax, Eloquent ORM, built-in auth, queues, and Blade templating. Batteries included.",
    category: "backend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing:
      "Free — hosting costs apply. Laravel Forge for server management ($12/mo)",
    scalability:
      "Good — queues (Redis/Database), caching, octane for high performance, horizontal scaling with load balancers",
    config: {
      envVars: [
        "APP_KEY",
        "DB_CONNECTION",
        "DB_HOST",
        "DB_DATABASE",
        "DB_USERNAME",
        "DB_PASSWORD",
      ],
      setupSteps: [
        "composer create-project laravel/laravel my-app",
        "Configure .env for database",
        "Create Eloquent models and migrations",
        "Set up routes in routes/api.php",
        "Implement auth with Laravel Sanctum or Jetstream",
        "Deploy on Forge, VPS, or Laravel Cloud",
      ],
      packages: ["laravel/framework", "laravel/sanctum", "laravel/horizon"],
    },
    integration: {
      connectsTo: [
        "postgresql",
        "mongodb",
        "docker_vps",
        "redis_self",
        "github_actions",
      ],
      notes:
        "Laravel is the most popular PHP framework. Built-in auth, queues, notifications, and cron scheduling make it great for business apps.",
    },
    ethiopianSupport:
      "Excellent — PHP is widely known in Ethiopia. Many Ethiopian developers have Laravel experience. Affordable VPS hosting.",
    limitations: [
      "PHP is less performant than Go or Rust for high-concurrency",
      "Laravel can be heavy for simple microservices",
    ],
    docsUrl: "https://laravel.com/docs",
  },
  {
    id: "rails",
    name: "Ruby on Rails",
    icon: "🛤️",
    description:
      "Full-stack Ruby framework emphasizing convention over configuration. Built-in ORM, migrations, scaffolding, and testing.",
    category: "backend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing:
      "Free — hosting costs apply. Heroku or Hatchbox for easy deployment.",
    scalability:
      "Good — background jobs (Sidekiq), caching, database optimization. Rails 7 supports Hotwire for real-time features.",
    config: {
      envVars: [
        "DATABASE_URL",
        "SECRET_KEY_BASE",
        "RAILS_ENV",
        "RAILS_MASTER_KEY",
      ],
      setupSteps: [
        "gem install rails && rails new my-app --api",
        "Configure database.yml",
        "Generate models and migrations",
        "Set up API endpoints with controllers",
        "Implement auth with devise-jwt",
        "Deploy on Railway, Render, or VPS",
      ],
      packages: ["rails", "pg", "devise", "devise-jwt", "sidekiq"],
    },
    integration: {
      connectsTo: ["postgresql", "mongodb", "redis_self", "railway", "render"],
      notes:
        "Rails is great for rapid prototyping and MVPs. Convention over configuration means less decision-making. Hotwire replaces frontend frameworks for many apps.",
    },
    ethiopianSupport:
      "Good — Rails runs well on VPS. Fewer Rails developers in Ethiopia, but the framework's productivity is excellent for startups.",
    limitations: [
      "Slower than Go or Node.js for high-concurrency",
      "Smaller developer pool in Ethiopia",
      "Memory usage can be high",
    ],
    docsUrl: "https://guides.rubyonrails.org",
  },
  {
    id: "bun",
    name: "Bun + Elysia",
    icon: "🥟",
    description:
      "Fast all-in-one JavaScript runtime with native bundler, test runner, and package manager. Elysia is a performant Bun-native web framework.",
    category: "backend",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Good — Bun's JavaScript core is 3-4x faster than Node.js for most operations. Elysia has zero-allocation routing.",
    config: {
      envVars: ["PORT", "DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"],
      setupSteps: [
        "curl -fsSL https://bun.sh/install | bash",
        "bun init my-app",
        "bun add elysia @elysiajs/cors prisma",
        "Create src/index.ts with Elysia app",
        "Set up routes and middleware",
        "Run with bun run src/index.ts",
      ],
      packages: ["elysia", "@elysiajs/cors", "prisma"],
    },
    integration: {
      connectsTo: ["postgresql", "supabase_db", "docker_vps", "railway"],
      notes:
        "Bun is a drop-in Node.js replacement for most apps. Elysia is purpose-built for Bun with TypeScript-first design and end-to-end type safety.",
    },
    ethiopianSupport:
      "Good — Bun reduces infrastructure costs by being faster and more resource-efficient than Node.js on the same hardware.",
    limitations: [
      "Newer ecosystem — fewer production deployments than Node.js",
      "Not all npm packages are compatible yet",
    ],
    docsUrl: "https://elysiajs.com",
  },
];
