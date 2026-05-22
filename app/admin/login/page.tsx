import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { user, profile } = await getCurrentProfile();
  if (user && profile?.role === "principal") {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in with the Supabase principal account.
          </p>
        </CardHeader>
        <CardContent>
          {!hasSupabaseEnv() ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Add Supabase values to <code>.env.local</code>, run the SQL schema, then restart
              the dev server.
            </div>
          ) : null}
          {resolvedSearchParams.error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {resolvedSearchParams.error === "missing-env"
                ? "Supabase environment variables are missing."
                : decodeURIComponent(resolvedSearchParams.error)}
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" />
            </div>
            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
