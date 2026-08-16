// ─── Join Membership — Payment Page ──────────────────
"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SiteShell } from "@/app/components/site-shell";
import { PaymentUpload } from "@/app/components/payment-upload";
import { AuthModal } from "@/app/components/auth-modal";
import { RequireAuth } from "@/app/components/require-auth";
import useAuth from "@/app/store/useAuth";
import type { MembershipPlan } from "@/lib/types";

const localPlanSlug = "local-stack-guides";
const diasporaPlanSlug = "diaspora-stack-guides";

function formatPlanPrice(plan: MembershipPlan | null) {
  if (!plan) return "";

  if (plan.currency === "ETB") {
    return `${plan.price} ETB / month`;
  }

  if (plan.currency === "USD") {
    return `$${plan.price} USD / month`;
  }

  return `${plan.price} ${plan.currency} / month`;
}

function formatPaymentAmount(plan: MembershipPlan | null, currency: string) {
  if (!plan) return "";

  if (currency === "ETB") {
    return `${plan.price} birr`;
  }

  return `$${plan.price}`;
}

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");

  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuth((s: any) => s.user);
  const profile = useAuth((s: any) => s.profile);
  const membership = useAuth((s: any) => s.membership);
  const fetchUser = useAuth((s: any) => s.fetchUser);
  const [showAuth, setShowAuth] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<
    "mobile_money" | "bank_transfer" | "paypal"
  >("mobile_money");
  const [region, setRegion] = useState<"local" | "global" | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [approvalPolling, setApprovalPolling] = useState(false);

  useEffect(() => {
    if (profile?.region === "global") {
      setRegion("global");
      setPaymentMethod("paypal");
      return;
    }

    setRegion("local");
    setPaymentMethod("mobile_money");
  }, [profile?.region]);

  useEffect(() => {
    if (!plans.length) return;

    const preferredPlan =
      (profile?.region === "global"
        ? plans.find((p) => p.slug === diasporaPlanSlug)
        : plans.find((p) => p.slug === localPlanSlug)) || plans[0];

    if (preferredPlan && (!planId || !plans.some((p) => p.id === planId))) {
      setPlan(preferredPlan);
      router.replace(`/membership/join?plan=${preferredPlan.id}`);
    }
  }, [plans, profile?.region, planId, router]);

  const fetchData = useCallback(async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        fetch("/api/membership/plans", { cache: "no-store" }),
        fetch("/api/membership/status", { cache: "no-store" }),
      ]);

      const plansData = await plansRes.json();
      const statusData = await statusRes.json();

      setPlans(plansData.plans || []);

      const latestStatus = statusData.latestPayment?.status;
      if (latestStatus === "pending" || latestStatus === "rejected") {
        setPaymentStatus(latestStatus);
        setSubmitted(true);
      }

      if (statusData.hasPremium || membership) {
        router.replace("/stack-advisor");
      }

      if (planId) {
        const found = (plansData.plans || []).find(
          (p: MembershipPlan) => p.id === planId,
        );
        if (found) setPlan(found);
      } else {
        const fallbackPlan = (plansData.plans || []).find(
          (p: MembershipPlan) => p.slug === localPlanSlug,
        );
        if (fallbackPlan) setPlan(fallbackPlan);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [planId, router, membership]);

  useEffect(() => {
    // ensure auth store is loaded then fetch page data
    if (user === undefined) {
      fetchUser()
        .then(fetchData)
        .catch(() => fetchData());
    } else {
      fetchData();
    }
  }, [fetchData, user, fetchUser]);

  useEffect(() => {
    if (!loading && user && membership) {
      router.replace("/stack-advisor");
    }
  }, [loading, user, membership, router]);

  useEffect(() => {
    if (!submitted) return;

    const isPayPal = paymentMethod === "paypal" || profile?.region === "global";

    if (isPayPal) {
      const redirectTimer = window.setTimeout(() => {
        router.push("/stack-advisor");
      }, 3500);
      return () => window.clearTimeout(redirectTimer);
    }

    setApprovalPolling(true);

    const checkMembership = async () => {
      try {
        const res = await fetch("/api/membership/status", {
          cache: "no-store",
        });
        const data = await res.json();

        if (res.ok && data.hasPremium) {
          setPaymentStatus("approved");
          router.push("/stack-advisor");
          return true;
        }

        if (data.latestPayment?.status === "rejected") {
          setPaymentStatus("rejected");
          setApprovalPolling(false);
          return true;
        }
      } catch {
        // ignore polling errors
      }
      return false;
    };

    checkMembership();
    const intervalId = window.setInterval(checkMembership, 3000);

    return () => {
      window.clearInterval(intervalId);
      setApprovalPolling(false);
    };
  }, [submitted, paymentMethod, profile?.region, router]);

  const handleAuthSuccess = () => {
    fetchData();
  };

  const handlePlanSelect = (selectedPlan: MembershipPlan) => {
    setPlan(selectedPlan);
    setError(null);
    router.replace(`/membership/join?plan=${selectedPlan.id}`);
  };

  const handlePaymentMethodChange = (
    nextMethod: "mobile_money" | "bank_transfer",
  ) => {
    setPaymentMethod(nextMethod);
    setError(null);
  };

  const handleScreenshotUpload = (url: string) => {
    setScreenshotUrl(url || null);
    if (url) setError(null);
  };

  const handleSubmitPaymentRequest = async () => {
    if (!plan || !screenshotUrl) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/membership/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod,
          screenshotUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payment request");
      }

      setPaymentStatus("pending");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit payment request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayPalApprove = async (orderID: string) => {
    if (!plan) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/membership/capture-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID,
          planId: plan.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "PayPal payment failed");
      }

      setPaymentStatus("approved");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayPal payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayPalCreateOrder = async (): Promise<string> => {
    if (!plan) throw new Error("No plan selected");

    const res = await fetch("/api/membership/create-paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create PayPal order");
    }

    return data.orderID;
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <h1 className="h-display">Loading...</h1>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (submitted) {
    const isPayPal = paymentMethod === "paypal" || profile?.region === "global";
    const isRejected = paymentStatus === "rejected";
    const isPending = paymentStatus === "pending";
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div className={`eyebrow ${isRejected ? "status-rejected" : ""}`}>
              {isRejected
                ? "Payment Rejected"
                : isPending
                  ? "Payment Pending"
                  : "Payment Approved"}
            </div>
            <h1 className="h-display">
              {isRejected
                ? "Your payment was rejected"
                : isPending
                  ? "Your payment is pending review"
                  : isPayPal
                    ? "Payment approved! 🎉"
                    : "Payment approved! 🎉"}
            </h1>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="join-success">
              <div className="success-icon">{isPayPal ? "🎉" : "📸"}</div>
              <h2>
                {isRejected
                  ? "The admin rejected this payment request. You can review the details below and submit a new screenshot if needed."
                  : isPending
                    ? "Your payment screenshot was received successfully. It is already in the admin review queue, so you do not need to submit it again."
                    : "Your membership is approved and full Stack Advisor access is now active."}
              </h2>
              <p>
                {isPayPal
                  ? "You now have full premium access. Start exploring the Stack Guide now."
                  : "An admin will review your payment within 24 hours. Once approved, your premium access will be activated automatically."}
              </p>
              <div className="join-success-actions">
                <button
                  className="btn solid"
                  onClick={() => router.push("/stack-advisor")}
                >
                  {isRejected ? "Submit a new request" : "Open Stack Advisor"}
                </button>
                {!isRejected && (
                  <button
                    className="btn"
                    onClick={() => router.push("/membership/dashboard")}
                  >
                    View Dashboard
                  </button>
                )}
              </div>
              {isRejected && (
                <button
                  className="btn"
                  onClick={() => {
                    setSubmitted(false);
                    setPaymentStatus(null);
                    setScreenshotUrl(null);
                    setError(null);
                  }}
                >
                  Return to payment form
                </button>
              )}
              {isPending && approvalPolling && (
                <p className="form-message info">
                  Waiting for admin approval... We will redirect you to premium
                  content once your receipt is approved.
                </p>
              )}
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  // If user is not authenticated, show auth modal prompt
  if (!user) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Membership</div>
            <h1 className="h-display">Sign in to continue</h1>
            <p className="lead">
              You need an account to join a membership plan.
            </p>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="join-auth-prompt">
              <p>
                Please sign in or create an account to proceed with payment.
              </p>
              <button className="btn solid" onClick={() => setShowAuth(true)}>
                Sign In / Create Account
              </button>
            </div>
          </div>
        </section>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </SiteShell>
    );
  }

  const isGlobalUser =
    plan?.slug === diasporaPlanSlug ||
    region === "global" ||
    profile?.region === "global";

  // Plan selector if no plan selected
  if (!plan) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Membership</div>
            <h1 className="h-display">Choose your membership</h1>
            <p className="lead">
              Unlock unlimited Stack Guides access and AI support with a monthly
              subscription.
            </p>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="plan-selector">
              {plans.map((p) => (
                <button
                  key={p.id}
                  className="plan-select-card"
                  onClick={() => handlePlanSelect(p)}
                >
                  <div className="plan-select-header">
                    <h3>{p.name}</h3>
                    <span className="plan-badge">Monthly</span>
                  </div>
                  <div className="plan-select-price">
                    {p.currency === "ETB" ? `${p.price} Birr` : `$${p.price}`}
                    <span>/month</span>
                  </div>
                  <p>{p.description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="page-hero join-hero">
        <div className="wrap">
          <div className="eyebrow">Complete payment</div>
          <h1 className="h-display">
            Join <span className="gradient-text">{plan.name}</span>
          </h1>
          <p className="lead">
            {plan.slug === localPlanSlug
              ? `Local Ethiopian members pay ${plan.price} birr per month and can access everything in the Stack Guides plus AI support.`
              : `Diaspora members pay $${plan.price} per month and receive unlimited access to the same Stack Guides and AI support tools.`}
          </p>
        </div>
      </div>

      <section className="sessions-section">
        <div className="wrap">
          <div className="join-layout">
            <div className="join-summary card">
              <div className="summary-header">
                <div>
                  <span className="admin-mini-tag">Order</span>
                  <h2>Order Summary</h2>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-row">
                  <span>Plan</span>
                  <strong>{plan.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Duration</span>
                  <strong>
                    {plan.duration_days === 30
                      ? "Monthly"
                      : `${plan.duration_days} days`}
                  </strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>{formatPlanPrice(plan)}</strong>
                </div>
              </div>

              <div className="summary-features">
                <h3>Included benefits</h3>
                <ul>
                  {plan.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="join-payment card">
              <div className="summary-header">
                <div>
                  <span className="admin-mini-tag">Payment</span>
                  <h2>Choose your method</h2>
                </div>
              </div>

              {isGlobalUser ? (
                <div className="paypal-section payment-panel">
                  <div className="payment-method-label">
                    <span>🌐</span> PayPal
                  </div>
                  <p className="payment-info">
                    This plan is billed through PayPal. Complete the secure
                    payment and your Stack Guides membership will activate
                    immediately.
                  </p>
                  <PayPalScriptProvider
                    options={{
                      clientId:
                        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "pay",
                      }}
                      createOrder={handlePayPalCreateOrder}
                      onApprove={async (data) => {
                        await handlePayPalApprove(data.orderID);
                      }}
                      onError={(err) => {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "PayPal error occurred",
                        );
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              ) : (
                <div className="local-payment-section payment-panel">
                  <div className="payment-method-selector">
                    <button
                      className={`payment-method-option ${
                        paymentMethod === "mobile_money" ? "active" : ""
                      }`}
                      onClick={() => handlePaymentMethodChange("mobile_money")}
                    >
                      <span className="payment-method-icon">📱</span>
                      <div>
                        <strong>Telebirr / CBE Birr</strong>
                        <small>Fast local mobile payment</small>
                      </div>
                    </button>
                    <button
                      className={`payment-method-option ${
                        paymentMethod === "bank_transfer" ? "active" : ""
                      }`}
                      onClick={() => handlePaymentMethodChange("bank_transfer")}
                    >
                      <span className="payment-method-icon">🏦</span>
                      <div>
                        <strong>Bank Transfer</strong>
                        <small>Direct bank deposit</small>
                      </div>
                    </button>
                  </div>

                  <div className="payment-instructions">
                    <h3>Payment instructions</h3>
                    {paymentMethod === "mobile_money" ? (
                      <>
                        <p>
                          Send{" "}
                          <strong>{formatPaymentAmount(plan, "ETB")}</strong> to
                          the following mobile money account:
                        </p>
                        <div className="payment-details-card">
                          <div className="detail-row">
                            <span>Provider</span>
                            <strong>Telebirr / CBE Birr</strong>
                          </div>
                          <div className="detail-row">
                            <span>Account</span>
                            <strong>
                              Telebirr: 0957580465 — CBE Birr: 0961214623
                            </strong>
                          </div>
                          <div className="detail-row">
                            <span>Name</span>
                            <strong>Awoke Zemenu</strong>
                          </div>
                          <div className="detail-row">
                            <span>Amount</span>
                            <strong>{formatPaymentAmount(plan, "ETB")}</strong>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          Transfer{" "}
                          <strong>{formatPaymentAmount(plan, "ETB")}</strong> to
                          our bank account:
                        </p>
                        <div className="payment-details-card">
                          <div className="detail-row">
                            <span>Bank</span>
                            <strong>Commercial Bank of Ethiopia</strong>
                          </div>
                          <div className="detail-row">
                            <span>Account</span>
                            <strong>1000273018844</strong>
                          </div>
                          <div className="detail-row">
                            <span>Name</span>
                            <strong>Awoke Zemenu</strong>
                          </div>
                          <div className="detail-row">
                            <span>Amount</span>
                            <strong>{formatPaymentAmount(plan, "ETB")}</strong>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="upload-section">
                    <h3>Upload payment screenshot</h3>
                    <p>
                      After making the payment, upload a screenshot of the
                      transaction confirmation.
                    </p>
                    <PaymentUpload
                      value={screenshotUrl}
                      onUploadComplete={handleScreenshotUpload}
                    />
                  </div>

                  {error && <p className="form-message error">{error}</p>}

                  <button
                    className="btn solid join-submit-button"
                    onClick={handleSubmitPaymentRequest}
                    disabled={submitting || !screenshotUrl}
                  >
                    {submitting
                      ? "Submitting..."
                      : !screenshotUrl
                        ? "Upload screenshot first"
                        : "Submit payment request"}
                  </button>
                </div>
              )}

              {error && isGlobalUser && (
                <p className="form-message error">{error}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export default function JoinMembershipPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <div className="page-hero">
            <div className="wrap">
              <h1 className="h-display">Loading...</h1>
            </div>
          </div>
        </SiteShell>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
