"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { copyPlainText } from "@/lib/clipboard";
import { CopyBar, type Feedback } from "./CopyBar";
import { Editor } from "./Editor";
import { FieldsPanel } from "./FieldsPanel";
import { Preview } from "./Preview";
import { TemplatePicker } from "./TemplatePicker";
import { draftReducer, initialDraftState, type TextField } from "./draft";
import { computeReadiness, findPlaceholders } from "./render";
import { getTemplate, type TemplateId, type VarName } from "./templates";
import styles from "./EmailWorkbench.module.css";

/** A visszajelzés ennyi ezredmásodperc után eltűnik. */
const FEEDBACK_MS = 5000;

/**
 * Belső email-sablon munkafelület.
 * A vázlat kizárólag a React-állapotban (böngészőfül memóriája) él: nincs
 * tárolás, hálózati hívás vagy küldés.
 */
export function EmailWorkbench() {
  const [state, dispatch] = useReducer(draftReducer, undefined, initialDraftState);
  const [attempted, setAttempted] = useState(false);
  const [guard, setGuard] = useState<{ target: TextField; tick: number } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const feedbackSeq = useRef(0);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const guardRef = useRef<HTMLDivElement | null>(null);
  const copySubjectRef = useRef<HTMLButtonElement | null>(null);
  const copyBodyRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const cancelResetRef = useRef<HTMLButtonElement | null>(null);

  const template = getTemplate(state.active);
  const draft = state.drafts[state.active];
  const readiness = computeReadiness(template, state.values, draft.subject, draft.body);

  // A figyelmeztetés a célszöveg aktuális helyőrzőiből számolódik: ha kitöltötték, magától eltűnik.
  const guardView = guard ? { target: guard.target, placeholders: findPlaceholders(draft[guard.target]) } : null;

  // Visszajelzés automatikus törlése.
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Fókusz a figyelmeztetésre, amikor megjelenik.
  useEffect(() => {
    if (guard) guardRef.current?.focus();
  }, [guard]);

  // Fókusz a biztonságos „Mégse” gombra a visszaállítás megerősítésekor.
  useEffect(() => {
    if (confirmReset) cancelResetRef.current?.focus();
  }, [confirmReset]);

  function show(kind: Feedback["kind"], text: string) {
    feedbackSeq.current += 1;
    setFeedback({ kind, text, id: feedbackSeq.current });
  }

  function fieldElement(target: TextField) {
    return target === "subject" ? subjectRef.current : bodyRef.current;
  }

  function selectTemplate(id: TemplateId) {
    dispatch({ type: "select", id });
    setGuard(null);
    setFeedback(null);
    setConfirmReset(false);
  }

  function changeValue(name: VarName, value: string) {
    dispatch({ type: "setValue", name, value });
  }

  function clearValues() {
    dispatch({ type: "clearValues" });
    setAttempted(false);
    setGuard(null);
  }

  async function copy(target: TextField, force: boolean) {
    const text = draft[target];
    setAttempted(true);
    setConfirmReset(false);
    if (!force && findPlaceholders(text).length > 0) {
      // Első kattintás: nem másolunk, figyelmeztetünk.
      setFeedback(null);
      setGuard({ target, tick: Date.now() });
      return;
    }
    setGuard(null);
    const ok = await copyPlainText(text);
    if (ok) {
      show("success", target === "subject" ? "Tárgy a vágólapon." : "Szöveg a vágólapon.");
    } else {
      show("error", "A másolás nem sikerült — jelölje ki a szöveget és másolja kézzel (Ctrl/Cmd+C).");
      const el = fieldElement(target);
      el?.focus();
      el?.select();
      return;
    }
    if (force) (target === "subject" ? copySubjectRef : copyBodyRef).current?.focus();
  }

  function requestReset() {
    setGuard(null);
    if (draft.subjectEdited || draft.bodyEdited) {
      setConfirmReset(true);
      return;
    }
    confirmResetNow();
  }

  function confirmResetNow() {
    dispatch({ type: "reset" });
    setConfirmReset(false);
    show("success", "Alapsablon visszaállítva.");
    resetRef.current?.focus();
  }

  function cancelReset() {
    setConfirmReset(false);
    resetRef.current?.focus();
  }

  function refresh(field: TextField) {
    dispatch({ type: "refresh", field });
    fieldElement(field)?.focus();
  }

  function keep(field: TextField) {
    dispatch({ type: "keep", field });
    fieldElement(field)?.focus();
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Megkereső emailek</h1>
        <p className={styles.lead}>
          Belső, helyi használatú munkafelület: innen nem megy ki levél. A vázlat csak ennek a böngészőfülnek a memóriájában él, és
          a lap bezárásakor elvész.
        </p>
      </header>

      <div className={styles.grid}>
        <div className={`${styles.controls} ${styles.panel}`}>
          <TemplatePicker value={state.active} onChange={selectTemplate} />
          <FieldsPanel
            template={template}
            values={state.values}
            attempted={attempted}
            demo={state.demo}
            onChange={changeValue}
            onFillDemo={() => dispatch({ type: "fillDemo" })}
            onClear={clearValues}
          />
        </div>

        <div className={`${styles.editorCol} ${styles.panel}`}>
          <Editor
            subject={draft.subject}
            body={draft.body}
            subjectEdited={draft.subjectEdited}
            bodyEdited={draft.bodyEdited}
            subjectSkipped={draft.subjectSkipped}
            bodySkipped={draft.bodySkipped}
            subjectRef={subjectRef}
            bodyRef={bodyRef}
            onEdit={(field, text) => dispatch({ type: "edit", field, text })}
            onRefresh={refresh}
            onKeep={keep}
          />
          <CopyBar
            readiness={readiness}
            guard={guardView}
            feedback={feedback}
            confirmReset={confirmReset}
            guardRef={guardRef}
            copySubjectRef={copySubjectRef}
            copyBodyRef={copyBodyRef}
            resetRef={resetRef}
            cancelResetRef={cancelResetRef}
            onCopy={copy}
            onDismissGuard={() => {
              const target = guard?.target;
              setGuard(null);
              (target === "body" ? copyBodyRef : copySubjectRef).current?.focus();
            }}
            onResetRequest={requestReset}
            onResetConfirm={confirmResetNow}
            onResetCancel={cancelReset}
          />
        </div>

        <div className={`${styles.previewCol} ${styles.panel}`}>
          <Preview subject={draft.subject} body={draft.body} placeholders={readiness.placeholders} />
        </div>
      </div>
    </div>
  );
}
