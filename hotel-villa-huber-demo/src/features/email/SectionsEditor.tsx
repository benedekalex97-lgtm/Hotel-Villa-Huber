import type { EditableField } from "./model";
import styles from "./EmailWorkbench.module.css";

interface SectionsEditorProps {
  fields: EditableField[];
  sectionTitles: { letter: string; title: string }[];
  onEdit: (field: EditableField, value: string) => void;
  onRestore: (key: string) => void;
}

/**
 * A bemutató szekciószövegei, szekciónként nyitható csoportokban. Az állapotcímkék (megerősített /
 * korábbi nyilvános közlés / tulajdonosi közlés / egyeztetés tárgya) nem szerkeszthetők: a levélben
 * mindig az adat mellett maradnak. A szerkesztés csak szöveget módosít, nyers HTML-t nem fogad.
 */
export function SectionsEditor({ fields, sectionTitles, onEdit, onRestore }: SectionsEditorProps) {
  const groups = [{ letter: "–", title: "Bevezető és záró szövegek" }, ...sectionTitles];
  return (
    <section className={styles.stack} aria-labelledby="email-sections-title">
      <h2 id="email-sections-title" className={styles.panelTitle}>
        Szekciószövegek
      </h2>
      <p className="hvh-hint">
        A központi tartalomból épülnek. Módosítás után a mező „kézzel módosítva” jelölést kap, és a név, telefonszám vagy előnézeti méret
        változtatása nem írja felül. Az állapotcímkék nem szerkeszthetők.
      </p>
      <div className={styles.sectionList}>
        {groups.map((group) => {
          const list = fields.filter((f) => f.section === group.letter && !f.key.endsWith(".title"));
          if (!list.length) return null;
          const edited = list.filter((f) => f.edited).length;
          return (
            <details key={group.letter} className={styles.sectionItem}>
              <summary>
                <span>
                  {group.letter === "–" ? "" : `${group.letter}) `}
                  {group.title}
                </span>
                {edited ? <span className={styles.editedCount}>{edited} módosított</span> : null}
              </summary>
              <div className={styles.fieldStack}>
                {list.map((field) => {
                  const id = `email-edit-${field.key.replace(/[^a-zA-Z0-9]+/g, "-")}`;
                  return (
                    <div key={field.key} className={styles.stackTight}>
                      <label className="hvh-label" htmlFor={id}>
                        {field.label}
                        {field.edited ? <span className={styles.editedBadge}> · kézzel módosítva</span> : null}
                      </label>
                      <textarea
                        id={id}
                        className={`hvh-textarea ${styles.fieldArea}`}
                        rows={field.multiline ? Math.min(6, Math.max(2, Math.ceil(field.value.length / 60))) : 2}
                        value={field.value}
                        onChange={(e) => onEdit(field, e.target.value)}
                      />
                      {field.edited ? (
                        <button type="button" className={`hvh-btn hvh-btn--ghost hvh-btn--sm ${styles.touch} ${styles.restoreBtn}`} onClick={() => onRestore(field.key)}>
                          Alapérték visszaállítása ennél a mezőnél
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
