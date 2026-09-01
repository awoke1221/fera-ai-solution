import { NextResponse } from "next/server";
import {
  createAdminClient,
  ensureProfileForUser,
  getAdminServiceClient,
  isAdminUser,
} from "@/lib/supabase-admin";
import { normalizeMembershipDuplicates } from "@/lib/membership";

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const serviceClient = getAdminServiceClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureProfileForUser(user);

    const isAdmin = await isAdminUser(user);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!serviceClient) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set. Admin cleanup is unavailable.",
        },
        { status: 500 },
      );
    }

    const { userId } = await request.json().catch(() => ({ userId: null }));

    const targetUserId = typeof userId === "string" ? userId : null;

    const query = serviceClient
      .from("memberships")
      .select("id, user_id, is_active, end_date, created_at")
      .order("end_date", { ascending: false });

    const { data: rows, error } = targetUserId
      ? await query.eq("user_id", targetUserId)
      : await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const grouped = new Map<string, any[]>();
    for (const row of rows || []) {
      const key = row.user_id || "unknown";
      grouped.set(key, [...(grouped.get(key) || []), row]);
    }

    let cleaned = 0;
    const results: Array<{
      user_id: string;
      canonicalId: string | null;
      duplicateIds: string[];
    }> = [];

    for (const [memberUserId, memberships] of grouped.entries()) {
      const { canonicalId, duplicateIds } =
        normalizeMembershipDuplicates(memberships);
      if (!canonicalId || duplicateIds.length === 0) {
        results.push({ user_id: memberUserId, canonicalId, duplicateIds: [] });
        continue;
      }

      const response = await serviceClient
        .from("memberships")
        .update({ is_active: false })
        .in("id", duplicateIds);

      if (response.error) {
        return NextResponse.json(
          { error: response.error.message },
          { status: 500 },
        );
      }

      cleaned += duplicateIds.length;
      results.push({ user_id: memberUserId, canonicalId, duplicateIds });
    }

    return NextResponse.json({
      success: true,
      cleaned,
      users: results,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
