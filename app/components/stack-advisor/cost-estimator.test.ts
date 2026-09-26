import test from "node:test";
import assert from "node:assert/strict";

import { calculateCost } from "./cost-estimator";
import { tools } from "./tools";

test("calculateCost treats free tiers as insufficient for larger user volumes", () => {
  const supabaseDb = tools.find((tool) => tool.id === "supabase_db");
  assert.ok(supabaseDb, "Supabase DB tool exists");

  const estimate = calculateCost([supabaseDb], {
    expectedUsers: "10000-100000",
    scale: "10000-100000",
  });

  assert.equal(estimate.freeTierSufficient, false);
  assert.match(estimate.monthsUntilPaid.toLowerCase(), /upgrade|paid|scale/);
  assert.match(
    estimate.recommendation.toLowerCase(),
    /upgrade|scale|monthly|growth|free tier/i,
  );
});

test("calculateCost stays conservative for small MVP scale", () => {
  const supabaseDb = tools.find((tool) => tool.id === "supabase_db");
  assert.ok(supabaseDb, "Supabase DB tool exists");

  const estimate = calculateCost([supabaseDb], {
    expectedUsers: "100-1000",
    scale: "100-1000",
  });

  assert.equal(estimate.freeTierSufficient, true);
  assert.match(
    estimate.monthsUntilPaid.toLowerCase(),
    /all tools free|n\/a|free/i,
  );
});
