import { NextResponse } from "next/server";
import {
  createAdminClient,
  getAdminServiceClient,
  isAdminUser,
} from "@/lib/supabase-admin";

type QueryResult<T> = {
  value: T;
  error: string | null;
};

async function countRows(
  db: any,
  table: string,
  filter?: (query: any) => any,
): Promise<QueryResult<number | null>> {
  let query = db.from(table).select("id", { count: "exact", head: true });
  if (filter) query = filter(query);
  const result = await query;
  return {
    value: result.error ? null : (result.count ?? 0),
    error: result.error ? `${table}: ${result.error.message}` : null,
  };
}

async function recentRows(
  db: any,
  table: string,
  columns: string,
  orderColumn = "created_at",
  limit = 5,
): Promise<QueryResult<any[]>> {
  const result = await db
    .from(table)
    .select(columns)
    .order(orderColumn, { ascending: false })
    .limit(limit);
  return {
    value: result.error ? [] : result.data || [],
    error: result.error ? `${table}: ${result.error.message}` : null,
  };
}

async function allRows(
  db: any,
  table: string,
  columns: string,
): Promise<QueryResult<any[]>> {
  const pageSize = 1000;
  const rows: any[] = [];

  for (let page = 0; page < 100; page += 1) {
    const result = await db
      .from(table)
      .select(columns)
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (result.error) {
      return { value: [], error: `${table}: ${result.error.message}` };
    }

    rows.push(...(result.data || []));
    if (!result.data || result.data.length < pageSize) break;
  }

  return { value: rows, error: null };
}

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isAdminUser(user))) {
      return NextResponse.json({ error: "Admin required" }, { status: 403 });
    }

    const db = getAdminServiceClient() || supabase;
    const now = new Date().toISOString();
    const [
      customers,
      activeMembers,
      pendingPayments,
      approvedPayments,
      bookings,
      sessions,
      upcomingSessions,
      requests,
      recentPayments,
      recentBookings,
      openRequests,
    ] = await Promise.all([
      countRows(db, "profiles"),
      countRows(db, "memberships", (query) => query.eq("is_active", true)),
      countRows(db, "payment_requests", (query) =>
        query.eq("status", "pending"),
      ),
      allRows(db, "payment_requests", "amount, currency"),
      countRows(db, "bookings"),
      countRows(db, "group_sessions"),
      countRows(db, "group_sessions", (query) =>
        query.gte("start_time", now).eq("is_active", true),
      ),
      countRows(db, "one_to_one_requests", (query) =>
        query.eq("handled", false),
      ),
      recentRows(
        db,
        "payment_requests",
        "id, amount, currency, status, created_at, profiles!payment_requests_user_id_fkey(full_name, email), membership_plans(name)",
      ),
      recentRows(
        db,
        "bookings",
        "id, name, email, preferred_time, duration, status, created_at",
      ),
      recentRows(
        db,
        "one_to_one_requests",
        "id, preferred_time, message, created_at, profiles:user_id(full_name, email)",
      ),
    ]);

    const warnings = [
      customers,
      activeMembers,
      pendingPayments,
      approvedPayments,
      bookings,
      sessions,
      upcomingSessions,
      requests,
      recentPayments,
      recentBookings,
      openRequests,
    ]
      .map((result) => result.error)
      .filter((error): error is string => Boolean(error));

    const approvedRevenue: Record<string, number> = {};
    for (const payment of approvedPayments.value) {
      if (payment.status !== "approved") continue;
      const currency = String(payment.currency || "USD").toUpperCase();
      approvedRevenue[currency] =
        (approvedRevenue[currency] || 0) + Number(payment.amount || 0);
    }

    return NextResponse.json({
      metrics: {
        customers: customers.value,
        activeMembers: activeMembers.value,
        pendingPayments: pendingPayments.value,
        bookings: bookings.value,
        sessions: sessions.value,
        upcomingSessions: upcomingSessions.value,
        requests: requests.value,
      },
      finance: { approvedRevenue },
      recentPayments: recentPayments.value,
      recentBookings: recentBookings.value,
      openRequests: openRequests.value,
      warnings,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("/api/admin/overview GET", error);
    return NextResponse.json(
      { error: "Unable to load admin overview" },
      { status: 500 },
    );
  }
}
