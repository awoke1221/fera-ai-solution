// ─── AI Stack Recommendation API ───────────────────────
// POST /api/ai-stack-recommend
// Two modes:
// 1. Structured Mode: If projectRequirements + requirementsAnalysis provided,
//    returns deterministic typed StructuredTechStackRecommendation
// 2. Chat Mode: If message provided, uses DeepSeek for conversational advice
//
// Environment:
//   DEEPSEEK_API_KEY  — required in .env.local for chat mode

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { consumeUserRateLimit } from "./rate-limit";
import type {
  ProjectRequirements,
  RequirementsAnalysisResult,
} from "@/app/components/stack-advisor";
import { analyzeAndRecommend } from "@/app/components/stack-advisor/tech-recommendation-analyzer";
import {
  RecommendationValidator,
  parseAiJsonResponse,
  sanitizeRecommendation,
} from "@/app/components/stack-advisor/tech-recommendation-validator";
import {
  buildFallbackRecommendation,
  createFallbackResponse,
} from "./fallback";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const API_URL = "https://api.deepseek.com/v1/chat/completions";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const SYSTEM_PROMPT = `You are a senior tech stack advisor for the "Vibe Coder's Tech Stack Platform". Your role is to help developers choose the best combination of tools, frameworks, and services for their projects.

AVAILABLE PROJECT TYPES:
- LMS / Learning Platform — Courses, quizzes, video lectures, student management
- E-Commerce / Marketplace — Product listings, cart, checkout, payments
- SaaS Platform — Subscriptions, multi-tenant, billing
- Social Media / Community — Feeds, chat, profiles, groups
- Enterprise ERP — Finance, HR, inventory, CRM
- Fintech / Payment Platform — Wallets, transfers, mobile money
- Healthcare / Telemedicine — Patients, appointments, telemedicine
- Real Estate Platform — Property listings, virtual tours, agent mgmt
- Content / Media Platform — CMS, video streaming, subscriptions
- Booking / Reservation System — Reservations, availability, payments

AVAILABLE TOOLS BY CATEGORY:

Frontend Frameworks:
- ▲ Next.js (React, SSR/SSG/ISR, App Router) [Recommended]
- ⚛️ React.js (UI library, needs extra tooling)
- ⚡ Vite + React (Fast builds, no SSR)
- 🅰️ Angular (Enterprise-grade, batteries included)
- 💚 Vue.js + Nuxt (Progressive, great DX)
- 🧡 Svelte + SvelteKit (Compiler-driven, tiny bundles)
- 🧶 Remix (Web-standards focused, nested routes)
- 🚀 Astro (Content-first, zero-JS by default)
- ▲ Next.js Pages Router (Stable, battle-tested)

Backend / API:
- 🟢 Node.js + Express (JS runtime, huge ecosystem) [Recommended]
- ▲ Next.js API Routes (Built-in, no separate server) [Recommended]
- 🐍 Python FastAPI (Async, auto-docs, high perf)
- 🎸 Django (Batteries included, admin panel)
- 🔵 Go + Gin (High perf, native binaries)
- 🎼 Laravel (PHP, Eloquent ORM, queues)
- 🛤️ Ruby on Rails (Convention over config, rapid MVP)
- 🥟 Bun + Elysia (Fast JS runtime, zero-allocation)

Database:
- ⚡ Supabase (PostgreSQL + real-time + auth) [Recommended]
- 🍃 MongoDB Atlas (NoSQL, flexible schema)
- 🐘 PostgreSQL (Self-hosted, ACID, full control)
- 🌍 PlanetScale (MySQL, serverless, branching)
- 💜 Neon (Serverless PostgreSQL, branching)
- 🧊 Turso (SQLite at the edge, global replicas)
- ☁️ Cloudflare D1 (Serverless SQLite, Workers)
- 📦 SQLite (Embedded, zero-config)
- 🌲 Pinecone (Vector DB for AI/ML)

Authentication:
- ⚡ Supabase Auth (Built-in, RLS) [Recommended]
- 🔑 NextAuth/Auth.js (Self-hosted, flexible)
- 🔥 Firebase Auth (Quick setup, Google)
- 🪪 Clerk (Drop-in UI, 10+ providers)
- 🔑 Auth0 (Enterprise-grade, SSO)

Storage / Media:
- 📁 Supabase Storage (S3-compatible, RLS)
- 🐰 Bunny.net (CDN + storage, African PoPs) [Recommended]
- ☁️ Cloudinary (Image optimization, transformations)

Payment:
- 🇪🇹 Chapa (Ethiopian gateway, Telebirr/CBE) [Recommended]
- 📱 Telebirr (Ethiopian mobile money)
- 💳 Stripe (Global, subscriptions)
- 💸 PayPal (Global, widely recognized)

Email, Cache, Testing, Monitoring, Deploy:
- 📨 Resend (Modern email API) / ✉️ SendGrid
- 🔴 Upstash Redis (Serverless cache) / 💾 Self-Hosted Redis
- 🧪 Jest + RTL (Unit) / 🎭 Playwright (E2E) [Recommended]
- 📡 Sentry (Error tracking) / 🦔 PostHog (Analytics)
- ▲ Vercel (Next.js) / 🌐 Netlify / ☁️ Cloudflare Pages
- 🚂 Railway / 🖼️ Render / 🐳 Docker VPS

Additional:
- 🌊 Tailwind CSS (Utility-first) [Recommended]
- 🧩 Shadcn/ui (Components on Radix) [Recommended]
- 🔄 TanStack Query (Server state) [Recommended]
- 🔎 Meilisearch / 🔦 Algolia / ⚡ Typesense (Search)
- 📱 React Native + Expo / 💙 Flutter (Mobile)

YOUR RESPONSE RULES:
1. Be concise but insightful — 150-250 words
2. If the user has selected tools, comment on their choices, suggest improvements, and flag any compatibility issues
3. If no tools are selected yet, recommend a full stack based on their project description
4. Always consider Ethiopian context: suggest Chapa/Telebirr for payments, Bunny.net for CDN, self-hosted options for data residency
5. Format responses with clear sections using emojis:
   - 🎯 Recommended Stack (for new recommendations)
   - ✅ What works (when reviewing existing selections)
   - ⚠️ Watch out (compatibility/pricing concerns)
   - 💰 Cost Estimate (free/pro tiers)
   - 🚀 Next Steps
6. Never make up tools — only recommend from the lists above
7. If asked about pricing, reference the cost estimator data accurately
8. Keep the tone professional, warm, and actionable`;

// Fallback chain: no API key, AI/network/parsing failures, and validation failures
// must all degrade to the safe recommendation payload instead of surfacing a raw error.

export async function POST(request: Request) {
  let projectType: string | null = null;
  let selections: Record<string, string> | undefined;
  let message: string | null = null;
  let conversation:
    | Array<{ role: "user" | "assistant"; content: string }>
    | undefined;
  let projectRequirements: ProjectRequirements | undefined;
  let requirementsAnalysis: RequirementsAnalysisResult | undefined;

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = consumeUserRateLimit(user.id, {
      max: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfterMs: rateLimit.retryAfterMs,
        },
        { status: 429 },
      );
    }

    ({
      projectType,
      selections,
      message,
      conversation,
      projectRequirements,
      requirementsAnalysis,
    } = await request.json());

    // Mode 1: Structured Recommendation
    // If we have project requirements and analysis, generate deterministic structured recommendation
    if (projectRequirements && requirementsAnalysis) {
      try {
        const recommendation = analyzeAndRecommend(
          projectRequirements as ProjectRequirements,
          requirementsAnalysis as RequirementsAnalysisResult,
        );

        const validator = new RecommendationValidator();
        const validationErrors: string[] = [];

        for (const [index, tech] of recommendation.recommendedStack.entries()) {
          if (
            !validator.validateTechRecommendation(
              tech,
              `recommendedStack[${index}]`,
            )
          ) {
            validationErrors.push(
              ...validator
                .getErrorMessages()
                .map((message) => `recommendedStack[${index}]: ${message}`),
            );
          }
        }

        if (
          !validator.validateRecommendation(recommendation) ||
          validationErrors.length > 0
        ) {
          const reasons = [
            ...validator.getErrorMessages(),
            ...validationErrors,
          ];
          console.warn(
            "Structued recommendation validation failed; falling back to safe recommendation.",
            reasons,
          );
          return createFallbackResponse(
            projectType,
            selections,
            message,
            `structured_validation_failed: ${reasons.join("; ")}`,
          );
        }

        return NextResponse.json({
          type: "structured",
          data: recommendation,
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.error("Recommendation analysis error:", reason);
        return createFallbackResponse(
          projectType,
          selections,
          message,
          `structured_generation_failed: ${reason}`,
        );
      }
    }

    // Mode 2: Chat Mode
    // Fallback to conversational AI response for free-form questions
    if (!message && !projectType) {
      return NextResponse.json(
        { error: "Provide project requirements or a message" },
        { status: 400 },
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return createFallbackResponse(
        projectType,
        selections,
        message,
        "missing_deepseek_api_key",
      );
    }

    // Build context about current selections
    let selectionsContext = "";
    if (selections && Object.keys(selections).length > 0) {
      selectionsContext = `\n\nThe user has already selected these tools:\n`;
      for (const [catId, toolId] of Object.entries(selections)) {
        selectionsContext += `- ${catId}: ${toolId}\n`;
      }
      selectionsContext += `\nReview their choices and provide feedback, improvements, and compatibility checks.`;
    }

    let projectContext = "";
    if (projectType) {
      projectContext = `\nThe user's project type is: ${projectType}\n`;
    }

    const userPrompt = `Project Type: ${projectType || "Not specified"}${selectionsContext}${projectContext}\n\nUser message: ${message || "What stack do you recommend for this project?"}`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(conversation || []),
      { role: "user", content: userPrompt },
    ];

    let response: Response;

    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages,
          temperature: 0.5,
          max_tokens: 2048,
          stream: false,
        }),
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error("DeepSeek fetch failed:", reason);
      return createFallbackResponse(
        projectType,
        selections,
        message,
        `deepseek_fetch_failed: ${reason}`,
      );
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", response.status, errorData);

      if (response.status === 401) {
        return NextResponse.json({
          type: "chat",
          role: "assistant",
          content:
            "🔑 **Invalid API Key**\n\nThe DeepSeek API key in your `.env.local` file appears to be invalid. Please double-check it and restart the dev server.",
        });
      }

      if (response.status === 429) {
        return NextResponse.json({
          type: "chat",
          role: "assistant",
          content:
            "⏳ **Rate limit reached**\n\nWe've hit the DeepSeek API rate limit. Please wait a moment and try again.",
        });
      }

      return NextResponse.json({
        type: "chat",
        role: "assistant",
        content:
          "⚠️ **Temporary issue**\n\nI couldn't get a response from the AI. Please try again in a moment.",
      });
    }

    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error("DeepSeek response parse failed:", reason);
      return createFallbackResponse(
        projectType,
        selections,
        message,
        `deepseek_json_parse_failed: ${reason}`,
      );
    }

    const assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      return createFallbackResponse(
        projectType,
        selections,
        message,
        "deepseek_missing_message_payload",
      );
    }

    const rawContent =
      typeof assistantMessage.content === "string"
        ? assistantMessage.content
        : "";

    if (rawContent) {
      try {
        const parsed = parseAiJsonResponse(rawContent);
        if (parsed && typeof parsed === "object") {
          const validator = new RecommendationValidator();
          const sanitized = sanitizeRecommendation(parsed);

          if (!sanitized || !validator.validateRecommendation(sanitized)) {
            const reasons = validator.getErrorMessages();
            console.warn(
              "AI structured JSON parse/validation failed; using safe fallback.",
              reasons,
            );
            return createFallbackResponse(
              projectType,
              selections,
              message,
              `structured_json_validation_failed: ${reasons.join("; ")}`,
            );
          }

          return NextResponse.json({
            type: "structured",
            data: sanitized,
          });
        }

        const reason = "parseAiJsonResponse did not yield a structured object";
        console.warn(
          "parseAiJsonResponse failed while evaluating AI structured response; falling back.",
          reason,
        );
        return createFallbackResponse(
          projectType,
          selections,
          message,
          `parse_ai_json_failed: ${reason}`,
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(
          "parseAiJsonResponse failed while evaluating AI structured response; falling back.",
          reason,
        );
        return createFallbackResponse(
          projectType,
          selections,
          message,
          `parse_ai_json_failed: ${reason}`,
        );
      }
    }

    return NextResponse.json({
      type: "chat",
      ...assistantMessage,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("AI Stack Recommend API error:", reason);
    return createFallbackResponse(
      projectType,
      selections,
      message,
      `chat_handler_failed: ${reason}`,
    );
  }
}
