// ─── GET /api/tutorials ──────────────────────────────
// Returns tutorials. Premium content is only returned
// if the user has an active membership.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user has premium access
    let hasPremium = false;
    if (user) {
      const { data: membership } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .maybeSingle();

      hasPremium = !!membership;
    }

    // Get all tutorials
    const { data, error } = await supabase
      .from("system_design_tutorials")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If not premium, only return non-premium tutorials with full content
    // Premium tutorials get marked but content hidden
    const tutorials = (data || []).map((tutorial: any) => {
      if (tutorial.is_premium && !hasPremium) {
        return {
          ...tutorial,
          content: null,
          is_locked: true,
        };
      }
      return {
        ...tutorial,
        is_locked: false,
      };
    });

    return NextResponse.json({ tutorials, hasPremium });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
