import { getAdminServiceClient, isAdminUser } from "./supabase-admin";

type SessionClient = {
  from: (table: string) => any;
};

type AccessUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
};

export async function getMembershipAccess(
  user: AccessUser,
  sessionClient: SessionClient,
) {
  const membershipClient = getAdminServiceClient() || sessionClient;
  const { data, error } = await membershipClient
    .from("memberships")
    .select("*, membership_plans(id, name, slug)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gt("end_date", new Date().toISOString())
    .order("end_date", { ascending: false })
    .limit(1);

  if (error) {
    return {
      membership: null,
      hasPremium: false,
      error,
    };
  }

  const membership = data?.[0] ?? null;
  const hasPremium = Boolean(membership) || (await isAdminUser(user));

  return { membership, hasPremium, error: null };
}
