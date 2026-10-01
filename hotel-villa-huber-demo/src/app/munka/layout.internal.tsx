import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { internalToolsEnabled } from "@/lib/internal-gate";
import { ROUTES } from "@/content/site";
import { INTERNAL_ROUTES } from "@/content/internal/routes";
import styles from "./internal.module.css";

export const metadata: Metadata = {
  title: "Belső munkafelület",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  if (!internalToolsEnabled()) notFound();
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <Link href={ROUTES.home} className={styles.brand} aria-label="Hotel Villa Huber — publikus kezdőlap">
            <Wordmark width={112} decorative />
          </Link>
          <span className={styles.badge}>Belső · helyi használat</span>
          <nav aria-label="Belső navigáció" className={styles.nav}>
            <Link href={INTERNAL_ROUTES.email}>Emailsablonok</Link>
            <Link href={INTERNAL_ROUTES.brand}>Brand board</Link>
          </nav>
        </div>
      </header>
      <main id="tartalom" tabIndex={-1} className={styles.main}>
        {children}
      </main>
    </div>
  );
}
