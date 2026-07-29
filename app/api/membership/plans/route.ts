// ─── GET /api/membership/plans ───────────────────────
import { NextResponse } from "next/server";
import { createAdminClient, getAdminServiceClient } from "@/lib/supabase-admin";
import type { MembershipPlan } from "@/lib/types";

// Plans change infrequently — cache for 5 min on CDN + browser
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "Surrogate-Control": "public, max-age=300",
};

const defaultPlans: Omit<MembershipPlan, "id" | "created_at">[] = [
  {
    name: "Local Stack Guides Membership",
    slug: "local-stack-guides",
    description:
      "Unlimited access to stack guides, architecture walkthroughs, and AI support for Ethiopian members.",
    price: 500,
    currency: "ETB",
    duration_days: 30,
    features: [
      "Unlimited access to every Stack Guide",
      "Unlimited AI support across the platform",
      "Priority guidance for product and system design work",
      "Monthly local support for Ethiopian members",
    ],
    is_active: true,
  },
  {
    name: "Diaspora Stack Guides Membership",
    slug: "diaspora-stack-guides",
    description:
      "Unlimited access for diaspora members with secure PayPal billing and instant premium access.",
    price: 10,
    currency: "USD",
    duration_days: 30,
    features: [
      "Unlimited access to every Stack Guide",
      "Unlimited AI support across the platform",
      "Priority guidance for remote product teams",
      "Secure monthly billing through PayPal",
    ],
    is_active: true,
  },
];

export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data: plans, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (!error && plans && plans.length > 0) {
      return NextResponse.json({ plans }, { headers: CACHE_HEADERS });
    }

    const serviceClient = getAdminServiceClient();
    const seededPlans: MembershipPlan[] = [];

    if (serviceClient) {
      for (const plan of defaultPlans) {
        const upsertPayload = {
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          duration_days: plan.duration_days,
          features: plan.features,
          is_active: true,
        };

        const { data, error: insertError } = await serviceClient
          .from("membership_plans")
          .insert(upsertPayload as any)
          .select("*")
          .single();

        if (!insertError && data) {
          seededPlans.push(data as MembershipPlan);
        }
      }
    }

    if (seededPlans.length > 0) {
      return NextResponse.json(
        { plans: seededPlans },
        { headers: CACHE_HEADERS },
      );
    }

    return NextResponse.json(
      {
        plans: defaultPlans.map((plan) => ({
          ...plan,
          id: "",
          created_at: new Date().toISOString(),
        })),
      },
      { headers: CACHE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
