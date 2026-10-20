// ─── Join Membership — Payment Page ──────────────────
"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SiteShell } from "@/app/components/site-shell";
import { PaymentUpload } from "@/app/components/payment-upload";
import useAuth from "@/app/store/useAuth";
import type { MembershipPlan } from "@/lib/types";

const localPlanSlug = "local-stack-guides";
const diasporaPlanSlug = "diaspora-stack-guides";

type PendingPayment = {
  id: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  created_at: string;
  status?: string;
  admin_notes?: string | null;
  membership_plans?: { name?: string } | null;
};

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
  const returnToJoin = `/membership/join${planId ? `?plan=${encodeURIComponent(planId)}` : ""}`;
  const loginHref = `/auth/login?next=${encodeURIComponent(returnToJoin)}`;
  const signupHref = `/auth/signup?next=${encodeURIComponent(returnToJoin)}`;

  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuth((s: any) => s.user);
  const authLoading = useAuth((s: any) => s.loading);
  const authError = useAuth((s: any) => s.error);
  const profile = useAuth((s: any) => s.profile);
  const fetchUser = useAuth((s: any) => s.fetchUser);

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
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );
  const [latestPaymentRecord, setLatestPaymentRecord] =
    useState<PendingPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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

      if (!plansRes.ok) {
        throw new Error(
          plansData?.error || "Unable to load membership plans.",
        );
      }
      if (!Array.isArray(plansData?.plans)) {
        throw new Error("The membership service returned an invalid plan list.");
      }
      if (!statusRes.ok) {
        throw new Error(
          statusData?.error || "Unable to verify payment and membership status.",
        );
      }
      if (
        !statusData ||
        typeof statusData.hasPremium !== "boolean" ||
        !Array.isArray(statusData.paymentRequests)
      ) {
        throw new Error(
          "The payment service returned an invalid status response.",
        );
      }

      setPlans(plansData.plans || []);
      setLoadError(null);

      const latestStatus = statusData.latestPayment?.status;
      setLatestPaymentRecord(statusData.latestPayment ?? null);
      const pending =
        statusData.pendingPayment ||
        statusData.paymentRequests?.find(
          (payment: PendingPayment & { status: string }) =>
            payment.status === "pending",
        );

      if (pending) {
        setPendingPayment(pending);
        setPaymentStatus("pending");
        setSubmitted(true);
      } else if (latestStatus === "rejected") {
        setPendingPayment(null);
        setPaymentStatus(latestStatus);
        setSubmitted(true);
      } else {
        setPendingPayment(null);
      }

      if (statusData.hasPremium || statusData.membership) {
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
    } catch (fetchError) {
      setLoadError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load membership and payment status.",
      );
    } finally {
      setLoading(false);
    }
  }, [planId, router]);

  useEffect(() => {
    if (user === undefined) {
      if (!authLoading && authError) {
        setLoading(false);
      } else if (!authLoading) {
        void fetchUser();
      }
      return;
    }

    void fetchData();
  }, [fetchData, user, authLoading, authError, fetchUser]);

  useEffect(() => {
    if (!submitted) return;

    if (paymentStatus === "approved") {
      const redirectTimer = window.setTimeout(() => {
        router.push("/stack-advisor");
      }, 3500);
      return () => window.clearTimeout(redirectTimer);
    }
    if (paymentStatus !== "pending") return;

    setApprovalPolling(true);

    const checkMembership = async () => {
      try {
        const res = await fetch("/api/membership/status", {
          cache: "no-store",
        });
        const data = await res.json();
        setLatestPaymentRecord(data.latestPayment ?? null);

        if (res.ok && data.hasPremium) {
          setPaymentStatus("approved");
          await fetchUser(true);
          router.push("/stack-advisor");
          return true;
        }

        const pending =
          data.pendingPayment ||
          data.paymentRequests?.find(
            (payment: PendingPayment & { status: string }) =>
              payment.status === "pending",
          );
        if (pending) {
          setPendingPayment(pending);
        }

        if (!pending && data.latestPayment?.status === "rejected") {
          setPendingPayment(null);
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
  }, [submitted, paymentStatus, router, fetchUser]);

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
    if (!plan || !screenshotUrl || pendingPayment) return;

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
        if (data.status === "pending") {
          await fetchData();
          setPaymentStatus("pending");
          setSubmitted(true);
          return;
        }
        throw new Error(data.error || "Failed to submit payment request");
      }

      setPendingPayment(data.paymentRequest);
      setLatestPaymentRecord(data.paymentRequest);
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
    if (!plan || pendingPayment) return;

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
      await fetchUser(true);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayPal payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayPalCreateOrder = async (): Promise<string> => {
    if (pendingPayment) {
      throw new Error(
        "A payment request is already under review. Please wait for a decision before paying again.",
      );
    }
    if (!plan) throw new Error("No plan selected");

    const res = await fetch("/api/membership/create-paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.status === "pending") {
        await fetchData();
        setPaymentStatus("pending");
        setSubmitted(true);
      }
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

  if (user === undefined && authError) {
    return (
      <SiteShell>
        <div className="premium-gate">
          <div className="premium-gate-shell">
            <div className="premium-gate-content">
              <div className="premium-gate-kicker">Session check</div>
              <h1 className="h-display">We couldn&apos;t verify your account</h1>
              <p>Your session has not been signed out. Retry before signing in again.</p>
              <p role="alert">{authError}</p>
              <div className="premium-gate-actions">
                <button
                  className="btn solid"
                  onClick={async () => {
                    setLoading(true);
                    await fetchUser(true);
                    await fetchData();
                  }}
                >
                  Retry session check
                </button>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (loadError) {
    return (
      <SiteShell>
        <div className="premium-gate">
          <div className="premium-gate-shell">
            <div className="premium-gate-content">
              <div className="premium-gate-kicker">Membership status</div>
              <h1 className="h-display">We couldn&apos;t load payment status</h1>
              <p>
                No payment can be submitted until we confirm your current plan
                and any payment already in progress.
              </p>
              <p role="alert">{loadError}</p>
              <div className="premium-gate-actions">
                <button
                  className="btn solid"
                  onClick={() => {
                    setLoading(true);
                    void fetchData();
                  }}
                >
                  Retry membership check
                </button>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (submitted) {
    const isRejected = paymentStatus === "rejected";
    const isPending = paymentStatus === "pending";
    const paymentPlanName =
      pendingPayment?.membership_plans?.name ||
      plans.find((item) => item.id === pendingPayment?.plan_id)?.name ||
      plan?.name ||
      "Membership plan";
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div
              className={`eyebrow ${isRejected ? "status-rejected" : ""} ${
                isPending ? "status-pending" : ""
              }`}
            >
              {isRejected
                ? "Payment Rejected"
                : isPending
                  ? "Payment in progress"
                  : "Payment Approved"}
            </div>
            <h1 className="h-display">
              {isRejected
                ? "Your payment was rejected"
                : isPending
                  ? "Your payment is under review"
                  : "Payment approved! 🎉"}
            </h1>
            <p className="lead">
              {isPending
                ? "Your payment has been received. Do not send another payment while this request is being reviewed."
                : isRejected
                  ? "Review the decision details and submit a new payment only if you still want to continue."
                  : "Your paid membership is active. You can now open Stack Advisor."}
            </p>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div
              className={`join-success join-payment-progress ${
                isPending ? "pending" : ""
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="success-icon">
                {isPending ? "⏳" : isRejected ? "↩" : "🎉"}
              </div>
              <h2>
                {isRejected
                  ? "The payment request was not approved."
                  : isPending
                    ? "Payment received — approval is in progress"
                    : "Your membership is approved and full Stack Advisor access is now active."}
              </h2>
              <p>
                {isRejected
                  ? latestPaymentRecord?.admin_notes ||
                    "You may review the payment details in your dashboard before submitting a new request."
                  : isPending
                    ? "Your request is in the review queue. We will update your membership dashboard when its status changes. Please do not pay again or submit another receipt."
                    : "Your paid membership is active. You can now use all Stack Advisor features."}
              </p>
              {pendingPayment && (
                <>
                  <div className="join-payment-progress-meta">
                    <div>
                      <span>Plan</span>
                      <strong>{paymentPlanName}</strong>
                    </div>
                    <div>
                      <span>Amount</span>
                      <strong>
                        {pendingPayment.amount} {pendingPayment.currency}
                      </strong>
                    </div>
                    <div>
                      <span>Method</span>
                      <strong>{pendingPayment.payment_method.replace(/_/g, " ")}</strong>
                    </div>
                    <div>
                      <span>Submitted</span>
                      <strong>
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(pendingPayment.created_at))}
                      </strong>
                    </div>
                  </div>
                  <ol className="join-payment-steps">
                    <li className="complete">
                      <span>1</span>
                      <div>
                        <strong>Payment submitted</strong>
                        <small>Receipt received</small>
                      </div>
                    </li>
                    <li className="current">
                      <span>2</span>
                      <div>
                        <strong>Admin review</strong>
                        <small>In progress</small>
                      </div>
                    </li>
                    <li>
                      <span>3</span>
                      <div>
                        <strong>Stack Advisor access</strong>
                        <small>Unlocks after approval</small>
                      </div>
                    </li>
                  </ol>
                </>
              )}
              <div className="join-success-actions">
                {!isPending && !isRejected && (
                  <button
                    className="btn solid"
                    onClick={() => router.push("/stack-advisor")}
                  >
                    Open Stack Advisor
                  </button>
                )}
                {(isPending || isRejected) && (
                  <button
                    className="btn solid"
                    onClick={() => router.push("/membership/dashboard")}
                  >
                    View payment status
                  </button>
                )}
              </div>
              {isRejected && (
                <button
                  className="btn"
                  onClick={() => {
                    setSubmitted(false);
                    setPaymentStatus(null);
                    setPendingPayment(null);
                    setScreenshotUrl(null);
                    setError(null);
                  }}
                >
                  Submit a new payment
                </button>
              )}
              {isPending && approvalPolling && (
                <p className="form-message info">
                  Status refreshes automatically. Your payment will not be
                  charged again while review is pending.
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
              <div className="premium-gate-actions">
                <Link href={loginHref} className="btn solid">
                  Sign In
                </Link>
                <Link href={signupHref} className="btn">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
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
                      disabled={submitting || Boolean(pendingPayment)}
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
                    disabled={
                      submitting || !screenshotUrl || Boolean(pendingPayment)
                    }
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
