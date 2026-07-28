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
    // Return a no-op client stub so the app doesn't crash
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({
          data: { user: null },
          error: { message: "Supabase not configured" },
        }),
        signInWithPassword: async () => ({
          data: { user: null },
          error: { message: "Supabase not configured" },
        }),
        signInWithOAuth: async () => ({
          data: { provider: null, url: "" },
          error: { message: "Supabase not configured" },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: { message: "Supabase not configured" },
            }),
            maybeSingle: async () => ({
              data: null,
              error: { message: "Supabase not configured" },
            }),
            order: () => ({
              limit: async () => ({
                data: null,
                error: { message: "Supabase not configured" },
              }),
            }),
          }),
          order: () => ({
            limit: async () => ({
              data: null,
              error: { message: "Supabase not configured" },
            }),
            maybeSingle: async () => ({
              data: null,
              error: { message: "Supabase not configured" },
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: { message: "Supabase not configured" },
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: async () => ({
              data: null,
              error: { message: "Supabase not configured" },
            }),
          }),
        }),
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
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
