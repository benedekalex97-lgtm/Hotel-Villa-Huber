"use client";

import { useState } from "react";
import { CONTACT } from "@/content/site";
import { inquiryPlainText, type InquiryMailto } from "@/features/inquiry/schema";
import { copyPlainText } from "@/lib/clipboard";
import styles from "./InquiryForm.module.css";

type CopyState = { kind: "idle" } | { kind: "ok" | "fail"; text: string };

/**
 * Az előkészített levél és a másolási alternatíva (mailto-mód, illetve a szerveres küldés
 * sikertelensége esetén tartalék). A site nem küldi el a levelet.
 */
export function PreparedMail({ mail, reopenLabel }: { mail: InquiryMailto; reopenLabel: string }) {
  const [copy, setCopy] = useState<CopyState>({ kind: "idle" });
  const plainText = inquiryPlainText(mail);

  async function copyText(text: string, label: string) {
    const ok = await copyPlainText(text);
    setCopy(
      ok
        ? { kind: "ok", text: `${label} a vágólapra másolva.` }
        : { kind: "fail", text: "A másolás nem sikerült. Jelölje ki és másolja ki a szöveget az alábbi mezőből." },
    );
  }

  return (
    <div className={styles.fallback}>
      <h3>Ha nem nyílt meg levelező</h3>
      <div className={styles.copyActions}>
        <button type="button" className="hvh-btn hvh-btn--secondary hvh-btn--sm" onClick={() => copyText(CONTACT.email, "A címzett")}>
          Címzett másolása
        </button>
        <button type="button" className="hvh-btn hvh-btn--secondary hvh-btn--sm" onClick={() => copyText(plainText, "A levél")}>
          Levél másolása
        </button>
      </div>
      <p className={copy.kind === "fail" ? styles.copyFail : styles.copyOk} aria-live="polite">
        {copy.kind === "idle" ? "" : copy.text}
      </p>
      <p className={styles.recipient}>
        Címzett: <strong>{CONTACT.email}</strong>
      </p>
      <label className="hvh-label" htmlFor="inquiry-prepared-text">
        Az előkészített levél szövege
      </label>
      <textarea
        id="inquiry-prepared-text"
        className={`hvh-textarea ${styles.preparedText}`}
        readOnly
        rows={10}
        value={plainText}
        onFocus={(event) => event.currentTarget.select()}
      />
      <a className={styles.reopen} href={mail.href}>
        {reopenLabel}
      </a>
    </div>
  );
}
