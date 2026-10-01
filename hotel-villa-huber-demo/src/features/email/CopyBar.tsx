import type { RefObject } from "react";
import { VAR_META, type VarName } from "./templates";
import type { Readiness } from "./render";
import type { TextField } from "./draft";
import styles from "./EmailWorkbench.module.css";

export interface Feedback {
  kind: "success" | "error";
  text: string;
  id: number;
}

interface CopyBarProps {
  readiness: Readiness;
  /** A figyelmeztetett másolási kísérlet célja és a benne maradt helyőrzők. */
  guard: { target: TextField; placeholders: string[] } | null;
  feedback: Feedback | null;
  confirmReset: boolean;
  guardRef: RefObject<HTMLDivElement | null>;
  copySubjectRef: RefObject<HTMLButtonElement | null>;
  copyBodyRef: RefObject<HTMLButtonElement | null>;
  resetRef: RefObject<HTMLButtonElement | null>;
  cancelResetRef: RefObject<HTMLButtonElement | null>;
  onCopy: (target: TextField, force: boolean) => void;
  onDismissGuard: () => void;
  onResetRequest: () => void;
  onResetConfirm: () => void;
  onResetCancel: () => void;
}

const TARGET_LABEL: Record<TextField, string> = { subject: "tárgyban", body: "szövegben" };

/** Készenléti állapot, másoló és visszaállító gombok, figyelmeztetések, visszajelzés. */
export function CopyBar({
  readiness,
  guard,
  feedback,
  confirmReset,
  guardRef,
  copySubjectRef,
  copyBodyRef,
  resetRef,
  cancelResetRef,
  onCopy,
  onDismissGuard,
  onResetRequest,
  onResetConfirm,
  onResetCancel,
}: CopyBarProps) {
  const missingLabels = readiness.missingFields.map((v: VarName) => VAR_META[v].label);

  return (
    <section className={styles.stack} aria-labelledby="email-copy-title">
      <h2 id="email-copy-title" className={styles.panelTitle}>
        Másolás
      </h2>

      <div className={`hvh-notice ${readiness.ready ? "hvh-notice--success" : "hvh-notice--warning"}`}>
        <p className={styles.readyLine} aria-live="polite" aria-atomic="true">
          <strong>{readiness.ready ? "Kész a másolásra" : "Még nem kész"}</strong>
        </p>
        {!readiness.ready ? (
          <ul className={styles.missingList}>
            {missingLabels.length ? <li>Kitöltendő mezők: {missingLabels.join(", ")}.</li> : null}
            {readiness.placeholders.length ? (
              <li>Kitöltetlen helyőrzők a tárgyban/szövegben: {readiness.placeholders.map((p) => `„${p}”`).join(", ")}.</li>
            ) : null}
          </ul>
        ) : (
          <p>Minden kötelező mező kitöltött, és nincs helyőrző a szövegben.</p>
        )}
      </div>

      <div className={styles.btnRow}>
        <button type="button" ref={copySubjectRef} className={`hvh-btn ${styles.touch}`} onClick={() => onCopy("subject", false)}>
          Tárgy másolása
        </button>
        <button type="button" ref={copyBodyRef} className={`hvh-btn ${styles.touch}`} onClick={() => onCopy("body", false)}>
          Szöveg másolása
        </button>
        <button type="button" ref={resetRef} className={`hvh-btn hvh-btn--secondary ${styles.touch}`} onClick={onResetRequest}>
          Alapsablon visszaállítása
        </button>
      </div>

      {guard && guard.placeholders.length > 0 ? (
        <div ref={guardRef} tabIndex={-1} role="region" aria-labelledby="email-guard-title" className={`hvh-notice hvh-notice--danger ${styles.guard}`}>
          <p id="email-guard-title">
            <strong>A {TARGET_LABEL[guard.target]} még kitöltetlen helyőrző van, ezért nem másoltuk a vágólapra.</strong>
          </p>
          <p>{guard.placeholders.map((p) => `„${p}”`).join(", ")}</p>
          <p>Töltse ki a hiányzó adatokat, vagy másolja így is, ha a helyőrző szándékos.</p>
          <div className={styles.btnRow}>
            <button type="button" className={`hvh-btn hvh-btn--secondary hvh-btn--sm ${styles.touch}`} onClick={() => onCopy(guard.target, true)}>
              Másolás így is
            </button>
            <button type="button" className={`hvh-btn hvh-btn--ghost hvh-btn--sm ${styles.touch}`} onClick={onDismissGuard}>
              Mégse
            </button>
          </div>
        </div>
      ) : null}

      {confirmReset ? (
        <div role="group" aria-labelledby="email-confirm-title" className="hvh-notice hvh-notice--warning">
          <p id="email-confirm-title">
            <strong>Biztosan? A kézi módosítások elvesznek.</strong>
          </p>
          <div className={styles.btnRow}>
            <button type="button" className={`hvh-btn hvh-btn--sm ${styles.touch}`} onClick={onResetConfirm}>
              Visszaállítás
            </button>
            <button type="button" ref={cancelResetRef} className={`hvh-btn hvh-btn--secondary hvh-btn--sm ${styles.touch}`} onClick={onResetCancel}>
              Mégse
            </button>
          </div>
        </div>
      ) : null}

      {/* Állandó, fenntartott magasságú sáv: a visszajelzés nem tolja el az elrendezést. */}
      <div className={styles.feedbackSlot} role="status" aria-live="polite">
        {feedback ? <p className={feedback.kind === "success" ? styles.feedbackOk : styles.feedbackErr}>{feedback.text}</p> : null}
      </div>
    </section>
  );
}
