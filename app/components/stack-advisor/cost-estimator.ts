// ─── Cost Estimation Engine ──────────────────────────
// Calculates estimated monthly infrastructure costs based on
// selected tools, factoring in free tiers, scaling thresholds,
// and Ethiopian-specific pricing.

import type { ToolOption } from "./types";

export type CostBreakdown = {
  toolId: string;
  toolName: string;
  toolIcon: string;
  categoryLabel: string;
  freeTier: string;
  monthlyCost: { min: number; max: number; note: string };
  estimatedAnnual: number;
  breakEvenPoint: string; // when you'd need to upgrade from free
  ethiopianCostNote: string;
};

export type TotalCostEstimate = {
  breakdown: CostBreakdown[];
  totalMonthly: { min: number; max: number };
  totalAnnual: { min: number; max: number };
  freeTierSufficient: boolean;
  monthsUntilPaid: string;
  recommendation: string;
};

// Per-tool cost data based on real pricing
const costData: Record<
  string,
  {
    min: number;
    max: number;
    note: string;
    breakEven: string;
    ethiopianNote: string;
  }
> = {
  nextjs: {
    min: 0,
    max: 20,
    note: "Vercel Hobby (free) → Pro ($20/mo) for team features",
    breakEven: "100k edge function invocations/mo",
    ethiopianNote: "Free tier sufficient for most Ethiopian MVPs",
  },
  react: {
    min: 0,
    max: 0,
    note: "Completely free, hosting costs separate",
    breakEven: "N/A — no platform cost",
    ethiopianNote: "Free — deploy on Netlify free tier",
  },
  vite_react: {
    min: 0,
    max: 0,
    note: "Completely free, hosting costs separate",
    breakEven: "N/A — no platform cost",
    ethiopianNote: "Free — deploy on Cloudflare Pages free tier",
  },
  angular: {
    min: 0,
    max: 0,
    note: "Completely free, hosting costs separate",
    breakEven: "N/A — no platform cost",
    ethiopianNote: "Free — larger bundle may need better hosting",
  },
  node: {
    min: 5,
    max: 25,
    note: "VPS $5-10/mo or Railway $5-25/mo",
    breakEven: "512MB RAM exceeded",
    ethiopianNote: "Habesha Host VPS from $10/mo",
  },
  nextjs_api: {
    min: 0,
    max: 20,
    note: "Vercel Hobby free → Pro $20/mo",
    breakEven: "100k edge invocations or 10s timeout",
    ethiopianNote: "Vercel free tier is excellent for startups",
  },
  python_fastapi: {
    min: 5,
    max: 25,
    note: "Railway $5-20/mo or VPS $5-10/mo",
    breakEven: "512MB RAM or 1 CPU exceeded",
    ethiopianNote: "Python skills widely available in Ethiopia",
  },
  django: {
    min: 7,
    max: 30,
    note: "Railway $7-20/mo or VPS $10-30/mo",
    breakEven: "CPU/memory limits on free tier",
    ethiopianNote: "Good for ERP — many Ethiopian devs know Django",
  },
  supabase_db: {
    min: 0,
    max: 25,
    note: "Free (500MB) → Pro $25/mo (8GB)",
    breakEven: "500MB database or 50K MAU",
    ethiopianNote: "Free tier generous, but US hosting adds latency",
  },
  mongodb: {
    min: 0,
    max: 57,
    note: "Free M0 (512MB) → M10 $57/mo",
    breakEven: "512MB storage exceeded",
    ethiopianNote: "Free tier good for prototyping",
  },
  postgresql: {
    min: 5,
    max: 20,
    note: "Self-hosted on VPS $5-20/mo",
    breakEven: "Depends on VPS resources",
    ethiopianNote: "Best for Ethiopian data residency",
  },
  planetscale: {
    min: 0,
    max: 39,
    note: "Free (1GB) → Scaler $39/mo",
    breakEven: "5M row reads or 1GB exceeded",
    ethiopianNote: "Global-only hosting, no African region",
  },
  supabase_auth: {
    min: 0,
    max: 25,
    note: "Free (50K MAU) → Pro $25/mo (100K)",
    breakEven: "50K monthly active users",
    ethiopianNote: "Email/password works without SMS gateways",
  },
  nextauth: {
    min: 0,
    max: 0,
    note: "Free and open-source, self-hosted",
    breakEven: "N/A — only DB hosting costs",
    ethiopianNote: "Free — excellent for Ethiopian startups",
  },
  firebase_auth: {
    min: 0,
    max: 0,
    note: "Free 10K MAU → Blaze pay-as-you-go",
    breakEven: "10K MAU for email/password",
    ethiopianNote: "Google services may be slower in Ethiopia",
  },
  supabase_storage: {
    min: 0,
    max: 25,
    note: "Free (1GB) → Pro $25/mo (100GB)",
    breakEven: "1GB storage or 10GB bandwidth",
    ethiopianNote: "Consider Bunny.net for better African CDN",
  },
  bunny: {
    min: 1,
    max: 50,
    note: "Pay-as-you-go from $0.01/GB",
    breakEven: "No free tier — pay from day 1",
    ethiopianNote: "Best CDN for Ethiopian users — South African PoPs",
  },
  cloudinary: {
    min: 0,
    max: 89,
    note: "Free (25GB) → Plus $89/mo",
    breakEven: "25GB storage or bandwidth",
    ethiopianNote: "Free tier generous for image-heavy apps",
  },
  vercel: {
    min: 0,
    max: 20,
    note: "Hobby free → Pro $20/mo/user",
    breakEven: "100GB bandwidth or 100k functions",
    ethiopianNote: "Free tier is excellent for startups",
  },
  netlify: {
    min: 0,
    max: 19,
    note: "Free (100GB) → Pro $19/mo",
    breakEven: "300 build min or 100GB bandwidth",
    ethiopianNote: "Good free tier, limited Next.js support",
  },
  cloudflare_pages: {
    min: 0,
    max: 20,
    note: "Free (unlimited bw) → Pro $20/mo",
    breakEven: "500 builds/mo exceeded",
    ethiopianNote: "Best free tier — unlimited bandwidth",
  },
  railway: {
    min: 5,
    max: 20,
    note: "$5 initial credit → $5-20/mo",
    breakEven: "Free $5 credit exhausted",
    ethiopianNote: "Good for global hosting",
  },
  render: {
    min: 0,
    max: 7,
    note: "Free (sleeps) → Starter $7/mo",
    breakEven: "Need to avoid 30min spin-down",
    ethiopianNote: "Free tier sleeps — not for production",
  },
  docker_vps: {
    min: 10,
    max: 30,
    note: "Ethiopian VPS $10-30/mo",
    breakEven: "Immediate hosting cost",
    ethiopianNote: "Best for Ethiopian data residency",
  },
  github_actions: {
    min: 0,
    max: 4,
    note: "Free 2000min → Team $4/mo",
    breakEven: "2000 CI minutes/month exhausted",
    ethiopianNote: "Free for public repos — unlimited",
  },
  chapa: {
    min: 0,
    max: 0,
    note: "3.5% + 5 ETB per transaction, no monthly fee",
    breakEven: "N/A — per-transaction only",
    ethiopianNote: "Best Ethiopian payment gateway",
  },
  paypal: {
    min: 0,
    max: 0,
    note: "3.49% + $0.49 per transaction",
    breakEven: "N/A — per-transaction only",
    ethiopianNote: "Not directly available in Ethiopia",
  },
  stripe: {
    min: 0,
    max: 0,
    note: "2.9% + $0.30 per transaction",
    breakEven: "N/A — per-transaction only",
    ethiopianNote: "Not available for Ethiopian merchants",
  },
  telebirr: {
    min: 0,
    max: 0,
    note: "~1% per transaction, no monthly fee",
    breakEven: "N/A — per-transaction only",
    ethiopianNote: "Most accessible payment in Ethiopia",
  },
  resend: {
    min: 0,
    max: 20,
    note: "Free 100/day → Pro $20/mo (50K)",
    breakEven: "3000 emails/month exceeded",
    ethiopianNote: "Good deliverability to Ethiopian providers",
  },
  sendgrid: {
    min: 0,
    max: 20,
    note: "Free 100/day → Essentials $20/mo",
    breakEven: "100 emails/day insufficient for growth",
    ethiopianNote: "Reliable delivery to Ethio Telecom",
  },
  redis_upstash: {
    min: 0,
    max: 19,
    note: "Free 10K cmd/day → Pro $19/mo",
    breakEven: "10K commands/day or 256MB",
    ethiopianNote: "Works globally, REST API no latency issues",
  },
  redis_self: {
    min: 0,
    max: 0,
    note: "Free on existing VPS",
    breakEven: "N/A — runs alongside app",
    ethiopianNote: "Best — run on same Ethiopian VPS",
  },
  jest: {
    min: 0,
    max: 0,
    note: "Free and open-source",
    breakEven: "N/A",
    ethiopianNote: "Free — no regional limitations",
  },
  playwright: {
    min: 0,
    max: 0,
    note: "Free and open-source",
    breakEven: "N/A",
    ethiopianNote: "Free — CI minutes are the only cost",
  },
  sentry: {
    min: 0,
    max: 26,
    note: "Free 5K events → Team $26/mo",
    breakEven: "5K error events/month exceeded",
    ethiopianNote: "Free tier enough for early stage",
  },
  posthog: {
    min: 0,
    max: 0,
    note: "Free 1M events/mo (cloud) or free self-hosted",
    breakEven: "1M events/month for cloud",
    ethiopianNote: "Self-hosted option for data residency",
  },
};

export function calculateCost(selectedTools: ToolOption[]): TotalCostEstimate {
  const breakdown: CostBreakdown[] = selectedTools.map((tool) => {
    const data = costData[tool.id] || {
      min: 0,
      max: 0,
      note: "Cost data not available",
      breakEven: "Unknown",
      ethiopianNote: "N/A",
    };
    return {
      toolId: tool.id,
      toolName: tool.name,
      toolIcon: tool.icon,
      categoryLabel: tool.category.replace(/_/g, " "),
      freeTier: tool.freeTier,
      monthlyCost: { min: data.min, max: data.max, note: data.note },
      estimatedAnnual: data.max * 12,
      breakEvenPoint: data.breakEven,
      ethiopianCostNote: data.ethiopianNote,
    };
  });

  const totalMonthly = breakdown.reduce(
    (acc, b) => ({
      min: acc.min + b.monthlyCost.min,
      max: acc.max + b.monthlyCost.max,
    }),
    { min: 0, max: 0 },
  );

  const totalAnnual = {
    min: totalMonthly.min * 12,
    max: totalMonthly.max * 12,
  };

  const hasFreeTools = breakdown.some((b) => b.monthlyCost.max === 0);
  const freeTierSufficient = totalMonthly.max === 0;
  const allFree = breakdown.every(
    (b) => b.monthlyCost.min === 0 && b.monthlyCost.max === 0,
  );

  let monthsUntilPaid = "N/A — all tools free";
  if (!allFree) {
    const earliestBreakEven = breakdown
      .filter((b) => b.monthlyCost.max > 0)
      .sort((a, b) => a.monthlyCost.max - b.monthlyCost.max)[0];
    monthsUntilPaid = earliestBreakEven
      ? `When ${earliestBreakEven.breakEvenPoint} — upgrade ${earliestBreakEven.toolName}`
      : "Immediately — some tools have no free tier";
  }

  let recommendation = "";
  if (totalMonthly.max === 0) {
    recommendation =
      "Your selected stack is completely free! Perfect for prototyping and MVPs.";
  } else if (totalMonthly.max <= 25) {
    recommendation =
      "Very affordable stack. Under $25/mo keeps costs low while you validate your idea.";
  } else if (totalMonthly.max <= 60) {
    recommendation =
      "Moderate monthly cost. Consider which tools you can optimize (e.g., self-hosted DB, Cloudflare free tier).";
  } else {
    recommendation =
      "Higher monthly cost. Review each tool — consider free alternatives like self-hosted PostgreSQL, Cloudflare Pages, or self-hosted Sentry.";
  }

  if (
    costData.chapa &&
    selectedTools.some((t) => t.id === "chapa" || t.id === "telebirr")
  ) {
    recommendation +=
      " For Ethiopian payments, Chapa (3.5% + 5 ETB) and Telebirr (~1%) have no monthly fees — only per-transaction costs.";
  }

  return {
    breakdown,
    totalMonthly,
    totalAnnual,
    freeTierSufficient,
    monthsUntilPaid,
    recommendation,
  };
}

export function getCategoryTooltip(catId: string): string {
  const tips: Record<string, string> = {
    frontend:
      "Next.js recommended for most projects. React + Vite for simpler SPAs. Angular for enterprise.",
    backend:
      "Next.js API routes eliminate separate backend cost. Node.js/Express for flexibility. FastAPI for AI/ML.",
    database:
      "Supabase PostgreSQL is the best all-rounder. MongoDB for flexible docs. Self-hosted PostgreSQL for data residency.",
    auth: "Supabase Auth integrates seamlessly with DB via RLS. NextAuth for multi-provider. Firebase if already in Google ecosystem.",
    deploy_frontend:
      "Vercel for Next.js (purpose-built). Cloudflare Pages for best free tier. Netlify for static sites.",
    deploy_backend:
      "Railway for ease of use. Render for free tier (sleeps). Docker+VPS for Ethiopian data residency.",
  };
  return tips[catId] || "";
}
