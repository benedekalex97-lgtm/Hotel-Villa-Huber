"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MAIN_NAV, NAV_EMPHASIS, ROUTES } from "@/content/site";
import { Wordmark } from "@/components/brand/Wordmark";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Útvonalváltáskor a menü bezárul (a render közbeni állapotfrissítés React-minta).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1240px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const renderItems = (onNavigate?: () => void) =>
    MAIN_NAV.map((item) => {
      const emphasized = NAV_EMPHASIS.includes(item.href);
      const current = !item.href.includes("#") && pathname === item.href ? "page" : undefined;
      return (
        <li key={item.href}>
          <Link href={item.href} className={emphasized ? styles.saleLink : styles.link} aria-current={current} onClick={onNavigate}>
            {item.label}
          </Link>
        </li>
      );
    });

  return (
    <header className={styles.header}>
      <div className={`hvh-container ${styles.inner}`}>
        <Link href={ROUTES.home} className={styles.brand} aria-label="Hotel Villa Huber — kezdőlap">
          <Wordmark width={150} decorative />
        </Link>

        <nav className={styles.nav} aria-label="Fő navigáció">
          <ul className={styles.list}>{renderItems()}</ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.bars} aria-hidden="true">
            <span />
          </span>
          {open ? "Bezárás" : "Menü"}
        </button>
      </div>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <nav className="hvh-container" aria-label="Fő navigáció (mobil)">
          <ul className={styles.panelList}>{renderItems(() => setOpen(false))}</ul>
        </nav>
      </div>
    </header>
  );
}
