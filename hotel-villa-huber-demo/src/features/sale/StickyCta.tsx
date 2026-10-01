"use client";

import { useEffect, useState } from "react";
import styles from "./StickyCta.module.css";

interface StickyCtaProps {
  label: string;
  href: string;
  /** A hero fő CTA-jának id-ja: amíg látszik (vagy még nem görgettünk el mellette), a sáv rejtve marad. */
  heroCtaId: string;
  /** Az ajánlatkérő szekció id-ja: elérése után (és a lábléc felett) a sáv eltűnik. */
  formId: string;
}

/** Mobilon diszkrét, alsó CTA-sáv. Nem takarja az űrlapot és a láblécet. */
export function StickyCta({ label, href, heroCtaId, formId }: StickyCtaProps) {
  const [heroPast, setHeroPast] = useState(false);
  const [formReached, setFormReached] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroCtaId);
    const form = document.getElementById(formId);
    if (!hero || !form || typeof IntersectionObserver === "undefined") return;

    const heroObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      setHeroPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    // A form elérése: látszik, vagy már felette járunk (pl. lábléc).
    const formObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      setFormReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    heroObserver.observe(hero);
    formObserver.observe(form);
    return () => {
      heroObserver.disconnect();
      formObserver.disconnect();
    };
  }, [heroCtaId, formId]);

  const visible = heroPast && !formReached;

  return (
    <div className={styles.bar} data-visible={visible ? "true" : "false"}>
      <a href={href} className={`hvh-btn ${styles.button}`}>
        {label}
      </a>
    </div>
  );
}
