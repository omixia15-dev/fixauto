import Link from "next/link";
import { AppNavigation } from "@/src/components/app-navigation";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import styles from "./case.module.css";
const alexandria = localFont({ src: [
  { path: "../fonts/alexandria-regular.ttf", weight: "400" },
  { path: "../fonts/alexandria-semibold.ttf", weight: "600" },
  { path: "../fonts/alexandria-bold.ttf", weight: "700" },
], display: "swap" });
export default function CaseLayout({ children, caseId }: { children: ReactNode; caseId?: string }) {
  return <div className={`${styles.workspace} ${alexandria.className}`}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/">Fixauto</Link>
      <AppNavigation caseId={caseId} />
      <span className={styles.demoLabel}>Demo</span>
      {caseId && <Link className={styles.staffLink} href={caseId ? `/staff?caseId=${encodeURIComponent(caseId)}` : "/staff"} aria-label={caseId ? "Staff workspace" : undefined}>Staff demo <span aria-hidden="true">↗</span></Link>}
    </header>
    {children}
    <footer className={styles.footer}><span>Sample data · browser-local demo · no real booking or payment.</span><Link href="/">Fixauto</Link></footer>
  </div>;
}
