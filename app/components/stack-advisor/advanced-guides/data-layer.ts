// ─── Advanced Guide — Supabase (Data Layer) ──────────
import type { AdvancedGuide } from "../types";

export const supabaseGuide: AdvancedGuide = {
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
ON public.courses FOR SELECT
USING (creator_id = auth.uid());

-- Only admins can update any course
CREATE POLICY "Admins can update any course"
ON public.courses FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;`,
      description:
        "RLS policies that enforce data isolation between users and grant admins full access.",
    },
    {
      title: "Optimized Schema with Indexes",
      code: `CREATE TABLE public.courses (
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

CREATE INDEX idx_courses_creator_status ON public.courses(creator_id, status);
CREATE INDEX idx_courses_category_status ON public.courses(category_id, status) WHERE status = 'published';
CREATE INDEX idx_courses_created_desc ON public.courses(created_at DESC);
CREATE INDEX idx_courses_metadata ON public.courses USING GIN(metadata);
CREATE INDEX idx_courses_search ON public.courses USING GIN(to_tsvector('english', title || ' ' || description));`,
      description:
        "Production schema with strategic indexes for filtering, sorting, search, and JSONB queries.",
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

  return { data: data || [], pagination: { page, limit, total: count || 0, totalPages: count ? Math.ceil(count / limit) : 0 } }
}`,
      language: "typescript",
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
    supabase.from('messages').select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .then(({ data }) => data && setMessages(data))

    const channel = supabase
      .channel(\`messages:\${channelId}\`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: \`channel_id=eq.\${channelId}\` },
        (payload) => setMessages(prev => [...prev, payload.new])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [channelId])

  return messages
}`,
      language: "typescript",
    },
  ],
  testingStrategy:
    "Unit: Test RLS policies with supabase-js — create test users with different roles. Integration: Use local Supabase CLI for isolated test DB. E2E: Playwright tests with real auth flows. Load: k6 simulating concurrent users, monitoring pg_stat_activity for connection pool saturation.",
  monitoringStrategy:
    "Supabase Dashboard: Built-in query performance monitoring, API usage. pg_stat_statements: Review top slow queries weekly. Logs: Supabase logs for auth events, API errors. Custom: Log slow queries (>100ms).",
  backupDisasterRecovery:
    "Supabase Pro: Daily automated backups with 7-day retention + PITR. Strategy: Weekly pg_dump to external storage. Test backups monthly. Disaster plan: Secondary Supabase project ready for restore.",
  deploymentStrategy:
    "Migrations: Supabase CLI for local DB migrations — commit to Git. Branching: Database branching for preview deployments. CI/CD: GitHub Actions with supabase link + db push. Production: Test on branch first.",
  commonPitfalls: [
    {
      issue: "Not enabling RLS on all tables — data accessible without auth",
      solution:
        "Enable RLS on EVERY table. Create 'deny all' policy for new tables until proper policies are written.",
    },
    {
      issue: "N+1 queries from client-side fetching",
      solution:
        "Use Supabase .select() with joins. Use server-side data fetching with a single query.",
    },
    {
      issue: "Over-fetching large JSONB columns",
      solution:
        "Use .select() to specify exact columns and JSONB paths. Never use .select('*') in production API routes.",
    },
    {
      issue: "Exceeding free tier limits unexpectedly",
      solution:
        "Set up usage alerts in Supabase dashboard. Monitor database size weekly.",
    },
  ],
  scalabilityPatterns: [
    "Connection pooling: PgBouncer handles thousands of concurrent connections",
    "Read replicas (Pro+): Offload analytics queries to replicas",
    "Materialized views: Pre-compute expensive joins for dashboards",
    "Caching layer: Upstash Redis reduces DB load by 60-80%",
    "Warm standby: Automated failover on Supabase Pro",
  ],
  costOptimization:
    "Start on Supabase Free (500MB, 50K MAU). At scale: Pro ($25/mo) for 8GB DB. Implement aggressive Redis caching to reduce DB ops. Archive old data. Consider self-hosted Supabase at massive scale.",
};
