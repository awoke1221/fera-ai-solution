// ─── Structured Technology Stack Recommendation Schema ───

export type ConfidenceLevel =
  | "very-high"
  | "high"
  | "medium"
  | "low"
  | "speculative";

export type RecommendationTier =
  | "frontend"
  | "backend"
  | "database"
  | "auth"
  | "storage"
  | "payment"
  | "search"
  | "cache"
  | "realtime"
  | "email"
  | "analytics"
  | "monitoring"
  | "deployment"
  | "cdn"
  | "testing"
  | "devops";

export interface TechAlternative {
  technology: string;
  reason: string;
  whenToUse: string;
  tradeoffs: string;
}

export interface TechRecommendation {
  id: string;
  category: RecommendationTier;
  technology: string;
  provider?: string;
  version?: string;
  confidenceScore: number;
  whyRecommended: string;
  advantages: string[];
  disadvantages: string[];
  alternatives: TechAlternative[];
  whenToReplace: string;
  maturityLevel: "stable" | "mature" | "beta" | "emerging";
  ecosystemStrength: number;
  costProfile: "free" | "freemium" | "paid" | "enterprise";
  Ethiopian?: boolean;
  scalabilityRating: number;
  learnabilityRating: number;
  productionReadiness: number;
}

export interface ArchitecturePattern {
  name: string;
  description: string;
  benefits: string[];
  complexity: "simple" | "moderate" | "complex";
  recommendedFor: string[];
}

export interface ArchitectureRecommendation {
  pattern: string;
  description: string;
  layers: Array<{
    tier: RecommendationTier;
    technologies: string[];
    rationale: string;
  }>;
  scalabilityApproach: string;
  securityApproach: string;
  observabilityApproach: string;
}

export interface RiskAssessment {
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  mitigation: string;
}

export interface TradeoffAnalysis {
  option1: string;
  option2: string;
  comparison: string;
  recommendation: string;
  context: string;
}

export interface NextStep {
  phase: string;
  description: string;
  duration: string;
  priority: "critical" | "high" | "medium" | "low";
  actions: string[];
  resources?: string[];
}

export interface ProjectSummary {
  projectName: string;
  category: string;
  targetAudience: string;
  expectedScale: string;
  criticalRequirements: string[];
  constraints: string[];
  marketContext: string;
}

export interface ComplexityEstimate {
  overallComplexity: "low" | "moderate" | "high" | "very-high";
  developmentTime: string;
  teamSize: string;
  mainChallenges: string[];
  keyRisks: string[];
}

export interface StructuredTechStackRecommendation {
  // Summary and context
  projectSummary: ProjectSummary;
  recommendedArchitecture: ArchitectureRecommendation;

  // Core recommendations
  recommendedStack: TechRecommendation[];
  alternatives: Array<{
    stack: TechRecommendation[];
    pros: string[];
    cons: string[];
    bestFor: string;
  }>;

  // Analysis and decision support
  reasoning: {
    overengineering?: string;
    avoided: string[];
    keyDecisions: string[];
    whyNotOthers: string[];
  };

  tradeoffs: TradeoffAnalysis[];
  risks: RiskAssessment[];

  // Security and operations
  securityRecommendations: {
    authentication: string;
    dataProtection: string;
    apiSecurity: string;
    deploymentSecurity: string;
    considerations: string[];
  };

  scalabilityRecommendations: {
    currentPhase: string;
    phase2: string;
    phase3: string;
    bottlenecks: string[];
    scalingStrategy: string;
  };

  // Implementation guidance
  estimatedComplexity: ComplexityEstimate;
  recommendedNextSteps: NextStep[];

  // Metadata
  timestamp: string;
  confidenceLevel: ConfidenceLevel;
  validationStatus: "valid" | "partial" | "requires-review";
}
