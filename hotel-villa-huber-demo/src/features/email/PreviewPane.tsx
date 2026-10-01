import styles from "./EmailWorkbench.module.css";

export type PreviewSize = "desktop" | "mobile";

interface PreviewPaneProps {
  html: string;
  size: PreviewSize;
  ready: boolean;
  onSize: (size: PreviewSize) => void;
}

/**
 * Az előnézet pontosan azt a HTML-t mutatja, amelyet exportálunk (`srcDoc`).
 * Sandboxolt iframe: nincs szkript, a linkek új lapon nyílnak. Ez böngészős előnézet,
 * nem levelezőkliens-teszt.
 */
export function PreviewPane({ html, size, ready, onSize }: PreviewPaneProps) {
  return (
    <section className={styles.stack} aria-labelledby="email-preview-title">
      <div className={styles.previewHead}>
        <h2 id="email-preview-title" className={styles.panelTitle}>
          HTML-előnézet
        </h2>
        <div className={styles.segmented} role="group" aria-label="Előnézeti méret">
          <button type="button" aria-pressed={size === "desktop"} className={styles.segBtn} onClick={() => onSize("desktop")}>
            Asztali
          </button>
          <button type="button" aria-pressed={size === "mobile"} className={styles.segBtn} onClick={() => onSize("mobile")}>
            Mobil (390 px)
          </button>
        </div>
      </div>
      {!ready ? (
        <p className="hvh-notice hvh-notice--warning" role="note">
          <span>Hiányos levél előnézete — a helyőrzők a levélben is láthatók, ezért nem exportálható.</span>
        </p>
      ) : null}
      <div className={`${styles.frameWrap} ${size === "mobile" ? styles.frameWrapMobile : ""}`}>
        <iframe
          title="Levél HTML-előnézete"
          className={`${styles.frame} ${size === "mobile" ? styles.frameMobile : styles.frameDesktop}`}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          srcDoc={html}
          data-preview-size={size}
        />
      </div>
    </section>
  );
}
