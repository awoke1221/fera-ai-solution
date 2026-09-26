/**
 * Security Advisor Analysis Generator
 * Comprehensive security analysis for architecture strategies
 * Evaluates 15 security categories based on actual tech stack
 */

import type {
  SecurityReport,
  SecurityIssue,
  SecuritySeverity,
  SecurityCategory,
  SecurityCategoryAnalysis,
  TopSecurityFix,
  SecurityAnalysisContext,
} from "./security-types";
import type { ArchitectureStrategy } from "./architecture-strategy-types";

// ─── Tech Stack Security Capabilities ────────────────────────
// When a security recommendation or capability profile is revised, bump the
// lastReviewed ISO date for the affected entries so the UI can flag stale reviews.
const TECH_SECURITY_PROFILES: Record<
  string,
  Record<string, boolean | string> & { lastReviewed: string }
> = {
  // Frontend frameworks
  "next.js": {
    hasBuiltInAuth: true,
    hasCSRFProtection: true,
    hasCORSSupport: true,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  react: {
    hasBuiltInAuth: false,
    hasCSRFProtection: false,
    hasCORSSupport: false,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  vue: {
    hasBuiltInAuth: false,
    hasCSRFProtection: false,
    hasCORSSupport: false,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  angular: {
    hasBuiltInAuth: false,
    hasCSRFProtection: true,
    hasCORSSupport: false,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },

  // Backend frameworks
  "node.js": {
    hasBuiltInAuth: false,
    hasCSRFProtection: false,
    hasCORSSupport: false,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  express: {
    hasBuiltInAuth: false,
    hasCSRFProtection: false,
    hasCORSSupport: true,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  fastapi: {
    hasBuiltInAuth: true,
    hasCSRFProtection: true,
    hasCORSSupport: true,
    hasInputValidation: true,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  django: {
    hasBuiltInAuth: true,
    hasCSRFProtection: true,
    hasCORSSupport: true,
    hasInputValidation: true,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },
  flask: {
    hasBuiltInAuth: false,
    hasCSRFProtection: false,
    hasCORSSupport: false,
    hasInputValidation: false,
    hasRateLimiting: false,
    hasEncryption: false,
    lastReviewed: "2026-09-26",
  },

  // Databases
  postgresql: {
    hasRoleBasedAccess: true,
    hasEncryption: true,
    hasAuditLogging: false,
    hasBackupSupport: true,
    lastReviewed: "2026-09-26",
  },
  mongodb: {
    hasRoleBasedAccess: true,
    hasEncryption: false,
    hasAuditLogging: false,
    hasBackupSupport: true,
    lastReviewed: "2026-09-26",
  },
  mysql: {
    hasRoleBasedAccess: true,
    hasEncryption: false,
    hasAuditLogging: false,
    hasBackupSupport: true,
    lastReviewed: "2026-09-26",
  },
  sqlite: {
    hasRoleBasedAccess: false,
    hasEncryption: false,
    hasAuditLogging: false,
    hasBackupSupport: false,
    lastReviewed: "2026-09-26",
  },

  // Cache
  redis: {
    hasEncryption: true,
    hasAccessControl: true,
    hasAOFPersistence: true,
    lastReviewed: "2026-09-26",
  },
  memcached: {
    hasEncryption: false,
    hasAccessControl: false,
    hasAOFPersistence: false,
    lastReviewed: "2026-09-26",
  },

  // Auth services
  supabase: {
    hasOAuth: true,
    hasMFA: true,
    hasSessionManagement: true,
    hasPasswordHashing: true,
    lastReviewed: "2026-09-26",
  },
  firebase: {
    hasOAuth: true,
    hasMFA: true,
    hasSessionManagement: true,
    hasPasswordHashing: true,
    lastReviewed: "2026-09-26",
  },
  auth0: {
    hasOAuth: true,
    hasMFA: true,
    hasSessionManagement: true,
    hasPasswordHashing: true,
    lastReviewed: "2026-09-26",
  },

  // Payment
  stripe: {
    hasPCICompliance: true,
    hasTokenization: true,
    hasWebhookSecurity: true,
    lastReviewed: "2026-09-26",
  },
  paypal: {
    hasPCICompliance: true,
    hasTokenization: true,
    hasWebhookSecurity: true,
    lastReviewed: "2026-09-26",
  },
};

// ─── Security Issues Database ────────────────────────
const SECURITY_ISSUES_DATABASE: SecurityIssue[] = [
  // When a security rule or guidance is revised, update the corresponding
  // lastReviewed date in ISO format (YYYY-MM-DD) so the UI can flag stale entries.
  // Authentication Issues
  {
    id: "auth-001",
    category: "authentication",
    severity: "CRITICAL",
    problem: "No authentication system in place",
    whyItMatters:
      "Without authentication, anyone can access user data and features. Unauthorized access is the most common security breach.",
    affectedComponents: ["Frontend", "API", "Database"],
    recommendedSolution:
      "Implement OAuth 2.0 with JWT tokens or use managed authentication service (Auth0, Supabase, Firebase)",
    implementationGuidance: [
      "Choose between JWT, sessions, or managed service",
      "Implement secure password storage with bcrypt or Argon2",
      "Add multi-factor authentication (MFA) for user accounts",
      "Use HTTPS for all auth endpoints",
      "Implement proper session timeout (15-30 minutes)",
    ],
    estimatedEffort: "large",
    lastReviewed: "2026-09-26",
  },
  {
    id: "auth-002",
    category: "authentication",
    severity: "CRITICAL",
    problem: "Weak password requirements or plain-text password storage",
    whyItMatters:
      "Weak passwords and plain-text storage make accounts vulnerable to brute force and data breach attacks.",
    affectedComponents: ["API", "Database"],
    recommendedSolution:
      "Use bcrypt, Argon2, or PBKDF2 with strong password policy (min 12 chars, complexity rules)",
    implementationGuidance: [
      "Enforce minimum 12-character passwords",
      "Require mix of uppercase, lowercase, numbers, special characters",
      "Use bcrypt with salt rounds ≥ 12",
      "Implement account lockout after 5 failed login attempts",
      "Log all authentication attempts",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },
  {
    id: "auth-003",
    category: "authentication",
    severity: "HIGH",
    problem: "No multi-factor authentication (MFA) available",
    whyItMatters:
      "MFA prevents unauthorized access even if passwords are compromised.",
    affectedComponents: ["Frontend", "API"],
    recommendedSolution:
      "Add TOTP (Time-based One-Time Password) or SMS-based MFA",
    implementationGuidance: [
      "Implement TOTP-based MFA using libraries like speakeasy",
      "Provide backup codes for account recovery",
      "Allow SMS or email-based MFA as fallback",
      "Store MFA secrets encrypted",
      "Test MFA recovery flows",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Authorization Issues
  {
    id: "authz-001",
    category: "authorization",
    severity: "CRITICAL",
    problem: "Missing or weak role-based access control (RBAC)",
    whyItMatters:
      "Without RBAC, regular users may access admin functions or sensitive data. Authorization bypass is a top security risk.",
    affectedComponents: ["API", "Database"],
    recommendedSolution:
      "Implement RBAC with roles (admin, moderator, user) and permission checks on every endpoint",
    implementationGuidance: [
      "Define clear roles: admin, moderator, user, guest",
      "Check permissions on every API endpoint",
      "Verify user belongs to correct role before sensitive operations",
      "Log all authorization checks and denials",
      "Use middleware for automatic permission checks",
      "Implement principle of least privilege",
    ],
    estimatedEffort: "large",
    lastReviewed: "2026-09-26",
  },
  {
    id: "authz-002",
    category: "authorization",
    severity: "HIGH",
    problem: "No audit logging of authorization decisions",
    whyItMatters:
      "Without logging, you cannot detect unauthorized access attempts or trace security incidents.",
    affectedComponents: ["API", "Logging"],
    recommendedSolution:
      "Log all authorization checks, denials, and role changes",
    implementationGuidance: [
      "Log who accessed what resource and when",
      "Log all permission denials",
      "Log role and permission changes",
      "Store logs in secure, tamper-proof location",
      "Implement log retention policy",
      "Monitor logs for suspicious patterns",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },

  // API Security Issues
  {
    id: "api-001",
    category: "api-security",
    severity: "CRITICAL",
    problem: "No API authentication or rate limiting",
    whyItMatters:
      "Without authentication, attackers can abuse your API. Without rate limiting, they can perform denial-of-service attacks.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Implement API key authentication, OAuth 2.0, and per-endpoint rate limiting",
    implementationGuidance: [
      "Require API keys for all API calls",
      "Implement rate limiting per IP and per user (e.g., 100 req/min)",
      "Use exponential backoff for retries",
      "Return 429 status for rate limit exceeded",
      "Implement different limits for different endpoints",
      "Monitor rate limit violations",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },
  {
    id: "api-002",
    category: "api-security",
    severity: "HIGH",
    problem: "API endpoints expose sensitive data or IDs",
    whyItMatters:
      "Sequential or predictable IDs allow enumeration attacks. Exposed data in responses leaks information to attackers.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Use UUIDs or hashed IDs, filter response data, implement field-level authorization",
    implementationGuidance: [
      "Use UUIDs instead of sequential IDs",
      "Filter response data to only needed fields",
      "Never return password hashes, tokens, or secrets",
      "Implement field-level authorization",
      "Test API responses for data leakage",
      "Document which fields are safe to expose",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },
  {
    id: "api-003",
    category: "api-security",
    severity: "MEDIUM",
    problem: "Missing API versioning and deprecation strategy",
    whyItMatters:
      "Without versioning, breaking changes can expose clients to security vulnerabilities.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Implement semantic versioning with v1, v2 API endpoints",
    implementationGuidance: [
      "Use URL versioning: /api/v1/users, /api/v2/users",
      "Support at least 2 API versions",
      "Provide 12-month deprecation notice",
      "Document migration path for clients",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Database Security Issues
  {
    id: "db-001",
    category: "database-security",
    severity: "CRITICAL",
    problem: "No encryption for database at rest",
    whyItMatters:
      "If database is stolen or physically accessed, all data is readable in plain text.",
    affectedComponents: ["Database"],
    recommendedSolution:
      "Enable transparent data encryption (TDE) or use encrypted database options",
    implementationGuidance: [
      "Enable database encryption at rest (pgcrypto in PostgreSQL)",
      "Use AWS RDS encrypted instances or similar managed service",
      "Encrypt sensitive fields individually (passwords, SSNs, credit cards)",
      "Store encryption keys separately from database",
      "Rotate encryption keys regularly",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },
  {
    id: "db-002",
    category: "database-security",
    severity: "CRITICAL",
    problem: "SQL injection vulnerabilities possible",
    whyItMatters:
      "SQL injection allows attackers to bypass authentication, steal data, or delete entire databases.",
    affectedComponents: ["API", "Database"],
    recommendedSolution:
      "Use parameterized queries (prepared statements) exclusively",
    implementationGuidance: [
      "Never concatenate user input into SQL queries",
      "Use parameterized queries/prepared statements",
      "Use ORM (Sequelize, TypeORM, SQLAlchemy)",
      "Validate and sanitize all inputs",
      "Use principle of least privilege for DB user",
      "Test for SQL injection vulnerabilities",
    ],
    estimatedEffort: "large",
    lastReviewed: "2026-09-26",
  },
  {
    id: "db-003",
    category: "database-security",
    severity: "HIGH",
    problem: "Database backups not encrypted or tested",
    whyItMatters:
      "Backups can be restored to recover from ransomware/data loss, but only if they're encrypted and tested.",
    affectedComponents: ["Database"],
    recommendedSolution:
      "Implement automated encrypted backups with regular restore testing",
    implementationGuidance: [
      "Automate daily backups",
      "Encrypt backups with AES-256",
      "Store backups in separate secure location",
      "Test restore process monthly",
      "Keep backups for minimum 30 days",
      "Document recovery procedures",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Secrets Management Issues
  {
    id: "secrets-001",
    category: "secrets-management",
    severity: "CRITICAL",
    problem: "Secrets hardcoded in source code or environment",
    whyItMatters:
      "Hardcoded secrets in git expose API keys, passwords, and credentials to anyone with repo access.",
    affectedComponents: ["Frontend", "API"],
    recommendedSolution:
      "Use environment variables, .env files (git-ignored), or secret vaults",
    implementationGuidance: [
      "Never commit .env files to git",
      "Add .env* to .gitignore",
      "Use .env.example with placeholder values",
      "Use environment variables for all secrets",
      "Use secret vault (HashiCorp Vault, AWS Secrets Manager) in production",
      "Rotate secrets quarterly",
      "Audit secret access logs",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },
  {
    id: "secrets-002",
    category: "secrets-management",
    severity: "HIGH",
    problem: "No secret rotation policy",
    whyItMatters:
      "If a secret is exposed, rotating it minimizes damage window. Without rotation, compromised secrets work indefinitely.",
    affectedComponents: ["API", "Infrastructure"],
    recommendedSolution:
      "Implement quarterly secret rotation with zero-downtime strategy",
    implementationGuidance: [
      "Establish quarterly rotation schedule",
      "Implement blue-green deployment for zero-downtime rotation",
      "Rotate database passwords",
      "Rotate API keys",
      "Rotate JWT signing keys (issue new tokens for existing users)",
      "Document rotation procedures",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Input Validation Issues
  {
    id: "input-001",
    category: "input-validation",
    severity: "CRITICAL",
    problem: "No input validation or sanitization",
    whyItMatters:
      "Unvalidated input allows XSS, injection, buffer overflow, and path traversal attacks.",
    affectedComponents: ["Frontend", "API"],
    recommendedSolution:
      "Validate all inputs on frontend and backend; sanitize for XSS",
    implementationGuidance: [
      "Validate input type, length, format on frontend AND backend",
      "Reject invalid requests immediately",
      "Use allowlist validation (not blacklist)",
      "Sanitize HTML to prevent XSS",
      "Escape output based on context (HTML, JavaScript, SQL, URL)",
      "Test with OWASP test data",
    ],
    estimatedEffort: "large",
    lastReviewed: "2026-09-26",
  },
  {
    id: "input-002",
    category: "input-validation",
    severity: "HIGH",
    problem: "File upload security not implemented",
    whyItMatters:
      "Unrestricted file uploads allow arbitrary file execution and server compromise.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Validate file type, size, scan for malware; store outside web root",
    implementationGuidance: [
      "Restrict file types by MIME type AND extension check",
      "Limit file size (e.g., 10MB max)",
      "Scan uploads with antivirus (ClamAV)",
      "Store files outside web root",
      "Use random filenames",
      "Serve with Content-Disposition: attachment",
      "Run uploaded files in sandboxed environment",
    ],
    estimatedEffort: "large",
    lastReviewed: "2026-09-26",
  },

  // Rate Limiting Issues
  {
    id: "ratelimit-001",
    category: "rate-limiting",
    severity: "HIGH",
    problem: "No rate limiting on API endpoints",
    whyItMatters:
      "Without rate limiting, attackers can brute-force passwords, perform DoS attacks, or abuse free resources.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Implement per-IP and per-user rate limiting on all endpoints",
    implementationGuidance: [
      "Implement rate limiting middleware",
      "Set limits: 100 req/min general, 5 req/min for auth",
      "Use sliding window algorithm",
      "Return 429 status with Retry-After header",
      "Log rate limit violations",
      "Allow whitelist for trusted IPs",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },

  // CORS Issues
  {
    id: "cors-001",
    category: "cors",
    severity: "HIGH",
    problem: "CORS misconfigured (allows all origins)",
    whyItMatters:
      "Overly permissive CORS allows cross-site request forgery (CSRF) attacks from any website.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Configure CORS to allow only trusted origins, with specific methods and headers",
    implementationGuidance: [
      "Never use Access-Control-Allow-Origin: *",
      "Explicitly list trusted origins",
      "Use environment variables for allowed origins",
      "Restrict allowed methods (GET, POST, etc.)",
      "Restrict allowed headers",
      "Set credentials: 'include' only when needed",
      "Test CORS with curl and browser tools",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },

  // CSRF Issues
  {
    id: "csrf-001",
    category: "csrf",
    severity: "HIGH",
    problem: "No CSRF token protection on forms/state-changing operations",
    whyItMatters:
      "Without CSRF tokens, attackers can trick users into making unwanted requests (transfer money, delete data).",
    affectedComponents: ["Frontend", "API"],
    recommendedSolution:
      "Implement CSRF tokens on all state-changing endpoints (POST, PUT, DELETE)",
    implementationGuidance: [
      "Generate unique CSRF token per session",
      "Include token in all forms and AJAX requests",
      "Validate token before processing request",
      "Use SameSite cookie attribute (Strict or Lax)",
      "Store tokens in httpOnly cookies",
      "Regenerate token after login",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Payment Security Issues
  {
    id: "payment-001",
    category: "payment-security",
    severity: "CRITICAL",
    problem: "Directly handling credit card data",
    whyItMatters:
      "Storing credit cards requires PCI-DSS compliance. Mishandling exposes to large fines and liability.",
    affectedComponents: ["API", "Database"],
    recommendedSolution:
      "Never store credit cards. Use tokenization services (Stripe, PayPal) for payments.",
    implementationGuidance: [
      "Use Stripe, PayPal, or similar PCI-compliant provider",
      "Use client-side tokenization",
      "Store only payment token, never card details",
      "Validate webhooks with signature verification",
      "Use HTTPS for all payment communication",
      "Never log payment details",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },
  {
    id: "payment-002",
    category: "payment-security",
    severity: "HIGH",
    problem: "No webhook signature verification for payment updates",
    whyItMatters:
      "Without signature verification, attackers can forge payment webhooks and grant unauthorized access.",
    affectedComponents: ["API"],
    recommendedSolution:
      "Verify webhook signatures using provider's public key",
    implementationGuidance: [
      "Verify webhook signature before processing",
      "Use provider's library for verification",
      "Log all webhooks (signed and unsigned)",
      "Implement idempotency checks (same webhook twice = same result)",
      "Return 200 OK immediately, process async",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },

  // Logging Issues
  {
    id: "logging-001",
    category: "logging",
    severity: "HIGH",
    problem: "No security event logging",
    whyItMatters:
      "Without logs, you cannot detect breaches, investigate incidents, or prove compliance.",
    affectedComponents: ["API", "Database"],
    recommendedSolution:
      "Log all security-relevant events: logins, permission changes, data access, errors",
    implementationGuidance: [
      "Log authentication attempts (success and failure)",
      "Log authorization decisions",
      "Log sensitive data access",
      "Log configuration changes",
      "Log error stack traces separately",
      "Include timestamp, user, action, result",
      "Never log passwords or sensitive data",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },
  {
    id: "logging-002",
    category: "logging",
    severity: "MEDIUM",
    problem: "Logs not centralized or protected",
    whyItMatters:
      "Local logs can be deleted by attackers. Centralized logs provide audit trail.",
    affectedComponents: ["Logging", "Infrastructure"],
    recommendedSolution:
      "Send logs to centralized, immutable log store with access controls",
    implementationGuidance: [
      "Use centralized logging (ELK, CloudWatch, Datadog, Splunk)",
      "Ensure logs are immutable or append-only",
      "Implement log retention policy",
      "Restrict access to logs",
      "Enable log file encryption",
      "Monitor for log tampering",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Monitoring Issues
  {
    id: "monitoring-001",
    category: "monitoring",
    severity: "HIGH",
    problem: "No security monitoring or alerting",
    whyItMatters:
      "Without monitoring, you won't know if you're being attacked until it's too late.",
    affectedComponents: ["Infrastructure", "Logging"],
    recommendedSolution:
      "Monitor for suspicious patterns: failed logins, rate limit violations, unusual data access",
    implementationGuidance: [
      "Set up alerts for: multiple failed logins, rate limit violations, error spikes",
      "Monitor for brute force attempts (>5 failures in 5 min)",
      "Alert on unusual geographic access patterns",
      "Alert on database query anomalies",
      "Implement automated response (lock accounts, throttle)",
      "Use APM tools for performance monitoring",
    ],
    estimatedEffort: "large",
    lastReviewed: "2026-09-26",
  },

  // Backup Issues
  {
    id: "backup-001",
    category: "backups",
    severity: "HIGH",
    problem: "No backup strategy or recovery procedures",
    whyItMatters:
      "Without backups, ransomware or data corruption means permanent data loss.",
    affectedComponents: ["Database", "Infrastructure"],
    recommendedSolution:
      "Implement automated daily backups with tested recovery procedures",
    implementationGuidance: [
      "Automate daily backups at minimum",
      "Keep backups for 30-90 days",
      "Test recovery monthly",
      "Store backups in separate location/account",
      "Encrypt backups",
      "Document recovery procedures",
      "Implement point-in-time recovery",
    ],
    estimatedEffort: "medium",
    lastReviewed: "2026-09-26",
  },

  // Dependency Security Issues
  {
    id: "deps-001",
    category: "dependency-security",
    severity: "HIGH",
    problem: "No dependency vulnerability scanning",
    whyItMatters:
      "Dependencies with known vulnerabilities expose application to exploitation.",
    affectedComponents: ["Frontend", "API"],
    recommendedSolution:
      "Scan dependencies with npm audit, Dependabot, or SNYK in CI/CD",
    implementationGuidance: [
      "Run npm audit regularly (automate in CI/CD)",
      "Use Dependabot for automatic updates",
      "Pin major versions, allow patch updates",
      "Review and test updates before deploying",
      "Subscribe to security advisories",
      "Keep Node.js and Python versions updated",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },
  {
    id: "deps-002",
    category: "dependency-security",
    severity: "MEDIUM",
    problem: "Dependencies not pinned to specific versions",
    whyItMatters:
      "Unpinned dependencies may auto-upgrade to broken or compromised versions.",
    affectedComponents: ["Frontend", "API"],
    recommendedSolution: "Pin major versions; use tools like npm-check-updates",
    implementationGuidance: [
      "Pin major versions (^1.2.3, not latest)",
      "Use lockfiles (package-lock.json, yarn.lock)",
      "Review dependency updates monthly",
      "Test updates in staging before production",
    ],
    estimatedEffort: "small",
    lastReviewed: "2026-09-26",
  },
];

// ─── Score Calculation ────────────────────────
function calculateSecurityScore(issues: SecurityIssue[]): number {
  let score = 100;

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highCount = issues.filter((i) => i.severity === "HIGH").length;
  const mediumCount = issues.filter((i) => i.severity === "MEDIUM").length;

  score -= criticalCount * 20;
  score -= highCount * 8;
  score -= mediumCount * 2;

  return Math.max(0, score);
}

// ─── Main Analysis Function ────────────────────────
export function generateSecurityAnalysis(
  context: SecurityAnalysisContext,
): SecurityReport {
  const { architectureStrategy, projectRequirements } = context;
  const strategy = architectureStrategy;
  const allTechs = [
    ...strategy.techStack.frontend,
    ...strategy.techStack.backend,
    ...strategy.techStack.database,
    ...strategy.techStack.cache,
    ...strategy.techStack.deployment,
    ...strategy.techStack.monitoring,
    ...strategy.techStack.other,
  ].map((t) => t.toLowerCase());

  // Identify issues based on architecture
  const identifiedIssues: SecurityIssue[] = [];

  // Check for authentication
  const hasAuth = allTechs.some((t) =>
    ["auth0", "supabase", "firebase", "next.js"].some((a) => t.includes(a)),
  );
  if (!hasAuth && strategy.tier === "mvp") {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[0]); // auth-001
  }

  // Check for database encryption
  const hasDBEncryption = allTechs.some((t) =>
    ["postgresql", "dynamodb"].some((a) => t.includes(a)),
  );
  if (!hasDBEncryption && strategy.tier !== "mvp") {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[8]); // db-001
  }

  // Check for secrets management
  const hasSecretsManagement = strategy.tier !== "mvp";
  if (!hasSecretsManagement) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[14]); // secrets-001
  }

  // Check for rate limiting
  const hasRateLimiting = allTechs.some((t) =>
    ["express-rate-limit", "fastapi", "django", "redis"].some((a) =>
      t.includes(a),
    ),
  );
  if (!hasRateLimiting) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[27]); // ratelimit-001
  }

  // Check for CORS
  identifiedIssues.push(SECURITY_ISSUES_DATABASE[29]); // cors-001 (almost always an issue)

  // Check for CSRF
  const hasCSRFProtection = allTechs.some((t) =>
    ["next.js", "django", "angular"].some((a) => t.includes(a)),
  );
  if (!hasCSRFProtection) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[32]); // csrf-001
  }

  // Check for payment handling
  const needsPayment =
    projectRequirements?.requiredFeatures?.includes("payments");
  const hasPaymentProvider = allTechs.some((t) =>
    ["stripe", "paypal", "square"].some((a) => t.includes(a)),
  );
  if (needsPayment && !hasPaymentProvider) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[34]); // payment-001
  }

  // Check for logging
  const hasLogging = strategy.tier !== "mvp";
  if (!hasLogging) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[39]); // logging-001
  }

  // Check for monitoring
  const hasMonitoring = allTechs.some((t) =>
    ["datadog", "newrelic", "cloudwatch", "prometheus"].some((a) =>
      t.includes(a),
    ),
  );
  if (!hasMonitoring) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[42]); // monitoring-001
  }

  // Check for backups
  identifiedIssues.push(SECURITY_ISSUES_DATABASE[44]); // backup-001 (almost always needed)

  // Check for dependency scanning
  identifiedIssues.push(SECURITY_ISSUES_DATABASE[46]); // deps-001

  // Add tier-specific recommendations
  if (strategy.tier === "mvp") {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[1]); // auth-002
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[18]); // authz-001
  }

  if (strategy.tier === "enterprise") {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[3]); // auth-003 - high priority
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[34]); // payment-002
  }

  // Add API-specific issues
  if (strategy.techStack.backend.length > 0) {
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[6]); // api-001
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[7]); // api-002
    identifiedIssues.push(SECURITY_ISSUES_DATABASE[10]); // db-002 (SQL injection)
  }

  // Deduplicate issues by ID
  const uniqueIssues = Array.from(
    new Map(identifiedIssues.map((i) => [i.id, i])).values(),
  );

  // Group by severity
  const issuesBySeverity = {
    CRITICAL: uniqueIssues.filter((i) => i.severity === "CRITICAL"),
    HIGH: uniqueIssues.filter((i) => i.severity === "HIGH"),
    MEDIUM: uniqueIssues.filter((i) => i.severity === "MEDIUM"),
    LOW: uniqueIssues.filter((i) => i.severity === "LOW"),
    PASS: uniqueIssues.filter((i) => i.severity === "PASS"),
  };

  // Calculate score
  const overallScore = calculateSecurityScore(uniqueIssues);

  // Create category analysis
  const categoriesMap = new Map<string, SecurityCategoryAnalysis>();
  const categories: SecurityCategory[] = [
    "authentication",
    "authorization",
    "api-security",
    "database-security",
    "secrets-management",
    "input-validation",
    "rate-limiting",
    "cors",
    "csrf",
    "file-upload-security",
    "payment-security",
    "logging",
    "monitoring",
    "backups",
    "dependency-security",
  ];

  categories.forEach((cat) => {
    const categoryIssues = uniqueIssues.filter((i) => i.category === cat);
    const worstSeverity =
      categoryIssues.length > 0
        ? (categoryIssues[0].severity as SecuritySeverity)
        : ("PASS" as SecuritySeverity);

    const severityOrder: Record<SecuritySeverity, number> = {
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      PASS: 1,
    };

    const actualWorst = categoryIssues.reduce(
      (worst, current) => {
        return severityOrder[current.severity] > severityOrder[worst.severity]
          ? current
          : worst;
      },
      categoryIssues[0] || { severity: "PASS" as SecuritySeverity },
    );

    categoriesMap.set(cat, {
      category: cat,
      categoryLabel: formatCategory(cat),
      severityLevel:
        categoryIssues.length > 0
          ? (actualWorst.severity as SecuritySeverity)
          : "PASS",
      description: getCategoryDescription(cat),
      findings: categoryIssues.map((i) => i.problem),
      strengths: getCategoryStrengths(cat, allTechs),
      weaknesses: categoryIssues.map((i) => i.whyItMatters),
      recommendations: categoryIssues.flatMap((i) => i.implementationGuidance),
    });
  });

  // Top 5 issues
  const topFiveIssues = [...issuesBySeverity.CRITICAL, ...issuesBySeverity.HIGH]
    .slice(0, 5)
    .map((issue, index) => ({
      rank: index + 1,
      category: issue.category,
      issue: issue.problem,
      impact: issue.whyItMatters,
      priority: issue.severity,
      quickStartGuide: issue.implementationGuidance.slice(0, 3),
    }));

  // Remediation roadmap
  const remediationRoadmap = [
    {
      phase: "immediate" as const,
      phaseName: "Immediate (Next 2 weeks)",
      timeframe: "2 weeks",
      issues: issuesBySeverity.CRITICAL,
      totalEstimatedHours: issuesBySeverity.CRITICAL.reduce(
        (sum, i) => sum + getEffortHours(i.estimatedEffort),
        0,
      ),
    },
    {
      phase: "short-term" as const,
      phaseName: "Short-term (1-3 months)",
      timeframe: "1-3 months",
      issues: issuesBySeverity.HIGH,
      totalEstimatedHours: issuesBySeverity.HIGH.reduce(
        (sum, i) => sum + getEffortHours(i.estimatedEffort),
        0,
      ),
    },
    {
      phase: "medium-term" as const,
      phaseName: "Medium-term (3-6 months)",
      timeframe: "3-6 months",
      issues: issuesBySeverity.MEDIUM,
      totalEstimatedHours: issuesBySeverity.MEDIUM.reduce(
        (sum, i) => sum + getEffortHours(i.estimatedEffort),
        0,
      ),
    },
    {
      phase: "long-term" as const,
      phaseName: "Long-term (6+ months)",
      timeframe: "6+ months",
      issues: issuesBySeverity.LOW,
      totalEstimatedHours: issuesBySeverity.LOW.reduce(
        (sum, i) => sum + getEffortHours(i.estimatedEffort),
        0,
      ),
    },
  ];

  return {
    overallSecurityScore: overallScore,
    generatedAt: new Date().toISOString(),
    architectureTier: strategy.tier,
    architectureName: strategy.name,
    summary: {
      strengths: getSummaryStrengths(strategy, uniqueIssues),
      weaknesses: issuesBySeverity.CRITICAL.map((i) => i.problem),
      majorGaps: issuesBySeverity.CRITICAL.slice(0, 3).map(
        (i) => i.whyItMatters,
      ),
    },
    categoriesAnalysis: Array.from(categoriesMap.values()),
    allIssues: uniqueIssues.sort(
      (a, b) =>
        (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0),
    ),
    issuesBySeverity,
    topFiveIssues,
    remediationRoadmap,
    complianceNotes: {
      dataProtection:
        "Ensure compliance with GDPR (EU), CCPA (California), and local data protection laws",
      backupRequirements:
        "Maintain minimum 30-day backup retention for disaster recovery",
      auditingRequirements:
        "Log and audit all security-relevant events for compliance investigations",
      recommendedFrameworks: [
        "OWASP Top 10",
        "CIS Benchmarks",
        "PCI-DSS (if handling payments)",
        "SOC 2 Type II",
      ],
    },
  };
}

// ─── Helper Functions ────────────────────────
function formatCategory(cat: SecurityCategory): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getCategoryDescription(cat: SecurityCategory): string {
  const descriptions: Record<SecurityCategory, string> = {
    authentication: "Verify users are who they claim to be through credentials",
    authorization:
      "Ensure users can only access resources they're permitted to access",
    "api-security":
      "Secure API endpoints against unauthorized access and abuse",
    "database-security": "Protect data at rest and in transit within database",
    "secrets-management": "Manage sensitive credentials and API keys securely",
    "input-validation":
      "Validate and sanitize all user inputs to prevent injection attacks",
    "rate-limiting": "Prevent abuse and DoS attacks by limiting request rates",
    cors: "Control cross-origin resource sharing to prevent CSRF",
    csrf: "Prevent cross-site request forgery attacks",
    "file-upload-security":
      "Secure file upload endpoints against malicious files",
    "payment-security": "Securely handle payment processing and PCI compliance",
    logging: "Log security events for audit and investigation",
    monitoring: "Monitor system for security threats and anomalies",
    backups: "Ensure data recovery capability after loss or corruption",
    "dependency-security":
      "Keep third-party dependencies free of vulnerabilities",
  };
  return descriptions[cat] || "";
}

function getCategoryStrengths(
  cat: SecurityCategory,
  allTechs: string[],
): string[] {
  const strengths: Record<SecurityCategory, string[]> = {
    authentication: allTechs.some((t) =>
      ["next.js", "supabase", "firebase"].some((a) => t.includes(a)),
    )
      ? ["Built-in authentication frameworks available"]
      : [],
    authorization: allTechs.some((t) =>
      ["postgresql", "django"].some((a) => t.includes(a)),
    )
      ? ["Database supports role-based access control"]
      : [],
    "api-security": allTechs.some((t) =>
      ["next.js", "fastapi"].some((a) => t.includes(a)),
    )
      ? ["Framework has security middleware support"]
      : [],
    "database-security": allTechs.some((t) =>
      ["postgresql", "dynamodb"].some((a) => t.includes(a)),
    )
      ? ["Managed database with encryption options"]
      : [],
    "secrets-management": ["Environment variable support available"],
    "input-validation": allTechs.some((t) =>
      ["next.js", "fastapi", "django"].some((a) => t.includes(a)),
    )
      ? ["Framework supports validation middleware"]
      : [],
    "rate-limiting": allTechs.some((t) =>
      ["redis", "fastapi"].some((a) => t.includes(a)),
    )
      ? ["Tools available for rate limiting implementation"]
      : [],
    cors: allTechs.some((t) =>
      ["next.js", "express"].some((a) => t.includes(a)),
    )
      ? ["Framework has CORS middleware"]
      : [],
    csrf: allTechs.some((t) => ["next.js", "django"].some((a) => t.includes(a)))
      ? ["Framework has built-in CSRF protection"]
      : [],
    "file-upload-security": [],
    "payment-security": allTechs.some((t) =>
      ["stripe", "paypal"].some((a) => t.includes(a)),
    )
      ? ["PCI-compliant payment processor selected"]
      : [],
    logging: allTechs.some((t) =>
      ["datadog", "cloudwatch"].some((a) => t.includes(a)),
    )
      ? ["Centralized logging infrastructure available"]
      : [],
    monitoring: allTechs.some((t) =>
      ["datadog", "prometheus"].some((a) => t.includes(a)),
    )
      ? ["Monitoring infrastructure selected"]
      : [],
    backups: allTechs.some((t) =>
      ["aws", "gcp", "azure"].some((a) => t.includes(a)),
    )
      ? ["Cloud provider has automated backup options"]
      : [],
    "dependency-security": ["npm audit and similar tools available"],
  };
  return strengths[cat] || [];
}

function getSummaryStrengths(
  strategy: ArchitectureStrategy,
  issues: SecurityIssue[],
): string[] {
  const strengths = [];

  if (strategy.tier === "enterprise") {
    strengths.push("Enterprise-grade architecture selected");
  }

  if (issues.filter((i) => i.severity === "CRITICAL").length === 0) {
    strengths.push("No critical security issues identified");
  }

  const hasAuth = strategy.techStack.backend.some((t) =>
    t.toLowerCase().includes("auth"),
  );
  if (hasAuth) {
    strengths.push("Authentication system included in architecture");
  }

  return strengths.length > 0
    ? strengths
    : ["Architecture is serviceable for MVP stage"];
}

function getEffortHours(
  effort: "minimal" | "small" | "medium" | "large",
): number {
  const hours: Record<string, number> = {
    minimal: 2,
    small: 8,
    medium: 24,
    large: 60,
  };
  return hours[effort] || 8;
}

const severityOrder: Record<SecuritySeverity, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  PASS: 1,
};
