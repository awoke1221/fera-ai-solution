"use client";

import { Suspense } from "react";
import { SiteShell } from "@/app/components/site-shell";
import { AuthForm } from "@/app/components/auth-form";

function SignupContent() {
  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Create account</div>
          <h1 className="h-display">Get started with Fera AI Solutions</h1>
          <p className="lead">
            Create your account to manage membership and access Stack Advisor.
          </p>
        </div>
      </div>
      <section>
        <div className="wrap">
          <AuthForm mode="signup" />
        </div>
      </section>
    </SiteShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <div className="page-hero">
            <div className="wrap">
              <h1 className="h-display">Loading sign up...</h1>
            </div>
          </div>
        </SiteShell>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
