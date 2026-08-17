// ─── Schema Validation for Tech Stack Recommendations ───
// Validates AI responses and ensures they conform to the StructuredTechStackRecommendation shape.

import type {
  StructuredTechStackRecommendation,
  ConfidenceLevel,
  RecommendationTier,
  TechRecommendation,
  ArchitectureRecommendation,
} from "./tech-recommendation-types";

export class ValidationError extends Error {
  constructor(
    public field: string,
    public reason: string,
  ) {
    super(`Validation failed for field "${field}": ${reason}`);
  }
}

export class RecommendationValidator {
  private errors: ValidationError[] = [];

  private addError(field: string, reason: string): void {
    this.errors.push(new ValidationError(field, reason));
  }

  validateTechRecommendation(tech: unknown, context: string): boolean {
    if (!tech || typeof tech !== "object") {
      this.addError(`${context}.tech`, "Must be a non-null object");
      return false;
    }

    const t = tech as Record<string, unknown>;

    if (!t.technology || typeof t.technology !== "string") {
      this.addError(`${context}.technology`, "Must be a non-empty string");
    }

    if (!t.category || !isValidTier(t.category)) {
      this.addError(
        `${context}.category`,
        `Must be one of: frontend, backend, database, auth, storage, payment, search, cache, realtime, email, analytics, monitoring, deployment, cdn, testing, devops. Got: ${t.category}`,
      );
    }

    if (
      typeof t.confidenceScore !== "number" ||
      t.confidenceScore < 0 ||
      t.confidenceScore > 100
    ) {
      this.addError(
        `${context}.confidenceScore`,
        "Must be a number between 0 and 100",
      );
    }

    if (!t.whyRecommended || typeof t.whyRecommended !== "string") {
      this.addError(`${context}.whyRecommended`, "Must be a non-empty string");
    }

    if (!Array.isArray(t.advantages) || t.advantages.length === 0) {
      this.addError(
        `${context}.advantages`,
        "Must be a non-empty array of strings",
      );
    }

    if (!Array.isArray(t.disadvantages) || t.disadvantages.length === 0) {
      this.addError(
        `${context}.disadvantages`,
        "Must be a non-empty array of strings",
      );
    }

    return this.errors.filter((e) => e.field.startsWith(context)).length === 0;
  }

  validateArchitecture(arch: unknown, context: string): boolean {
    if (!arch || typeof arch !== "object") {
      this.addError(context, "Must be a non-null object");
      return false;
    }

    const a = arch as Record<string, unknown>;

    if (!a.pattern || typeof a.pattern !== "string") {
      this.addError(`${context}.pattern`, "Must be a non-empty string");
    }

    if (!a.description || typeof a.description !== "string") {
      this.addError(`${context}.description`, "Must be a non-empty string");
    }

    if (!Array.isArray(a.layers) || a.layers.length === 0) {
      this.addError(`${context}.layers`, "Must be a non-empty array");
    }

    return this.errors.filter((e) => e.field.startsWith(context)).length === 0;
  }

  validateRecommendation(
    rec: unknown,
  ): rec is StructuredTechStackRecommendation {
    this.errors = [];

    if (!rec || typeof rec !== "object") {
      this.addError("root", "Recommendation must be a non-null object");
      return false;
    }

    const r = rec as Record<string, unknown>;

    // Check required fields
    if (!r.projectSummary) {
      this.addError("projectSummary", "Required field missing");
    } else if (typeof r.projectSummary !== "object") {
      this.addError("projectSummary", "Must be an object");
    }

    if (!r.recommendedArchitecture) {
      this.addError("recommendedArchitecture", "Required field missing");
    } else if (typeof r.recommendedArchitecture !== "object") {
      this.addError("recommendedArchitecture", "Must be an object");
    } else {
      this.validateArchitecture(
        r.recommendedArchitecture,
        "recommendedArchitecture",
      );
    }

    if (!Array.isArray(r.recommendedStack) || r.recommendedStack.length === 0) {
      this.addError(
        "recommendedStack",
        "Must be a non-empty array of TechRecommendation",
      );
    } else {
      r.recommendedStack.forEach((tech, idx) => {
        this.validateTechRecommendation(tech, `recommendedStack[${idx}]`);
      });
    }

    if (!r.reasoning || typeof r.reasoning !== "object") {
      this.addError("reasoning", "Must be an object with decision context");
    }

    if (
      !r.securityRecommendations ||
      typeof r.securityRecommendations !== "object"
    ) {
      this.addError("securityRecommendations", "Must be an object");
    }

    if (
      !r.scalabilityRecommendations ||
      typeof r.scalabilityRecommendations !== "object"
    ) {
      this.addError("scalabilityRecommendations", "Must be an object");
    }

    if (!r.estimatedComplexity || typeof r.estimatedComplexity !== "object") {
      this.addError("estimatedComplexity", "Must be an object");
    }

    if (
      !Array.isArray(r.recommendedNextSteps) ||
      r.recommendedNextSteps.length === 0
    ) {
      this.addError(
        "recommendedNextSteps",
        "Must be a non-empty array of NextStep",
      );
    }

    if (!r.timestamp || typeof r.timestamp !== "string") {
      this.addError("timestamp", "Must be an ISO 8601 timestamp string");
    }

    if (!r.confidenceLevel || !isValidConfidence(r.confidenceLevel)) {
      this.addError(
        "confidenceLevel",
        "Must be one of: very-high, high, medium, low, speculative",
      );
    }

    return this.errors.length === 0;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }

  getErrorMessages(): string[] {
    return this.errors.map((e) => `${e.field}: ${e.reason}`);
  }

  clearErrors(): void {
    this.errors = [];
  }
}

function isValidTier(value: unknown): value is RecommendationTier {
  const validTiers: RecommendationTier[] = [
    "frontend",
    "backend",
    "database",
    "auth",
    "storage",
    "payment",
    "search",
    "cache",
    "realtime",
    "email",
    "analytics",
    "monitoring",
    "deployment",
    "cdn",
    "testing",
    "devops",
  ];
  return (
    typeof value === "string" &&
    validTiers.includes(value as RecommendationTier)
  );
}

function isValidConfidence(value: unknown): value is ConfidenceLevel {
  const validLevels: ConfidenceLevel[] = [
    "very-high",
    "high",
    "medium",
    "low",
    "speculative",
  ];
  return (
    typeof value === "string" && validLevels.includes(value as ConfidenceLevel)
  );
}

/**
 * Sanitize and attempt to repair partial or malformed recommendation objects.
 * If critical fields are missing, returns null.
 * If fixable fields are missing or wrong type, attempts to fill sensible defaults.
 */
export function sanitizeRecommendation(
  data: unknown,
): StructuredTechStackRecommendation | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const rec = data as Record<string, unknown>;

  // Check for absolutely required fields
  if (
    !rec.projectSummary ||
    !rec.recommendedStack ||
    !rec.recommendedArchitecture
  ) {
    return null;
  }

  // Ensure arrays exist
  if (
    !Array.isArray(rec.recommendedStack) ||
    rec.recommendedStack.length === 0
  ) {
    return null;
  }

  // Try to cast and fill defaults for missing fields
  const cleaned: StructuredTechStackRecommendation = {
    projectSummary: (rec.projectSummary ||
      {}) as StructuredTechStackRecommendation["projectSummary"],
    recommendedArchitecture: (rec.recommendedArchitecture ||
      {}) as ArchitectureRecommendation,
    recommendedStack: (rec.recommendedStack || []) as TechRecommendation[],
    alternatives: Array.isArray(rec.alternatives) ? rec.alternatives : [],
    reasoning: (rec.reasoning || {
      avoided: [],
      keyDecisions: [],
      whyNotOthers: [],
    }) as StructuredTechStackRecommendation["reasoning"],
    tradeoffs: Array.isArray(rec.tradeoffs) ? rec.tradeoffs : [],
    risks: Array.isArray(rec.risks) ? rec.risks : [],
    securityRecommendations: (rec.securityRecommendations || {
      authentication: "Use strong authentication",
      dataProtection: "Encrypt sensitive data",
      apiSecurity: "Validate inputs, use CORS",
      deploymentSecurity: "Use secrets management",
      considerations: [],
    }) as StructuredTechStackRecommendation["securityRecommendations"],
    scalabilityRecommendations: (rec.scalabilityRecommendations || {
      currentPhase: "Initial MVP",
      phase2: "Scale to 10k users",
      phase3: "Enterprise scale",
      bottlenecks: [],
      scalingStrategy: "Scale horizontally",
    }) as StructuredTechStackRecommendation["scalabilityRecommendations"],
    estimatedComplexity: (rec.estimatedComplexity || {
      overallComplexity: "moderate",
      developmentTime: "3-6 months",
      teamSize: "3-5 developers",
      mainChallenges: [],
      keyRisks: [],
    }) as StructuredTechStackRecommendation["estimatedComplexity"],
    recommendedNextSteps: Array.isArray(rec.recommendedNextSteps)
      ? rec.recommendedNextSteps
      : [],
    timestamp:
      typeof rec.timestamp === "string"
        ? rec.timestamp
        : new Date().toISOString(),
    confidenceLevel: isValidConfidence(rec.confidenceLevel)
      ? (rec.confidenceLevel as ConfidenceLevel)
      : "medium",
    validationStatus: "partial",
  };

  return cleaned;
}

/**
 * Parse a potentially stringified JSON response from the AI.
 * Handles common issues like embedded JSON in markdown blocks.
 */
export function parseAiJsonResponse(response: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = response.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch {
        // Fall through
      }
    }

    // Try to find a JSON object or array in the response
    const jsonMatch = response.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // Fall through
      }
    }

    return null;
  }
}
