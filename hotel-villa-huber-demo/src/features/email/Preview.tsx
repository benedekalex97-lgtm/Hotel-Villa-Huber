import { splitPlaceholders } from "./render";
import styles from "./EmailWorkbench.module.css";

interface PreviewProps {
  subject: string;
  body: string;
  placeholders: string[];
}

/** Egy szöveg kiemelt helyőrzőkkel; csak szövegcsomópontokat renderel (nincs HTML-beszúrás). */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {splitPlaceholders(text).map((part, i) =>
        part.placeholder ? (
          <mark key={i} className={styles.ph}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

/** Papírszerű, olvasható előnézet; a kitöltetlen helyőrzők kiemelve. */
export function Preview({ subject, body, placeholders }: PreviewProps) {
  return (
    <section className={styles.stack} aria-labelledby="email-preview-title">
      <h2 id="email-preview-title" className={styles.panelTitle}>
        Előnézet
      </h2>
      <article className={styles.paper}>
        <p className={styles.paperSubject}>
          <span className={styles.paperLabel}>Tárgy:</span> <Highlighted text={subject} />
        </p>
        <div className={styles.paperBody}>
          <Highlighted text={body} />
        </div>
      </article>
      <p className={placeholders.length ? styles.phStatus : styles.phStatusOk}>
        {placeholders.length ? (
          <>
            Kitöltetlen helyőrző a szövegben:{" "}
            {placeholders.map((p, i) => (
              <span key={p}>
                {i > 0 ? ", " : ""}
                <mark className={styles.ph}>{p}</mark>
              </span>
            ))}
          </>
        ) : (
          "Nincs kitöltetlen helyőrző a tárgyban és a szövegben."
        )}
      </p>
    </section>
  );
}
