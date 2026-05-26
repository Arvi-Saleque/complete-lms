"use client";

import { Languages } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { setAdminLanguageAction } from "@/lib/i18n-server";
import { translate, type AdminLanguage } from "@/lib/i18n";

export function LanguageToggle({ language }: { language: AdminLanguage }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const next = query ? `${pathname}?${query}` : pathname;
  const nextLanguage = language === "bn" ? "en" : "bn";

  return (
    <form action={setAdminLanguageAction} className="px-3">
      <input name="language" type="hidden" value={nextLanguage} />
      <input name="next" type="hidden" value={next} />
      <button
        className="flex w-full items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        type="submit"
      >
        <span className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {translate(language, "Language")}
        </span>
        <span className="font-medium text-foreground">
          {language === "bn" ? translate(language, "Bangla") : translate(language, "English")}
        </span>
      </button>
    </form>
  );
}

