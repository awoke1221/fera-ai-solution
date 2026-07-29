// ─── Extra Database & Storage Tools ───────────────────
import type { ToolOption } from "../types";

export const databaseExtraTools: ToolOption[] = [
  {
    id: "neon",
    name: "Neon (Serverless PostgreSQL)",
    icon: "💜",
    description:
      "Serverless PostgreSQL with instant provisioning, branching, connection pooling, and scale-to-zero. Compatible with Prisma, Drizzle, and raw SQL.",
    category: "database",
    recommended: false,
    freeTier: "Free: 500MB DB, 100hr compute/month, branching included",
    pricing:
      "Scale: $19/mo (10GB, 300hr compute). Business: $49/mo (50GB, 1000hr)",
    scalability:
      "Excellent — serverless auto-scaling, instant compute wake, connection pooling via PgBouncer, branching for dev workflows",
    config: {
      envVars: ["DATABASE_URL", "NEON_DB_URL", "DIRECT_DATABASE_URL"],
      setupSteps: [
        "Create account at neon.tech",
        "Create project and get connection string",
        "Use pooled connection string for apps",
        "Use direct connection for migrations",
        "Enable branching for preview deployments",
      ],
      packages: ["@prisma/client", "drizzle-orm", "pg"],
    },
    integration: {
      connectsTo: ["node", "nextjs_api", "python_fastapi", "vercel", "railway"],
      notes:
        "Neon is the best serverless PostgreSQL option. Pooled connections work with serverless functions. Branching enables DB per preview deployment.",
    },
    ethiopianSupport:
      "Good — global service with US/EU regions. Serverless means no idle costs for small Ethiopian projects.",
    limitations: [
      "No African region — latency from Ethiopia",
      "Scale-to-zero means cold starts after inactivity",
    ],
    docsUrl: "https://neon.tech/docs",
  },
  {
    id: "turso",
    name: "Turso (SQLite Edge)",
    icon: "🧊",
    description:
      "Edge-hosted SQLite with libsql, branching, and replica distribution across 35+ locations. Sub-millisecond reads from edge.",
    category: "database",
    recommended: false,
    freeTier:
      "Free: 9GB database, 1B rows read/mo, 25M rows written/mo, 3 locations",
    pricing: "Scale: $9/mo (9GB, 3 locations). Enterprise: custom",
    scalability:
      "Excellent — edge replicas for global low-latency reads, libsql for SQLite compatibility, branching for dev",
    config: {
      envVars: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
      setupSteps: [
        "Install Turso CLI: npm i -g turso",
        "turso auth login",
        "turso db create my-db",
        "Create replicas in edge locations",
        "Connect with @libsql/client",
      ],
      packages: ["@libsql/client", "drizzle-orm"],
    },
    integration: {
      connectsTo: ["nextjs", "node", "vercel", "cloudflare_pages"],
      notes:
        "Turso is ideal for read-heavy apps with global users. Edge replicas mean Ethiopian users get fast reads. Not ideal for write-heavy apps.",
    },
    ethiopianSupport:
      "Excellent — edge replicas can be deployed close to Ethiopia (Europe/Middle East) for fast reads.",
    limitations: [
      "SQLite — no stored procedures or row-level security",
      "Write performance limited — single-writer per database",
      "Not ideal for write-heavy apps",
    ],
    docsUrl: "https://docs.turso.tech",
  },
  {
    id: "d1",
    name: "Cloudflare D1",
    icon: "☁️",
    description:
      "Cloudflare's serverless SQLite database with global replication, zero-egress fees, and Workers integration.",
    category: "database",
    recommended: false,
    freeTier: "Free: 5GB storage, 5M read queries/mo, 100K write queries/mo",
    pricing: "Paid: $0.75/GB storage, $0.01/M reads, $0.15/M writes",
    scalability:
      "Good — integrated with Cloudflare Workers, global CDN, zero-egress. Still maturing for production.",
    config: {
      envVars: [
        "CLOUDFLARE_ACCOUNT_ID",
        "CLOUDFLARE_DATABASE_ID",
        "CLOUDFLARE_API_TOKEN",
      ],
      setupSteps: [
        "Create Cloudflare account",
        "Use Wrangler CLI: npx wrangler d1 create my-db",
        "Update wrangler.toml with DB binding",
        "Run migrations with wrangler d1 migrations",
        "Query from Workers with env.DB",
      ],
      packages: [],
    },
    integration: {
      connectsTo: ["cloudflare_pages", "github_actions"],
      notes:
        "D1 is best when already using Cloudflare ecosystem. Great for Workers-based APIs. Zero-egress is a cost advantage.",
    },
    ethiopianSupport:
      "Excellent — Cloudflare's global network including South African PoPs, zero-egress fees reduce costs.",
    limitations: [
      "Still in beta — not production-ready for critical apps",
      "SQLite limitations — no concurrent writers",
      "Only accessible from Cloudflare Workers",
    ],
    docsUrl: "https://developers.cloudflare.com/d1/",
  },
  {
    id: "sqlite",
    name: "SQLite (Self-hosted)",
    icon: "📦",
    description:
      "Embedded SQL database — zero-config, serverless, stored as a single file. Perfect for small apps, prototypes, and embedded use.",
    category: "database",
    recommended: false,
    freeTier: "Free and open-source",
    pricing: "Free",
    scalability:
      "Limited — single-writer, best for single-server apps. Not designed for distributed or high-concurrency scenarios.",
    config: {
      envVars: ["DATABASE_PATH", "DATABASE_URL"],
      setupSteps: [
        "Install SQLite or use better-sqlite3 npm package",
        "Create database file",
        "Run schema migrations",
        "Connect with Prisma or better-sqlite3",
        "Backup regularly — single file means easy backups",
      ],
      packages: ["better-sqlite3", "prisma", "drizzle-orm"],
    },
    integration: {
      connectsTo: ["node", "python_fastapi", "docker_vps"],
      notes:
        "SQLite is great for MVPs, internal tools, and single-server apps. Easy backup — just copy the file. Upgrade to PostgreSQL when scaling.",
    },
    ethiopianSupport:
      "Excellent — runs on any VPS with zero configuration. Ideal for Ethiopian MVPs with limited budgets.",
    limitations: [
      "No concurrent writes — single-writer lock",
      "Not suitable for distributed or multi-server apps",
      "Limited SQL features compared to PostgreSQL",
    ],
    docsUrl: "https://www.sqlite.org/docs.html",
  },
  {
    id: "pinecone",
    name: "Pinecone (Vector DB)",
    icon: "🌲",
    description:
      "Managed vector database for AI/ML applications — semantic search, RAG, recommendations, and similarity matching at scale.",
    category: "database",
    recommended: false,
    freeTier: "Free: 1 pod, 5GB storage, 100K vectors (1536d), standard index",
    pricing:
      "Serverless: $0.10/GB/month storage + $0.30/M reads. Standard: from $70/mo per pod",
    scalability:
      "Excellent — serverless option, pod-based scaling, 99.99% uptime, 10ms latency at p99",
    config: {
      envVars: [
        "PINECONE_API_KEY",
        "PINECONE_INDEX_NAME",
        "PINECONE_ENVIRONMENT",
      ],
      setupSteps: [
        "Create Pinecone account",
        "Create an index (dimensions match your embedding model)",
        "Install @pinecone-database/pinecone SDK",
        "Generate embeddings with OpenAI/text-embedding-ada-002",
        "Insert vectors and query with similarity search",
      ],
      packages: ["@pinecone-database/pinecone", "openai"],
    },
    integration: {
      connectsTo: ["node", "python_fastapi", "nextjs_api"],
      notes:
        "Best for AI-powered search, RAG (Retrieval Augmented Generation), and recommendation systems. Pair with OpenAI embeddings.",
    },
    ethiopianSupport:
      "Good — global infrastructure. Free tier is generous for AI experimentation.",
    limitations: [
      "Free tier limited to 1 pod and 5GB",
      "Requires embedding model (additional cost)",
      "Not a replacement for primary database",
    ],
    docsUrl: "https://docs.pinecone.io",
  },
];
