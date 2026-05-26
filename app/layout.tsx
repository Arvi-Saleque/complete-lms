import type { Metadata } from "next";
import { getAdminLanguage, getAdminTranslator } from "@/lib/i18n-server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminTranslator();

  return {
    title: t("Ikra Academy Admin"),
    description: t("Student, fees, attendance, and results admin panel")
  };
}

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const language = await getAdminLanguage();
  return (
    <html lang={language === "bn" ? "bn" : "en"}>
      <body>{children}</body>
    </html>
  );
}
