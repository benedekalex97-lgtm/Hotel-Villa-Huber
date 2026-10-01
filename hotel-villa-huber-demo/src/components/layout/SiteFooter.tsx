import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { PROPERTY } from "@/content/property";
import { CONTACT, MAIN_NAV } from "@/content/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={`hvh-surface-dark ${styles.footer}`}>
      <div className="hvh-container">
        <div className={styles.grid}>
          <div className={styles.meta}>
            <Wordmark width={170} tone="light" />
            <p>{PROPERTY.placeLineFull}</p>
            <p>
              Értékesítés: <a href={CONTACT.mailtoHref}>{CONTACT.email}</a>
            </p>
          </div>
          <nav aria-label="Lábléc navigáció">
            <ul className={styles.links}>
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className={styles.bottom}>
          A foglalási folyamat ezen az oldalon bemutató jellegű; valódi foglalás nem történik. Az oldal a {PROPERTY.name} értékesítését is szolgálja.
        </p>
      </div>
    </footer>
  );
}
