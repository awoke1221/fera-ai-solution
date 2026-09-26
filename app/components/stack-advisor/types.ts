// ─── Shared Type Definitions for Stack Advisor ──────────

export type ProjectType = {
  id: string;
  label: string;
  icon: string;
  description: string;
  businessFeatures: string[];
};

export type ToolCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  required: boolean;
};

export type ToolOption = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  recommended: boolean;
  freeTier: string;
  pricing: string;
  scalability: string;
  config: {
    envVars: string[];
    setupSteps: string[];
    packages: string[];
  };
  integration: {
    connectsTo: string[];
    notes: string;
  };
  ethiopianSupport: string;
  limitations: string[];
  docsUrl: string;
};

export type IntegrationEdge = {
  from: string;
  to: string;
  label: string;
  type: "api" | "sdk" | "webhook" | "direct" | "auth" | "deploy";
};

export type EthiopianAdaptation = {
  id: string;
  title: string;
  description: string;
  tools: string[];
  category: "payment" | "hosting" | "auth" | "delivery" | "compliance";
};

export type RecommendedStack = {
  projectType: string;
  name: string;
  description: string;
  selections: Record<string, string>;
  isPrimary: boolean;
  cost: "free" | "low" | "medium" | "high";
  difficulty: "beginner" | "intermediate" | "advanced";
};

export type ProductionChecklistItem = {
  category: string;
  items: {
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
    tools: string[];
  }[];
};

export type AdvancedGuide = {
  toolId: string;
  architecturePatterns: string[];
  securityBestPractices: string[];
  performanceOptimizations: string[];
  productionConfigs: { title: string; code: string; description: string }[];
  codeExamples: { title: string; code: string; language: string }[];
  testingStrategy: string;
  monitoringStrategy: string;
  backupDisasterRecovery: string;
  deploymentStrategy: string;
  commonPitfalls: { issue: string; solution: string }[];
  scalabilityPatterns: string[];
  costOptimization: string;
};

// ─── Per-Project-Type Tool Mappings ─────────────────
export type CategoryToolPriorities = {
  /** Why this category was reordered for this project type */
  reason: string;
  /** Tool IDs to show first (recommended for this project type) */
  prioritize: string[];
  /** Tool IDs to hide (not relevant for this project type) */
  hide: string[];
  /** Tool IDs that get an Ethiopian priority boost */
  ethiopianPriority: string[];
};

export type ProjectToolMapping = {
  projectType: string;
  /** Categories that become required for this project type (beyond default `required: true`) */
  forceRequiredCategories: string[];
  /** Categories to hide entirely */
  hideCategories: string[];
  /** Category-specific tool filtering */
  categoryPriorities: Record<string, CategoryToolPriorities>;
  /** Custom category order for this project type */
  categoryOrder: string[];
  /** Human-readable note about this project's tooling strategy */
  note: string;
};

export type ProjectCategory =
  | "saas"
  | "ecommerce"
  | "lms"
  | "marketplace"
  | "social"
  | "mobile-app"
  | "ai-app"
  | "internal-business"
  | "portfolio"
  | "api-backend"
  | "other";

export type TargetPlatform = "web" | "mobile" | "desktop" | "api" | "multiple";

export type TargetUserSegment =
  | "personal-project"
  | "small-business"
  | "startup"
  | "enterprise";

export type ExpectedUserRange =
  | "under-100"
  | "100-1000"
  | "1000-10000"
  | "10000-100000"
  | "100000-plus";

export type TeamSize = "solo" | "2-5" | "6-15" | "16-plus";

export type DeveloperExperience =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export type DevelopmentPriority =
  | "fast-mvp"
  | "balanced"
  | "max-scalability"
  | "lowest-cost"
  | "max-performance";

export type BudgetRange =
  | "free"
  | "under-50"
  | "50-200"
  | "200-1000"
  | "1000-plus";

export type TimeToLaunch =
  | "under-2-weeks"
  | "2-4-weeks"
  | "1-3-months"
  | "3-6-months"
  | "6-plus-months";

export type RequiredFeature =
  | "authentication"
  | "payments"
  | "file-uploads"
  | "video"
  | "real-time-communication"
  | "notifications"
  | "search"
  | "analytics"
  | "ai"
  | "background-jobs"
  | "admin-dashboard"
  | "multi-tenancy"
  | "other";

export type ProjectRequirements = {
  projectName: string;
  projectDescription: string;
  projectCategory: ProjectCategory;
  targetPlatforms: TargetPlatform[];
  targetUsers: TargetUserSegment;
  expectedUsers: ExpectedUserRange;
  teamSize: TeamSize;
  developerExperience: DeveloperExperience;
  developmentPriority: DevelopmentPriority;
  budget: BudgetRange;
  timeToLaunch: TimeToLaunch;
  requiredFeatures: RequiredFeature[];
  targetMarketCountry: string;
  expectedGrowth: string;
  existingTechnologyPreferences: string;
};

export type ProjectRequirementsValidationErrors = Partial<
  Record<keyof ProjectRequirements, string>
>;

export type RequirementPriority = "low" | "medium" | "high" | "critical";

export type RequirementCategory =
  | "functional"
  | "non-functional"
  | "infrastructure"
  | "data"
  | "security"
  | "scalability"
  | "performance"
  | "integration"
  | "devops"
  | "project";

export type RequirementItem = {
  id: string;
  title: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  rationale: string;
};

export type RequirementsAnalysisScore = {
  requirementScore: number;
  complexityScore: number;
  scalabilityScore: number;
  securityBaselineScore: number;
  readinessScore: number;
};

export type ProjectClassification = {
  project: string;
  category: ProjectCategory;
  summary: string;
  confidence: "high" | "medium";
};

export type RequirementsAnalysisResult = {
  projectClassification: ProjectClassification;
  functionalRequirements: RequirementItem[];
  nonFunctionalRequirements: RequirementItem[];
  infrastructureRequirements: RequirementItem[];
  dataRequirements: RequirementItem[];
  securityRequirements: RequirementItem[];
  scalabilityRequirements: RequirementItem[];
  performanceRequirements: RequirementItem[];
  integrationRequirements: RequirementItem[];
  devOpsRequirements: RequirementItem[];
  scoring: RequirementsAnalysisScore;
};
