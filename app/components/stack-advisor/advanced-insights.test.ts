import test from "node:test";
import assert from "node:assert/strict";

import { buildAdvancedStackInsights } from "./advanced-insights";
import type { ProjectRequirements } from "./types";

const baseRequirements: ProjectRequirements = {
  projectName: "Luma Academy",
  projectDescription:
    "A modern learning platform with video, payments, and analytics.",
  projectCategory: "lms",
  targetPlatforms: ["web", "mobile"],
  targetUsers: "startup",
  expectedUsers: "1000-10000",
  teamSize: "2-5",
  developerExperience: "intermediate",
  developmentPriority: "balanced",
  budget: "200-1000",
  timeToLaunch: "1-3-months",
  requiredFeatures: ["authentication", "payments", "video", "analytics"],
  targetMarketCountry: "Ethiopia",
  expectedGrowth: "Rapid growth with premium subscriptions",
  existingTechnologyPreferences: "React + Node.js preferred",
};

test("buildAdvancedStackInsights adds architecture, delivery, and risk guidance", () => {
  const insights = buildAdvancedStackInsights(baseRequirements);

  assert.ok(insights.length >= 4);
  assert.ok(
    insights.some(
      (insight) =>
        insight.category === "Architecture" &&
        insight.headline.toLowerCase().includes("strategy"),
    ),
  );
  assert.ok(
    insights.some(
      (insight) =>
        insight.category === "Security" ||
        insight.category === "Delivery" ||
        insight.category === "Growth",
    ),
  );
  assert.ok(
    insights.every(
      (insight) =>
        typeof insight.headline === "string" &&
        insight.headline.trim().length > 0 &&
        typeof insight.detail === "string" &&
        insight.detail.trim().length > 0,
    ),
  );
});
