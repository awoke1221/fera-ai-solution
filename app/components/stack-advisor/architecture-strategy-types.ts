/**
 * Architecture Strategy Types
 * Defines three architecture tiers: MVP, Balanced, Enterprise
 * Each with complete details for comparison and selection
 */

export type StrategyTier = "mvp" | "balanced" | "enterprise";
export type EstimatedComplexity = "low" | "medium" | "high" | "very-high";
export type DevelopmentSpeed = "very-fast" | "fast" | "moderate" | "slow";
export type Scalability =
  | "small-scale"
  | "medium-scale"
  | "large-scale"
  | "unlimited";
export type MaintenanceLevel =
  | "minimal"
  | "low"
  | "moderate"
  | "high"
  | "very-high";
export type SecurityLevel = "basic" | "standard" | "advanced" | "enterprise";

export interface ArchitectureLayer {
  tier: string; // "Frontend", "Backend", "Database", etc.
  technologies: string[];
  purpose: string;
}

export interface CostBreakdown {
  compute: number; // Monthly cost for servers/compute
  database: number; // Monthly cost for database
  storage: number; // Monthly cost for storage
  cdn: number; // Monthly cost for CDN
  services: number; // Monthly cost for third-party services
  total: number; // Total monthly cost
}

export interface SecurityConsideration {
  aspect: string; // "Authentication", "Data Encryption", etc.
  implementation: string;
  risk: "low" | "medium" | "high";
}

export interface ArchitectureStrategy {
  id: string; // "mvp", "balanced", "enterprise"
  tier: StrategyTier;
  name: string; // "MVP / Fast Launch", etc.
  tagline: string; // Short description
  description: string; // Longer description

  // Core technology stack
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    cache: string[];
    deployment: string[];
    monitoring: string[];
    other: string[];
  };

  // Architecture layers
  layers: ArchitectureLayer[];
  architecturePattern: string; // "Monolithic", "Microservices", etc.
  architectureDiagram: string; // ASCII or mermaid diagram code

  // Metrics & Estimates
  estimatedComplexity: EstimatedComplexity;
  developmentSpeed: DevelopmentSpeed; // Weeks to MVP
  developmentTimeWeeks: number;
  scalability: Scalability;
  maintenanceComplexity: MaintenanceLevel;
  monthlyOperatingCost: CostBreakdown;

  // Security & Non-Functional
  securityLevel: SecurityLevel;
  securityConsiderations: SecurityConsideration[];
  dataRetention: string; // "30 days", "Indefinite", etc.
  backupStrategy: string;
  disasterRecovery: string;

  // Characteristics
  advantages: string[];
  disadvantages: string[];
  tradeoffs: string[];
  whenToUse: string;
  bestFor: string; // "Solo developers", "Small teams", "Enterprises"
  suitableProjectSize: {
    min: number; // Min users/requests
    max: number; // Max users/requests
    description: string;
  };

  // Context
  teamRequirements: {
    minSize: number;
    skills: string[];
    experienceLevel: "beginner" | "intermediate" | "advanced";
    description: string;
  };

  // Migration paths
  migrationPath: {
    nextTier: StrategyTier | null;
    effort: "low" | "medium" | "high";
    description: string;
  };

  // Maturity
  isProduction: boolean; // Ready for production
  isPlatformLocked: boolean; // Vendor lock-in risk
}

export interface ArchitectureComparison {
  strategies: ArchitectureStrategy[];
  recommendedTier: StrategyTier;
  recommendationReasoning: string;
  projectContext: {
    type: string;
    scale: string;
    budget: string;
    teamSize: string;
  };
}

/**
 * Comparison table headers for UI rendering
 */
export const COMPARISON_METRICS = [
  { key: "developmentTimeWeeks", label: "Dev Time", category: "timeline" },
  { key: "estimatedComplexity", label: "Complexity", category: "effort" },
  { key: "architecturePattern", label: "Architecture", category: "design" },
  {
    key: "monthlyOperatingCost.total",
    label: "Monthly Cost",
    category: "cost",
  },
  { key: "scalability", label: "Scalability", category: "performance" },
  {
    key: "maintenanceComplexity",
    label: "Maintenance",
    category: "operations",
  },
  { key: "securityLevel", label: "Security Level", category: "security" },
  {
    key: "teamRequirements.skills",
    label: "Required Skills",
    category: "team",
  },
] as const;

/**
 * Helper to get strategy label
 */
export function getStrategyLabel(tier: StrategyTier): string {
  const labels: Record<StrategyTier, string> = {
    mvp: "MVP / Fast Launch",
    balanced: "Balanced Production",
    enterprise: "High Scale / Enterprise",
  };
  return labels[tier];
}

/**
 * Helper to get strategy description
 */
export function getStrategyDescription(tier: StrategyTier): string {
  const descriptions: Record<StrategyTier, string> = {
    mvp: "Fast to market, minimal infrastructure, perfect for validation",
    balanced:
      "Production-ready with moderate scale, good balance of features and complexity",
    enterprise:
      "Maximum scalability and reliability, complex setup, suitable for large scale",
  };
  return descriptions[tier];
}

/**
 * Helper to format cost as string
 */
export function formatCost(cost: number): string {
  if (cost === 0) return "Free";
  if (cost < 10) return `$${cost.toFixed(2)}`;
  return `$${cost.toLocaleString()}`;
}

/**
 * Helper to get complexity label
 */
export function getComplexityLabel(complexity: EstimatedComplexity): string {
  const labels: Record<EstimatedComplexity, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    "very-high": "Very High",
  };
  return labels[complexity];
}
