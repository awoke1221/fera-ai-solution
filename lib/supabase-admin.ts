// ─── Supabase server (admin) client ─────────────────
// Must only be used in API routes / server components.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return a no-op admin client stub
    const noop = async () => ({
      data: null,
      error: { message: "Supabase not configured" },
    });

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
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
