import test from "node:test";
import assert from "node:assert/strict";

import { analyzeProjectRequirements } from "./requirements-analyzer";
import type { ProjectRequirements } from "./types";

const baseRequirements: ProjectRequirements = {
  projectName: "Test Platform",
  projectDescription: "A platform for learners and coaches.",
  projectCategory: "lms",
  targetPlatforms: ["web", "mobile"],
  targetUsers: "startup",
  expectedUsers: "1000-10000",
  teamSize: "2-5",
  developerExperience: "intermediate",
  developmentPriority: "balanced",
  budget: "200-1000",
  timeToLaunch: "1-3-months",
  requiredFeatures: ["authentication", "payments", "video", "search", "ai"],
  targetMarketCountry: "Ethiopia",
  expectedGrowth: "Strong regional adoption",
  existingTechnologyPreferences: "Next.js + Supabase",
};

test("detects LMS-specific functional requirements", () => {
  const result = analyzeProjectRequirements(baseRequirements);

  assert.ok(
    result.functionalRequirements.some(
      (item) => item.id === "course-management",
    ),
  );
  assert.ok(
    result.functionalRequirements.some(
      (item) => item.id === "progress-tracking",
    ),
  );
  assert.ok(
    result.infrastructureRequirements.some((item) => item.id === "cdn"),
  );
});

test("flags payment and security requirements for commerce flows", () => {
  const commerce: ProjectRequirements = {
    ...baseRequirements,
    projectCategory: "ecommerce",
    requiredFeatures: ["authentication", "payments", "file-uploads"],
    targetUsers: "enterprise",
    expectedUsers: "10000-100000",
  };

  const result = analyzeProjectRequirements(commerce);

  assert.ok(
    result.securityRequirements.some((item) => item.id === "payment-security"),
  );
  assert.ok(
    result.integrationRequirements.some(
      (item) => item.id === "payment-provider",
    ),
  );
  assert.ok(
    result.functionalRequirements.some((item) => item.id === "payments"),
  );
});

test("escalates scaling and performance requirements for large AI products", () => {
  const aiProduct: ProjectRequirements = {
    ...baseRequirements,
    projectCategory: "ai-app",
    requiredFeatures: [
      "authentication",
      "ai",
      "background-jobs",
      "analytics",
      "search",
      "multi-tenancy",
    ],
    targetUsers: "enterprise",
    expectedUsers: "100000-plus",
    developmentPriority: "max-scalability",
  };

  const result = analyzeProjectRequirements(aiProduct);

  assert.ok(
    result.scalabilityRequirements.some(
      (item) => item.id === "horizontal-scaling",
    ),
  );
  assert.ok(
    result.infrastructureRequirements.some((item) => item.id === "job-workers"),
  );
  assert.ok(
    result.integrationRequirements.some(
      (item) => item.id === "llm-or-model-integration",
    ),
  );
  assert.ok(result.scoring.scalabilityScore >= 70);
});

test("keeps safety scores and readiness aligned to complexity", () => {
  const result = analyzeProjectRequirements(baseRequirements);

  assert.ok(result.scoring.complexityScore > 50);
  assert.ok(result.scoring.securityBaselineScore >= 45);
  assert.ok(result.scoring.readinessScore >= 0);
  assert.ok(result.scoring.readinessScore <= 100);
});
