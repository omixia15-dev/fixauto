import Link from "next/link";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import styles from "./case.module.css";
const alexandria = localFont({ src: [
  { path: "../fonts/alexandria-regular.ttf", weight: "400" },
  { path: "../fonts/alexandria-semibold.ttf", weight: "600" },
  { path: "../fonts/alexandria-bold.ttf", weight: "700" },
], display: "swap" });
export default function CaseLayout({ children }: { children: ReactNode }) {
  return <div className={`${styles.workspace} ${alexandria.className}`}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/">Fixauto</Link>
      <nav aria-label="Cases navigation"><Link href="/case">My cases</Link><Link href="/">Back to home</Link></nav>
      <span className={styles.demoLabel}>Demo</span>
      <Link className={styles.staffLink} href="/staff">Staff demo <span aria-hidden="true">↗</span></Link>
    </header>
    {children}
    <footer className={styles.footer}><span>Sample data · browser-local demo · no real booking or payment.</span><Link href="/">Fixauto</Link></footer>
  </div>;
}
