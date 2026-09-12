"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { en } from "../i18n/en";
import { useDemoCases } from "../store/demo-case-provider";
import { ResetSampleButton } from "./reset-sample-button";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data, notice, ready } = useDemoCases();
  const latestCaseId = data.cases.at(-1)?.id ?? "case-atlas-001";
  const links = [
    { href: "/", label: en.nav.request, active: pathname === "/" },
    { href: `/cases/${latestCaseId}`, label: en.nav.customer, active: pathname.startsWith("/cases/") },
    { href: "/staff", label: en.nav.staff, active: pathname === "/staff" },
  ];

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Fixauto service request">
            {en.brand}
          </Link>
          <nav aria-label="Demo screens">
            <ul className="nav-list">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="nav-link"
                    href={link.href}
                    aria-current={link.active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ResetSampleButton />
        </div>
      </header>
      <div className="demo-banner" role="note" aria-label="Demo limitations">
        <div>
          <strong>{en.demoBannerTitle}</strong>
          <span>{en.demoBannerBody}</span>
        </div>
        <span className="storage-state">{ready ? "Saved in this browser" : "Loading sample data…"}</span>
      </div>
      <main id="main-content" className="page-shell">
        {children}
      </main>
      <div className="sr-live" role="status" aria-live="polite">
        {notice}
      </div>
    </>
  );
}
