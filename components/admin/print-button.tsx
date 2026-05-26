"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultLanguage, isAdminLanguage, translate } from "@/lib/i18n";

function currentLanguage() {
  if (typeof document === "undefined") return defaultLanguage;
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith("ikra-admin-language="))
    ?.split("=")[1];
  return isAdminLanguage(value) ? value : defaultLanguage;
}

export function PrintButton({ label = "Export PDF" }: { label?: string }) {
  return (
    <Button className="print-hide" type="button" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      {translate(currentLanguage(), label)}
    </Button>
  );
}
