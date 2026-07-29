// ─── Compatibility Checker & Stack Export ────────────
// Detects incompatible tool combinations and generates
// exportable stack summaries.

import type { ToolOption } from "../types";
import { tools } from "./index";

// ─── Compatibility Rules ───────────────────────────────
export type CompatibilityWarning = {
  type: "warning" | "error" | "info";
  message: string;
  tools: string[];
  recommendation: string;
};

export function checkCompatibility(
  selectedToolIds: string[],
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const selected = new Set(selectedToolIds);

  // Auth conflicts
  if (selected.has("supabase_auth") && selected.has("firebase_auth")) {
    warnings.push({
      type: "warning",
      message:
        "Using both Supabase Auth and Firebase Auth adds unnecessary complexity",
      tools: ["supabase_auth", "firebase_auth"],
      recommendation:
        "Pick one auth provider. Supabase Auth is recommended if using Supabase DB.",
    });
  }

  if (selected.has("supabase_auth") && selected.has("nextauth")) {
    warnings.push({
      type: "info",
      message: "Supabase Auth + NextAuth can overlap in functionality",
      tools: ["supabase_auth", "nextauth"],
      recommendation:
        "Use Supabase Auth for RLS integration or NextAuth for more provider options. Both work, but pick one as primary.",
    });
  }

  // Database compatibility
  if (selected.has("supabase_db") && selected.has("mongodb")) {
    warnings.push({
      type: "info",
      message: "Using both PostgreSQL and MongoDB doubles database complexity",
      tools: ["supabase_db", "mongodb"],
      recommendation:
        "Use Supabase (PostgreSQL) for structured data + MongoDB only if you need flexible document storage for specific features.",
    });
  }

  // Deployment
  if (selected.has("vercel") && selected.has("netlify")) {
    warnings.push({
      type: "warning",
      message: "Double deployment — both Vercel and Netlify selected",
      tools: ["vercel", "netlify"],
      recommendation:
        "Choose one. Vercel for Next.js apps, Netlify for static React/Vite sites.",
    });
  }

  // Payment conflicts
  if (selected.has("stripe") && selected.has("chapa")) {
    warnings.push({
      type: "info",
      message:
        "Stripe + Chapa covers both international and Ethiopian payments",
      tools: ["stripe", "chapa"],
      recommendation:
        "Great combo for serving both Ethiopian (Chapa) and international (Stripe) customers. Keep both.",
    });
  }

  // Backend + Frontend deploy conflict
  if (selected.has("vercel") && selected.has("docker_vps")) {
    warnings.push({
      type: "info",
      message:
        "Vercel (frontend) + Docker VPS (backend) is a common production pattern",
      tools: ["vercel", "docker_vps"],
      recommendation:
        "This is a solid architecture. Vercel serves the frontend globally, VPS handles backend + database locally.",
    });
  }

  // Missing critical combinations
  if (
    selected.has("nextjs") &&
    !selected.has("vercel") &&
    !selected.has("netlify")
  ) {
    warnings.push({
      type: "info",
      message: "Next.js performs best on Vercel (purpose-built platform)",
      tools: ["nextjs"],
      recommendation:
        "Consider Vercel for optimal Next.js performance with ISR, edge functions, and automatic optimization.",
    });
  }

  if (
    selected.has("node") &&
    !selected.has("supabase_db") &&
    !selected.has("postgresql") &&
    !selected.has("mongodb")
  ) {
    warnings.push({
      type: "warning",
      message: "Node.js backend without a selected database",
      tools: ["node"],
      recommendation:
        "Select at least one database (Supabase, PostgreSQL, or MongoDB) for your backend to function.",
    });
  }

  // Ethiopian-specific
  if (
    selected.has("paypal") &&
    !selected.has("chapa") &&
    !selected.has("telebirr")
  ) {
    warnings.push({
      type: "info",
      message: "PayPal alone doesn't serve Ethiopian customers well",
      tools: ["paypal"],
      recommendation:
        "Add Chapa or Telebirr for Ethiopian users, and keep PayPal for international customers.",
    });
  }

  // Redundancy in storage
  if (
    selected.has("supabase_storage") &&
    selected.has("cloudinary") &&
    selected.has("bunny")
  ) {
    warnings.push({
      type: "warning",
      message:
        "Three storage services selected — unnecessary cost and complexity",
      tools: ["supabase_storage", "cloudinary", "bunny"],
      recommendation:
        "Pick one primary storage. Supabase Storage for general use, Cloudinary for images, Bunny for video-heavy apps.",
    });
  }

  return warnings;
}

// ─── Stack Export ──────────────────────────────────────
export function generateStackExport(
  selectedTools: ToolOption[],
  format: "json" | "markdown" | "env",
): string {
  switch (format) {
    case "json":
      return generateJSON(selectedTools);
    case "markdown":
      return generateMarkdown(selectedTools);
    case "env":
      return generateEnvFile(selectedTools);
  }
}

function generateJSON(tools: ToolOption[]): string {
  const data = {
    generatedAt: new Date().toISOString(),
    totalTools: tools.length,
    techStack: tools.map((t) => ({
      name: t.name,
      category: t.category,
      recommended: t.recommended,
      freeTier: t.freeTier,
      pricing: t.pricing,
      envVars: t.config.envVars,
      packages: t.config.packages,
    })),
    categories: [...new Set(tools.map((t) => t.category))],
  };
  return JSON.stringify(data, null, 2);
}

function generateMarkdown(tools: ToolOption[]): string {
  const categories = [...new Set(tools.map((t) => t.category))];
  let md = `# 🚀 Tech Stack Summary\n\n`;
  md += `> Generated by **Stack Advisor** on ${new Date().toLocaleDateString()}\n\n`;
  md += `## 📊 Overview\n\n`;
  md += `- **Total Tools:** ${tools.length}\n`;
  md += `- **Categories:** ${categories.length}\n\n`;

  md += `## 🛠️ Selected Stack\n\n`;
  md += `| Category | Tool | Free Tier | Pricing |\n`;
  md += `|----------|------|-----------|--------|\n`;

  for (const tool of tools) {
    const cat = tool.category.replace(/_/g, " ");
    md += `| ${cat} | ${tool.icon} ${tool.name} | ${tool.freeTier} | ${tool.pricing} |\n`;
  }

  md += `\n## 🔧 Environment Variables\n\n`;
  md += "```bash\n";
  const allVars = [...new Set(tools.flatMap((t) => t.config.envVars))];
  allVars.forEach((v) => {
    md += `${v}=""\n`;
  });
  md += "```\n";

  md += `\n## 📦 Required Packages\n\n`;
  const allPkgs = [...new Set(tools.flatMap((t) => t.config.packages))];
  md += "```bash\n";
  md += `npm install ${allPkgs.join(" ")}\n`;
  md += "```\n";

  return md;
}

function generateEnvFile(tools: ToolOption[]): string {
  const allVars = [...new Set(tools.flatMap((t) => t.config.envVars))];
  let env = `# ─── Generated by Stack Advisor ───\n`;
  env += `# ${new Date().toLocaleDateString()}\n\n`;

  // Group by category
  const categories = [...new Set(tools.map((t) => t.category))];
  for (const cat of categories) {
    const catTools = tools.filter((t) => t.category === cat);
    const catLabel = cat.replace(/_/g, " ");
    env += `# ── ${catLabel} ──\n`;
    for (const tool of catTools) {
      for (const v of tool.config.envVars) {
        env += `${v}=""\n`;
      }
    }
    env += "\n";
  }

  return env;
}

// ─── Tool Scoring System ──────────────────────────────
export type ToolScore = {
  toolId: string;
  totalScore: number;
  scores: {
    popularity: number; // 1-10
    costEffectiveness: number; // 1-10
    easeOfUse: number; // 1-10
    scalability: number; // 1-10
    communitySize: number; // 1-10
    ethiopianFit: number; // 1-10
  };
  strengths: string[];
  weaknesses: string[];
};

const toolScores: Record<string, Omit<ToolScore, "toolId">> = {
  nextjs: {
    totalScore: 0,
    scores: {
      popularity: 10,
      costEffectiveness: 8,
      easeOfUse: 8,
      scalability: 10,
      communitySize: 10,
      ethiopianFit: 8,
    },
    strengths: [
      "Full-stack in one framework",
      "Excellent performance (ISR/SSR)",
      "Huge ecosystem",
      "Vercel optimization",
    ],
    weaknesses: [
      "Vercel lock-in concern",
      "Learning curve for App Router",
      "Serverless timeout limits",
    ],
  },
  supabase_db: {
    totalScore: 0,
    scores: {
      popularity: 9,
      costEffectiveness: 9,
      easeOfUse: 9,
      scalability: 8,
      communitySize: 9,
      ethiopianFit: 7,
    },
    strengths: [
      "RLS security built-in",
      "Real-time subscriptions",
      "Generous free tier",
      "All-in-one (auth+DB+storage)",
    ],
    weaknesses: [
      "No African hosting region",
      "RLS complexity at scale",
      "Free tier limits (500MB)",
    ],
  },
  chapa: {
    totalScore: 0,
    scores: {
      popularity: 6,
      costEffectiveness: 9,
      easeOfUse: 7,
      scalability: 7,
      communitySize: 5,
      ethiopianFit: 10,
    },
    strengths: [
      "Purpose-built for Ethiopia",
      "Telebirr integration",
      "No monthly fees",
      "Local support",
    ],
    weaknesses: [
      "ETB only",
      "Requires Ethiopian business license",
      "Smaller developer community",
    ],
  },
  node: {
    totalScore: 0,
    scores: {
      popularity: 10,
      costEffectiveness: 8,
      easeOfUse: 8,
      scalability: 7,
      communitySize: 10,
      ethiopianFit: 8,
    },
    strengths: [
      "Massive ecosystem (npm)",
      "Fast prototyping",
      "JavaScript everywhere",
      "Huge community",
    ],
    weaknesses: [
      "Single-threaded",
      "Callback complexity",
      "CPU-bound tasks block event loop",
    ],
  },
  vercel: {
    totalScore: 0,
    scores: {
      popularity: 10,
      costEffectiveness: 7,
      easeOfUse: 10,
      scalability: 10,
      communitySize: 10,
      ethiopianFit: 7,
    },
    strengths: [
      "Zero-config deploys",
      "Preview deployments",
      "Edge network",
      "Next.js optimized",
    ],
    weaknesses: [
      "Can get expensive at scale",
      "Vendor lock-in",
      "Bandwidth overage costs",
    ],
  },
  railway: {
    totalScore: 0,
    scores: {
      popularity: 8,
      costEffectiveness: 8,
      easeOfUse: 9,
      scalability: 7,
      communitySize: 7,
      ethiopianFit: 6,
    },
    strengths: [
      "Easy database provisioning",
      "Docker support",
      "Simple pricing",
      "Quick setup",
    ],
    weaknesses: [
      "No free forever tier",
      "Limited regions",
      "CPU/memory caps on lower plans",
    ],
  },
  redis_upstash: {
    totalScore: 0,
    scores: {
      popularity: 8,
      costEffectiveness: 9,
      easeOfUse: 9,
      scalability: 9,
      communitySize: 7,
      ethiopianFit: 8,
    },
    strengths: [
      "Serverless Redis",
      "REST API works everywhere",
      "Generous free tier",
      "No connection management",
    ],
    weaknesses: [
      "REST latency vs direct Redis",
      "10K cmd/day free limit",
      "Less control than self-hosted",
    ],
  },
};

export function getToolScore(toolId: string): ToolScore | null {
  const data = toolScores[toolId];
  if (!data) return null;
  const scores = data.scores;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
  return { toolId, ...data, totalScore: Math.round(totalScore * 10) / 10 };
}

export function getAlternativeRecommendation(
  categoryId: string,
  selectedToolId: string,
): string | null {
  const categoryTools = tools.filter(
    (t) => t.category === categoryId && t.id !== selectedToolId,
  );
  if (categoryTools.length === 0) return null;

  const selected = tools.find((t) => t.id === selectedToolId);
  if (!selected) return null;

  const bestAlt = categoryTools.find((t) => t.recommended) || categoryTools[0];

  if (selected.recommended && !bestAlt.recommended) {
    return `**${selected.name}** is our recommended choice for ${categoryId.replace(/_/g, " ")}. It offers the best balance of features, cost, and scalability.`;
  }
  if (!selected.recommended && bestAlt.recommended) {
    return `Consider **${bestAlt.name}** (Recommended) instead of ${selected.name}. It provides better performance and ecosystem support.`;
  }
  return null;
}
