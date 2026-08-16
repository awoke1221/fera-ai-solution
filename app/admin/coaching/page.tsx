import dynamic from "next/dynamic";
import { SiteShell } from "@/app/components/site-shell";

const AdminCoachingClient = dynamic(
  () =>
    import("@/app/components/admin-coaching-client").then(
      (module) => module.AdminCoachingClient,
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
        Loading coaching dashboard...
      </div>
    ),
  },
);

export default function AdminCoachingPage() {
  return (
    <SiteShell>
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Admin</div>
          <h1 className="h-display">Coaching Sessions</h1>
          <p className="lead">Create and manage group coaching sessions.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <AdminCoachingClient />
        </div>
      </section>
    </SiteShell>
  );
}
