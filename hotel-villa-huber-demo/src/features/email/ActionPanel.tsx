import type { RefObject } from "react";
import { PERSONAL_FIELD_META } from "./model";
import type { Readiness } from "./validate";
import styles from "./EmailWorkbench.module.css";

export interface Feedback {
  kind: "success" | "error";
  text: string;
  id: number;
}

export interface ManualCopy {
  label: string;
  text: string;
}

interface ActionPanelProps {
  readiness: Readiness;
  manualEdits: number;
  confirmReset: boolean;
  feedback: Feedback | null;
  manualCopy: ManualCopy | null;
  resetRef: RefObject<HTMLButtonElement | null>;
  cancelResetRef: RefObject<HTMLButtonElement | null>;
  onCopySubject: () => void;
  onCopyRich: () => void;
  onCopyText: () => void;
  onDownloadHtml: () => void;
  onDownloadText: () => void;
  onResetRequest: () => void;
  onResetConfirm: () => void;
  onResetCancel: () => void;
  onCloseManual: () => void;
}

/** Készenléti állapot, másoló és letöltő műveletek, visszaállítás megerősítéssel. */
export function ActionPanel({
  readiness,
  manualEdits,
  confirmReset,
  feedback,
  manualCopy,
  resetRef,
  cancelResetRef,
  onCopySubject,
  onCopyRich,
  onCopyText,
  onDownloadHtml,
  onDownloadText,
  onResetRequest,
  onResetConfirm,
  onResetCancel,
  onCloseManual,
}: ActionPanelProps) {
  const blocked = !readiness.ready;
  const missingLabels = readiness.missingFields.map((f) => PERSONAL_FIELD_META[f].label);

  // `aria-disabled` + kattintáskor hibajelzés: a felhasználó megtudja, miért nem exportálható.
  const guardedProps = (handler: () => void) => ({
    "aria-disabled": blocked,
    "aria-describedby": blocked ? "email-ready-title" : undefined,
    onClick: handler,
  });

  return (
    <section className={styles.stack} aria-labelledby="email-actions-title">
      <h2 id="email-actions-title" className={styles.panelTitle}>
        Készenlét és műveletek
      </h2>

      <div className={`hvh-notice ${readiness.ready ? "hvh-notice--success" : "hvh-notice--warning"}`} data-ready={readiness.ready}>
        <p id="email-ready-title" className={styles.readyLine} aria-live="polite" aria-atomic="true">
          <strong>{readiness.ready ? "Kész az exportra" : "Még nem kész — nem exportálható"}</strong>
        </p>
        {!readiness.ready ? (
          <ul className={styles.missingList}>
            {missingLabels.length ? <li>Kitöltendő személyes mezők: {missingLabels.join(", ")}.</li> : null}
            {readiness.personalPlaceholders.length ? (
              <li>
                Kitöltetlen személyes helyőrző a levélben:{" "}
                {readiness.personalPlaceholders.map((h) => `„${h.text}” (${h.where.toLowerCase()})`).join(", ")}.
              </li>
            ) : null}
            {readiness.invalidFields.map((f) => (
              <li key={f.field}>
                {PERSONAL_FIELD_META[f.field].label}: {f.message}
              </li>
            ))}
            {readiness.contentPlaceholders.length ? (
              <li>
                Bent maradt helyőrző a szövegben:{" "}
                {readiness.contentPlaceholders.map((h) => `„${h.text}” (${h.where})`).join(", ")}.
              </li>
            ) : null}
            {readiness.blocked.length ? (
              <li>
                Nem engedélyezett tartalom: {readiness.blocked.map((h) => `${h.text} (${h.where})`).join("; ")}.
              </li>
            ) : null}
            {readiness.subjectMissing ? <li>A tárgy üres.</li> : null}
          </ul>
        ) : (
          <p>A kötelező mezők kitöltöttek, nincs helyőrző és nem engedélyezett tartalom a levélben.</p>
        )}
      </div>

      <div className="hvh-notice" data-testid="pending-facts">
        <p>
          <strong>Megerősítésre váró ingatlanadat: {readiness.pendingConfirmation} tétel.</strong> A levélben mindegyik az állapotcímkéjével szerepel
          (korábbi nyilvános vagy tulajdonosi közlés); ez nem helyőrző és nem hiba.{" "}
          {readiness.openTopics ? `Egyeztetés tárgya: ${readiness.openTopics} tétel.` : ""}
        </p>
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={`hvh-btn ${styles.touch}`} {...guardedProps(onCopySubject)}>
          Tárgy másolása
        </button>
        <button type="button" className={`hvh-btn ${styles.touch}`} {...guardedProps(onCopyRich)}>
          Formázott levél másolása
        </button>
        <button type="button" className={`hvh-btn ${styles.touch}`} {...guardedProps(onCopyText)}>
          Teljes szöveges levél másolása
        </button>
        <button type="button" className={`hvh-btn hvh-btn--secondary ${styles.touch}`} {...guardedProps(onDownloadHtml)}>
          HTML letöltése
        </button>
        <button type="button" className={`hvh-btn hvh-btn--secondary ${styles.touch}`} {...guardedProps(onDownloadText)}>
          TXT letöltése
        </button>
      </div>
      <p className="hvh-hint">
        A formázott beillesztés levelezőnként eltérhet; tesztelt levelezőkliens a dokumentációban szerepel. Hiányos levél nem exportálható.
      </p>

      <div className={styles.btnRow}>
        <button type="button" ref={resetRef} className={`hvh-btn hvh-btn--ghost ${styles.touch}`} onClick={onResetRequest}>
          Visszaállítás a központi alapváltozatra
        </button>
      </div>

      {confirmReset ? (
        <div role="group" aria-labelledby="email-confirm-title" className="hvh-notice hvh-notice--warning">
          <p id="email-confirm-title">
            <strong>Biztosan? {manualEdits} kézi tartalmi módosítás elvész.</strong> A címzett és a feladó adatai megmaradnak.
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

      <div className={styles.feedbackSlot} role="status" aria-live="polite">
        {feedback ? <p className={feedback.kind === "success" ? styles.feedbackOk : styles.feedbackErr}>{feedback.text}</p> : null}
      </div>

      {manualCopy ? (
        <div className={`hvh-notice hvh-notice--danger ${styles.stackTight}`} role="group" aria-labelledby="email-manual-title">
          <p id="email-manual-title">
            <strong>Kézi másolás: {manualCopy.label}</strong> — jelölje ki a teljes szöveget (Ctrl/Cmd+A), majd másolja (Ctrl/Cmd+C), vagy használja a letöltést.
          </p>
          <textarea
            className={`hvh-textarea ${styles.manualArea}`}
            readOnly
            rows={8}
            value={manualCopy.text}
            aria-label={`Kézi másolás: ${manualCopy.label}`}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className={styles.btnRow}>
            <button type="button" className={`hvh-btn hvh-btn--ghost hvh-btn--sm ${styles.touch}`} onClick={onCloseManual}>
              Bezárás
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
