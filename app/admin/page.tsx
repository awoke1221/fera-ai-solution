import dynamic from "next/dynamic";

const AdminOverview = dynamic(
  () =>
    import("@/app/components/admin-overview").then(
      (module) => module.AdminOverview,
    ),
  { ssr: false },
);

export default function AdminPage() {
  return <AdminOverview />;
}
