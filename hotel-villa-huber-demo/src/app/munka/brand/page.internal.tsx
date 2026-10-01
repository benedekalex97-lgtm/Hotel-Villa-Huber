import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { internalToolsEnabled } from "@/lib/internal-gate";
import { Wordmark } from "@/components/brand/Wordmark";
import { MediaImage } from "@/components/media/MediaImage";
import { Field } from "@/components/form/Field";
import { getMedia } from "@/content/media";
import styles from "./brand.module.css";

export const metadata: Metadata = {
  title: "Brand board",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const COLORS = [
  { token: "--hvh-paper", hex: "#F6F1E7", name: "Törtfehér", use: "Alap háttér" },
  { token: "--hvh-paper-deep", hex: "#ECE4D4", name: "Homok", use: "Váltott szekció, képhely" },
  { token: "--hvh-surface", hex: "#FFFCF6", name: "Felület", use: "Kártya, input" },
  { token: "--hvh-forest", hex: "#2C4636", name: "Mély zöld", use: "Elsődleges gomb, link", dark: true },
  { token: "--hvh-forest-strong", hex: "#1F3427", name: "Erdő", use: "Hover, sötét sáv, lábléc", dark: true },
  { token: "--hvh-forest-tint", hex: "#DFE6DC", name: "Zöld tónus", use: "Kijelölés, aktív állapot" },
  { token: "--hvh-bronze", hex: "#9B6B3A", name: "Bronz", use: "Akcentus: vonal, szám", dark: true },
  { token: "--hvh-bronze-ink", hex: "#7A5226", name: "Bronz szöveg", use: "Eyebrow, kis kiemelés", dark: true },
  { token: "--hvh-ink", hex: "#1E221F", name: "Tinta", use: "Elsődleges szöveg", dark: true },
  { token: "--hvh-ink-muted", hex: "#4A5049", name: "Tinta, halvány", use: "Másodlagos szöveg", dark: true },
  { token: "--hvh-line", hex: "#D8CDB9", name: "Vonal", use: "Elválasztó, keret" },
  { token: "--hvh-focus", hex: "#A46A26", name: "Fókusz", use: "Fókuszgyűrű (3 px); sötét alapon #E0BD8A", dark: true },
] as const;

const STATUS = [
  { token: "--hvh-success", tint: "--hvh-success-tint", label: "Kész / siker" },
  { token: "--hvh-warning", tint: "--hvh-warning-tint", label: "Hiányzó adat" },
  { token: "--hvh-danger", tint: "--hvh-danger-tint", label: "Hiba" },
] as const;

const TYPE = [
  { token: "--hvh-fs-display", label: "Display", sample: "Hotel Villa Huber", serif: true },
  { token: "--hvh-fs-h1", label: "H1", sample: "Karakteres villa-hotel Karintiában", serif: true },
  { token: "--hvh-fs-h2", label: "H2", sample: "Két vásárlási út", serif: true },
  { token: "--hvh-fs-h3", label: "H3", sample: "Első egyeztetés", serif: true },
  { token: "--hvh-fs-lead", label: "Lead", sample: "Magyar befektetőknek és szállodás vállalkozásoknak.", serif: false },
  { token: "--hvh-fs-body", label: "Törzs 17 px", sample: "Árvíztűrő tükörfúrógép — ő, ű, Ő, Ű, á, é, í, ó, ö, ú, ü.", serif: false },
  { token: "--hvh-fs-small", label: "Kicsi 15 px", sample: "Segédszöveg, képaláírás, címke.", serif: false },
] as const;

const SPACE = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const RATIOS = [
  { ratio: "hero", label: "Hero 3:2" },
  { ratio: "wide", label: "Széles 16:9" },
  { ratio: "portrait", label: "Álló 4:5" },
  { ratio: "square", label: "Négyzet 1:1" },
] as const;

export default function BrandBoardPage() {
  if (!internalToolsEnabled()) notFound();
  const sample = getMedia("facade-summer");

  return (
    <div className={styles.board}>
      <header className={styles.head}>
        <p className="hvh-eyebrow">Brand board · v0.1</p>
        <h1 className={styles.title}>Hotel Villa Huber — arculati alapok</h1>
        <p className="hvh-lead">
          Nyugodt, karakteres karintiai villa-hotel, befektető számára hiteles bemutatással. Ideiglenes wordmark; hivatalos logó és
          brandjóváhagyás nincs.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="bb-wordmark">
        <h2 id="bb-wordmark" className={styles.h2}>
          Wordmark
        </h2>
        <div className={styles.marks}>
          <div className={styles.markTile}>
            <Wordmark width={260} />
            <span className={styles.meta}>Elsődleges · zöld + bronz</span>
          </div>
          <div className={`${styles.markTile} ${styles.markDark}`}>
            <Wordmark width={260} tone="light" />
            <span className={styles.meta}>Sötét háttéren</span>
          </div>
          <div className={styles.markTile}>
            <Wordmark width={120} tone="ink" />
            <span className={styles.meta}>Minimum 120 px szélesség</span>
          </div>
        </div>
        <p className={styles.note}>
          SVG-útvonalakra konvertált Fraunces és Source Sans 3 betűk (scripts/build-wordmark.py). Védőtér: a „HOTEL” sor magassága
          minden oldalon.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="bb-colors">
        <h2 id="bb-colors" className={styles.h2}>
          Színek
        </h2>
        <ul className={styles.swatches}>
          {COLORS.map((c) => (
            <li key={c.token} className={styles.swatch}>
              <span className={styles.chip} style={{ background: `var(${c.token})` }} />
              <span className={styles.swName}>{c.name}</span>
              <code className={styles.code}>
                {c.token} · {c.hex}
              </code>
              <span className={styles.meta}>{c.use}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.statusRow}>
          {STATUS.map((s) => (
            <li key={s.token} className={styles.status} style={{ background: `var(${s.tint})`, borderColor: `var(${s.token})` }}>
              <strong style={{ color: `var(${s.token})` }}>{s.label}</strong>
              <code className={styles.code}>{s.token}</code>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Kontraszt a törtfehér alapon: tinta 14,3:1 · halvány tinta 7,4:1 · mély zöld 9,2:1 · bronz szöveg 6,1:1 · input keret 3,8:1. A bronz (#9B6B3A, 4,1:1)
          csak akcentus, kis szövegre a bronz szöveg tokent használjuk.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="bb-type">
        <h2 id="bb-type" className={styles.h2}>
          Tipográfia
        </h2>
        <p className={styles.note}>
          Címek: Fraunces (serif, optikai méretezés, latin-ext). Törzs: Source Sans 3. Mindkettő helyben, npm-csomagból töltődik;
          tartalék: Georgia / system-ui.
        </p>
        <ul className={styles.typeList}>
          {TYPE.map((t) => (
            <li key={t.token} className={styles.typeRow}>
              <span className={styles.typeMeta}>
                {t.label}
                <code className={styles.code}>{t.token}</code>
              </span>
              <span
                style={{
                  fontSize: `var(${t.token})`,
                  fontFamily: t.serif ? "var(--hvh-font-serif)" : "var(--hvh-font-sans)",
                  lineHeight: t.serif ? 1.15 : 1.5,
                }}
              >
                {t.sample}
              </span>
            </li>
          ))}
        </ul>
        <p className="hvh-eyebrow">Eyebrow · 13 px · 0,14 em ritkítás</p>
      </section>

      <section className={styles.section} aria-labelledby="bb-space">
        <h2 id="bb-space" className={styles.h2}>
          Térköz
        </h2>
        <ul className={styles.spaceList}>
          {SPACE.map((s) => (
            <li key={s} className={styles.spaceRow}>
              <code className={styles.code}>--hvh-space-{s}</code>
              <span className={styles.spaceBar} style={{ width: `var(--hvh-space-${s})` }} />
            </li>
          ))}
        </ul>
        <p className={styles.note}>4 px alapú skála. Szekció függőleges térköz: clamp(56 px → 112 px). Oldalsó margó: clamp(16 px → 40 px).</p>
      </section>

      <section className={styles.section} aria-labelledby="bb-controls">
        <h2 id="bb-controls" className={styles.h2}>
          Gombok, mezők, fókusz
        </h2>
        <div className={styles.controls}>
          <div className={styles.btnRow}>
            <button type="button" className="hvh-btn">
              Részletes bemutatót kérek
            </button>
            <button type="button" className="hvh-btn hvh-btn--secondary">
              Megnézem a galériát
            </button>
            <button type="button" className="hvh-btn hvh-btn--ghost">
              Szöveges gomb
            </button>
            <button type="button" className="hvh-btn hvh-btn--sm">
              Kicsi
            </button>
            <button type="button" className="hvh-btn" disabled>
              Letiltott
            </button>
          </div>
          <div className={`${styles.btnRow} ${styles.darkRow}`}>
            <button type="button" className="hvh-btn hvh-btn--on-dark">
              Sötét háttéren
            </button>
          </div>
          <div className={styles.fields}>
            <Field id="bb-name" label="Név">
              <input id="bb-name" className="hvh-input" defaultValue="Minta Péter" />
            </Field>
            <Field id="bb-company" label="Cég" optional hint="Ha cég nevében érdeklődik.">
              <input id="bb-company" className="hvh-input" aria-describedby="bb-company-hint" />
            </Field>
            <Field id="bb-email" label="Email" error="Adjon meg érvényes email-címet.">
              <input id="bb-email" className="hvh-input" defaultValue="minta@" aria-invalid="true" aria-describedby="bb-email-error" />
            </Field>
            <Field id="bb-focus" label="Fókuszállapot (minta)">
              <input id="bb-focus" className={`hvh-input ${styles.fakeFocus}`} defaultValue="3 px bronz gyűrű" />
            </Field>
          </div>
          <div className="hvh-notice hvh-notice--warning">
            <strong>Még nem kész</strong>
            <span>A szövegben kitöltetlen helyettesítő maradt: [Név]</span>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="bb-ratios">
        <h2 id="bb-ratios" className={styles.h2}>
          Képarányok
        </h2>
        <div className={styles.ratios}>
          {RATIOS.map((r) => (
            <figure key={r.ratio} className={styles.ratioFig}>
              <MediaImage asset={sample} ratio={r.ratio} sizes="(min-width: 768px) 480px, 100vw" decorative />
              <figcaption className={styles.meta}>{r.label}</figcaption>
            </figure>
          ))}
          <figure className={styles.ratioFig}>
            <MediaImage asset={null} ratio="hero" sizes="240px" />
            <figcaption className={styles.meta}>Üres képhely (csere előtt)</figcaption>
          </figure>
        </div>
        <p className={styles.note}>
          A meglévő képek legfeljebb 1024 px szélesek: nem nyújtjuk teljes képernyősre. Vágás a manifest fókuszpontja szerint
          (object-position).
        </p>
      </section>

      <section className={styles.section} aria-labelledby="bb-mobile">
        <h2 id="bb-mobile" className={styles.h2}>
          Mobil és mozgás
        </h2>
        <ul className={styles.rules}>
          <li>Töréspontok: 390 px mobil · 768 px tablet · 960 px fejléc-navigáció · 1440 px desktop.</li>
          <li>Érintési cél ≥ 44 px; input betűméret 16 px (iOS nem nagyít).</li>
          <li>Nincs vízszintes túlcsordulás; a képek és táblák a konténerben maradnak.</li>
          <li>Mozgás: csak 180 ms-os színátmenet; prefers-reduced-motion esetén kikapcsol. Nincs automatikus hang, scroll hijack vagy dekoratív 3D.</li>
          <li>Belső felület (/munka/*): ugyanazok a tokenek, sűrűbb elrendezés, kisebb fejléc.</li>
        </ul>
      </section>
    </div>
  );
}
