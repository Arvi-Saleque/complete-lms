import { requirePrincipal } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminLanguage } from "@/lib/i18n-server";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [{ profile, user }, language] = await Promise.all([
    requirePrincipal(),
    getAdminLanguage()
  ]);

  return (
    <AdminShell language={language} userName={profile.full_name ?? user.email ?? "Principal"}>
      {children}
    </AdminShell>
  );
}
