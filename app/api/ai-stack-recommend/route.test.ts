import test from "node:test";
import assert from "node:assert/strict";

import { buildFallbackRecommendation, createFallbackResponse } from "./route";

test("buildFallbackRecommendation includes the fallback guidance for a low-cost MVP", () => {
  const content = buildFallbackRecommendation(
    "saas",
    {
      nextjs: "nextjs",
      supabase_db: "supabase_db",
      supabase_auth: "supabase_auth",
    },
    "cheap MVP",
  );

  assert.match(content, /Recommended direction for saas/i);
  assert.match(content, /Next.js/i);
  assert.match(content, /budget-friendly MVP|budget/i);
});

test("createFallbackResponse returns a non-error chat payload without leaking internals", async () => {
  const response = createFallbackResponse(
    "fintech",
    { chapa: "chapa", nextjs: "nextjs" },
    "What stack should I use?",
    "deepseek_timeout",
  );

  const json = await response.json();
  assert.equal(json.type, "chat");
  assert.equal(json.role, "assistant");
  assert.match(String(json.content), /Recommended direction for fintech/i);
  assert.doesNotMatch(
    String(json.content),
    /deepseek_timeout|internal|stack trace/i,
  );
});
