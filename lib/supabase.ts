// ─── Supabase browser client ─────────────────────────
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== "undefined") {
      console.warn(
        "Supabase: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
      );
    }
    // Return a minimal no-op stub so the app doesn't crash
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
          order: () => ({ limit: noop, maybeSingle: noop }),
        }),
        insert: () => ({ select: () => ({ single: noop }) }),
        update: () => ({ eq: () => ({ select: noop }) }),
      }),
      storage: {
        from: () => ({
          upload: noop,
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
