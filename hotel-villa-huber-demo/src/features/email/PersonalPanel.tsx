import { Field } from "@/components/form/Field";
import { PERSONAL_FIELD_META, PERSONAL_FIELD_ORDER, PERSONAL_PLACEHOLDER, type PersonalField, type PersonalValues } from "./model";
import { cleanLine } from "./presentation";
import type { Readiness } from "./validate";
import styles from "./EmailWorkbench.module.css";

interface PersonalPanelProps {
  personal: PersonalValues;
  subject: string;
  preheader: string;
  readiness: Readiness;
  /** Igaz, ha a felhasználó már próbált exportálni: a hiányzó mezők hibaként jelennek meg. */
  attempted: boolean;
  onPersonal: (field: PersonalField, value: string) => void;
  onSubject: (value: string) => void;
  onPreheader: (value: string) => void;
}

const PLACEHOLDER_OF: Partial<Record<PersonalField, string>> = {
  recipientName: PERSONAL_PLACEHOLDER.recipientName,
  senderName: PERSONAL_PLACEHOLDER.senderName,
  senderPhone: PERSONAL_PLACEHOLDER.senderPhone,
};

/** Címzett, feladó, személyes bevezető, tárgy és előnézeti szöveg. */
export function PersonalPanel({ personal, subject, preheader, readiness, attempted, onPersonal, onSubject, onPreheader }: PersonalPanelProps) {
  return (
    <section className={styles.stack} aria-labelledby="email-fields-title">
      <h2 id="email-fields-title" className={styles.panelTitle}>
        Címzett, feladó és tárgy
      </h2>

      {PERSONAL_FIELD_ORDER.map((field) => {
        const meta = PERSONAL_FIELD_META[field];
        const id = `email-field-${field}`;
        const filled = cleanLine(personal[field]).length > 0;
        const missing = meta.required && !filled;
        const invalid = readiness.invalidFields.find((f) => f.field === field);
        const error = invalid ? invalid.message : missing && attempted ? `Hiányzik – a levélben még „${PLACEHOLDER_OF[field] ?? ""}” szerepel (${meta.where}).` : null;
        const statusId = `${id}-status`;
        const status = filled
          ? "Kitöltve."
          : meta.required
            ? `Kötelező – a levélben még „${PLACEHOLDER_OF[field] ?? ""}” szerepel (${meta.where}).`
            : `Opcionális – ${meta.where}.`;
        const describedBy = [`${id}-hint`, error ? `${id}-error` : statusId].join(" ");
        return (
          <Field
            key={field}
            id={id}
            label={meta.label}
            optional={!meta.required}
            hint={field === "personalIntro" ? "Üresen hagyva a levélben nem jelenik meg üres sor vagy helyőrző." : undefined}
            error={error}
          >
            {meta.multiline ? (
              <textarea
                id={id}
                className={`hvh-textarea ${styles.smallArea}`}
                rows={3}
                value={personal[field]}
                aria-describedby={field === "personalIntro" ? describedBy : statusId}
                aria-invalid={!!error}
                onChange={(e) => onPersonal(field, e.target.value)}
              />
            ) : (
              <input
                id={id}
                className="hvh-input"
                type={meta.type ?? "text"}
                inputMode={meta.inputMode}
                autoComplete={meta.autoComplete}
                spellCheck={false}
                value={personal[field]}
                aria-required={meta.required}
                aria-invalid={!!error}
                aria-describedby={field === "personalIntro" ? describedBy : error ? `${id}-error` : statusId}
                onChange={(e) => onPersonal(field, e.target.value)}
              />
            )}
            {!error ? (
              <p id={statusId} className={filled ? styles.statusOk : styles.status}>
                {status}
              </p>
            ) : null}
          </Field>
        );
      })}

      <Field id="email-subject" label="Tárgy" error={readiness.subjectMissing ? "A tárgy nem lehet üres." : null}>
        <input
          id="email-subject"
          className="hvh-input"
          type="text"
          value={subject}
          aria-invalid={readiness.subjectMissing}
          onChange={(e) => onSubject(e.target.value)}
        />
      </Field>
      <Field id="email-preheader" label="Előnézeti szöveg (preheader)" hint="A levelezők a tárgy mellett mutatják; a levélben rejtett.">
        <textarea
          id="email-preheader"
          className={`hvh-textarea ${styles.smallArea}`}
          rows={3}
          value={preheader}
          aria-describedby="email-preheader-hint"
          onChange={(e) => onPreheader(e.target.value)}
        />
      </Field>
    </section>
  );
}
