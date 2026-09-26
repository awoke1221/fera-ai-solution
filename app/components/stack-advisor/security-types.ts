/**
 * Security Advisor Types
 * Defines security analysis, issues, and reports for architecture strategies
 */

export type SecuritySeverity = "PASS" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SecurityCategory =
  | "authentication"
  | "authorization"
  | "api-security"
  | "database-security"
  | "secrets-management"
  | "input-validation"
  | "rate-limiting"
  | "cors"
  | "csrf"
  | "file-upload-security"
  | "payment-security"
  | "logging"
  | "monitoring"
  | "backups"
  | "dependency-security";

export interface SecurityIssue {
  id: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  problem: string;
  whyItMatters: string;
  affectedComponents: string[]; // e.g., ["Frontend", "API", "Database"]
  recommendedSolution: string;
  implementationGuidance: string[];
  estimatedEffort: "minimal" | "small" | "medium" | "large";
  relatedTechnology?: string; // e.g., "Next.js", "PostgreSQL"
  lastReviewed?: string; // ISO date, e.g. "2026-09-26"
}

export interface SecurityCategoryAnalysis {
  category: SecurityCategory;
  categoryLabel: string;
  severityLevel: SecuritySeverity;
  description: string;
  findings: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface TopSecurityFix {
  rank: number; // 1-5
  category: SecurityCategory;
  issue: string;
  impact: string;
  priority: SecuritySeverity;
  quickStartGuide: string[];
}

export interface SecurityReport {
  overallSecurityScore: number; // 0-100
  generatedAt: string;
  architectureTier: "mvp" | "balanced" | "enterprise";
  architectureName: string;

  // Summary
  summary: {
    strengths: string[];
    weaknesses: string[];
    majorGaps: string[];
  };

  // Detailed analysis by category
  categoriesAnalysis: SecurityCategoryAnalysis[];

  // All issues found (can be many)
  allIssues: SecurityIssue[];

  // Issues grouped by severity
  issuesBySeverity: {
    CRITICAL: SecurityIssue[];
    HIGH: SecurityIssue[];
    MEDIUM: SecurityIssue[];
    LOW: SecurityIssue[];
    PASS: SecurityIssue[];
  };

  // Top 5 things to fix before production
  topFiveIssues: TopSecurityFix[];

  // Remediation roadmap
  remediationRoadmap: {
    phase: "immediate" | "short-term" | "medium-term" | "long-term";
    phaseName: string;
    timeframe: string;
    issues: SecurityIssue[];
    totalEstimatedHours: number;
  }[];

  // Compliance notes
  complianceNotes: {
    dataProtection: string;
    backupRequirements: string;
    auditingRequirements: string;
    recommendedFrameworks: string[];
  };
}

export interface SecurityAnalysisContext {
  architectureStrategy: import("./architecture-strategy-types").ArchitectureStrategy;
  projectRequirements?: import("./types").ProjectRequirements;
  selectedTechStack?: string[];
}
