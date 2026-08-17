// ─── Stack Advisor Data Barrel Export ─────────────────
// Single import point for all data modules.

export type {
  ProjectType,
  ToolCategory,
  ToolOption,
  IntegrationEdge,
  EthiopianAdaptation,
  RecommendedStack,
  ProductionChecklistItem,
  AdvancedGuide,
  ProjectToolMapping,
  CategoryToolPriorities,
} from "./types";

export { projectTypes } from "./project-types";
export { toolCategories } from "./tool-categories";
export { tools } from "./tools";
export { integrationEdges } from "./integration-edges";
export { ethiopianAdaptations } from "./ethiopian-adaptations";
export { recommendedStacks } from "./recommended-stacks";
export { productionChecklist } from "./production-checklist";
export { advancedGuides } from "./advanced-guides";
export { calculateCost } from "./cost-estimator";
export type { CostBreakdown, TotalCostEstimate } from "./cost-estimator";
export {
  checkCompatibility,
  generateStackExport,
  getToolScore,
} from "./tools/compatibility";
export type { CompatibilityWarning, ToolScore } from "./tools/compatibility";
export {
  projectToolMappings,
  getProjectMapping,
  getOrderedCategories,
  isCategoryRequired,
  sortToolsForProject,
} from "./project-tool-mappings";
export {
  projectRequirementsDefaults,
  projectCategoryOptions,
  targetPlatformOptions,
  targetUsersOptions,
  expectedUsersOptions,
  teamSizeOptions,
  developerExperienceOptions,
  developmentPriorityOptions,
  budgetOptions,
  timeToLaunchOptions,
  requiredFeatureOptions,
  discoveryWizardSteps,
  validateProjectRequirements,
  prepareProjectRequirementsForRecommendation,
} from "./project-requirements";
export type {
  ProjectCategory,
  ProjectRequirements,
  ProjectRequirementsValidationErrors,
  TargetPlatform,
  TargetUserSegment,
  ExpectedUserRange,
  TeamSize,
  DeveloperExperience,
  DevelopmentPriority,
  BudgetRange,
  TimeToLaunch,
  RequiredFeature,
  RequirementPriority,
  RequirementCategory,
  RequirementItem,
  RequirementsAnalysisScore,
  ProjectClassification,
  RequirementsAnalysisResult,
} from "./types";
export { analyzeProjectRequirements } from "./requirements-analyzer";
export { analyzeAndRecommend } from "./tech-recommendation-analyzer";
export type {
  ConfidenceLevel,
  RecommendationTier,
  TechAlternative,
  TechRecommendation,
  ArchitecturePattern,
  ArchitectureRecommendation,
  RiskAssessment,
  TradeoffAnalysis,
  NextStep,
  ProjectSummary,
  ComplexityEstimate,
  StructuredTechStackRecommendation,
} from "./tech-recommendation-types";
export {
  RecommendationValidator,
  parseAiJsonResponse,
  sanitizeRecommendation,
} from "./tech-recommendation-validator";
export type { ValidationError } from "./tech-recommendation-validator";
export { generateArchitectureStrategies } from "./architecture-strategy-generator";
export type {
  StrategyTier,
  EstimatedComplexity,
  DevelopmentSpeed,
  Scalability,
  MaintenanceLevel,
  SecurityLevel,
  ArchitectureLayer,
  SecurityConsideration,
  ArchitectureStrategy,
  ArchitectureComparison,
} from "./architecture-strategy-types";
export {
  getStrategyLabel,
  getStrategyDescription,
  formatCost,
  getComplexityLabel,
  COMPARISON_METRICS,
} from "./architecture-strategy-types";
export { ArchitectureComparison as ArchitectureComparisonComponent } from "./architecture-comparison";

// Technology Explanation Components and Functions
export { TechExplanationCard } from "./technology-explanation";
export type {
  DecisionTraceStep,
  TechDecisionTrace,
  TechExplanation,
  TechExplanationContext,
} from "./technology-explanation-types";
export { generateTechExplanation } from "./technology-explanation-generator";

// Architecture Diagram Components and Functions
export { ArchitectureDiagramComponent } from "./architecture-diagram";
export type {
  ArchitectureNodeType,
  DataFlowType,
  ArchitectureNode,
  ArchitectureConnection,
  ArchitectureDiagram,
  NodeDetails,
} from "./architecture-diagram-types";
export { generateArchitectureDiagram } from "./architecture-diagram-generator";

// Security Advisor Components and Functions
export { SecurityReportComponent } from "./security-report";
export type {
  SecuritySeverity,
  SecurityCategory,
  SecurityIssue,
  SecurityReport,
  SecurityAnalysisContext,
} from "./security-types";
export { generateSecurityAnalysis } from "./security-analysis-generator";
