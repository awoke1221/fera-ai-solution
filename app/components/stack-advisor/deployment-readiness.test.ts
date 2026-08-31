import test from "node:test";
import assert from "node:assert/strict";

import { buildDeploymentReadinessAssessment } from "./deployment-readiness";
import type { ProjectRequirements } from "./types";

const baseRequirements: ProjectRequirements = {
  projectName: "Mela Commerce",
  projectDescription:
    "A regional commerce platform with payments, analytics, and customer accounts.",
  projectCategory: "ecommerce",
  targetPlatforms: ["web", "mobile"],
  targetUsers: "startup",
  expectedUsers: "10000-100000",
  teamSize: "2-5",
  developerExperience: "intermediate",
  developmentPriority: "balanced",
  budget: "200-1000",
  timeToLaunch: "1-3-months",
  requiredFeatures: [
    "authentication",
    "payments",
    "analytics",
    "notifications",
  ],
  targetMarketCountry: "Ethiopia",
  expectedGrowth: "Strong regional growth with multiple sales channels",
  existingTechnologyPreferences: "Next.js with Vercel and Supabase",
};

test("buildDeploymentReadinessAssessment produces structured deployment guidance", () => {
  const report = buildDeploymentReadinessAssessment(baseRequirements);

  assert.ok(report.overallScore >= 0 && report.overallScore <= 100);
  assert.ok(report.recommendedStrategy.length > 0);
  assert.ok(report.readyForProduction.length > 0);
  assert.ok(report.deploymentOptions.length >= 3);
  assert.ok(
    report.deploymentOptions.every(
      (option) =>
        option.title.length > 0 &&
        option.summary.length > 0 &&
        option.advantages.length > 0 &&
        option.readinessChecklist.length > 0,
    ),
  );
  assert.ok(report.riskNotes.some((note) => note.length > 0));
});
