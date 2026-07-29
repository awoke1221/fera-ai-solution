// ─── Advanced Production Guides — Per-Tool Deep Dives ──
// Architecture patterns, security, performance, testing,
// monitoring, deployment strategies, code examples, and
// common pitfalls for each supported tool.

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

export const advancedGuides: Record<string, AdvancedGuide> = {
  // ────────────────────────────────────────────────
  // FRONTEND
  // ────────────────────────────────────────────────
  nextjs: {
    toolId: "nextjs",
    architecturePatterns: [
      "App Router with Route Groups for scalable page organization",
      "Server Components by default — minimize 'use client' to client-leaf components only",
      "BFF (Backend-for-Frontend) pattern using Next.js API routes as thin proxy layer",
      "ISR (Incremental Static Regeneration) for content that changes periodically",
      "Streaming SSR with Suspense boundaries for progressive page loading",
      "Module Federation for micro-frontend architecture in enterprise apps",
      "Monorepo pattern with Turborepo for shared UI components and types",
    ],
    securityBestPractices: [
      "Never expose Supabase service_role_key in client components — use API routes",
      "Implement middleware.ts for route protection — check auth tokens before page load",
      "Use Server Actions with input validation (Zod) to prevent CSRF and injection attacks",
      "Set security headers via next.config.js: Content-Security-Policy, X-Frame-Options, etc.",
      "Sanitize user-generated content with DOMPurify before rendering dangerouslySetInnerHTML",
      "Implement rate limiting on API routes using Upstash Ratelimit",
      "Use NextAuth/Auth.js middleware for protected pages — never rely solely on client-side checks",
      "Enable trusted hosts in next.config.js to prevent host header injection",
    ],
    performanceOptimizations: [
      "Use next/image with remotePatterns for automatic WebP/AVIF conversion and lazy loading",
      "Implement React.lazy and dynamic imports for heavy components (charts, editors, maps)",
      "Leverage ISR with on-demand revalidation via revalidateTag() for instant content updates",
      "Use Streaming with loading.js and Suspense for non-blocking UI rendering",
      "Optimize bundle with @next/bundle-analyzer — identify and remove dead code",
      "Enable gzip/brotli compression on reverse proxy (Nginx/Cloudflare)",
      "Use next/font with preload for critical fonts — eliminates layout shift",
      "Cache API responses with stale-while-revalidate pattern at edge/CDN level",
      "Implement route prefetching only for above-the-fold links",
    ],
    productionConfigs: [
      {
        title: "Production next.config.js with Security Headers",
        code: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
  headers: async () => [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ],
  }],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
  },
};`,
        description:
          "Production-ready Next.js config with security, image optimization, and package bundling.",
      },
      {
        title: "Middleware for Auth Protection",
        code: `// middleware.ts
import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  const protectedPaths = ['/dashboard', '/admin', '/membership']
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p))
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}`,
        description:
          "Protect routes at the edge before the page loads — no flash of unauthorized content.",
      },
      {
        title: "Rate Limiting for API Routes",
        code: `// app/api/chat/route.ts
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit:chat',
})

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { success, limit, remaining, reset } = await ratelimit.limit(user.id)
  if (!success) {
    return Response.json({
      error: 'Rate limit exceeded',
      limit, remaining, reset: new Date(reset).toISOString(),
    }, { status: 429, headers: { 'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0', 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } })
  }
  // ... handle the request
}`,
        description:
          "Production rate limiting with proper rate limit headers for client-side handling.",
      },
    ],
    codeExamples: [
      {
        title: "Optimized Server Component with Suspense",
        code: `// app/courses/page.tsx — Server Component (no 'use client')
import { Suspense } from 'react'
import { CoursesList } from './courses-list'
import { CoursesSkeleton } from './courses-skeleton'

export const metadata = { title: 'Courses' }
export const revalidate = 3600 // ISR: revalidate hourly

export default async function CoursesPage() {
  return (
    <div>
      <h1 className="h-display">All Courses</h1>
      <Suspense fallback={<CoursesSkeleton count={6} />}>
        <CoursesList />
      </Suspense>
    </div>
  )
}

// app/courses/courses-list.tsx
async function CoursesList() {
  const courses = await fetchCoursesFromDB() // DB call happens on server
  return (
    <div className="courses-grid">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}`,
        language: "typescript",
      },
      {
        title: "Server Action with Zod Validation",
        code: `'use server'
import { z } from 'zod'
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const CreateCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive().multipleOf(0.01),
  categoryId: z.string().uuid(),
})

export async function createCourse(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = CreateCourseSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    categoryId: formData.get('categoryId'),
  })

  const { data, error } = await supabase
    .from('courses').insert({ ...validated, creator_id: user.id })
    .select().single()

  if (error) throw new Error(error.message)
  revalidatePath('/courses')
  return data
}`,
        language: "typescript",
      },
    ],
    testingStrategy:
      "Unit: Jest + React Testing Library for component behavior, user interactions, and accessibility. Integration: MSW (Mock Service Worker) to intercept API calls — test full data flow. E2E: Playwright for critical user journeys: signup → browse → purchase → access content. Coverage: aim for 80%+ on business logic, 60%+ on UI components. Visual regression: Chromatic or Percy for UI snapshot testing across routes.",
    monitoringStrategy:
      "Runtime: Sentry for error tracking with source maps and user context. Performance: Vercel Analytics for Web Vitals (LCP, CLS, INP). Custom: PostHog for user behavior analytics and session replays. Health: Vercel Status Dashboard + Better Uptime for external monitoring. Alerts: Sentry + Slack integration for critical error notifications.",
    backupDisasterRecovery:
      "Source code: Git — always push to GitHub. Content/data: Supabase daily backups (Pro plan) + pg_dump weekly for self-hosted DB. Media: Supabase Storage is backed by S3 — versioning enabled. Configuration: Keep all env vars in Vercel dashboard + 1Password backup. DR plan: Vercel instant rollback (one-click), database point-in-time recovery (7-day retention on Pro).",
    deploymentStrategy:
      "Vercel: Automatic deployments from Git — every PR gets a preview URL. Branch-based: main → production, develop → staging. Zero-downtime with instant rollback. For custom domain: configure DNS with Vercel nameservers. Edge Functions for low-latency global execution. For self-hosted: Docker build → Nginx reverse proxy → PM2 process manager → GitHub Actions CI/CD.",
    commonPitfalls: [
      {
        issue:
          "Overusing 'use client' — putting everything in client components",
        solution:
          "Only use 'use client' for interactive elements. Keep data fetching and static content in Server Components.",
      },
      {
        issue:
          "Not using ISR for dynamic content — hitting DB on every request",
        solution:
          "Use revalidate or on-demand ISR with revalidateTag() to cache pages and update only when content changes.",
      },
      {
        issue: "Large bundle sizes from heavy libraries",
        solution:
          "Use next/dynamic for code splitting. Check bundle with @next/bundle-analyzer. Use optimizePackageImports in config.",
      },
      {
        issue: "Missing error boundaries — whole page crashes from one error",
        solution:
          "Wrap interactive sections in error boundaries. Use global error.tsx + not-found.tsx.",
      },
      {
        issue:
          "Not configuring image remotePatterns — next/image breaks on external domains",
        solution:
          "Always add all external image hosts to remotePatterns in next.config.js.",
      },
    ],
    scalabilityPatterns: [
      "Horizontal scaling: Vercel auto-scales across edge regions — no configuration needed",
      "Database: Connection pooling via Supabase PgBouncer, read replicas for analytics queries",
      "Caching: Multi-tier — CDN (Vercel Edge) → ISR cache → Redis (Upstash) → Database",
      "Background jobs: Use Vercel Cron Jobs or BullMQ with Upstash Redis for async processing",
      "CDN: Vercel Edge Network serves static assets from 100+ locations globally",
    ],
    costOptimization:
      "Start on Vercel Hobby (free) — upgrade to Pro ($20/mo) when you need team features or 10s+ function timeout. Use ISR aggressively to reduce serverless function invocations. Optimize images to reduce bandwidth costs. For database, Supabase Free (500MB) is enough for prototyping — Pro ($25/mo) at scale. Consider Bunny CDN for video-heavy apps instead of Supabase Storage for bandwidth cost savings.",
  },

  supabase_db: {
    toolId: "supabase_db",
    architecturePatterns: [
      "Row Level Security (RLS) as the primary auth layer — enforce data access at database level",
      "PostgreSQL schema design with proper normalization + strategic denormalization for read-heavy queries",
      "Real-time subscriptions with Realtime Server — ideal for chat, notifications, live collaboration",
      "Materialized views for complex analytics queries — refresh periodically with pg_cron",
      "Database functions + triggers for business logic that must be atomic (e.g., updating balances)",
      "GraphQL-style API via pg_graphql extension for flexible frontend queries",
      "Multi-tenant architecture using RLS with tenant_id column pattern — each user sees only their data",
    ],
    securityBestPractices: [
      "Enable RLS on EVERY table — no exceptions. Default: deny all, then grant specific policies",
      "Use service_role key ONLY in server-side code (API routes, cron jobs) — never expose to client",
      "Implement multi-factor authentication via Supabase Auth — require for admin accounts",
      "Audit logging: create a table for sensitive operations (payment approvals, account changes)",
      "Use parameterized queries or Supabase JS SDK — never concatenate user input into SQL strings",
      "Set up network restrictions: restrict DB access to specific IP ranges in Supabase dashboard",
      "Encrypt sensitive columns at application level (e.g., PII data) before storing",
      "Regular security audits: run supabase/audit SQL to review RLS policies and permissions",
    ],
    performanceOptimizations: [
      "Add composite indexes on frequently queried columns: (user_id, created_at), (status, created_at)",
      "Use pg_stat_statements to identify slow queries — enable in Supabase dashboard",
      "Implement connection pooling via Supabase's built-in PgBouncer (transaction mode recommended)",
      "Materialized views for dashboards and reports — refresh during off-peak hours",
      "Use EXPLAIN ANALYZE before deploying new queries — aim for sequential scans only on small tables",
      "Batch inserts with .insert(array) instead of individual inserts — reduces round trips",
      "Consider partitioning large tables (logs, events) by date range for query performance",
      "Use JSONB columns for flexible schemas BUT create GIN indexes for query performance",
    ],
    productionConfigs: [
      {
        title: "RLS Policy Example — Multi-tenant Data Access",
        code: `-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON public.courses
FOR SELECT
USING (creator_id = auth.uid());

-- Only admins can update any course
CREATE POLICY "Admins can update any course"
ON public.courses
FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- For membership: users can view their own active membership
CREATE POLICY "Users view own membership"
ON public.memberships
FOR SELECT
USING (
  auth.uid() = user_id 
  AND is_active = true 
  AND end_date > now()
);`,
        description:
          "RLS policies that enforce data isolation between users and grant admins full access.",
      },
      {
        title: "Optimized Schema with Indexes",
        code: `-- Courses table with strategic indexes
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_courses_creator_status ON public.courses(creator_id, status);
CREATE INDEX idx_courses_category_status ON public.courses(category_id, status) WHERE status = 'published';
CREATE INDEX idx_courses_created_desc ON public.courses(created_at DESC);
CREATE INDEX idx_courses_metadata ON public.courses USING GIN(metadata);
CREATE INDEX idx_courses_search ON public.courses USING GIN(to_tsvector('english', title || ' ' || description));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,
        description:
          "Production schema with strategic indexes for filtering, sorting, search, and JSONB queries.",
      },
      {
        title: "Real-time Subscription Setup",
        code: `'use client'
import { createClientComponentClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function useRealtimeMessages(channelId: string) {
  const supabase = createClientComponentClient()
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // Initial fetch
    supabase.from('messages').select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .then(({ data }) => data && setMessages(data))

    // Subscribe to new messages
    const channel = supabase
      .channel(\`messages:\${channelId}\`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages',
          filter: \`channel_id=eq.\${channelId}\` },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages',
          filter: \`channel_id=eq.\${channelId}\` },
        (payload) => {
          setMessages(prev => prev.map(m =>
            m.id === payload.new.id ? { ...m, ...payload.new } : m
          ))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [channelId])

  return messages
}`,
        description:
          "Real-time message subscription with automatic cleanup on unmount.",
      },
    ],
    codeExamples: [
      {
        title: "Server-side DB Query with RLS",
        code: `import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getCourses(options: {
  category?: string; status?: string; page?: number; limit?: number
}) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  let query = supabase.from('courses').select('*', { count: 'exact' })

  if (options.category) query = query.eq('category_id', options.category)
  if (options.status) query = query.eq('status', options.status)
  
  const page = options.page || 1
  const limit = Math.min(options.limit || 20, 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return {
    data: data || [],
    pagination: {
      page, limit, total: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    }
  }
}`,
        language: "typescript",
      },
      {
        title: "Transaction: Create Order with Inventory Check",
        code: `// Using Supabase RPC for atomic transactions
export async function createOrder(
  userId: string, items: { productId: string; quantity: number }[]
) {
  const { data, error } = await supabase.rpc('create_order', {
    p_user_id: userId,
    p_items: items,
  })
  if (error) throw error
  return data
}

-- SQL function — atomic, rolls back on failure
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID, p_items JSONB
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_total DECIMAL(10,2) := 0;
  v_stock INTEGER;
BEGIN
  INSERT INTO orders (user_id, status, total)
  VALUES (p_user_id, 'pending', 0) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT stock_quantity INTO v_stock
    FROM products WHERE id = (v_item->>'productId')::UUID FOR UPDATE;
    
    IF v_stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'productId';
    END IF;

    INSERT INTO order_items (order_id, product_id, quantity, price)
    SELECT v_order_id, id, (v_item->>'quantity')::INT, price
    FROM products WHERE id = (v_item->>'productId')::UUID;

    UPDATE products SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT
    WHERE id = (v_item->>'productId')::UUID;

    v_total := v_total + ((v_item->>'quantity')::INT * (SELECT price FROM products WHERE id = (v_item->>'productId')::UUID));
  END LOOP;

  UPDATE orders SET total = v_total WHERE id = v_order_id;
  RETURN jsonb_build_object('order_id', v_order_id, 'total', v_total);
END; $$;`,
        language: "sql",
      },
    ],
    testingStrategy:
      "Unit: Test RLS policies with supabase-js in test environment — create test users with different roles and verify data isolation. Integration: Use local Supabase CLI for isolated test DB with migrations. E2E: Playwright tests with real auth flows — signup, login, access protected data. Performance: Load test with k6 — simulate concurrent users querying the database, monitor pg_stat_activity for connection pool saturation. Data integrity: Write tests that verify constraints, triggers, and cascading deletes work correctly.",
    monitoringStrategy:
      "Supabase Dashboard: Built-in query performance monitoring, API usage, database size tracking. pg_stat_statements: Top slow queries — review weekly. Logs: Supabase logs for auth events, API errors, and webhook failures. Custom: Log slow queries (>100ms) to a monitoring table for analysis. Alerts: Set up webhook notifications for database size >80% of plan limit.",
    backupDisasterRecovery:
      "Supabase Pro: Daily automated backups with 7-day retention. Point-in-time recovery (PITR) available. Strategy: Schedule weekly pg_dump to external storage (S3/Backblaze) for long-term retention. Test backups monthly by restoring to a separate project. For critical data, implement a write-ahead log (WAL) archival to S3. Disaster plan: Have a secondary Supabase project ready to restore into — update environment variables for instant failover.",
    deploymentStrategy:
      "Migrations: Use Supabase CLI for local DB migrations — commit to Git. Branching: Supabase database branching for preview deployments — each PR gets its own DB branch. CI/CD: Run migrations automatically in GitHub Actions using supabase link + supabase db push. Production changes: Use Supabase dashboard for production — always test on a branch first. For self-hosted: Use pg_migrate or Sqitch for version-controlled schema changes.",
    commonPitfalls: [
      {
        issue:
          "Not enabling RLS on all tables — data accessible without authentication",
        solution:
          "Enable RLS on EVERY table by default. Create at least a 'deny all' policy for new tables until proper policies are written.",
      },
      {
        issue:
          "N+1 queries from client-side fetching — e.g., fetching courses then individually fetching each creator",
        solution:
          "Use Supabase .select() with joins: .select('*, creator:profiles!inner(*)'). Use server-side data fetching with a single query.",
      },
      {
        issue:
          "Over-fetching large JSONB columns — returning entire metadata when only 2 fields needed",
        solution:
          "Use .select() to specify exactly which columns and JSONB paths you need. Never use .select('*') in production API routes.",
      },
      {
        issue: "Exceeding free tier limits (500MB DB, 50K MAU) unexpectedly",
        solution:
          "Set up usage alerts in Supabase dashboard. Monitor database size weekly. Set up webhook notifications for approaching limits.",
      },
      {
        issue:
          "Inefficient RLS policies causing slow queries — policy runs per-row check on large tables",
        solution:
          "Use indexed columns in RLS policies. Test policies with EXPLAIN ANALYZE. Consider using security definer functions for complex auth logic.",
      },
    ],
    scalabilityPatterns: [
      "Connection pooling: Supabase PgBouncer (transaction mode) handles thousands of concurrent connections",
      "Read replicas (Pro+): Offload analytics/reporting queries to read replicas — keep primary for writes",
      "Materialized views: Pre-compute expensive joins and aggregations for dashboard queries",
      "Sharding: For multi-tenant apps at massive scale, consider schema-based sharding by region or tenant group",
      "Caching layer: Upstash Redis in front of frequently accessed data — reduces DB load by 60-80%",
      "Warm standby: Supabase Pro includes automated failover to standby in case of region outage",
    ],
    costOptimization:
      "Start on Supabase Free (500MB DB, 50K MAU). At scale: Pro ($25/mo) for 8GB DB and 100K MAU. To reduce cost: Implement aggressive caching with Redis — reduces database read operations. Archive old data to cold storage. Use RLS instead of a separate auth microservice. Consider self-hosted Supabase for massive scale ($0 infra cost but DevOps overhead). Monitor pg_stat_statements for expensive queries — optimize before they cost you.",
  },

  // ────────────────────────────────────────────────
  // CHAPA — Ethiopian Payment Gateway (special focus)
  // ────────────────────────────────────────────────
  chapa: {
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
  
  // Verify webhook signature
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

  // Log webhook for audit trail
  await supabase.from('webhook_logs').insert({
    provider: 'chapa',
    event_type: event.event,
    payload: event,
    received_at: new Date().toISOString(),
  })

  if (event.event === 'charge.success') {
    const { tx_ref, amount, currency, status } = event.data

    // Use DB transaction for atomic operation
    const { error } = await supabase.rpc('process_payment_success', {
      p_tx_ref: tx_ref,
      p_amount: amount,
      p_currency: currency,
    })

    if (error) {
      console.error('Payment processing failed:', error)
      return Response.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}`,
        description:
          "Secure webhook handler with HMAC verification and atomic payment processing.",
      },
      {
        title: "Chapa Payment Initiation with Idempotency",
        code: `// app/api/payments/create/route.ts
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const { planId, userId, email, amount } = await req.json()
  const idempotencyKey = randomUUID()
  const txRef = \`TX-\${Date.now()}-\${randomUUID().slice(0, 8)}\`

  const chapaPayload = {
    amount: String(amount),
    currency: 'ETB',
    email,
    first_name: email.split('@')[0],
    tx_ref: txRef,
    callback_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chapa\`,
    return_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/membership/success?tx_ref=\${txRef}\`,
    customization: { title: 'Membership Payment' },
  }

  const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.CHAPA_SECRET_KEY}\`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(chapaPayload),
  })

  const data = await response.json()

  // Store pending payment in database
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  await supabase.from('payment_requests').insert({
    user_id: userId, plan_id: planId, amount, currency: 'ETB',
    payment_method: 'chapa', tx_ref: txRef,
    status: 'pending', idempotency_key: idempotencyKey,
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
      // 1. Upload screenshot
      const fileExt = file.name.split('.').pop()
      const filePath = \`payments/\${Date.now()}-\${Math.random().toString(36).slice(2)}.\${fileExt}\`
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots').upload(filePath, file)
      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots').getPublicUrl(filePath)

      // 3. Create payment request
      const res = await fetch('/api/membership/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, amount, screenshotUrl: publicUrl }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }, [file, planId, amount, supabase])

  if (submitted) {
    return (
      <div className="success-message">
        ✅ Payment request submitted! Admin will review and activate your membership.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="manual-payment-form">
      <p>Amount to pay: <strong>{amount} ETB</strong></p>
      <p className="bank-details">
        Bank: Commercial Bank of Ethiopia<br />
        Account: 1234567890<br />
        Name: Fera AI Solutions
      </p>
      <div className="field">
        <label>Upload payment screenshot/receipt</label>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
      </div>
      <button type="submit" className="btn solid" disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Submit Payment Request'}
      </button>
    </form>
  )
}`,
        language: "typescript",
      },
    ],
    testingStrategy:
      "Sandbox: Use Chapa test mode (sandbox.chapa.co) for development. Test all webhook events by sending test payloads. Webhook testing: Use ngrok to expose local server for webhook testing. Integration: Test the full flow: initiate payment → redirect to Chapa → webhook callback → membership activation. Edge cases: Test network failures (webhook retries), expired transactions, insufficient funds responses.",
    monitoringStrategy:
      "Dashboard: Chapa merchant dashboard for transaction monitoring, settlements, and dispute management. Webhook health: Monitor webhook delivery success rate — Chapa retries failed webhooks up to 3 times. Reconciliation: Daily cron job that compares payment_requests table with Chapa transactions. Alerts: Set up webhook failure alerts — if webhook handler returns 5xx, trigger notification. Fraud monitoring: Flag rapid repeated payment attempts from the same user/IP.",
    backupDisasterRecovery:
      "Transaction logs: Maintain a local copy of all payment transactions in Supabase payment_requests table. Reconciliation: Daily automated reconciliation between local records and Chapa dashboard. Receipts: Store PDF receipts in Supabase Storage for customer reference. Disaster: If Chapa webhooks fail, implement a polling mechanism that checks transaction status every 5 minutes.",
    deploymentStrategy:
      "CI/CD: Include payment route tests in GitHub Actions — verify webhook handler responds correctly. Environment variables: Chapa secret keys differ between sandbox and production — use Vercel environment variables per branch. Staging: Test payments with Chapa sandbox on preview deployments. Production: Switch to Chapa live keys and verify webhook URLs point to production domain.",
    commonPitfalls: [
      {
        issue: "Trusting client-side success callback instead of webhook",
        solution:
          "Never activate membership based on client-side redirect. Always wait for and verify the server-side webhook.",
      },
      {
        issue:
          "Not handling webhook retries — Chapa retries failed webhooks, causing duplicate processing",
        solution:
          "Make webhook handlers idempotent: check if tx_ref already processed before processing again.",
      },
      {
        issue:
          "Missing idempotency — same payment initialized twice on network error",
        solution:
          "Always generate and pass an idempotency_key header. Store it in database and check before creating new transactions.",
      },
      {
        issue: "ETB/USD confusion — charging in wrong currency",
        solution:
          "Always explicitly set currency: 'ETB' for Ethiopian payments. Use separate flows for international vs local payments.",
      },
    ],
    scalabilityPatterns: [
      "Queue-based webhook processing to handle payment spikes during promotions",
      "Database read replicas for payment reconciliation queries — avoid slowing down the primary DB",
      "CDN-cached payment success pages — served instantly after webhook processing",
      "Rate limiter on payment initiation endpoints — prevent abuse during flash sales",
    ],
    costOptimization:
      "Chapa charges 3.5% + 5 ETB per local transaction. To reduce costs: Batch smaller payments into weekly billing. Use Telebirr directly (1%) for users who prefer it — integrate through Chapa's unified API. For international payments, use PayPal (3.49% + $0.49) which may be cheaper than Chapa's international card rate (5%). Implement automated reconciliation to catch and dispute erroneous charges.",
  },

  // ────────────────────────────────────────────────
  // NODE.JS + EXPRESS
  // ────────────────────────────────────────────────
  node: {
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

// Validate environment variables on startup
validateEnv()

const app = express()
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  connectionTimeout: 10_000,
})

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // preflight cache for 24h
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 req per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}))

// Request logging
app.use(requestLogger)

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/payments', paymentRoutes)

// Error handler (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
  prisma.$connect().then(() => console.log('DB connected'))
})

export default app`,
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
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) { super(message) }
}

export function errorHandler(
  err: Error, req: Request, res: Response, next: NextFunction
) {
  // Log error
  console.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
  })

  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: 'APP_ERROR',
    })
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Resource already exists',
        code: 'UNIQUE_CONSTRAINT',
      })
    }
  }

  // Unknown errors — don't leak details in production
  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  })
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
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
  ) {}

  async getPublishedCourses(page = 1, limit = 20) {
    const cacheKey = \`courses:published:\${page}:\${limit}\`
    
    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { status: 'published' },
        include: {
          creator: { select: { id: true, full_name: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.course.count({ where: { status: 'published' } }),
    ])

    const result = {
      data: courses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }

    // Cache for 5 min
    await this.redis.setex(cacheKey, 300, JSON.stringify(result))
    return result
  }

  async createCourse(data: Prisma.CourseCreateInput) {
    const course = await this.prisma.course.create({ data })
    // Invalidate list cache
    await this.redis.del('courses:published:*')
    return course
  }
}`,
        language: "typescript",
      },
    ],
    testingStrategy:
      "Unit: Vitest/Jest for service layer with mocked Prisma and Redis. Integration: Supertest for API endpoint testing with test database (separate PostgreSQL instance). E2E: Playwright for full-stack tests. Contract: Test API contracts with openapi-enforcer. Load: k6 for endpoint load testing — identify bottlenecks. Coverage: 90%+ on service layer, 70%+ on controllers. CI: Run tests in GitHub Actions with Docker PostgreSQL.",
    monitoringStrategy:
      "APM: Use Sentry for Node.js — track transaction performance, database query times, and error rates. Metrics: Prometheus + Grafana for custom metrics (request rate, error rate, p95/p99 latency). Logging: Pino or Winston for structured JSON logging — ship to Logtail or Papertrail. Health checks: /health endpoint returning DB + Redis + external service status. Alerts: PagerDuty for 5xx error rate >1% or latency >1s p95.",
    backupDisasterRecovery:
      "Database: Automated PostgreSQL backups + WAL archival for point-in-time recovery. Code: Git — always pushed to GitHub. Configuration: All env vars in 1Password + CI/CD secrets. Session data: If using Redis sessions — configure Redis persistence (RDB/AOF). Disaster plan: Have infrastructure-as-code (Docker Compose or Terraform) ready to spin up new instance. Runbook: Document manual recovery steps in project README.",
    deploymentStrategy:
      "PM2 cluster mode with --instances=max for CPU utilization. Docker: Multi-stage build for small image size. Nginx reverse proxy with SSL termination and gzip. CI/CD: GitHub Actions → build Docker image → push to registry → SSH deploy. Blue-green deployment: Maintain two server instances — swap traffic after health check passes. Zero-downtime: Use PM2 reload (graceful) or Kubernetes rolling updates.",
    commonPitfalls: [
      {
        issue: "Blocking the event loop with CPU-intensive operations",
        solution:
          "Use worker_threads, child_process, or offload to BullMQ queue. Never use sync fs.readFileSync, crypto, etc. in request handlers.",
      },
      {
        issue: "Unhandled promise rejections crashing the process",
        solution:
          "Always use .catch() or try/catch on async operations. Register process.on('unhandledRejection') handler.",
      },
      {
        issue: "Memory leaks from closures and event listeners",
        solution:
          "Use --inspect for heap snapshots. Monitor memory with process.memoryUsage(). Clean up event listeners on route disposal.",
      },
      {
        issue: "Prisma connection exhaustion under load",
        solution:
          "Configure connection_limit and pool_timeout in Prisma datasource. Use PgBouncer in transaction mode.",
      },
    ],
    scalabilityPatterns: [
      "Horizontal: PM2 cluster mode or Docker containers behind Nginx load balancer",
      "Vertical: Increase Node.js memory limit with --max-old-space-size flag",
      "Queue-based: BullMQ with Redis for async task processing (email, reports)",
      "Read replicas: Separate read/write Prisma instances — reads go to replica",
      "Microservices: Split monolithic Express app into separate services by domain",
      "Serverless migration path: Refactor Express routes to serverless functions when needed",
    ],
    costOptimization:
      "Start with a single $5-10 VPS (DigitalOcean/Linode) running PM2 cluster. Add Redis ($5/mo Upstash free tier) for caching. Use Render free tier for staging environments. At scale: Railway ($5-20/mo) for managed hosting with auto-scaling. For Ethiopian hosting: Habesha Host VPS ($10-30/mo) for local data residency. Monitor with free Sentry tier (5K events/mo) initially.",
  },

  // ────────────────────────────────────────────────
  // UPSTASH REDIS — Caching & Rate Limiting
  // ────────────────────────────────────────────────
  redis_upstash: {
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

// Initialize with environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  automaticDeserialization: false, // handle JSON manually for control
})

// Cache helper with typed generics
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) {
    try { return JSON.parse(cached as string) } catch { /* fall through */ }
  }
  
  const data = await fetchFn()
  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds })
  return data
}

// Invalidate cache by pattern
export async function invalidatePattern(pattern: string) {
  let cursor = 0
  do {
    const result = await redis.scan(cursor, { match: pattern, count: 100 })
    cursor = result[0] as unknown as number
    const keys = result[1] as string[]
    if (keys.length > 0) await redis.del(...keys)
  } while (cursor !== 0)
}

// API rate limiter
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit:api',
})

// Stricter limiter for auth endpoints
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
})`,
        description:
          "Production Redis caching layer with typed helpers and rate limiters.",
      },
      {
        title: "Session Storage for Serverless",
        code: `import { Redis } from '@upstash/redis'
import { cookies } from 'next/headers'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export class SessionStore {
  static async get(sessionId: string) {
    const data = await redis.get(\`session:\${sessionId}\`)
    return data ? JSON.parse(data as string) : null
  }

  static async set(sessionId: string, data: Record<string, unknown>, ttl = 86400) {
    await redis.set(\`session:\${sessionId}\`, JSON.stringify(data), { ex: ttl })
  }

  static async destroy(sessionId: string) {
    await redis.del(\`session:\${sessionId}\`)
  }

  static async touch(sessionId: string, ttl = 86400) {
    await redis.expire(\`session:\${sessionId}\`, ttl)
  }
}

// Usage in middleware:
// const sessionId = cookies().get('session_id')?.value
// const session = await SessionStore.get(sessionId)`,
        description:
          "Session store using Upstash Redis REST API — works in edge/serverless environments.",
      },
    ],
    codeExamples: [
      {
        title: "Distributed Lock for Critical Operations",
        code: `import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function withLock<T>(
  lockKey: string,
  ttlMs: number,
  fn: () => Promise<T>,
  retryDelayMs = 100,
  maxRetries = 10,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const acquired = await redis.set(
      \`lock:\${lockKey}\`,
      'locked',
      { nx: true, px: ttlMs }
    )
    
    if (acquired === 'OK') {
      try {
        return await fn()
      } finally {
        await redis.del(\`lock:\${lockKey}\`)
      }
    }
    
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, retryDelayMs * (attempt + 1)))
    }
  }
  
  throw new Error(\`Could not acquire lock for \${lockKey}\`)
}

// Usage: prevent double-processing of payment webhooks
// await withLock(\`payment:\${txRef}\`, 30000, async () => {
//   await processPayment(txRef)
// })`,
        language: "typescript",
      },
      {
        title: "Leaderboard with Sorted Sets",
        code: `import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export class Leaderboard {
  constructor(private name: string) {}

  async addScore(userId: string, score: number) {
    await redis.zadd(\`leaderboard:\${this.name}\`, { score, member: userId })
  }

  async incrementScore(userId: string, increment: number) {
    await redis.zincrby(\`leaderboard:\${this.name}\`, increment, userId)
  }

  async getTop(n: number) {
    const results = await redis.zrange<string[]>(
      \`leaderboard:\${this.name}\`, 0, n - 1, { rev: true, withScores: true }
    )
    // Returns [member, score, member, score, ...]
    const entries = []
    for (let i = 0; i < results.length; i += 2) {
      entries.push({ userId: results[i], score: Number(results[i + 1]) })
    }
    return entries
  }

  async getUserRank(userId: string) {
    const rank = await redis.zrevrank(\`leaderboard:\${this.name}\`, userId)
    return rank !== null ? rank + 1 : null
  }
}

// Usage:
// const leaderboard = new Leaderboard('course-completions')
// await leaderboard.incrementScore(userId, 1)
// const top10 = await leaderboard.getTop(10)`,
        language: "typescript",
      },
    ],
    testingStrategy:
      "Unit: Mock Redis client for service tests — test caching logic without real Redis. Integration: Use Upstash free tier for integration testing with real Redis operations. Rate limiter: Test sliding window behavior — verify limits reset correctly. Cache invalidation: Test that cache clears on data mutation. Load: Verify Redis handles high concurrency without connection exhaustion. Use redis-compatible mock (ioredis-mock) for local development.",
    monitoringStrategy:
      "Upstash Dashboard: Built-in monitoring for commands executed, keyspace, latency, and bandwidth usage. Custom: Track cache hit ratio — log via custom metric to your monitoring system. Rate limiter: Monitor how many requests hit the rate limit — adjust limits based on real usage. Alerts: Set up threshold alerts for approaching free tier limits (10K commands/day on free). Latency: Monitor p99 Redis response time — should be <10ms.",
    backupDisasterRecovery:
      "Upstash handles data persistence automatically — daily backups with 7-day retention. For critical data, implement dual-write pattern: write to both Redis and database. Redis is a cache — losing it should not cause data loss, only performance degradation. Warm the cache after restart by serving first few requests from DB and populating cache. For self-hosted Redis: enable AOF persistence with fsync every second.",
    deploymentStrategy:
      "Upstash REST API works everywhere — no VPC or network configuration needed. Environment variables: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. For serverless: Use Upstash directly — no persistent connection required. For self-hosted: Deploy Redis on same VPS as your app or as a managed service. Scaling: Upgrade Upstash plan for more commands/day. Consider global replication for multi-region apps.",
    commonPitfalls: [
      {
        issue: "No TTL on cache entries — stale data served indefinitely",
        solution:
          "Always set EX/TTL on every cache write. Use default TTLs per data type (e.g., 300s for API responses, 60s for user data).",
      },
      {
        issue:
          "Cache stampede — multiple requests simultaneously recomputing same cache",
        solution:
          "Use distributed locks (Redlock) or Upstash's built-in deduplication. First request computes, others wait.",
      },
      {
        issue: "Over-caching — caching uncacheable data (real-time, per-user)",
        solution:
          "Cache only data that changes infrequently and is shared across users. Use real-time subscriptions for live data.",
      },
      {
        issue: "Large values — storing >10KB entries degrades performance",
        solution:
          "Compress values with gzip before storing. Consider storing only summary data in Redis and full data in DB.",
      },
    ],
    scalabilityPatterns: [
      "Read replicas: Upstash offers global replication — read from closest region, write to primary",
      "Sharding: Split data across multiple Redis instances by domain (cache, sessions, queues, rate-limit)",
      "Connection pooling: Upstash REST API handles unlimited connections — no pool needed",
      "Persistence: RDB snapshots for fast restart, AOF for durability",
      "Redis Cluster: For self-hosted at massive scale — automatic sharding across nodes",
    ],
    costOptimization:
      "Upstash Free: 10K commands/day, 256MB — enough for most small-to-medium apps. Pro ($19/mo): 1M commands/day, 1GB. To save: Use smaller TTLs to reduce storage. Batch operations with pipelining. Cache only the most frequently accessed data. For self-hosted: Run Redis on same VPS as app ($0 additional cost). Use Upstash REST API initially — migrate to self-hosted when cost becomes a concern.",
  },

  // ────────────────────────────────────────────────
  // PLAYWRIGHT — Testing
  // ────────────────────────────────────────────────
  playwright: {
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
      "Use dedicated test accounts with limited permissions — never use production admin accounts",
      "Run tests in isolated test environment — never connect to production databases",
      "Sanitize test artifacts (screenshots, traces) before sharing — blur any PII",
    ],
    performanceOptimizations: [
      "Use webServer config to auto-start/stop dev server — saves manual setup time",
      "Enable fullyParallel: true for maximum test execution speed",
      "Use trace: 'on-first-retry' instead of always-on to save CI time",
      "Set reasonable timeouts per test (30s) and expect (10s) — avoid excessive waits",
      "Use test.use({ storageState }) to skip login in every test — saves 3-5s per test",
      "Leverage testProject dependencies — run setup tests before test suites",
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
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\\.setup\\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json', // reuse authenticated state
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: process.env.CI ? {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: false,
    timeout: 30_000,
  } : undefined,
})`,
        description:
          "Production Playwright config with parallel execution, retries, multiple browsers, and CI optimization.",
      },
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

  async goto() {
    await this.page.goto('/auth/login')
    await expect(this.emailInput).toBeVisible()
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectSuccess() {
    await expect(this.page).toHaveURL(/dashboard/)
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toBeVisible()
    await expect(this.errorMessage).toContainText(message)
  }
}

// e2e/specs/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'

test.describe('Login Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'correct-password')
    await loginPage.expectSuccess()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('wrong@email.com', 'wrong-password')
    await loginPage.expectError('Invalid login credentials')
  })
})`,
        description:
          "Page Object Model pattern for maintainable, reusable test code.",
      },
    ],
    codeExamples: [
      {
        title: "Setup: Authenticated Session",
        code: `// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import { LoginPage } from './pages/login-page'

const authFile = '.auth/user.json'

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(
    process.env.TEST_USER_EMAIL!,
    process.env.TEST_USER_PASSWORD!
  )
  await loginPage.expectSuccess()
  
  // Save authenticated state for reuse
  await page.context().storageState({ path: authFile })
})`,
        language: "typescript",
      },
      {
        title: "API Testing with Playwright",
        code: `// e2e/api/courses.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Courses API', () => {
  test('GET /api/courses returns paginated results', async ({ request }) => {
    const response = await request.get('/api/courses?page=1&limit=10')
    expect(response.ok()).toBeTruthy()
    
    const body = await response.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('pagination')
    expect(Array.isArray(body.data)).toBeTruthy()
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.limit).toBe(10)
  })

  test('POST /api/courses requires authentication', async ({ request }) => {
    const response = await request.post('/api/courses', {
      data: { title: 'Test Course' },
    })
    expect(response.status()).toBe(401)
  })

  test('rate limiting returns 429', async ({ request }) => {
    const requests = Array(20).fill(null).map(() =>
      request.get('/api/auth/login', {
        data: { email: 'test@test.com', password: 'wrong' }
      })
    )
    const responses = await Promise.all(requests)
    const tooManyRequests = responses.filter(r => r.status() === 429)
    expect(tooManyRequests.length).toBeGreaterThan(0)
  })
})`,
        language: "typescript",
      },
    ],
    testingStrategy:
      "This IS the testing strategy tool. Key approaches: Unit tests (Jest/Vitest) for business logic. Component tests (React Testing Library) for UI behavior. E2E tests (Playwright) for critical user flows. Visual regression (Playwright screenshot) for UI consistency. API tests (Playwright API testing) for backend endpoints. Accessibility tests (axe-core) for WCAG compliance. Performance tests (Lighthouse CI) for web vitals.",
    monitoringStrategy:
      "Test results: Playwright HTML reporter + CI dashboard (GitHub Actions). Flakiness tracking: Track flaky tests — retry 2x, quarantine consistently flaky tests. Coverage: Monitor test coverage with c8/istanbul — aim for 80%+ on business logic. Performance: Track test execution time — if CI test time exceeds 10 min, optimize parallelization. Alerts: Set up notifications for test suite failures in CI.",
    backupDisasterRecovery:
      "Test code is part of the codebase — backed up in Git. Test artifacts (screenshots, traces, videos) stored in CI for 30 days. Test data: seeded via API calls in setup — no persistent test data needed. If tests break: rollback to last passing commit and debug. Document common test failures and solutions in project wiki.",
    deploymentStrategy:
      "CI integration: Run Playwright tests in GitHub Actions after linting and type checking. Parallel: Run across 4+ shards for faster feedback. Web server: Start Next.js dev server with test database. Reporting: Publish HTML report as CI artifact. Pre-commit: Run only affected tests locally via --grep. Pre-merge: Run full suite with 3 browsers as required check.",
    commonPitfalls: [
      {
        issue:
          "Flaky tests due to timing — expecting element before it renders",
        solution:
          "Always use locator-based assertions with auto-waiting (toBeVisible, toHaveText). Never use page.waitForTimeout().",
      },
      {
        issue: "Tests passing locally but failing in CI",
        solution:
          "Use same Node.js version, browser versions, and timeouts in CI as local. Run with --headed locally to debug.",
      },
      {
        issue: "Slow tests from login in every test",
        solution:
          "Use storageState to reuse authentication. Set up auth once in a setup project and share across tests.",
      },
      {
        issue: "Brittle selectors breaking on UI changes",
        solution:
          "Use getByRole, getByLabel, getByTestId over CSS/XPath selectors. Add data-testid attributes to interactive elements.",
      },
    ],
    scalabilityPatterns: [
      "Sharding: Split test suite across multiple CI machines — each runs subset of tests",
      "Parallelism: Playwright runs test files in parallel by default — one worker per CPU core",
      "Project-based: Separate tests into projects (chromium, firefox, webkit) for targeted runs",
      "Cloud execution: Use Playwright Cloud or BrowserStack for massive parallel test matrices",
      "Selective: Run only changed/affected tests using playwright-test-deploy or similar",
    ],
    costOptimization:
      "Playwright is free and open-source — no licensing costs. CI minutes: Use sharding and parallelism to reduce total CI time. GitHub Actions: 2000 free minutes/month for private repos. Use trace: 'on-first-retry' to save storage. Limit browser matrix — test on Chromium primarily, Firefox/WebKit only for critical flows. Use Playwright's built-in test runner — no need for additional test frameworks.",
  },
};
