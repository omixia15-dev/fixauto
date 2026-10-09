import Link from "next/link";
import { AppNavigation } from "./app-navigation";
import styles from "./app-header.module.css";

export function AppHeader({ caseId }: { caseId?: string }) {
  return <div className={styles.header}>
    <div className={styles.identity}><Link href="/" className={styles.wordmark}>Fixauto</Link><span className={styles.demo}>Demo</span></div>
    <AppNavigation caseId={caseId} />
  </div>;
}
