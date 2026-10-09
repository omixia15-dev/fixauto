import Link from "next/link";
import { RequestScreen } from "@/src/screens/request-screen";
import styles from "../case.module.css";
export default function NewCasePage() {
  return <div className={styles.requestPage}><Link className={styles.backLink} href="/case">Back to your cases</Link><RequestScreen /></div>;
}
