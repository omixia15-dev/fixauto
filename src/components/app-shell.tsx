"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDemoCases } from "../store/demo-case-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { notice } = useDemoCases();
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" className="page-shell marketing-shell">{children}</main>
    {pathname === "/" && <div className="sr-live" role="status" aria-live="polite">{notice}</div>}
  </>;
}
