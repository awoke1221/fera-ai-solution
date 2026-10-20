"use client";

import { useMemo, useState, useCallback } from "react";
import { tools, type ToolOption } from ".";

interface CodeScaffoldingProps {
  selections: Record<string, string>;
}

type ScaffoldTab =
  | "env"
  | "schema"
  | "middleware"
  | "docker"
  | "cicd"
  | "packages";

const TABS: { id: ScaffoldTab; label: string; icon: string }[] = [
  { id: "env", label: ".env", icon: "[env]" },
  { id: "schema", label: "Schema SQL", icon: "[sql]" },
  { id: "middleware", label: "Middleware", icon: "[key]" },
  { id: "packages", label: "Dependencies", icon: "[box]" },
  { id: "docker", label: "Docker", icon: "[whale]" },
  { id: "cicd", label: "CI/CD", icon: "[sync]" },
];

export function CodeScaffolding({ selections }: CodeScaffoldingProps) {
  const [activeTab, setActiveTab] = useState<ScaffoldTab>("env");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const selectedTools = useMemo(() => {
    return Object.values(selections)
      .map((id) => tools.find((t) => t.id === id))
      .filter((tool): tool is ToolOption => Boolean(tool));
  }, [selections]);

  const hasSelections = Object.keys(selections).length > 0;

  const envContent = useMemo(() => {
    const lines: string[] = [];
    lines.push("# Stack Advisor Generated .env");
    lines.push("# Replace placeholders locally. Never commit real secrets.");
    lines.push("");
    for (const tool of selectedTools) {
      const vars = tool.config.envVars;
      if (vars.length === 0) continue;
      lines.push("# " + tool.name + " (" + tool.category + ")");
      for (const v of vars) {
        lines.push(v + "=" + placeholderFor(v, tool.id));
      }
      lines.push("");
    }
    return lines.join("\n");
  }, [selectedTools]);

  const packagesContent = useMemo(() => {
    const dependencies = [
      ...new Set(selectedTools.flatMap((tool) => tool.config.packages)),
    ];
    if (dependencies.length === 0) return null;
    return [
      "# Review package compatibility and choose versions before installing.",
      `npm install ${dependencies.join(" ")}`,
    ].join("\n");
  }, [selectedTools]);

  const schemaContent = useMemo(() => {
    const hasSupabase = Object.values(selections).includes("supabase_db");
    const hasPostgres = Object.values(selections).includes("postgresql");
    const hasSupabaseAuth =
      hasSupabase && Object.values(selections).includes("supabase_auth");
    const lines: string[] = [];
    lines.push("-- ============================================");
    lines.push("-- Generated Schema");
    lines.push("-- Based on your selected tech stack");
    lines.push("-- ============================================");
    lines.push("");

    if (hasSupabase || hasPostgres) {
      if (hasSupabaseAuth) {
        lines.push("-- Auth & Users");
        lines.push("CREATE TABLE IF NOT EXISTS profiles (");
      lines.push(
        "  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,",
      );
      lines.push("  email TEXT UNIQUE,");
      lines.push("  full_name TEXT,");
      lines.push("  avatar_url TEXT,");
      lines.push("  created_at TIMESTAMPTZ DEFAULT NOW(),");
      lines.push("  updated_at TIMESTAMPTZ DEFAULT NOW()");
      lines.push(");");
      lines.push("");
      lines.push("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;");
      lines.push("");
      lines.push('DROP POLICY IF EXISTS "Users can view own profile" ON profiles;');
      lines.push('CREATE POLICY "Users can view own profile"');
      lines.push("  ON profiles FOR SELECT");
      lines.push("  USING (auth.uid() = user_id);");
      lines.push("");
      lines.push('DROP POLICY IF EXISTS "Users can create own profile" ON profiles;');
      lines.push('CREATE POLICY "Users can create own profile"');
      lines.push(
        "  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);",
      );
      lines.push("");
      lines.push('DROP POLICY IF EXISTS "Users can update own profile" ON profiles;');
      lines.push('CREATE POLICY "Users can update own profile"');
      lines.push(
        "  ON profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);",
      );
      lines.push("");
      }
      lines.push("-- Content / Data Tables");
      lines.push("CREATE TABLE IF NOT EXISTS projects (");
      lines.push("  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),");
      lines.push(
      hasSupabaseAuth
        ? "  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,"
        : "  user_id UUID,",
      );
      lines.push("  title TEXT NOT NULL,");
      lines.push("  description TEXT,");
      lines.push(
        "  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),",
      );
      lines.push("  metadata JSONB DEFAULT '{}',");
      lines.push("  created_at TIMESTAMPTZ DEFAULT NOW(),");
      lines.push("  updated_at TIMESTAMPTZ DEFAULT NOW()");
      lines.push(");");
      lines.push("");
      lines.push("CREATE INDEX idx_projects_user_id ON projects(user_id);");
      lines.push("CREATE INDEX idx_projects_status ON projects(status);");
      lines.push(
        "CREATE INDEX idx_projects_created_at ON projects(created_at DESC);",
      );
      if (hasSupabase) {
        lines.push("");
        lines.push("ALTER TABLE projects ENABLE ROW LEVEL SECURITY;");
        if (hasSupabaseAuth) {
          lines.push('DROP POLICY IF EXISTS "Owners can read projects" ON projects;');
          lines.push('CREATE POLICY "Owners can read projects"');
          lines.push(
            "  ON projects FOR SELECT USING (auth.uid() = user_id);",
          );
          lines.push('DROP POLICY IF EXISTS "Owners can create projects" ON projects;');
          lines.push('CREATE POLICY "Owners can create projects"');
          lines.push(
            "  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);",
          );
          lines.push('DROP POLICY IF EXISTS "Owners can update projects" ON projects;');
          lines.push('CREATE POLICY "Owners can update projects"');
          lines.push(
            "  ON projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);",
          );
          lines.push('DROP POLICY IF EXISTS "Owners can delete projects" ON projects;');
          lines.push('CREATE POLICY "Owners can delete projects"');
          lines.push(
            "  ON projects FOR DELETE USING (auth.uid() = user_id);",
          );
        } else {
          lines.push(
            "-- Add policies for your auth provider before exposing this table to client access.",
          );
        }
      } else {
        lines.push("");
        lines.push(
          "-- Enforce authorization in your server-side data access layer before exposing this table.",
        );
      }
    }
    return lines.join("\n");
  }, [selections]);

  const middlewareContent = useMemo(() => {
    const hasSupabase = Object.values(selections).includes("supabase_auth");
    if (!hasSupabase) return "// Select Supabase Auth to generate middleware.";
    return [
      "import { createServerClient } from '@supabase/ssr';",
      "import { NextResponse } from 'next/server';",
      "import type { NextRequest } from 'next/server';",
      "",
      "export async function middleware(req: NextRequest) {",
      "  const res = NextResponse.next();",
      "  const supabase = createServerClient(",
      "    process.env.NEXT_PUBLIC_SUPABASE_URL!,",
      "    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,",
      "    {",
      "      cookies: {",
      "        getAll: () => req.cookies.getAll(),",
      "        setAll(cookiesToSet) {",
      "          cookiesToSet.forEach(({ name, value, options }) => {",
      "            req.cookies.set(name, value);",
      "            res.cookies.set(name, value, options);",
      "          });",
      "        },",
      "      },",
      "    },",
      "  );",
      "  const { data: { user } } = await supabase.auth.getUser();",
      "",
      "  const protectedPaths = ['/dashboard', '/admin', '/profile'];",
      "  const pathname = req.nextUrl.pathname;",
      "  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));",
      "",
      "  if (isProtected && !user) {",
      "    const redirectUrl = new URL('/auth/login', req.url);",
      "    redirectUrl.searchParams.set('redirect', pathname + req.nextUrl.search);",
      "    return NextResponse.redirect(redirectUrl);",
      "  }",
      "",
      "  return res;",
      "}",
      "",
      "export const config = {",
      "  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],",
      "};",
    ].join("\n");
  }, [selections]);

  const dockerContent = useMemo(() => {
    const hasDocker = Object.values(selections).includes("docker_vps");
    const hasRedis = Object.values(selections).includes("redis_self");
    const hasPostgres = Object.values(selections).includes("postgresql");
    if (!hasDocker && !hasRedis && !hasPostgres)
      return "# Select Docker or self-hosted DB to generate docker-compose.";
    const lines: string[] = [];
    lines.push("version: '3.8'");
    lines.push("");
    lines.push("services:");
    if (hasPostgres) {
      lines.push("  postgres:");
      lines.push("    image: postgres:16-alpine");
      lines.push("    restart: unless-stopped");
      lines.push("    ports:");
      lines.push("      - '127.0.0.1:5432:5432'");
      lines.push("    environment:");
      lines.push("      POSTGRES_DB: ${POSTGRES_DB:-myapp}");
      lines.push("      POSTGRES_USER: ${POSTGRES_USER:-myapp}");
      lines.push(
        "      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in your environment}",
      );
      lines.push("    volumes:");
      lines.push("      - postgres_data:/var/lib/postgresql/data");
      lines.push("");
    }
    if (hasRedis) {
      lines.push("  redis:");
      lines.push("    image: redis:7-alpine");
      lines.push("    restart: unless-stopped");
      lines.push("    ports:");
      lines.push("      - '127.0.0.1:6379:6379'");
      lines.push("    volumes:");
      lines.push("      - redis_data:/data");
      lines.push("    command: redis-server --appendonly yes");
      lines.push("");
    }
    if (hasDocker) {
      lines.push("  app:");
      lines.push("    build: .");
      lines.push("    restart: unless-stopped");
      lines.push("    ports:");
      lines.push("      - '3000:3000'");
      lines.push("    env_file: .env");
      lines.push(
        "    depends_on:" +
          (hasPostgres ? "\n      - postgres" : "") +
          (hasRedis ? "\n      - redis" : ""),
      );
      lines.push("    volumes:");
      lines.push("      - .:/app");
      lines.push("      - /app/node_modules");
      lines.push("");
    }
    lines.push("volumes:");
    if (hasPostgres) lines.push("  postgres_data:");
    if (hasRedis) lines.push("  redis_data:");
    return lines.join("\n");
  }, [selections]);

  const cicdContent = useMemo(() => {
    if (!Object.values(selections).includes("github_actions"))
      return "# Select GitHub Actions to generate CI/CD.";
    const hasVercel = Object.values(selections).includes("vercel");
    const hasRailway = Object.values(selections).includes("railway");
    const lines: string[] = [];
    lines.push("name: CI/CD Pipeline");
    lines.push("");
    lines.push("on:");
    lines.push("  push:");
    lines.push("    branches: [main, develop]");
    lines.push("  pull_request:");
    lines.push("    branches: [main]");
    lines.push("");
    lines.push("jobs:");
    lines.push("  quality:");
    lines.push("    name: Build & Test");
    lines.push("    runs-on: ubuntu-latest");
    lines.push("    steps:");
    lines.push("      - uses: actions/checkout@v4");
    lines.push("      - uses: actions/setup-node@v4");
    lines.push("        with:");
    lines.push("          node-version: '20'");
    lines.push("          cache: 'npm'");
    lines.push("      - run: npm ci");
    lines.push("      - run: npm run build");
    lines.push("      - run: npm test");
    if (Object.values(selections).includes("playwright")) {
      lines.push("      - run: npx playwright install");
      lines.push("      - run: npx playwright test");
    }
    if (hasVercel) {
      lines.push("");
      lines.push("  deploy:");
      lines.push("    name: Deploy to Vercel");
      lines.push("    needs: quality");
      lines.push("    if: github.ref == 'refs/heads/main'");
      lines.push("    runs-on: ubuntu-latest");
      lines.push("    steps:");
      lines.push("      - uses: actions/checkout@v4");
      lines.push("      - run: npm ci");
      lines.push(
        "      - run: npx vercel@latest deploy --prod --yes --token=${{ secrets.VERCEL_TOKEN }}",
      );
    } else if (hasRailway) {
      lines.push("");
      lines.push("  deploy:");
      lines.push("    name: Deploy to Railway");
      lines.push("    needs: quality");
      lines.push("    if: github.ref == 'refs/heads/main'");
      lines.push("    runs-on: ubuntu-latest");
      lines.push("    steps:");
      lines.push("      - uses: actions/checkout@v4");
      lines.push("      - run: npm ci");
      lines.push(
        "      - run: npx @railway/cli@latest up --ci",
      );
    }
    return lines.join("\n");
  }, [selections]);

  const tabContent: Record<ScaffoldTab, { code: string; lang: string }> = {
    env: { code: envContent, lang: "bash" },
    schema: { code: schemaContent, lang: "sql" },
    middleware: { code: middlewareContent, lang: "typescript" },
    packages: {
      code: packagesContent || "# No packages required by selected tools.",
      lang: "bash",
    },
    docker: { code: dockerContent, lang: "yaml" },
    cicd: { code: cicdContent, lang: "yaml" },
  };

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      setCopyError(
        error instanceof Error
          ? `Could not copy template: ${error.message}`
          : "Could not copy template. Check browser clipboard permissions.",
      );
    }
  }, []);

  const activeContent = tabContent[activeTab];

  if (!hasSelections) {
    return (
      <div className="scaffold-empty">
        <div className="scaffold-empty-icon">[box]</div>
        <h4>Select Tools First</h4>
        <p>
          Choose your tech stack in the Tool Selector to generate scaffolding
          code.
        </p>
      </div>
    );
  }

  return (
    <div className="scaffold-container">
      <div className="scaffold-header">
        <h4>Code Scaffolding Generator</h4>
        <p>
          Generated templates reflect your {Object.keys(selections).length}{" "}
          selected tools. Review package versions, policies, and deployment
          settings before using them in production.
        </p>
      </div>

      <div className="scaffold-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={"scaffold-tab" + (activeTab === tab.id ? " active" : "")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="scaffold-content">
        <div className="scaffold-toolbar">
          <span className="scaffold-filename">
            {activeTab === "env"
              ? ".env"
              : activeTab === "schema"
                ? "schema.sql"
                : activeTab === "middleware"
                  ? "middleware.ts"
                  : activeTab === "packages"
                      ? "install-dependencies.sh"
                    : activeTab === "docker"
                      ? "docker-compose.yml"
                      : ".github/workflows/deploy.yml"}
          </span>
          <button
            className="scaffold-copy-btn"
            onClick={() => copyToClipboard(activeContent.code, activeTab)}
          >
            {copiedId === activeTab ? "Copied!" : "Copy"}
          </button>
        </div>
        {copyError && (
          <p className="scaffold-copy-error" role="alert">
            {copyError}
          </p>
        )}
        <pre className="scaffold-code">
          <code>{activeContent.code}</code>
        </pre>
      </div>
    </div>
  );
}

function placeholderFor(varName: string, toolId: string): string {
  const upper = varName.toUpperCase();
  if (
    upper.includes("SECRET") ||
    upper.includes("KEY") ||
    upper.includes("TOKEN") ||
    upper.includes("PASSWORD")
  )
    return "your-" + varName.toLowerCase().replace(/_/g, "-");
  if (upper.includes("URL")) return "https://your-domain.com";
  if (upper.includes("HOST")) return "localhost";
  if (upper.includes("PORT")) return "3000";
  if (upper.includes("EMAIL") || upper.includes("FROM"))
    return "hello@your-domain.com";
  if (upper.includes("DB_NAME") || upper.includes("DATABASE")) return "myapp";
  if (upper.includes("USER") || toolId === "postgresql") return "myapp_user";
  if (upper.includes("ENV") || upper.includes("MODE")) return "development";
  return "your-value";
}
