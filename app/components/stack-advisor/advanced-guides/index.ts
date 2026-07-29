// ─── Advanced Guides Barrel Export ────────────────────
import type { AdvancedGuide } from "../types";
import { nextjsGuide } from "./frontend";
import { nodeGuide, chapaGuide } from "./backend";
import { supabaseGuide } from "./data-layer";
import { redisUpstashGuide, playwrightGuide } from "./infra";

export const advancedGuides: Record<string, AdvancedGuide> = {
  nextjs: nextjsGuide,
  node: nodeGuide,
  chapa: chapaGuide,
  supabase_db: supabaseGuide,
  redis_upstash: redisUpstashGuide,
  playwright: playwrightGuide,
};
