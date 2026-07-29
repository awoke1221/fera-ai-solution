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
