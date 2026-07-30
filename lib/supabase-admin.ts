// ─── Supabase server (admin) client ─────────────────
// Uses the service role key when available for admin operations
// that need to bypass RLS (approve/reject payments, etc.).
// Falls back to the anon key + user session for regular operations.
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type ProfileRow = {
  id: string;
  is_admin?: boolean | null;
  role?: "user" | "admin" | null;
};

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

function getConfiguredAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
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

export async function ensureProfileForUser(
  user:
    | { id: string; email?: string | null; user_metadata?: Record<string, any> }
    | null
    | undefined,
) {
  if (!user?.id) return null;

  const serviceClient = getAdminServiceClient();
  if (!serviceClient) return null;

  const normalizedEmail = (user.email || "").trim().toLowerCase();
  const adminEmails = getConfiguredAdminEmails();
  const isAdminEmail =
    normalizedEmail.length > 0 && adminEmails.includes(normalizedEmail);

  let roleSupported = true;
  let profile: ProfileRow | null = null;
  let existingError: any = null;

  const { data: existingProfile, error: initialError } = await serviceClient
    .from("profiles")
    .select("id, is_admin, role")
    .eq("id", user.id)
    .maybeSingle();

  if (initialError) {
    if (
      initialError.message?.includes("column") &&
      initialError.message?.includes("does not exist")
    ) {
      roleSupported = false;
      const fallback = await serviceClient
        .from("profiles")
        .select("id, is_admin")
        .eq("id", user.id)
        .maybeSingle();
      profile = fallback.data as ProfileRow | null;
      existingError = fallback.error;
    } else {
      existingError = initialError;
    }
  } else {
    profile = existingProfile as ProfileRow | null;
  }

  if (existingError && existingError.code !== "PGRST116") {
    return null;
  }

  if (profile) {
    const shouldBeAdmin = isAdminEmail || !!profile.is_admin;
    const updatePayload: Record<string, any> = { is_admin: shouldBeAdmin };

    if (roleSupported) {
      updatePayload.role = shouldBeAdmin ? "admin" : "user";
    }

    if (isAdminEmail && !profile.is_admin) {
      await (serviceClient.from("profiles") as any)
        .update(updatePayload)
        .eq("id", user.id);
    } else if (
      roleSupported &&
      profile.role !== (shouldBeAdmin ? "admin" : "user")
    ) {
      await (serviceClient.from("profiles") as any)
        .update({ role: shouldBeAdmin ? "admin" : "user" })
        .eq("id", user.id);
    }
    return profile;
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    null;

  const insertPayload: Record<string, any> = {
    id: user.id,
    email: user.email || null,
    full_name: fullName,
    avatar_url: null,
    region: "local",
    is_admin: isAdminEmail,
  };

  if (roleSupported) {
    insertPayload.role = isAdminEmail ? "admin" : "user";
  }

  const { data, error } = await serviceClient
    .from("profiles")
    .insert(insertPayload as any)
    .select("id")
    .single();

  if (error) return null;
  return data;
}

export async function isAdminUser(
  user: { id: string; email?: string | null } | null | undefined,
) {
  if (!user?.id) return false;

  const normalizedEmail = (user.email || "").trim().toLowerCase();
  if (normalizedEmail && getConfiguredAdminEmails().includes(normalizedEmail)) {
    return true;
  }

  const serviceClient = getAdminServiceClient();
  if (!serviceClient) return false;

  const { data, error } = await serviceClient
    .from("profiles")
    .select("is_admin, role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as ProfileRow | null;
  return !error && (!!profile?.is_admin || profile?.role === "admin");
}
