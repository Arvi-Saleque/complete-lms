"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  defaultLanguage,
  isAdminLanguage,
  translator,
  type AdminLanguage
} from "@/lib/i18n";

const languageCookie = "ikra-admin-language";

export async function getAdminLanguage(): Promise<AdminLanguage> {
  const cookieStore = await cookies();
  const value = cookieStore.get(languageCookie)?.value;
  return isAdminLanguage(value) ? value : defaultLanguage;
}

export async function getAdminTranslator() {
  return translator(await getAdminLanguage());
}

export async function setAdminLanguageAction(formData: FormData) {
  const language = String(formData.get("language") ?? "");
  const next = String(formData.get("next") ?? "/admin/dashboard");

  if (isAdminLanguage(language)) {
    const cookieStore = await cookies();
    cookieStore.set(languageCookie, language, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax"
    });
    revalidatePath("/admin", "layout");
  }

  redirect(next.startsWith("/admin") ? next : "/admin/dashboard");
}

