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
import type { MembershipPlan } from "@/lib/types";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");

  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<
    "mobile_money" | "bank_transfer" | "paypal"
  >("mobile_money");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalPolling, setApprovalPolling] = useState(false);

  useEffect(() => {
    if (profile?.region === "global") {
      setPaymentMethod("paypal");
    }
  }, [profile?.region]);

  const fetchData = useCallback(async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        fetch("/api/membership/plans"),
        fetch("/api/auth/user"),
      ]);

      const plansData = await plansRes.json();
      const userData = await userRes.json();

      setPlans(plansData.plans || []);
      setUser(userData.user);
      setProfile(userData.profile);

      if (planId) {
        const found = plansData.plans?.find(
          (p: MembershipPlan) => p.id === planId,
        );
        if (found) setPlan(found);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!submitted) return;

    const isPayPal = paymentMethod === "paypal" || profile?.region === "global";

    if (isPayPal) {
      const redirectTimer = window.setTimeout(() => {
        router.push("/system-design");
      }, 3500);
      return () => window.clearTimeout(redirectTimer);
    }

    setApprovalPolling(true);
    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch("/api/membership/status");
        const data = await res.json();

        if (res.ok && data.hasPremium) {
          window.clearInterval(intervalId);
          router.push("/system-design");
        }
      } catch {
        // ignore polling errors
      }
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
      setApprovalPolling(false);
    };
  }, [submitted, paymentMethod, profile?.region, router]);

  const handleAuthSuccess = () => {
    fetchData();
  };

  const handleScreenshotUpload = (url: string) => {
    setScreenshotUrl(url);
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
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Success</div>
            <h1 className="h-display">
              {isPayPal ? "Payment Successful! 🎉" : "Payment Submitted! 📸"}
            </h1>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="join-success">
              <div className="success-icon">{isPayPal ? "🎉" : "📸"}</div>
              <h2>
                {isPayPal
                  ? "Your membership is now active!"
                  : "Your payment screenshot has been submitted for review."}
              </h2>
              <p>
                {isPayPal
                  ? "You now have full premium access. Start exploring system design tutorials now."
                  : "An admin will review your payment within 24 hours. Once approved, your premium access will be activated automatically."}
              </p>
              <div className="join-success-actions">
                <button
                  className="btn solid"
                  onClick={() => router.push("/system-design")}
                >
                  {isPayPal ? "Start Learning" : "Browse Tutorials"}
                </button>
                <button
                  className="btn"
                  onClick={() => router.push("/membership/dashboard")}
                >
                  View Dashboard
                </button>
              </div>
              {!isPayPal && approvalPolling && (
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

  const isGlobalUser = profile?.region === "global";

  // Plan selector if no plan selected
  if (!plan) {
    return (
      <SiteShell>
        <div className="page-hero">
          <div className="wrap">
            <div className="eyebrow">Membership</div>
            <h1 className="h-display">Choose a plan</h1>
            <p className="lead">Select a membership plan to get started.</p>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="plan-selector">
              {plans.map((p) => (
                <button
                  key={p.id}
                  className="plan-select-card"
                  onClick={() => {
                    setPlan(p);
                    router.replace(`/membership/join?plan=${p.id}`);
                  }}
                >
                  <h3>{p.name}</h3>
                  <div className="plan-select-price">
                    ${p.price}
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
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Complete Payment</div>
          <h1 className="h-display">
            Join <span className="gradient-text">{plan.name}</span>
          </h1>
          <p className="lead">{plan.description}</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="join-layout">
            {/* Order Summary */}
            <div className="join-summary">
              <h2>Order Summary</h2>
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
                  <strong>
                    ${plan.price} {plan.currency}
                  </strong>
                </div>
              </div>

              <div className="summary-features">
                <h3>Features included:</h3>
                <ul>
                  {plan.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Payment Form */}
            <div className="join-payment">
              <h2>Payment Method</h2>

              {isGlobalUser ? (
                // ─── PayPal for global users ──────────
                <div className="paypal-section">
                  <div className="payment-method-label">
                    <span>🌐</span> PayPal
                  </div>
                  <p className="payment-info">
                    You are registered as a global user. Pay securely via PayPal
                    for instant membership activation.
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
                // ─── Local payment methods ────────────
                <div className="local-payment-section">
                  <div className="payment-method-selector">
                    <button
                      className={`payment-method-option ${
                        paymentMethod === "mobile_money" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("mobile_money")}
                    >
                      <span>📱</span>
                      <div>
                        <strong>Mobile Money</strong>
                        <small>Local mobile transfer</small>
                      </div>
                    </button>
                    <button
                      className={`payment-method-option ${
                        paymentMethod === "bank_transfer" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("bank_transfer")}
                    >
                      <span>🏦</span>
                      <div>
                        <strong>Bank Transfer</strong>
                        <small>Direct bank deposit</small>
                      </div>
                    </button>
                  </div>

                  <div className="payment-instructions">
                    <h3>Payment Instructions</h3>
                    {paymentMethod === "mobile_money" ? (
                      <>
                        <p>
                          Send <strong>${plan.price}</strong> to the following
                          mobile money account:
                        </p>
                        <div className="payment-details-card">
                          <div className="detail-row">
                            <span>Provider</span>
                            <strong>Telebirr / CBE Birr</strong>
                          </div>
                          <div className="detail-row">
                            <span>Account</span>
                            <strong>+251-91-234-5678</strong>
                          </div>
                          <div className="detail-row">
                            <span>Name</span>
                            <strong>Fera AI Solutions</strong>
                          </div>
                          <div className="detail-row">
                            <span>Amount</span>
                            <strong>${plan.price} USD</strong>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          Transfer <strong>${plan.price}</strong> to our bank
                          account:
                        </p>
                        <div className="payment-details-card">
                          <div className="detail-row">
                            <span>Bank</span>
                            <strong>Commercial Bank of Ethiopia</strong>
                          </div>
                          <div className="detail-row">
                            <span>Account</span>
                            <strong>1000 1234 5678</strong>
                          </div>
                          <div className="detail-row">
                            <span>Name</span>
                            <strong>Fera AI Solutions</strong>
                          </div>
                          <div className="detail-row">
                            <span>Amount</span>
                            <strong>${plan.price} USD</strong>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="upload-section">
                    <h3>Upload Payment Screenshot</h3>
                    <p>
                      After making the payment, upload a screenshot of the
                      transaction confirmation.
                    </p>
                    <PaymentUpload onUploadComplete={handleScreenshotUpload} />
                  </div>

                  {error && <p className="form-message error">{error}</p>}

                  <button
                    className="btn solid"
                    style={{ width: "100%", marginTop: "20px" }}
                    onClick={handleSubmitPaymentRequest}
                    disabled={submitting || !screenshotUrl}
                  >
                    {submitting
                      ? "Submitting..."
                      : !screenshotUrl
                        ? "Upload screenshot first"
                        : "Submit Payment Request"}
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
