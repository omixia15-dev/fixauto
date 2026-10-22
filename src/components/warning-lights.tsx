import type { CSSProperties } from "react";
import styles from "./warning-lights.module.css";

export type WarningScene = "hero" | "assessment" | "approval" | "return" | "request";
const icons = ["engine", "battery", "brake", "oil", "coolant"] as const;

export function WarningLights({ revealedCount }: { revealedCount: number }) {
  return (
    <div className={styles.lights} data-warning-sequence aria-hidden="true">
      {icons.map((icon, index) => (
        <span
          className={styles.light}
          data-warning-icon={icon}
          data-revealed={index < revealedCount}
          key={icon}
          style={{ "--warning-mask": `url("/images/warnings/${icon}-clear.png")` } as CSSProperties}
        />
      ))}
    </div>
  );
}
