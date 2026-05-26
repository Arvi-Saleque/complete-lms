import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LanguageToggle } from "@/components/admin/language-toggle";
import { loginAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getAdminLanguage, getAdminTranslator } from "@/lib/i18n-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [language, t] = await Promise.all([getAdminLanguage(), getAdminTranslator()]);
  const { user, profile } = await getCurrentProfile();
  if (user && profile?.role === "principal") {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4 w-56">
        <Suspense fallback={null}>
          <LanguageToggle language={language} />
        </Suspense>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("Admin Login")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("Sign in with the Supabase principal account.")}
          </p>
        </CardHeader>
        <CardContent>
          {!hasSupabaseEnv() ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t("Add Supabase values to")} <code>.env.local</code>
              {t(", run the SQL schema, then restart the dev server.")}
            </div>
          ) : null}
          {resolvedSearchParams.error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {resolvedSearchParams.error === "missing-env"
                ? t("Supabase environment variables are missing.")
                : decodeURIComponent(resolvedSearchParams.error)}
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("Email")}</Label>
              <Input id="email" name="email" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("Password")}</Label>
              <Input id="password" name="password" required type="password" />
            </div>
            <Button className="w-full" type="submit">
              {t("Login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
