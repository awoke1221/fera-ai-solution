// ─── Advanced Guide — Next.js (Frontend) ──────────────
import type { AdvancedGuide } from "../types";

export const nextjsGuide: AdvancedGuide = {
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
      error: 'Rate limit exceeded', limit, remaining,
      reset: new Date(reset).toISOString(),
    }, { status: 429, headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0',
      'Retry-After': String(Math.ceil((reset - Date.now()) / 1000))
    }})
  }
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
  const courses = await fetchCoursesFromDB()
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
      issue: "Overusing 'use client' — putting everything in client components",
      solution:
        "Only use 'use client' for interactive elements. Keep data fetching and static content in Server Components.",
    },
    {
      issue: "Not using ISR for dynamic content — hitting DB on every request",
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
};
