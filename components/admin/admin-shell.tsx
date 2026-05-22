import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  FileText,
  ReceiptText,
  Settings,
  UserRoundPlus,
  Users
} from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const viewNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/fees", label: "Fees", icon: ReceiptText },
  { href: "/admin/exams", label: "Exams", icon: BookOpen },
  { href: "/admin/reports", label: "Reports", icon: FileText }
];

const adminNavItems = [
  { href: "/admin/students/new", label: "Add Student", icon: UserRoundPlus },
  { href: "/admin/attendance", label: "Edit Hajira", icon: CalendarCheck },
  { href: "/admin/results", label: "Edit Results", icon: BarChart3 },
  { href: "/admin/settings/classes", label: "Classes", icon: Settings },
  { href: "/admin/settings/fee-types", label: "Fee Types", icon: Settings },
  { href: "/admin/settings/custom-fields", label: "Custom Fields", icon: Settings }
];

const mobileNavItems = [...viewNavItems, ...adminNavItems];

export function AdminShell({
  children,
  userName
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5 text-primary" />
            Ikra Academy
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Admin panel</p>
        </div>
        <nav className="space-y-5 p-3">
          <div>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              View
            </p>
            <div className="space-y-1">
              {viewNavItems.map((item) => (
                <Link
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Admin
            </p>
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4">
            <div>
              <p className="text-sm font-semibold">Ikra Academy</p>
              <p className="text-xs text-muted-foreground">Signed in as {userName}</p>
            </div>
            <form action={logoutAction}>
              <Button size="sm" variant="outline">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t p-2 lg:hidden">
            {mobileNavItems.map((item) => (
              <Link
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
