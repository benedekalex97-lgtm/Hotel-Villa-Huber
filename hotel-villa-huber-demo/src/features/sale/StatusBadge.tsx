import type { FactStatus } from "@/content/types";
import styles from "./StatusBadge.module.css";

/**
 * Az adat ellenőrzöttségi állapota — mindig szöveggel, nem csak színnel
 * (a jelölő forma is eltér: telt kör, üres kör, rombusz, vonás).
 */
export function StatusBadge({ status, label }: { status: FactStatus; label: string }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{label}</span>;
}
