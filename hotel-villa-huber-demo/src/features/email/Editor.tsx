import type { RefObject } from "react";
import { Field } from "@/components/form/Field";
import type { TextField } from "./draft";
import styles from "./EmailWorkbench.module.css";

interface EditorProps {
  subject: string;
  body: string;
  subjectEdited: boolean;
  bodyEdited: boolean;
  /** Mezőváltozás történt, de a kézi szöveget nem írtuk felül. */
  subjectSkipped: boolean;
  bodySkipped: boolean;
  subjectRef: RefObject<HTMLInputElement | null>;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  onEdit: (field: TextField, text: string) => void;
  onRefresh: (field: TextField) => void;
  onKeep: (field: TextField) => void;
}

const NOTICE_TEXT: Record<TextField, string> = {
  subject: "A tárgyat kézzel szerkesztette, ezért a mezők változása nem frissítette.",
  body: "A szöveget kézzel szerkesztette, ezért a mezők változása nem frissítette.",
};

/** Szerkeszthető tárgy és szöveg, kézi módosítás elleni védelemmel. */
export function Editor(props: EditorProps) {
  const { subject, body, subjectEdited, bodyEdited, subjectSkipped, bodySkipped, subjectRef, bodyRef } = props;

  return (
    <section className={styles.stack} aria-labelledby="email-editor-title">
      <h2 id="email-editor-title" className={styles.panelTitle}>
        Szerkesztés
      </h2>

      <div className={styles.stackTight}>
        <Field
          id="email-subject"
          label="Tárgy"
          hint={subjectEdited ? "Kézzel szerkesztett vázlat." : "Szerkeszthető vázlat — a mezőkből frissül."}
        >
          <input
            id="email-subject"
            ref={subjectRef}
            className="hvh-input"
            type="text"
            value={subject}
            aria-describedby="email-subject-hint"
            onChange={(e) => props.onEdit("subject", e.target.value)}
          />
        </Field>
        <ManualNotice field="subject" visible={subjectSkipped} onRefresh={props.onRefresh} onKeep={props.onKeep} />
      </div>

      <div className={styles.stackTight}>
        <Field
          id="email-body"
          label="Szöveg"
          hint={bodyEdited ? "Kézzel szerkesztett vázlat." : "Szerkeszthető vázlat — a mezőkből frissül."}
        >
          <textarea
            id="email-body"
            ref={bodyRef}
            className={`hvh-textarea ${styles.bodyArea}`}
            rows={18}
            value={body}
            aria-describedby="email-body-hint"
            onChange={(e) => props.onEdit("body", e.target.value)}
          />
        </Field>
        <ManualNotice field="body" visible={bodySkipped} onRefresh={props.onRefresh} onKeep={props.onKeep} />
      </div>
    </section>
  );
}

interface ManualNoticeProps {
  field: TextField;
  visible: boolean;
  onRefresh: (field: TextField) => void;
  onKeep: (field: TextField) => void;
}

/** Állandóan jelen lévő aria-live burkoló, hogy a megjelenő értesítést felolvassák. */
function ManualNotice({ field, visible, onRefresh, onKeep }: ManualNoticeProps) {
  return (
    <div aria-live="polite">
      {visible ? (
        <div className="hvh-notice hvh-notice--warning">
          <p>{NOTICE_TEXT[field]}</p>
          <div className={styles.btnRow}>
            <button type="button" className={`hvh-btn hvh-btn--secondary hvh-btn--sm ${styles.touch}`} onClick={() => onRefresh(field)}>
              Frissítés a mezőkből (kézi módosítás elvész)
            </button>
            <button type="button" className={`hvh-btn hvh-btn--ghost hvh-btn--sm ${styles.touch}`} onClick={() => onKeep(field)}>
              Kézi szöveg megtartása
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
