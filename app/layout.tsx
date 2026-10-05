import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/src/components/app-shell";
import { DemoCaseProvider } from "@/src/store/demo-case-provider";

export const metadata: Metadata = {
  title: "Fixauto — Managed vehicle repair coordination",
  description: "Fixauto is being built to coordinate vehicle assessment, repair approvals, specialist repairs, and return in Kerman. Coming soon; explore the demo.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DemoCaseProvider>
          <AppShell>{children}</AppShell>
        </DemoCaseProvider>
      </body>
    </html>
  );
}
