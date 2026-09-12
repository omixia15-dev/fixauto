import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/src/components/app-shell";
import { DemoCaseProvider } from "@/src/store/demo-case-provider";

export const metadata: Metadata = {
  title: "Fixauto interactive demo",
  description: "A browser-only sample of the Fixauto managed repair journey.",
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
