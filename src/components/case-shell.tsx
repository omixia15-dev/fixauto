"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import styles from "../../app/case/case.module.css";

const alexandria = localFont({ src: [
  { path: "../../app/fonts/alexandria-regular.ttf", weight: "400" },
  { path: "../../app/fonts/alexandria-semibold.ttf", weight: "600" },
  { path: "../../app/fonts/alexandria-bold.ttf", weight: "700" },
], display: "swap" });

export function CaseShell({ children, caseId }: { children: ReactNode; caseId?: string }) {
  const pathname = usePathname();
  if (pathname === "/case/new") return <div className={alexandria.className}>{children}</div>;
  return <div className={`${styles.workspace} ${alexandria.className}`}>
    <header><AppHeader caseId={caseId} /></header>
    {caseId && <div className={styles.contextLink}><Link href={`/staff?caseId=${encodeURIComponent(caseId)}`} aria-label="Staff workspace">Staff demo <span aria-hidden="true">↗</span></Link></div>}
    {children}
    <footer className={styles.footer}><span>Sample data · browser-local demo · no real booking or payment.</span><Link href="/">Fixauto</Link></footer>
  </div>;
}
