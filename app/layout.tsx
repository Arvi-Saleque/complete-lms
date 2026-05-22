import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ikra Academy Admin",
  description: "Student, fees, attendance, and results admin panel"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
