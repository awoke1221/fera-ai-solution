// ─── Ethiopian Market Adaptations ─────────────────────
import type { EthiopianAdaptation } from "./types";

export const ethiopianAdaptations: EthiopianAdaptation[] = [
  {
    id: "eth_payment_chapa",
    title: "Chapa Payment Gateway",
    description:
      "Chapa is the leading Ethiopian payment gateway supporting Telebirr, CB Birr, CBE, Amole, and bank transfers. Integrate via REST API with webhook callbacks. No monthly fees — only per-transaction pricing (3.5% + 5 ETB).",
    tools: ["chapa", "telebirr"],
    category: "payment",
  },
  {
    id: "eth_payment_telebirr",
    title: "Telebirr Mobile Money",
    description:
      "Telebirr by Ethio Telecom is the most widely used digital payment in Ethiopia with millions of active users. Works on any phone (no smartphone required). Can be integrated directly or through Chapa's API.",
    tools: ["telebirr", "chapa"],
    category: "payment",
  },
  {
    id: "eth_payment_screenshot",
    title: "Screenshot Upload + Admin Approval",
    description:
      "For Ethiopian businesses where manual payment confirmation is common, implement a screenshot upload workflow: user uploads payment screenshot → admin reviews → admin approves/rejects → membership/content is activated. This is handled via the existing admin dashboard.",
    tools: ["supabase_storage", "supabase_db", "supabase_auth"],
    category: "payment",
  },
  {
    id: "eth_hosting",
    title: "Ethiopian VPS Hosting",
    description:
      "For apps requiring Ethiopian data residency, use Habesha Host or Ethio Telecom's data centers. Deploy with Docker on VPS for full control. Combined with Cloudflare CDN for global performance.",
    tools: ["docker_vps", "postgresql", "redis_self"],
    category: "hosting",
  },
  {
    id: "eth_auth",
    title: "Ethiopian Phone Auth",
    description:
      "For Ethiopian users, email + password auth (via Supabase) is most accessible. SMS-based auth can be implemented via Ethio Telecom APIs or third-party SMS gateways. Google OAuth works for users with Google accounts.",
    tools: ["supabase_auth", "nextauth"],
    category: "auth",
  },
  {
    id: "eth_delivery",
    title: "Ethiopian Delivery & Logistics",
    description:
      "For e-commerce platforms, integrate with Ethiopian logistics providers (Ethio Express, Qongo, or local courier services). Implement order tracking with status updates and SMS notifications.",
    tools: ["node", "supabase_db", "resend"],
    category: "delivery",
  },
  {
    id: "eth_compliance",
    title: "Ethiopian Business Compliance",
    description:
      "For Ethiopian businesses: include receipt generation with Ethiopian tax requirements, invoice numbering per Ethiopian standards, and reporting for Ethiopian tax authority. Consider NID (National ID) verification for KYC.",
    tools: ["supabase_db", "node", "nextjs"],
    category: "compliance",
  },
];
