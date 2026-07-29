// ─── Advanced Guides — Backend Tools ──────────────────
// Node.js + Express, Chapa (Ethiopian Payment Gateway)
import type { AdvancedGuide } from "../types";

export const nodeGuide: AdvancedGuide = {
  toolId: "node",
  architecturePatterns: [
    "Layered architecture: Routes → Controllers → Services → Repositories",
    "Middleware pipeline pattern for cross-cutting concerns (auth, logging, rate limiting, validation)",
    "BFF (Backend-for-Frontend) pattern — dedicated backend for each client type",
    "Event-driven architecture with EventEmitter or Redis pub/sub for decoupled services",
    "Clean Architecture / Hexagonal Architecture for enterprise apps with complex business logic",
    "Queue-based processing with BullMQ for background jobs (email, notifications, report generation)",
    "API versioning via URL prefix (v1, v2) or custom header for backward compatibility",
  ],
  securityBestPractices: [
    "Helmet.js for security headers (Content-Security-Policy, X-XSS-Protection, etc.)",
    "Rate limiting with express-rate-limit or Upstash Ratelimit for serverless",
    "Input validation with Zod or Joi on every endpoint — never trust request body",
    "CORS: restrict to specific origins — never use wildcard in production",
    "SQL injection prevention: always use parameterized queries or ORM (Prisma/Drizzle)",
    "JWT: use short-lived access tokens (15 min) + long-lived refresh tokens (7 days)",
    "Password hashing: use bcrypt with cost factor 12+ — never store plain text",
    "File upload: validate MIME type, file size, scan for malware with ClamAV",
    "Environment variables: validate all required vars on startup with envalid package",
  ],
  performanceOptimizations: [
    "Compression: Use compression middleware (gzip/brotli) — reduces response size by 70%+",
    "Connection pooling: Prisma with pgBouncer or PgPool — never create new connections per request",
    "Caching: Redis for session storage, API response cache, and rate limiter state",
    "Cluster mode: Use PM2 cluster mode or Node.js cluster module to utilize all CPU cores",
    "Async/await everywhere — never block the event loop with sync operations",
    "Lightweight alternatives: Use fastify instead of express for 2-3x throughput",
    "Offload CPU tasks: Use worker_threads or BullMQ for CPU-intensive operations",
    "HTTP/2: Enable for multiplexed connections and reduced latency",
  ],
  productionConfigs: [
    {
      title: "Production Express Server Setup",
      code: `import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/request-logger'
import { validateEnv } from './config/env'

validateEnv()

const app = express()
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  connectionTimeout: 10_000,
})

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))
app.use(express.json({ limit: '1mb' }))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}))

app.use(requestLogger)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
  prisma.$connect().then(() => console.log('DB connected'))
})`,
      description:
        "Production Express server with security, rate limiting, CORS, and error handling.",
    },
    {
      title: "Error Handler Middleware",
      code: `// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public isOperational = true) {
    super(message)
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path, method: req.method,
  })

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: 'APP_ERROR' })
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed', code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists', code: 'UNIQUE_CONSTRAINT' })
  }
  return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
}`,
      description:
        "Structured error handler with validation errors, operational errors, and safe production messages.",
    },
  ],
  codeExamples: [
    {
      title: "Service Layer with Dependency Injection",
      code: `// services/course-service.ts
import { PrismaClient, Prisma } from '@prisma/client'
import { Redis } from 'ioredis'

export class CourseService {
  constructor(private prisma: PrismaClient, private redis: Redis) {}

  async getPublishedCourses(page = 1, limit = 20) {
    const cacheKey = \`courses:published:\${page}:\${limit}\`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { status: 'published' },
        include: { creator: { select: { id: true, full_name: true } } },
        skip: (page - 1) * limit, take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.course.count({ where: { status: 'published' } }),
    ])

    const result = { data: courses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    await this.redis.setex(cacheKey, 300, JSON.stringify(result))
    return result
  }
}`,
      language: "typescript",
    },
  ],
  testingStrategy:
    "Unit: Vitest/Jest for service layer with mocked Prisma and Redis. Integration: Supertest for API endpoint testing with test database. E2E: Playwright for full-stack tests. Load: k6 for endpoint load testing. Coverage: 90%+ on service layer, 70%+ on controllers.",
  monitoringStrategy:
    "APM: Sentry for Node.js — track transaction performance and query times. Metrics: Prometheus + Grafana. Logging: Pino/Winston structured JSON logging to Logtail. Health: /health endpoint returning DB + Redis + external service status.",
  backupDisasterRecovery:
    "Database: Automated PostgreSQL backups + WAL archival for PITR. Code: Git — always pushed to GitHub. Config: All env vars in 1Password + CI/CD secrets. Disaster plan: Infrastructure-as-code (Docker Compose) ready to spin up new instance.",
  deploymentStrategy:
    "PM2 cluster mode with --instances=max. Docker multi-stage build. Nginx reverse proxy with SSL + gzip. CI/CD: GitHub Actions → build Docker → push registry → SSH deploy. Blue-green with PM2 graceful reload.",
  commonPitfalls: [
    {
      issue: "Blocking the event loop with CPU-intensive operations",
      solution:
        "Use worker_threads, child_process, or offload to BullMQ queue.",
    },
    {
      issue: "Unhandled promise rejections crashing the process",
      solution:
        "Always use .catch() or try/catch. Register process.on('unhandledRejection') handler.",
    },
    {
      issue: "Memory leaks from closures and event listeners",
      solution:
        "Use --inspect for heap snapshots. Monitor memory with process.memoryUsage().",
    },
    {
      issue: "Prisma connection exhaustion under load",
      solution:
        "Configure connection_limit and pool_timeout. Use PgBouncer in transaction mode.",
    },
  ],
  scalabilityPatterns: [
    "Horizontal: PM2 cluster mode or Docker containers behind Nginx load balancer",
    "Vertical: Increase Node.js memory limit with --max-old-space-size flag",
    "Queue-based: BullMQ with Redis for async task processing",
    "Read replicas: Separate read/write Prisma instances",
    "Microservices: Split monolithic Express app into separate services by domain",
  ],
  costOptimization:
    "Start with a single $5-10 VPS (DigitalOcean/Linode) running PM2 cluster. Add Redis ($5/mo Upstash free tier) for caching. Use Render free tier for staging. At scale: Railway ($5-20/mo) for managed hosting with auto-scaling.",
};

export const chapaGuide: AdvancedGuide = {
  toolId: "chapa",
  architecturePatterns: [
    "Webhook-first payment confirmation — never trust client-side success callbacks",
    "Idempotency keys for payment creation — prevent duplicate charges on network retry",
    "Payment status polling with exponential backoff for failed webhooks",
    "Screenshot upload fallback for manual bank transfers and Telebirr payments",
    "Admin approval queue for payment verification — human-in-the-loop for large transactions",
    "Multi-payment strategy: Chapa for ETB, PayPal/Stripe for international USD payments",
  ],
  securityBestPractices: [
    "Store Chapa secret key server-side only — never expose in client bundle",
    "Verify webhook signatures using HMAC-SHA256 to ensure requests are from Chapa",
    "Implement idempotency_key on all payment creation requests",
    "Log all webhook events for audit trail — store in separate webhook_events table",
    "Use database transactions when processing webhook — credit membership only after successful DB commit",
    "Set up IP whitelisting for Chapa webhook callbacks if supported",
    "Rate limit payment initiation endpoints — prevent mass payment attempts",
  ],
  performanceOptimizations: [
    "Cache payment plans and pricing in Redis — rarely changes but fetched frequently",
    "Offload webhook processing to a queue (BullMQ with Redis) — respond immediately to Chapa",
    "Use database materialized views for payment reports and reconciliation",
    "Batch payment status checks with scheduled cron jobs rather than per-user polling",
    "Compress screenshot uploads before storing — reduce storage and CDN costs",
  ],
  productionConfigs: [
    {
      title: "Chapa Webhook Handler with Signature Verification",
      code: `// app/api/webhooks/chapa/route.ts
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-chapa-signature')
  
  const expectedSig = crypto
    .createHmac('sha256', process.env.CHAPA_SECRET_KEY!)
    .update(body)
    .digest('hex')
  
  if (signature !== expectedSig) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  await supabase.from('webhook_logs').insert({
    provider: 'chapa', event_type: event.event,
    payload: event, received_at: new Date().toISOString(),
  })

  if (event.event === 'charge.success') {
    const { tx_ref, amount, currency } = event.data
    const { error } = await supabase.rpc('process_payment_success', {
      p_tx_ref: tx_ref, p_amount: amount, p_currency: currency,
    })
    if (error) return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
  return Response.json({ received: true })
}`,
      description:
        "Secure webhook handler with HMAC verification and atomic payment processing.",
    },
    {
      title: "Chapa Payment Initiation with Idempotency",
      code: `// app/api/payments/create/route.ts
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const { planId, userId, email, amount } = await req.json()
  const idempotencyKey = randomUUID()
  const txRef = \`TX-\${Date.now()}-\${randomUUID().slice(0, 8)}\`

  const chapaPayload = {
    amount: String(amount), currency: 'ETB', email,
    first_name: email.split('@')[0], tx_ref: txRef,
    callback_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chapa\`,
    return_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/membership/success?tx_ref=\${txRef}\`,
  }

  const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${process.env.CHAPA_SECRET_KEY}\`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
    body: JSON.stringify(chapaPayload),
  })
  const data = await response.json()

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  await supabase.from('payment_requests').insert({
    user_id: userId, plan_id: planId, amount, currency: 'ETB',
    payment_method: 'chapa', tx_ref: txRef, status: 'pending', idempotency_key: idempotencyKey,
  })

  return Response.json({ checkout_url: data.data.checkout_url, tx_ref: txRef })
}`,
      description:
        "Payment initialization with idempotency keys to prevent double charges.",
    },
  ],
  codeExamples: [
    {
      title: "Screenshot Upload + Payment Request",
      code: `'use client'
import { useCallback, useState } from 'react'
import { createClientComponentClient } from '@supabase/ssr'

export function ManualPaymentForm({ planId, amount }: { planId: string; amount: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = \`payments/\${Date.now()}-\${Math.random().toString(36).slice(2)}.\${fileExt}\`
      await supabase.storage.from('payment-screenshots').upload(filePath, file)
      const { data: { publicUrl } } = supabase.storage.from('payment-screenshots').getPublicUrl(filePath)
      const res = await fetch('/api/membership/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, amount, screenshotUrl: publicUrl }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }, [file, planId, amount, supabase])

  if (submitted) return <div>✅ Payment request submitted! Admin will review.</div>
  return (
    <form onSubmit={handleSubmit}>
      <p>Amount: <strong>{amount} ETB</strong></p>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
      <button type="submit" disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Submit Payment Request'}
      </button>
    </form>
  )
}`,
      language: "typescript",
    },
  ],
  testingStrategy:
    "Sandbox: Use Chapa test mode for development. Test webhooks via ngrok. Integration: Test full flow: initiate → redirect → webhook → membership activation. Edge cases: Network failures, expired transactions, insufficient funds.",
  monitoringStrategy:
    "Dashboard: Chapa merchant dashboard. Webhook health: Monitor delivery success rate. Reconciliation: Daily cron job comparing payment_requests vs Chapa transactions. Alerts: Webhook failure alerts.",
  backupDisasterRecovery:
    "Transaction logs: Maintain local copy of all transactions in Supabase. Reconciliation: Daily automated reconciliation. Receipts: Store PDF receipts in Supabase Storage. Disaster: Polling mechanism if webhooks fail.",
  deploymentStrategy:
    "CI/CD: Include payment route tests in GitHub Actions. Env vars: Different Chapa keys for sandbox/production. Staging: Test with Chapa sandbox. Production: Switch to live keys, verify webhook URLs.",
  commonPitfalls: [
    {
      issue: "Trusting client-side success callback instead of webhook",
      solution:
        "Never activate membership based on client-side redirect. Always verify server-side webhook.",
    },
    {
      issue: "Not handling webhook retries causing duplicate processing",
      solution:
        "Make webhook handlers idempotent: check if tx_ref already processed before processing again.",
    },
    {
      issue: "Missing idempotency — same payment initialized twice",
      solution:
        "Always generate and pass an idempotency_key header. Store it in DB and check before creating new transactions.",
    },
  ],
  scalabilityPatterns: [
    "Queue-based webhook processing to handle payment spikes during promotions",
    "Database read replicas for payment reconciliation queries",
    "CDN-cached payment success pages",
    "Rate limiter on payment initiation endpoints",
  ],
  costOptimization:
    "Chapa charges 3.5% + 5 ETB per transaction. Batch smaller payments into weekly billing. Use Telebirr directly (1%) via Chapa's unified API. For international, use PayPal (3.49% + $0.49).",
};
