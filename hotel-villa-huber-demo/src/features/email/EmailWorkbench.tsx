"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { SITE_URL_CONFIG } from "@/content/site-url";
import { ActionPanel, type Feedback, type ManualCopy } from "./ActionPanel";
import { PersonalPanel } from "./PersonalPanel";
import { PreviewPane, type PreviewSize } from "./PreviewPane";
import { SectionsEditor } from "./SectionsEditor";
import { composeEmail } from "./compose";
import { countManualEdits, draftReducer, initialDraftState } from "./draft";
import { EXPORT_FILES, copyRichText, copyText, downloadFile } from "./export";
import type { EditableField } from "./model";
import styles from "./EmailWorkbench.module.css";

/** A visszajelzés ennyi ezredmásodperc után eltűnik. */
const FEEDBACK_MS = 8000;

/**
 * Belső munkafelület az egyetlen aktív sablonhoz: „Hotel Villa Huber bemutató”.
 * A vázlat kizárólag a React-állapotban (böngészőfül memóriája) él: nincs tárolás, hálózati hívás vagy küldés.
 * Az előnézet és az export ugyanabból az összeállított levélből (`composed`) készül.
 */
export function EmailWorkbench() {
  const [state, dispatch] = useReducer(draftReducer, undefined, initialDraftState);
  const [size, setSize] = useState<PreviewSize>("desktop");
  const [attempted, setAttempted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [manualCopy, setManualCopy] = useState<ManualCopy | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const feedbackSeq = useRef(0);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const cancelResetRef = useRef<HTMLButtonElement | null>(null);

  const composed = useMemo(() => composeEmail(state, SITE_URL_CONFIG.url), [state]);
  const manualEdits = countManualEdits(state);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Fókusz a biztonságos „Mégse” gombra a visszaállítás megerősítésekor.
  useEffect(() => {
    if (confirmReset) cancelResetRef.current?.focus();
  }, [confirmReset]);

  function show(kind: Feedback["kind"], text: string) {
    feedbackSeq.current += 1;
    setFeedback({ kind, text, id: feedbackSeq.current });
  }

  /** Közös kapu: hiányos levél nem exportálható. */
  function guard(): boolean {
    setAttempted(true);
    setConfirmReset(false);
    setManualCopy(null);
    if (composed.readiness.ready) return true;
    setFeedback(null);
    show("error", "A levél még nem kész, ezért nem exportálható. Töltse ki a hiányzó mezőket, és szüntesse meg a jelzett hibákat.");
    return false;
  }

  async function copy(label: string, success: string, run: () => Promise<{ ok: true } | { ok: false; message: string }>, fallbackText: string) {
    if (!guard()) return;
    const result = await run();
    if (result.ok) {
      show("success", success);
      return;
    }
    show("error", `${result.message} Használja a kézi másolást vagy a fájl letöltését.`);
    setManualCopy({ label, text: fallbackText });
  }

  function download(kind: keyof typeof EXPORT_FILES) {
    if (!guard()) return;
    const ok = downloadFile(kind, kind === "html" ? composed.html : composed.text);
    if (ok) show("success", `A letöltés elindult: ${EXPORT_FILES[kind].name} (UTF-8).`);
    else show("error", "A böngésző nem engedte a letöltést. Használja a másolást.");
  }

  function requestReset() {
    setManualCopy(null);
    if (manualEdits === 0) {
      show("success", "Nincs kézi tartalmi módosítás; a levél a központi alapváltozaton áll.");
      return;
    }
    setConfirmReset(true);
  }

  function confirmResetNow() {
    dispatch({ type: "resetContent" });
    setConfirmReset(false);
    show("success", "A tartalom a központi alapváltozatra állt vissza.");
    resetRef.current?.focus();
  }

  function cancelReset() {
    setConfirmReset(false);
    resetRef.current?.focus();
  }

  const sectionTitles = composed.doc.sections.map((s) => ({ letter: s.letter, title: s.title }));

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hotel Villa Huber bemutató</h1>
        <p className={styles.lead}>
          Belső, helyi használatú munkafelület az egyetlen aktív befektetői bemutató emailhez: innen nem megy ki levél. A vázlat csak ennek a böngészőfülnek a
          memóriájában él, és a lap bezárásakor elvész.
        </p>
        <p className={styles.baseUrl} data-testid="base-url">
          A linkek alapcíme: <strong>{SITE_URL_CONFIG.url}</strong> ({SITE_URL_CONFIG.source === "env" ? "NEXT_PUBLIC_SITE_URL" : "alapérték"})
        </p>
        {SITE_URL_CONFIG.warning ? <p className="hvh-notice hvh-notice--danger">{SITE_URL_CONFIG.warning}</p> : null}
      </header>

      <div className={styles.grid}>
        <div className={`${styles.areaFields} ${styles.panel}`}>
          <PersonalPanel
            personal={state.personal}
            subject={state.subject}
            preheader={state.preheader}
            readiness={composed.readiness}
            attempted={attempted}
            onPersonal={(field, value) => dispatch({ type: "setPersonal", field, value })}
            onSubject={(value) => dispatch({ type: "setSubject", value })}
            onPreheader={(value) => dispatch({ type: "setPreheader", value })}
          />
        </div>

        <div className={`${styles.areaActions} ${styles.panel}`}>
          <ActionPanel
            readiness={composed.readiness}
            manualEdits={manualEdits}
            confirmReset={confirmReset}
            feedback={feedback}
            manualCopy={manualCopy}
            resetRef={resetRef}
            cancelResetRef={cancelResetRef}
            onCopySubject={() => copy("tárgy", "A tárgy a vágólapon.", () => copyText(composed.subject), composed.subject)}
            onCopyRich={() =>
              copy("HTML-forrás", "A formázott levél a vágólapon (HTML + szöveg). A beillesztés levelezőnként eltérhet.", () => copyRichText(composed.html, composed.text), composed.html)
            }
            onCopyText={() => copy("szöveges levél", "A teljes szöveges levél a vágólapon.", () => copyText(composed.text), composed.text)}
            onDownloadHtml={() => download("html")}
            onDownloadText={() => download("text")}
            onResetRequest={requestReset}
            onResetConfirm={confirmResetNow}
            onResetCancel={cancelReset}
            onCloseManual={() => setManualCopy(null)}
          />
        </div>

        <div className={`${styles.areaPreview} ${styles.panel}`}>
          <PreviewPane html={composed.html} size={size} ready={composed.readiness.ready} onSize={setSize} />
        </div>

        <div className={`${styles.areaSections} ${styles.panel}`}>
          <SectionsEditor
            fields={composed.fields}
            sectionTitles={sectionTitles}
            onEdit={(field: EditableField, value: string) => dispatch({ type: "setOverride", key: field.key, value, base: field.base })}
            onRestore={(key) => dispatch({ type: "clearOverride", key })}
          />
        </div>
      </div>
    </div>
  );
}
