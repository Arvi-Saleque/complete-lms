import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  if (!hasSupabaseEnv()) {
    return { user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function requirePrincipal() {
  if (!hasSupabaseEnv()) {
    redirect("/admin/login?error=missing-env");
  }

  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/admin/login");
  }

  if (!profile || profile.role !== "principal") {
    redirect("/admin/login?error=unauthorized");
  }

  return { user, profile };
}
