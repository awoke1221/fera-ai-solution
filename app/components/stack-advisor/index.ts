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
