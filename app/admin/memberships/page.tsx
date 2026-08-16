// ─── Admin — Payment Requests Dashboard ──────────────
import dynamic from "next/dynamic";
import { SiteShell } from "@/app/components/site-shell";

const AdminMembershipsClient = dynamic(
  () =>
    import("@/app/components/admin-memberships-client").then(
      (module) => module.AdminMembershipsClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 200,
          display: "grid",
          placeItems: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading admin dashboard...
      </div>
    ),
  },
);

export default function AdminMembershipsPage() {
  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Admin</div>
          <h1 className="h-display">Payment Requests</h1>
          <p className="lead">
            Review and approve/reject membership payment requests.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <AdminMembershipsClient />
        </div>
      </section>
    </SiteShell>
  );
}
