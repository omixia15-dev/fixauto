"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./public-header.module.css";

export function PublicHeader({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <div className={`${styles.frame} ${children ? styles.withDashboard : ""}`}>
        <div className={styles.identity}>
          <Link className={styles.brand} href="/" aria-label="Fixauto home">Fixauto</Link>
          <span className={styles.note}>Coming soon · Kerman</span>
        </div>
        {children && <div className={styles.dashboardSlot}>{children}</div>}
        <nav className={styles.navigation} aria-label="Main navigation">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home page</Link>
          <Link href="/case/new" aria-current={pathname === "/case/new" ? "page" : undefined}>Request a visit</Link>
        </nav>
      </div>
    </header>
  );
}
