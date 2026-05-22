import { requirePrincipal } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await requirePrincipal();

  return (
    <AdminShell userName={profile.full_name ?? user.email ?? "Principal"}>
      {children}
    </AdminShell>
  );
}
