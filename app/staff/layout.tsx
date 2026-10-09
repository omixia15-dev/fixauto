import Link from "next/link";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import styles from "../case/case.module.css";
import staffStyles from "@/src/screens/staff-workspace-screen.module.css";

const alexandria = localFont({ src: [
  { path: "../fonts/alexandria-regular.ttf", weight: "400" },
  { path: "../fonts/alexandria-semibold.ttf", weight: "600" },
  { path: "../fonts/alexandria-bold.ttf", weight: "700" },
], display: "swap" });

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <div className={styles.workspace + " " + alexandria.className}>
    <header className={styles.header + " " + staffStyles.staffHeader}>
      <Link className={styles.wordmark} href="/">Fixauto</Link>
      <nav aria-label="Staff navigation"><Link href="/case">My cases</Link><Link href="/staff" aria-current="page">Staff workspace</Link><Link href="/">Back to home</Link></nav>
      <span className={styles.demoLabel}>Demo</span>
    </header>
    {children}
    <footer className={styles.footer}><span>Sample data · browser-local demo · no real booking or payment.</span><Link href="/">Fixauto</Link></footer>
  </div>;
}
