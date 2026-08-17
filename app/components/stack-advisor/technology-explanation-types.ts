/**
 * Types for detailed technology explanations with decision traces
 */

import type { ProjectRequirements, RequirementsAnalysisResult } from "./types";
import type {
  TechRecommendation,
  RecommendationTier,
} from "./tech-recommendation-types";

export interface DecisionTraceStep {
  level: "requirement" | "technical-need" | "technology" | "reason";
  content: string;
  icon: string;
}

export interface TechDecisionTrace {
  steps: DecisionTraceStep[];
  fitScore: number; // 0-100, derived from confidence score
  fitExplanation: string; // Why this fit score
}

export interface TechExplanation {
  tech: TechRecommendation;
  decisionTrace: TechDecisionTrace;
  contextualAdvantages: string[]; // Advantages specific to this project
  contextualDisadvantages: string[]; // Disadvantages specific to this project
  whenToChoose: string; // When to use this for projects like this one
  whenToAvoid: string; // When NOT to use this
  migrationPath?: {
    upgrade?: string; // What to upgrade to later
    downgrade?: string; // What to use if it's overkill
  };
}

export interface TechExplanationContext {
  requirements: ProjectRequirements;
  analysis: RequirementsAnalysisResult;
  category: RecommendationTier;
}
