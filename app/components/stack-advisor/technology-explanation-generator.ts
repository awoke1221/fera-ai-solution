/**
 * Technology Explanation Generator
 * Creates detailed, context-aware explanations for tech recommendations with decision traces
 */

import type { ProjectRequirements, RequirementsAnalysisResult } from "./types";
import type {
  TechRecommendation,
  RecommendationTier,
} from "./tech-recommendation-types";
import type {
  TechExplanation,
  TechDecisionTrace,
  DecisionTraceStep,
  TechExplanationContext,
} from "./technology-explanation-types";

/**
 * Generate a decision trace that shows the logic flow from requirements to technology choice
 */
function generateDecisionTrace(
  tech: TechRecommendation,
  context: TechExplanationContext,
): TechDecisionTrace {
  const { requirements, analysis, category } = context;
  const steps: DecisionTraceStep[] = [];

  // Step 1: Extract the key project requirement
  let requirementStep = "";
  const userCount = requirements.expectedUsers;
  const teamSize = requirements.teamSize;
  const budget = requirements.budget;
  const priority = requirements.developmentPriority;

  if (category === "frontend") {
    if (
      requirements.targetPlatforms.includes("web") &&
      userCount &&
      userCount !== "under-100"
    ) {
      requirementStep = `${userCount} users, needs ${priority === "fast-mvp" ? "fast launch" : "scalability"}`;
    } else if (priority === "fast-mvp") {
      requirementStep = "Rapid MVP launch with small team";
    } else {
      requirementStep = "Web application with good performance";
    }
  } else if (category === "database") {
    if (analysis.scoring.complexityScore > 60) {
      requirementStep = "Complex relational data requirements";
    } else if (
      userCount &&
      ["10000-100000", "100000-plus"].includes(userCount)
    ) {
      requirementStep = `High-volume data at ${userCount} user scale`;
    } else {
      requirementStep = "Reliable data persistence";
    }
  } else if (category === "backend") {
    if (analysis.scoring.scalabilityScore > 70) {
      requirementStep = "Backend service handling high scalability needs";
    } else if (budget === "free" || budget === "under-50") {
      requirementStep = "Cost-effective backend solution";
    } else {
      requirementStep = "Production-grade backend server";
    }
  } else if (category === "cache") {
    if (
      analysis.scoring.complexityScore > 70 ||
      requirements.expectedUsers === "100000-plus"
    ) {
      requirementStep = "High-performance caching for scale";
    } else {
      requirementStep = "Session management and performance optimization";
    }
  } else if (category === "deployment") {
    if (priority === "fast-mvp") {
      requirementStep = "One-click, zero-config deployment";
    } else if (analysis.scoring.scalabilityScore > 70) {
      requirementStep = "Multi-region, auto-scaling deployment";
    } else {
      requirementStep = "Reliable hosting with good DX";
    }
  } else if (category === "auth") {
    if (requirements.requiredFeatures?.includes("authentication")) {
      requirementStep = "User authentication and session management";
    } else {
      requirementStep = "User authentication capability";
    }
  } else {
    requirementStep = `${category} solution`;
  }

  steps.push({
    level: "requirement",
    content: requirementStep,
    icon: "📋",
  });

  // Step 2: Technical requirement
  let technicalNeed = "";
  switch (category) {
    case "frontend":
      if (priority === "fast-mvp") {
        technicalNeed = "Framework with built-in deployment and minimal config";
      } else if (requirements.targetPlatforms.length > 1) {
        technicalNeed = "Multi-platform capable with excellent DX";
      } else {
        technicalNeed = "Performant client-side rendering with SSR capability";
      }
      break;
    case "database":
      if (analysis.scoring.complexityScore > 60) {
        technicalNeed = "Relational database with complex query support";
      } else if (requirements.expectedUsers === "100000-plus") {
        technicalNeed = "Horizontally scalable, distributed database";
      } else {
        technicalNeed = "Reliable ACID-compliant data store";
      }
      break;
    case "backend":
      if (analysis.scoring.scalabilityScore > 70) {
        technicalNeed = "Non-blocking I/O, async request handling";
      } else if (budget === "free" || budget === "under-50") {
        technicalNeed = "Cost-effective runtime with free tier options";
      } else {
        technicalNeed = "Stable runtime with strong ecosystem";
      }
      break;
    case "cache":
      technicalNeed = "In-memory data store with low latency";
      break;
    case "deployment":
      if (priority === "fast-mvp") {
        technicalNeed = "Platform with Git-based deployment";
      } else if (analysis.scoring.scalabilityScore > 70) {
        technicalNeed = "Kubernetes-compatible or serverless infrastructure";
      } else {
        technicalNeed = "Simple, reliable hosting platform";
      }
      break;
    case "auth":
      if (requirements.requiredFeatures?.includes("authentication")) {
        technicalNeed = "Session and authentication management";
      } else {
        technicalNeed = "User identity verification";
      }
      break;
    default:
      technicalNeed = `Technical solution for ${category}`;
  }

  steps.push({
    level: "technical-need",
    content: technicalNeed,
    icon: "⚙️",
  });

  // Step 3: Technology choice
  steps.push({
    level: "technology",
    content: `${tech.technology}${tech.version ? ` ${tech.version}` : ""}`,
    icon: "🎯",
  });

  // Step 4: Reason (condensed from whyRecommended)
  let reason = tech.whyRecommended;
  if (reason.length > 120) {
    reason = reason.substring(0, 120) + "...";
  }
  steps.push({
    level: "reason",
    content: reason,
    icon: "✅",
  });

  // Calculate fit explanation based on score and context
  let fitExplanation = "";
  if (tech.confidenceScore >= 95) {
    fitExplanation = "Strong fit - perfectly matches project requirements";
  } else if (tech.confidenceScore >= 90) {
    fitExplanation = "Excellent fit - aligns well with your project needs";
  } else if (tech.confidenceScore >= 80) {
    fitExplanation = "Good fit - solid choice for your requirements";
  } else if (tech.confidenceScore >= 70) {
    fitExplanation = "Reasonable fit - works but consider alternatives";
  } else {
    fitExplanation = "Acceptable choice - other options may be better";
  }

  return {
    steps,
    fitScore: tech.confidenceScore,
    fitExplanation,
  };
}

/**
 * Generate context-specific advantages based on project requirements
 */
function extractContextualAdvantages(
  tech: TechRecommendation,
  context: TechExplanationContext,
): string[] {
  const { requirements, analysis, category } = context;
  const contextual: string[] = [];

  // Add advantages that apply to this specific project
  if (tech.advantages.length > 0) {
    // First 2-3 advantages are usually most relevant
    contextual.push(...tech.advantages.slice(0, 3));
  }

  // Add project-specific context
  if (
    category === "frontend" &&
    requirements.developmentPriority === "fast-mvp"
  ) {
    contextual.push("Fastest path to deployment for rapid validation");
  }
  if (category === "database" && analysis.scoring.scalabilityScore > 70) {
    contextual.push("Proven scalability at enterprise scale");
  }
  if (
    analysis.scoring.complexityScore > 70 &&
    !contextual.includes("High performance")
  ) {
    contextual.push("Optimized for performance-critical applications");
  }

  return contextual;
}

/**
 * Generate context-specific disadvantages that matter for this project
 */
function extractContextualDisadvantages(
  tech: TechRecommendation,
  context: TechExplanationContext,
): string[] {
  const { requirements, category } = context;
  const contextual: string[] = [];

  // Include most relevant disadvantages
  if (tech.disadvantages.length > 0) {
    contextual.push(...tech.disadvantages.slice(0, 2));
  }

  // Add specific concerns based on project
  if (category === "deployment" && requirements.budget === "free") {
    contextual.push("Cost may increase significantly with scale");
  }
  if (
    requirements.developerExperience === "beginner" &&
    tech.learnabilityRating < 75
  ) {
    contextual.push("Steeper learning curve for new developers");
  }

  return contextual;
}

/**
 * Generate when-to-choose guidance
 */
function generateWhenToChoose(
  tech: TechRecommendation,
  context: TechExplanationContext,
): string {
  const { requirements, category } = context;

  // Build scenario from project requirements
  const scenarios: string[] = [];

  if (requirements.developmentPriority === "fast-mvp") {
    scenarios.push("need rapid MVP launch");
  }
  if (requirements.developerExperience === "beginner") {
    scenarios.push("your team is new to software development");
  }
  if (requirements.budget !== "1000-plus") {
    scenarios.push("budget-conscious development");
  }
  if (["10000-100000", "100000-plus"].includes(requirements.expectedUsers)) {
    scenarios.push("planning for large-scale user bases");
  }

  if (scenarios.length > 0) {
    return `${tech.technology} is ideal when you ${scenarios.join(" and you ")}.`;
  }

  return `${tech.technology} works well for this project profile.`;
}

/**
 * Generate when-to-avoid guidance
 */
function generateWhenToAvoid(
  tech: TechRecommendation,
  _context: TechExplanationContext,
): string {
  // Invert some advantages to create avoid scenarios
  const avoidScenarios: string[] = [];

  if (tech.disadvantages.length > 0) {
    // Use first disadvantage to build avoid scenario
    const firstDisadvantage = tech.disadvantages[0].toLowerCase();
    if (
      firstDisadvantage.includes("vendor") ||
      firstDisadvantage.includes("lock")
    ) {
      avoidScenarios.push("you need complete infrastructure portability");
    }
    if (
      firstDisadvantage.includes("learn") ||
      firstDisadvantage.includes("complex")
    ) {
      avoidScenarios.push("you need the absolute simplest solution");
    }
  }

  if (tech.costProfile === "paid") {
    avoidScenarios.push("you have a zero budget");
  }

  if (avoidScenarios.length > 0) {
    return `Avoid ${tech.technology} if ${avoidScenarios.join(" or if ")}.`;
  }

  return `Consider alternatives if your needs diverge significantly from this project profile.`;
}

/**
 * Main function to generate comprehensive tech explanation
 */
export function generateTechExplanation(
  tech: TechRecommendation,
  context: TechExplanationContext,
): TechExplanation {
  const decisionTrace = generateDecisionTrace(tech, context);
  const contextualAdvantages = extractContextualAdvantages(tech, context);
  const contextualDisadvantages = extractContextualDisadvantages(tech, context);
  const whenToChoose = generateWhenToChoose(tech, context);
  const whenToAvoid = generateWhenToAvoid(tech, context);

  return {
    tech,
    decisionTrace,
    contextualAdvantages,
    contextualDisadvantages,
    whenToChoose,
    whenToAvoid,
    migrationPath:
      tech.alternatives.length > 0
        ? {
            upgrade:
              tech.alternatives[0]?.technology ||
              "Consider more advanced solutions as requirements grow",
            downgrade:
              tech.alternatives[tech.alternatives.length - 1]?.technology ||
              "Simpler alternatives for basic use cases",
          }
        : undefined,
  };
}
