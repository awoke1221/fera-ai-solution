// ─── AI Stack Recommendation API ───────────────────────
// POST /api/ai-stack-recommend
// Uses DeepSeek to give personalized tech stack advice
// based on project type, selected tools, and user prompt.
//
// Environment:
//   DEEPSEEK_API_KEY  — required in .env.local

import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

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

export async function POST(request: Request) {
  try {
    const { projectType, selections, message, conversation } =
      await request.json();

    if (!message && !projectType) {
      return NextResponse.json(
        { error: "Provide at least a message or project type" },
        { status: 400 },
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        role: "assistant",
        content:
          "👋 **Stack Advisor AI is ready!**\n\nTo enable AI-powered recommendations, add your **DeepSeek API key** to the `.env.local` file:\n\n```\nDEEPSEEK_API_KEY=your_key_here\n```\n\nOnce configured, I can help you choose the perfect tech stack for your project!",
      });
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

    const response = await fetch(API_URL, {
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", response.status, errorData);

      if (response.status === 401) {
        return NextResponse.json({
          role: "assistant",
          content:
            "🔑 **Invalid API Key**\n\nThe DeepSeek API key in your `.env.local` file appears to be invalid. Please double-check it and restart the dev server.",
        });
      }

      if (response.status === 429) {
        return NextResponse.json({
          role: "assistant",
          content:
            "⏳ **Rate limit reached**\n\nWe've hit the DeepSeek API rate limit. Please wait a moment and try again.",
        });
      }

      return NextResponse.json({
        role: "assistant",
        content:
          "⚠️ **Temporary issue**\n\nI couldn't get a response from the AI. Please try again in a moment.",
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json({
        role: "assistant",
        content:
          "🤔 **Unexpected response**\n\nI received an unexpected response format. Please try rephrasing your question.",
      });
    }

    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error("AI Stack Recommend API error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content:
          "❌ **Connection error**\n\nI'm having trouble connecting to the AI service. Please check your network and try again.",
      },
      { status: 200 },
    );
  }
}
