import { TEMPLATES, type TemplateId } from "./templates";
import styles from "./EmailWorkbench.module.css";

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

/** Sablonválasztó: rádiócsoport (fieldset/legend), sablononként rövid leírással. */
export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.panelTitle}>Sablon</legend>
      <div className={styles.choices}>
        {TEMPLATES.map((t) => (
          <label key={t.id} className="hvh-choice">
            <input type="radio" name="email-template" value={t.id} checked={value === t.id} onChange={() => onChange(t.id)} />
            <span className={styles.choiceText}>
              <span className={styles.choiceLabel}>{t.label}</span>
              <span className={styles.choiceDesc}>{t.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
