// ─── FERA AI Chat API ─────────────────────────────────
// POST /api/chat
// Accepts: { messages: { role, content }[] }
// Returns: { role: "assistant", content: "..." }
// Uses DeepSeek LLM with a system prompt that teaches
// the model about Fera AI Solutions' services, team,
// partners, and industries.
//
// Environment:
//   DEEPSEEK_API_KEY  — required for real AI responses
//   DEEPSEEK_MODEL    — optional (default: deepseek-chat)

import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are FERA AI, the intelligent assistant for Fera AI Solutions. You represent a premium software engineering studio.

ABOUT THE COMPANY:
- Fera AI Solutions designs and delivers advanced software platforms, AI-powered products, AI agents, web applications, enterprise systems, ERP solutions, LMS platforms, and custom digital products.
- The studio combines product strategy, AI execution, and senior engineering.
- Services include: Advanced Websites & Web Platforms, AI-Based Software & Intelligent Agents, Custom Enterprise Software, ERP/CRM & Business Operations, LMS & Learning Platforms, Blockchain & Web3 Solutions, Mobile & Cross-Platform Apps, Fintech & Payment Systems.
- The team operates across East Africa, Europe, and Remote locations.
- Key partners: Supabase, Vercel, OpenAI, LangChain, Stripe, Google Cloud.
- They serve markets including Retail & E-commerce, Logistics & Fleet Operations, Healthcare & Clinics, Construction & Field Services, Fintech & Payments, Education & Learning Platforms, Blockchain & Web3, Enterprise Operations.

PERSONALITY:
- Professional, warm, and knowledgeable.
- Be concise but thorough — provide real value in every response.
- If asked about pricing or specific quotes, explain that each project is tailored and invite them to book a consultation.
- If you don't know something specific, be honest but helpful.
- Keep responses under 200 words unless deep technical detail is requested.
- Use a confident, executive tone suitable for business decision-makers.

RULES:
- Never claim to be a human; identify as FERA AI when asked.
- Always be helpful, never dismissive.
- For booking inquiries, guide users to the /book page.
- For technical questions, provide genuine insights based on the company's service areas.
- Do not make up specific client results or case studies outside what is listed.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        role: "assistant",
        content:
          "👋 Hello! I'm FERA AI, your assistant. I'm currently running in demo mode. To enable full AI responses, add your **DeepSeek API key** to the `.env.local` file:\n\n```\nDEEPSEEK_API_KEY=your_key_here\n```\n\nIn the meantime, feel free to explore our [services](/services) or [book a consultation](/book) directly!",
      });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
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
            "🔑 The DeepSeek API key is invalid or unauthorized. Please check your `DEEPSEEK_API_KEY` environment variable and ensure it is correct.",
        });
      }

      if (response.status === 429) {
        return NextResponse.json({
          role: "assistant",
          content:
            "⏳ We've received a high volume of requests. Please try again in a moment, or [book a consultation](/book) to speak with our team directly.",
        });
      }

      return NextResponse.json({
        role: "assistant",
        content:
          "I encountered a temporary issue. Please try again, or reach out via our [contact page](/contact).",
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json({
        role: "assistant",
        content:
          "I received an unexpected response. Please try rephrasing your question.",
      });
    }

    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again or reach out via our [contact page](/contact).",
      },
      { status: 200 },
    );
  }
}
