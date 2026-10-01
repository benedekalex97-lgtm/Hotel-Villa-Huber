import { Field } from "@/components/form/Field";
import { articleAdjusted, cleanValue } from "./render";
import { CONTACT_EMAIL, VAR_META, placeholderFor, type EmailTemplate, type Values, type VarName } from "./templates";
import styles from "./EmailWorkbench.module.css";

interface FieldsPanelProps {
  template: EmailTemplate;
  values: Values;
  /** Igaz, ha a felhasználó már próbált másolni: a hiányzó mezők hibaként jelennek meg. */
  attempted: boolean;
  demo: boolean;
  onChange: (name: VarName, value: string) => void;
  onFillDemo: () => void;
  onClear: () => void;
}

/** A sablon által használt mezők; a nem használtak rejtettek, de az értékük megmarad az állapotban. */
export function FieldsPanel({ template, values, attempted, demo, onChange, onFillDemo, onClear }: FieldsPanelProps) {
  const adjusted = articleAdjusted(template, values);

  return (
    <section className={styles.stack} aria-labelledby="email-fields-title">
      <h2 id="email-fields-title" className={styles.panelTitle}>
        Adatok
      </h2>

      {template.fields.map((f) => {
        const meta = VAR_META[f.var];
        const id = `email-field-${f.var}`;
        const placeholder = placeholderFor(template, f.var);
        const filled = cleanValue(values[f.var]).length > 0;
        const missing = f.required && !filled;
        const showError = missing && attempted;

        const hint =
          f.var === "connection" && placeholder ? (
            <>
              Sablon szerint: „{placeholder.slice(1, -1)}”
            </>
          ) : undefined;
        const where = meta.where ? ` (${meta.where})` : "";
        const statusText = `${showError ? "Hiányzik" : "Kitöltendő"} – a levélben még „${placeholder ?? ""}” szerepel${where}.`;
        const showNote = f.var === "companyName" && adjusted;

        const describedBy =
          [hint ? `${id}-hint` : null, showError ? `${id}-error` : `${id}-status`, showNote ? `${id}-note` : null]
            .filter(Boolean)
            .join(" ") || undefined;

        return (
          <Field key={f.var} id={id} label={meta.label} hint={hint} error={showError ? statusText : null}>
            <input
              id={id}
              className="hvh-input"
              type="text"
              inputMode={meta.inputMode}
              autoComplete={meta.autoComplete}
              spellCheck={false}
              value={values[f.var]}
              aria-required={f.required}
              aria-invalid={showError}
              aria-describedby={describedBy}
              onChange={(e) => onChange(f.var, e.target.value)}
            />
            {!showError ? (
              <p id={`${id}-status`} className={filled ? styles.statusOk : styles.status}>
                {filled ? "Kitöltve." : statusText}
              </p>
            ) : null}
            {showNote ? (
              <p id={`${id}-note`} className={styles.note}>
                A névelőt (A/Az) a cégnévhez igazítottuk — ellenőrizze rövidítéseknél.
              </p>
            ) : null}
          </Field>
        );
      })}

      <div className={styles.btnRow}>
        <button type="button" className={`hvh-btn hvh-btn--secondary hvh-btn--sm ${styles.touch}`} onClick={onFillDemo}>
          Demó kitöltés
        </button>
        <button type="button" className={`hvh-btn hvh-btn--ghost hvh-btn--sm ${styles.touch}`} onClick={onClear}>
          Mezők ürítése
        </button>
      </div>

      <div className={styles.contact}>
        <p>
          <span className={styles.contactLabel}>Kapcsolati cím az aláírásban:</span> <strong>{CONTACT_EMAIL}</strong>
        </p>
        <p className="hvh-hint">Ez az aláírásban szereplő kapcsolattartó cím — nem küldő fiók és nem címzett.</p>
      </div>

      {demo ? (
        <p className="hvh-notice hvh-notice--warning" role="status">
          <strong>Minta adatok.</strong>
          <span>A mezők fiktív mintaadatokkal vannak kitöltve (Minta Péter, Minta Szálloda Kft., Kovács Anna) — nem valódi címzett. Éles használat előtt ürítse a mezőket.</span>
        </p>
      ) : null}
    </section>
  );
}
