// ─── Advanced Guides — Infrastructure Tools ───────────
// Upstash Redis (Cache), Playwright (Testing)
import type { AdvancedGuide } from "../types";

export const redisUpstashGuide: AdvancedGuide = {
  toolId: "redis_upstash",
  architecturePatterns: [
    "Multi-tier caching: CDN (Vercel Edge) → Redis (hot cache) → Database (source of truth)",
    "Cache-aside (lazy loading): Read from cache → miss → query DB → populate cache",
    "Write-through: Update cache synchronously on DB writes — strong consistency",
    "Write-behind: Update cache async — higher throughput but eventual consistency",
    "Rate limiting via sliding window algorithm — prevents brute force and API abuse",
    "Session storage for serverless environments where local memory isn't persistent",
    "Message queue with BullMQ for background job processing",
    "Distributed locks (Redlock) for coordinating across multiple server instances",
  ],
  securityBestPractices: [
    "Use REST API tokens instead of direct Redis connections — never expose Redis protocol to the internet",
    "Implement least-privilege access: create separate tokens for read-only vs read-write operations",
    "Encrypt sensitive cached data at application level before storing",
    "Set TTL on every cache entry — prevent stale data accumulation",
    "Never cache PII (personally identifiable information) without encryption",
    "Use separate Redis instances for different environments (dev, staging, production)",
    "Validate data before caching — cache poisoned data could serve to all users",
  ],
  performanceOptimizations: [
    "Use pipelining for batch operations — reduces round trips by 10x",
    "Keep cache entries small — use compression for large JSON payloads",
    "Use appropriate data structures: Hashes for objects, Sets for unique items, Sorted Sets for leaderboards",
    "Set optimal TTLs — too short defeats caching, too long risks stale data",
    "Prefix keys by domain (e.g., 'courses:123', 'user:456:profile') for logical grouping",
    "Use SCAN instead of KEYS in production — KEYS blocks the event loop",
    "Monitor cache hit ratio target >80% — if lower, review caching strategy",
  ],
  productionConfigs: [
    {
      title: "Production Caching Layer",
      code: `import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  automaticDeserialization: false,
})

export async function getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds = 300): Promise<T> {
  const cached = await redis.get(key)
  if (cached) { try { return JSON.parse(cached as string) } catch {} }
  const data = await fetchFn()
  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds })
  return data
}

export async function invalidatePattern(pattern: string) {
  let cursor = 0
  do {
    const result = await redis.scan(cursor, { match: pattern, count: 100 })
    cursor = result[0] as unknown as number
    const keys = result[1] as string[]
    if (keys.length > 0) await redis.del(...keys)
  } while (cursor !== 0)
}

export const apiRatelimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(10, '10 s'), analytics: true, prefix: 'ratelimit:api',
})`,
      description:
        "Production Redis caching layer with typed helpers and rate limiters.",
    },
  ],
  codeExamples: [
    {
      title: "Distributed Lock for Critical Operations",
      code: `export async function withLock<T>(lockKey: string, ttlMs: number, fn: () => Promise<T>, maxRetries = 10): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const acquired = await redis.set(\`lock:\${lockKey}\`, 'locked', { nx: true, px: ttlMs })
    if (acquired === 'OK') {
      try { return await fn() }
      finally { await redis.del(\`lock:\${lockKey}\`) }
    }
    if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 100 * (attempt + 1)))
  }
  throw new Error(\`Could not acquire lock for \${lockKey}\`)
}`,
      language: "typescript",
    },
    {
      title: "Leaderboard with Sorted Sets",
      code: `export class Leaderboard {
  constructor(private name: string) {}
  async addScore(userId: string, score: number) { await redis.zadd(\`leaderboard:\${this.name}\`, { score, member: userId }) }
  async incrementScore(userId: string, inc: number) { await redis.zincrby(\`leaderboard:\${this.name}\`, inc, userId) }
  async getTop(n: number) {
    const results = await redis.zrange<string[]>(\`leaderboard:\${this.name}\`, 0, n - 1, { rev: true, withScores: true })
    const entries = []
    for (let i = 0; i < results.length; i += 2) entries.push({ userId: results[i], score: Number(results[i + 1]) })
    return entries
  }
}`,
      language: "typescript",
    },
  ],
  testingStrategy:
    "Unit: Mock Redis client. Integration: Use Upstash free tier for real operations. Rate limiter: Test sliding window behavior. Cache invalidation: Verify clears on mutation.",
  monitoringStrategy:
    "Upstash Dashboard: Built-in commands, keyspace, latency monitoring. Custom: Track cache hit ratio. Rate limiter: Monitor how many requests hit the limit. Alerts: Threshold alerts for approaching free tier limits.",
  backupDisasterRecovery:
    "Upstash handles persistence automatically — daily backups. For critical data: dual-write to Redis and DB. Redis is a cache — losing it causes performance degradation, not data loss. Warm cache after restart.",
  deploymentStrategy:
    "Upstash REST API works everywhere — no VPC needed. Env vars: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. Works natively with serverless/edge functions.",
  commonPitfalls: [
    {
      issue: "No TTL on cache entries — stale data served indefinitely",
      solution:
        "Always set EX/TTL on every cache write with appropriate defaults per data type.",
    },
    {
      issue:
        "Cache stampede — multiple requests recomputing same cache simultaneously",
      solution: "Use distributed locks. First request computes, others wait.",
    },
    {
      issue: "Over-caching uncacheable data (real-time, per-user)",
      solution:
        "Cache only shared, infrequently-changing data. Use real-time subscriptions for live data.",
    },
  ],
  scalabilityPatterns: [
    "Read replicas: Upstash global replication — read from closest region",
    "Sharding: Split data across instances by domain",
    "Connection pooling: Upstash REST API handles unlimited connections",
    "Persistence: RDB snapshots for restart, AOF for durability",
  ],
  costOptimization:
    "Upstash Free: 10K commands/day, 256MB. Pro ($19/mo): 1M commands/day, 1GB. Use smaller TTLs to reduce storage. Batch with pipelining. For self-hosted: Run on same VPS as app.",
};

export const playwrightGuide: AdvancedGuide = {
  toolId: "playwright",
  architecturePatterns: [
    "Page Object Model: Encapsulate page selectors and actions in reusable Page classes",
    "Data-driven tests: Run same test with multiple inputs via parameterized test suites",
    "API-first testing: Use Playwright APIRequestContext to set up test data before UI tests",
    "Visual regression: Screenshot comparison for detecting unintended UI changes",
    "Parallel execution: Run tests across multiple workers and browsers simultaneously",
    "Test isolation: Each test gets fresh browser context, cookies, and local storage",
    "CI-first: Tests designed to run in headless mode with retry logic for flaky tests",
  ],
  securityBestPractices: [
    "Never commit test credentials or API keys to version control — use CI secrets",
    "Use .env.test file for test environment variables — not tracked in Git",
    "Mask sensitive data in test reports — auth tokens, passwords, API keys",
    "Run tests in isolated test environment — never connect to production databases",
    "Sanitize test artifacts (screenshots, traces) before sharing — blur any PII",
  ],
  performanceOptimizations: [
    "Use webServer config to auto-start/stop dev server — saves manual setup time",
    "Enable fullyParallel: true for maximum test execution speed",
    "Use trace: 'on-first-retry' instead of always-on to save CI time",
    "Set reasonable timeouts per test (30s) and expect (10s) — avoid excessive waits",
    "Use test.use({ storageState }) to skip login in every test — saves 3-5s per test",
    "Use sharding in CI to distribute tests across multiple machines",
  ],
  productionConfigs: [
    {
      title: "Production Playwright Configuration",
      code: `// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', screenshot: 'only-on-failure',
    video: 'retain-on-failure', actionTimeout: 10_000, navigationTimeout: 15_000,
  },
  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' }, dependencies: ['setup'] },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' }, dependencies: ['setup'] },
  ],
  webServer: process.env.CI ? { command: 'npm run start', port: 3000, reuseExistingServer: false, timeout: 30_000 } : undefined,
})`,
      description:
        "Production Playwright config with parallel execution, retries, and CI optimization.",
    },
  ],
  codeExamples: [
    {
      title: "Page Object Model Example",
      code: `// e2e/pages/login-page.ts
import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(public readonly page: Page) {
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign In' })
    this.errorMessage = page.getByTestId('auth-error')
  }

  async goto() { await this.page.goto('/auth/login'); await expect(this.emailInput).toBeVisible() }
  async login(email: string, password: string) { await this.emailInput.fill(email); await this.passwordInput.fill(password); await this.submitButton.click() }
  async expectSuccess() { await expect(this.page).toHaveURL(/dashboard/) }
}`,
      language: "typescript",
    },
  ],
  testingStrategy:
    "This IS the testing tool. Key: Unit (Jest) for logic, Component (RTL) for UI, E2E (Playwright) for flows, Visual (screenshots) for consistency, API (Playwright API) for backends, a11y (axe-core) for compliance.",
  monitoringStrategy:
    "HTML reporter + CI dashboard. Track flaky tests. Monitor coverage with c8/istanbul. Track test execution time — optimize if >10 min in CI.",
  backupDisasterRecovery:
    "Test code is in Git. Artifacts stored in CI for 30 days. Test data seeded via API — no persistent data needed. Rollback to last passing commit on failure.",
  deploymentStrategy:
    "CI: Run after linting and type checking. Parallel: 4+ shards. Web server: Start dev server with test DB. Reporting: HTML report as CI artifact. Pre-merge: Full suite as required check.",
  commonPitfalls: [
    {
      issue: "Flaky tests due to timing",
      solution:
        "Use locator-based assertions with auto-waiting. Never use page.waitForTimeout().",
    },
    {
      issue: "Tests passing locally but failing in CI",
      solution: "Use same Node/browser versions. Match timeouts exactly.",
    },
    {
      issue: "Slow tests from login in every test",
      solution: "Use storageState to reuse auth. Set up once in setup project.",
    },
  ],
  scalabilityPatterns: [
    "Sharding across multiple CI machines",
    "Parallelism: One worker per CPU core",
    "Project-based: Separate tests by browser for targeted runs",
    "Cloud: Playwright Cloud or BrowserStack for massive parallel matrices",
  ],
  costOptimization:
    "Playwright is free and open-source. CI minutes: Use sharding/parallelism. GitHub Actions: 2000 free min/mo for private repos. Use trace: 'on-first-retry' to save storage. Limit browser matrix.",
};
