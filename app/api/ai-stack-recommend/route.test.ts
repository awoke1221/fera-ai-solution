import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFallbackRecommendation,
  createFallbackResponse,
} from "./fallback";
import { consumeUserRateLimit } from "./rate-limit";

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

test("should allow a user to make a few requests before rate limiting", () => {
  const userId = "user-rate-limit-test";

  for (let i = 0; i < 5; i += 1) {
    const result = consumeUserRateLimit(userId, { max: 5, windowMs: 60_000 });
    assert.equal(result.allowed, true);
  }

  const blocked = consumeUserRateLimit(userId, { max: 5, windowMs: 60_000 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterMs > 0, true);
});

test("should reset the rate limit after the window expires", () => {
  const userId = "user-rate-limit-reset";

  const first = consumeUserRateLimit(
    userId,
    { max: 1, windowMs: 1000 },
    Date.now(),
  );
  assert.equal(first.allowed, true);

  const second = consumeUserRateLimit(
    userId,
    { max: 1, windowMs: 1000 },
    Date.now() + 1500,
  );
  assert.equal(second.allowed, true);
});
