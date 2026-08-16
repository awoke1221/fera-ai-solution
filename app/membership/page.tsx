// ─── Membership Plans Page — Advanced UI/UX ──────────
import dynamic from "next/dynamic";
import { SiteShell } from "@/app/components/site-shell";
import { RequireAuth } from "@/app/components/require-auth";

const MembershipPageClient = dynamic(
  () =>
    import("@/app/components/membership-page-client").then(
      (module) => module.MembershipPageClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 420,
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Loading membership plans...
      </div>
    ),
  },
);

export default function MembershipPage() {
  return (
    <SiteShell>
      <RequireAuth>
        <MembershipPageClient />
      </RequireAuth>
    </SiteShell>
  );
}
