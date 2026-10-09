import Link from "next/link";
import CaseLayout from "./case/layout";
import styles from "./case/case.module.css";

export default function NotFound() {
  return <CaseLayout><section className={styles.content}>
    <h1>Page not found</h1>
    <p>Use the navigation to explore Fixauto or return to the home page.</p>
    <Link className={styles.primaryButton} href="/">Back to home</Link>
  </section></CaseLayout>;
}
