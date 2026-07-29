// ─── Supabase server (admin) client ─────────────────
// Uses the service role key when available for admin operations
// that need to bypass RLS (approve/reject payments, etc.).
// Falls back to the anon key + user session for regular operations.
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ── Service-role client (bypasses RLS) ──────────────
// Used for admin operations: approving payments, managing memberships.
let _serviceClient: ReturnType<typeof createClient> | null = null;

function getServiceClient() {
  if (_serviceClient) return _serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _serviceClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _serviceClient;
}

// ── Authenticated server client (respects RLS) ──────
// Used for regular API routes where we need the user's session.
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const noop = async () => ({
      data: null,
      error: { message: "Supabase not configured" },
    });
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOAuth: async () => ({
          data: { provider: null, url: "" },
          error: { message: "Supabase not configured" },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: noop,
            maybeSingle: noop,
            order: () => ({ limit: noop }),
          }),
          order: () => ({
            limit: noop,
            maybeSingle: noop,
          }),
        }),
        insert: () => ({ select: () => ({ single: noop }) }),
        update: () => ({ eq: () => ({ select: noop }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({
            data: null,
            error: { message: "Supabase not configured" },
          }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
      rpc: () => noop,
    } as any;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignore — middleware handles session refresh
        }
      },
    },
  });
}

// ── Admin service client (bypasses RLS) ─────────────
// Use this ONLY for admin write operations (approve, reject, create membership).
// Returns null if SERVICE_ROLE_KEY is not configured.
export function getAdminServiceClient() {
  return getServiceClient();
}
