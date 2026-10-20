import test from "node:test";
import assert from "node:assert/strict";

import { calculateCost } from "./cost-estimator";
import { tools } from "./tools";

test("calculateCost keeps user-volume assumptions explicit and vendor-specific", () => {
  const supabaseDb = tools.find((tool) => tool.id === "supabase_db");
  assert.ok(supabaseDb, "Supabase DB tool exists");

  const estimate = calculateCost([supabaseDb], {
    expectedUsers: "10000-100000",
    scale: "10000-100000",
  });

  assert.equal(estimate.hasFreeTierOptions, true);
  assert.match(
    estimate.upgradePlanningNote.toLowerCase(),
    /validate service limits/,
  );
  assert.match(
    estimate.recommendation.toLowerCase(),
    /catalogue|not a live quote/i,
  );
});

test("calculateCost does not promise free-tier capacity at small project scale", () => {
  const supabaseDb = tools.find((tool) => tool.id === "supabase_db");
  assert.ok(supabaseDb, "Supabase DB tool exists");

  const estimate = calculateCost([supabaseDb], {
    expectedUsers: "100-1000",
    scale: "100-1000",
  });

  assert.equal(estimate.hasFreeTierOptions, true);
  assert.match(
    estimate.upgradePlanningNote.toLowerCase(),
    /does not convert users into requests/,
  );
});
