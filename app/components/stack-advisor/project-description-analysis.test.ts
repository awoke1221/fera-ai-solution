import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLocalProjectDescriptionAnalysis,
  isProjectDescriptionAnalysis,
} from "./project-description-analysis";

test("project description suggestions select one relevant platform and features", () => {
  const result = buildLocalProjectDescriptionAnalysis(
    "A course platform for students with video lessons, quizzes, and progress tracking.",
  );

  assert.equal(result.projectCategory, "lms");
  assert.equal(result.projectType, "lms");
  assert.ok(result.requiredFeatures.includes("video"));
  assert.deepEqual(result.targetPlatforms, ["web"]);
  assert.ok(result.recommendedTools.frontend);
  assert.ok(result.recommendedTools.database);
  assert.ok(result.recommendedToolReasons.frontend);
  assert.equal(result.source, "local");
});

test("project description suggestions identify mobile commerce", () => {
  const result = buildLocalProjectDescriptionAnalysis(
    "A mobile shopping app with product listings, user accounts, and checkout payments.",
  );

  assert.equal(result.projectCategory, "ecommerce");
  assert.equal(result.projectType, "ecommerce");
  assert.ok(result.requiredFeatures.includes("payments"));
  assert.ok(result.requiredFeatures.includes("authentication"));
  assert.deepEqual(result.targetPlatforms, ["mobile", "web"]);
});

test("description analysis distinguishes healthcare from generic projects", () => {
  const result = buildLocalProjectDescriptionAnalysis(
    "A telemedicine service for patients to book remote doctor appointments.",
  );

  assert.equal(result.projectCategory, "healthcare");
  assert.equal(result.projectType, "healthcare");
});

test("AI analysis validator rejects unrelated project types and invalid features", () => {
  const validAnalysis = buildLocalProjectDescriptionAnalysis(
    "A booking app for scheduling appointments.",
  );
  assert.equal(isProjectDescriptionAnalysis(validAnalysis), true);
  assert.equal(
    isProjectDescriptionAnalysis({
      ...validAnalysis,
      projectType: "not-a-project-type",
    }),
    false,
  );
  assert.equal(
    isProjectDescriptionAnalysis({
      ...validAnalysis,
      projectType: "saas",
    }),
    false,
  );
  assert.equal(
    isProjectDescriptionAnalysis({
      ...validAnalysis,
      requiredFeatures: ["made-up-feature"],
    }),
    false,
  );
  assert.equal(
    isProjectDescriptionAnalysis({
      ...validAnalysis,
      recommendedTools: { frontend: "not-a-tool" },
    }),
    false,
  );
});
