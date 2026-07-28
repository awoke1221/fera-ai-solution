// ─── Membership & Payment data types ────────────────

export type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
};

export type PaymentMethod = "mobile_money" | "bank_transfer" | "paypal";

export type PaymentRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "refunded";

export type PaymentRequest = {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  screenshot_url: string | null;
  paypal_order_id: string | null;
  status: PaymentRequestStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // joined fields
  plan_name?: string;
  user_email?: string;
  user_name?: string;
};

export type Membership = {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
  created_at: string;
  // joined
  plan_name?: string;
};

export type SystemDesignTutorial = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  content: string;
  is_premium: boolean;
  order_index: number;
  created_at: string;
};

// ─── Profile / User types ──────────────────────────
export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  region: "local" | "global";
  created_at: string;
};
