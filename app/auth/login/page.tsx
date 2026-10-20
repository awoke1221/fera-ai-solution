"use client";

import { Suspense } from "react";
import { SiteShell } from "@/app/components/site-shell";
import { AuthForm } from "@/app/components/auth-form";

function LoginContent() {
  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Account</div>
          <h1 className="h-display">Welcome back</h1>
          <p className="lead">
            Sign in to continue to your account, membership, or Stack Advisor.
          </p>
        </div>
      </div>
      <section>
        <div className="wrap">
          <AuthForm mode="login" />
        </div>
      </section>
    </SiteShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <div className="page-hero">
            <div className="wrap">
              <h1 className="h-display">Loading sign in...</h1>
            </div>
          </div>
        </SiteShell>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
