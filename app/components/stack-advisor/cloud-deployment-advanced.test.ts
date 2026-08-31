import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCloudCostComparison,
  generateDeploymentChecklist,
  selectDeploymentPattern,
} from "./cloud-deployment-advanced";
import type { ProjectRequirements } from "./types";

const baseRequirements: ProjectRequirements = {
  projectName: "Northstar AI",
  projectDescription:
    "AI-enabled workflow platform with payments, uploads, and background processing.",
  projectCategory: "ai-app",
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
    "payments",
    "ai",
    "file-uploads",
    "background-jobs",
  ],
  targetMarketCountry: "Ethiopia",
  expectedGrowth: "Enterprise growth across regional operations",
  existingTechnologyPreferences: "AWS preferred, Docker and Kubernetes allowed",
};

test("advanced cloud guidance returns structured cost, pattern, and checklist data", () => {
  const costComparison = buildCloudCostComparison(baseRequirements);
  const pattern = selectDeploymentPattern(baseRequirements);
  const checklist = generateDeploymentChecklist(baseRequirements);

  assert.ok(costComparison.length >= 4);
  assert.ok(
    costComparison.some(
      (entry) => entry.provider === "AWS" || entry.provider === "Azure",
    ),
  );
  assert.ok(pattern.title.length > 0);
  assert.ok(pattern.summary.length > 0);
  assert.ok(Array.isArray(pattern.providerBlueprints));
  assert.ok(
    pattern.providerBlueprints.some((entry) => entry.provider === "AWS"),
  );
  assert.ok(Array.isArray(pattern.roadmap));
  assert.ok(pattern.roadmap.some((phase) => phase.title === "MVP launch"));
  assert.ok(
    pattern.roadmap.some(
      (phase) => phase.title === "Multi-region / cloud resilience strategy",
    ),
  );
  assert.ok(Array.isArray(pattern.decisionBoard));
  assert.ok(
    pattern.decisionBoard.some(
      (entry) =>
        entry.recommendedPhase === "MVP launch" ||
        entry.recommendedPhase === "Enterprise production hardening",
    ),
  );
  assert.ok(
    pattern.decisionBoard.some((entry) => entry.targetProvider === "AWS"),
  );
  assert.ok(checklist.includes("Production deployment checklist"));
  assert.ok(checklist.includes("Security and access"));
});
