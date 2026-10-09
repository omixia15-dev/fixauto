"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./app-navigation.module.css";

export function AppNavigation({ caseId }: { caseId?: string }) {
  const pathname = usePathname();
  const links = [
    { label: "Home page", href: "/", active: pathname === "/" },
    { label: "Cases", href: "/case", active: pathname === "/case" || pathname.startsWith("/case/") },
    { label: "Users", href: `/cases/${caseId ?? "case-kia-003"}`, active: pathname.startsWith("/cases/"), title: "Sample customer case demo" },
    { label: "Staffs", href: caseId ? `/staff?caseId=${encodeURIComponent(caseId)}` : "/staff", active: pathname === "/staff", title: "Sample staff workspace" },
    { label: "Coming Soon", href: pathname === "/" ? "#coming-soon" : "/#coming-soon", active: false },
  ];
  return <nav className={styles.navigation} aria-label="Main navigation">
    {links.map(link => <Link key={link.label} href={link.href} title={link.title} aria-current={link.active ? (pathname === "/case/new" ? "location" : "page") : undefined}>{link.label}</Link>)}
  </nav>;
}
