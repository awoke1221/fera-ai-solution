import { NextResponse } from "next/server";

export function buildFallbackRecommendation(
  projectType: string | null,
  selections: Record<string, string> | undefined,
  message: string | null,
) {
  const selectedToolIds = Object.values(selections || {});
  const selectedCount = selectedToolIds.length;
  const projectLabel = projectType || "your project";

  let content = `🎯 Recommended direction for ${projectLabel}\n\n`;

  if (selectedCount > 0) {
    content += `You have already selected ${selectedCount} tools. That is a strong starting point for a practical MVP stack.\n\n`;
  } else {
    content +=
      "You have not selected tools yet, so I would start with a lean MVP stack built around Next.js, Supabase, Tailwind, and a simple deployment workflow.\n\n";
  }

  if (
    selectedToolIds.includes("nextjs") &&
    !selectedToolIds.includes("vercel")
  ) {
    content +=
      "✅ Next.js is a solid foundation; add Vercel for the smoothest deployment and performance experience.\n";
  }

  if (
    selectedToolIds.includes("paypal") &&
    !selectedToolIds.includes("chapa") &&
    !selectedToolIds.includes("telebirr")
  ) {
    content +=
      "💳 For Ethiopian users, add Chapa or Telebirr alongside PayPal to improve local payment support.\n";
  }

  if (
    selectedToolIds.includes("supabase_db") &&
    selectedToolIds.includes("supabase_auth")
  ) {
    content +=
      "🛡️ Your database and auth combination is coherent; focus on row-level security and clean API boundaries for production.\n";
  }

  if (message && /cheap|budget|free|mvp/i.test(message)) {
    content +=
      "💰 For a budget-friendly MVP, keep the core stack small and only add paid services when your user growth justifies them.\n";
  }

  content +=
    "\n🚀 Suggested next step: refine your stack around auth, monitoring, backups, and a staging deployment before you go live.";

  return content;
}

export function createFallbackResponse(
  projectType: string | null,
  selections: Record<string, string> | undefined,
  message: string | null,
  failureReason?: string,
) {
  if (failureReason) {
    console.warn(
      `[stack-advisor fallback] Falling back to safe recommendation: ${failureReason}`,
    );
  }

  return NextResponse.json({
    type: "chat",
    role: "assistant",
    content: buildFallbackRecommendation(projectType, selections, message),
  });
}
