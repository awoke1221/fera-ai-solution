// ─── GET /api/membership/plans ───────────────────────
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
