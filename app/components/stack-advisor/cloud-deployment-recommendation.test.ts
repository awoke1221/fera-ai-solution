import test from "node:test";
import assert from "node:assert/strict";

import { buildCloudDeploymentRecommendation } from "./cloud-deployment-recommendation";
import type { ProjectRequirements } from "./types";

const baseRequirements: ProjectRequirements = {
  projectName: "Atlas Ops",
  projectDescription:
    "A B2B business platform with analytics, file uploads, and background jobs.",
  projectCategory: "internal-business",
  targetPlatforms: ["web", "mobile"],
  targetUsers: "enterprise",
  expectedUsers: "10000-100000",
  teamSize: "6-15",
  developerExperience: "advanced",
  developmentPriority: "max-scalability",
  budget: "1000-plus",
  timeToLaunch: "3-6-months",
  requiredFeatures: [
    "authentication",
    "file-uploads",
    "analytics",
    "background-jobs",
  ],
  targetMarketCountry: "Kenya",
  expectedGrowth: "Enterprise expansion across East Africa",
  existingTechnologyPreferences: "Docker, AWS preferred",
};

test("buildCloudDeploymentRecommendation provides a structured provider strategy", () => {
  const recommendation = buildCloudDeploymentRecommendation(baseRequirements);

  assert.ok(recommendation.primaryProvider.length > 0);
  assert.ok(recommendation.primaryProvider.includes("AWS"));
  assert.ok(recommendation.providerOptions.length >= 4);
  assert.ok(recommendation.costSummary.length > 0);
  assert.ok(
    recommendation.decisionMatrix.some((item) => item.metric.length > 0),
  );
});
