import { BOOKING_DEMO_NOTICE } from "@/content/site";
import styles from "./fields.module.css";

/** A kötelező demó-jelölés: a widgetnél, a /foglalas tetején és a lezáráskor. */
export function DemoNotice({ className }: { className?: string }) {
  return (
    <p className={`hvh-notice hvh-notice--warning ${styles.demoNotice} ${className ?? ""}`} role="note">
      <span className={styles.demoTag}>Demó</span>
      <span>{BOOKING_DEMO_NOTICE}</span>
    </p>
  );
}

/** Kis jelvény a mintaadatot tartalmazó listákhoz és kártyákhoz. */
export function SampleBadge({ className }: { className?: string }) {
  return <span className={`${styles.sampleBadge} ${className ?? ""}`}>Mintaadat</span>;
}
