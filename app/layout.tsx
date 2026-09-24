import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/src/components/app-shell";
import { DemoCaseProvider } from "@/src/store/demo-case-provider";

export const metadata: Metadata = {
  title: "Fixauto — Managed vehicle repair coordination",
  description: "Fixauto helps busy car owners in Kerman coordinate diagnosis, approvals, repair, and return.",
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
