import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { GALLERY, MEDIA_SLOTS, getMedia, getSlot } from "@/content/media";
import { ACCOMMODATION, AREA_HIGHLIGHTS, GUEST_SERVICES } from "@/content/guest";
import { FACT_STATUS_EXPLANATION, FACT_STATUS_ORDER, FACT_STATUS_PUBLIC_LABEL, publicFactView } from "@/content/property";
import type { PublicFactId } from "@/content/property";
import {
  AUDIENCES,
  DOCUMENT_TOPICS,
  OPEN_DATA_TOPICS,
  OPERATIONS,
  POSSIBLE_DIRECTIONS,
  PROPERTY_DATA_GROUPS,
  PURCHASE_PATHS,
  PURCHASE_PROCESS,
  SALE_CTA_LABEL,
  SALE_FAQ,
  SALE_SUMMARY,
  SALE_TERMS,
  VIEWING,
} from "@/content/sales";
import { HOME_SECTIONS, ROUTES, SALE_SECTIONS } from "@/content/site";
import type { DeliveryMode } from "@/features/inquiry/delivery";
import { InquiryForm } from "./InquiryForm";
import { StatusBadge } from "./StatusBadge";
import { StickyCta } from "./StickyCta";
import styles from "./SalePage.module.css";

const HERO_CTA_ID = "sale-hero-cta";
const GALLERY_HREF = `${ROUTES.home}#${HOME_SECTIONS.gallery}`;

/** Oldalon belüli index — a szekciók sorrendje és rövid címkéi. */
const SECTION_INDEX: readonly { id: string; label: string }[] = [
  { id: SALE_SECTIONS.data, label: "Ingatlanadatok" },
  { id: SALE_SECTIONS.spaces, label: "A ház és terei" },
  { id: SALE_SECTIONS.area, label: "Környék" },
  { id: SALE_SECTIONS.operations, label: "Működés" },
  { id: SALE_SECTIONS.audience, label: "Kinek lehet érdekes?" },
  { id: SALE_SECTIONS.paths, label: "Vásárlási utak" },
  { id: SALE_SECTIONS.terms, label: "Feltételek" },
  { id: SALE_SECTIONS.documents, label: "Dokumentumok" },
  { id: SALE_SECTIONS.faq, label: "Gyakori kérdések" },
  { id: SALE_SECTIONS.process, label: "Folyamat" },
  { id: SALE_SECTIONS.inquiry, label: "Ajánlatkérés" },
];

function SectionHead({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead?: string }) {
  return (
    <header className={styles.head}>
      <p className="hvh-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {lead ? <p className="hvh-lead">{lead}</p> : null}
    </header>
  );
}

/** Egy adat (címke, érték, állapot) — a nem megerősített értékek mindig állapotcímkével jelennek meg. */
function FactRow({ id }: { id: PublicFactId }) {
  const fact = publicFactView(id);
  return (
    <div className={styles.factRow}>
      <dt>{fact.label}</dt>
      <dd>
        <span className={styles.factValue}>{fact.value}</span>
        <StatusBadge status={fact.status} label={fact.statusLabel} />
      </dd>
    </div>
  );
}

export function SalePage({ deliveryMode }: { deliveryMode: DeliveryMode }) {
  const heroImage = getSlot("sale.hero");
  const heroMediaId = MEDIA_SLOTS["sale.hero"];

  // Kompakt galériasor: a galéria azon képei, amelyek fent még nem szerepelnek.
  const usedMedia = new Set<string>([
    ...(heroMediaId ? [heroMediaId] : []),
    ...ACCOMMODATION.map((a) => a.media),
    ...GUEST_SERVICES.flatMap((s) => (s.media ? [s.media] : [])),
  ]);
  const stripImages = GALLERY.filter((id) => !usedMedia.has(id))
    .slice(0, 4)
    .map((id) => getMedia(id));

  const roomsFact = publicFactView("rooms");
  const spacesFact = publicFactView("spaces");
  const lakeFact = publicFactView("lake-distance");

  return (
    <>
      {/* A) Hero és összefoglaló */}
      <section id={SALE_SECTIONS.summary} className={styles.hero} aria-labelledby="sale-title">
        <div className={`hvh-container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="hvh-eyebrow">Értékesítés</p>
            <h1 id="sale-title" className={styles.heroTitle}>
              {SALE_SUMMARY.title}
            </h1>
            <p className="hvh-lead">{SALE_SUMMARY.subtitle}</p>
            <ul className={styles.points}>
              {SALE_SUMMARY.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <a id={HERO_CTA_ID} href={`#${SALE_SECTIONS.inquiry}`} className="hvh-btn">
                {SALE_CTA_LABEL}
              </a>
            </div>
          </div>
          <MediaImage
            asset={heroImage}
            ratio="hero"
            priority
            withCaption
            sizes="(min-width: 1100px) 560px, (min-width: 768px) 90vw, calc(100vw - 2rem)"
            className={styles.heroImage}
          />
        </div>
      </section>

      <nav className={styles.index} aria-label="Az oldal szakaszai">
        <div className="hvh-container">
          <p className={styles.indexLabel}>Ugrás a szakaszhoz</p>
          <ul className={styles.indexList}>
            {SECTION_INDEX.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* B) Ingatlanadatok */}
      <section id={SALE_SECTIONS.data} className={styles.section} aria-labelledby="sale-data-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-data-title"
            eyebrow="Az ingatlan"
            title="Ingatlanadatok"
            lead="Minden adat mellett jelezzük, mennyire ellenőrzött. A nem megerősített adatokat a tulajdonossal, dokumentum alapján erősítjük meg."
          />

          <div className={styles.legend}>
            <h3 className={styles.legendTitle}>Állapotjelölések</h3>
            <ul className={styles.legendList}>
              {FACT_STATUS_ORDER.map((status) => (
                <li key={status}>
                  <StatusBadge status={status} label={FACT_STATUS_PUBLIC_LABEL[status]} />
                  <span>{FACT_STATUS_EXPLANATION[status]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.groups}>
            {PROPERTY_DATA_GROUPS.map((group) => (
              <div key={group.title} className={styles.group}>
                <h3>{group.title}</h3>
                <dl className={styles.factList}>
                  {group.factIds.map((id) => (
                    <FactRow key={id} id={id} />
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <div className={styles.openTopics}>
            <h3>Ami még egyeztetés tárgya</h3>
            <p className={styles.openLead}>
              Ezekről az adatokról jelenleg nincs megbízható forrásunk, ezért nem közlünk számot vagy minősítést. A tulajdonossal dokumentumok alapján tisztázzuk őket.
            </p>
            <ul className={styles.openList}>
              {OPEN_DATA_TOPICS.map((topic) => (
                <li key={topic.title}>
                  <StatusBadge status="ismeretlen" label={FACT_STATUS_PUBLIC_LABEL.ismeretlen} />
                  <h4>{topic.title}</h4>
                  <p>{topic.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* C) A ház és terei */}
      <section id={SALE_SECTIONS.spaces} className={`${styles.section} ${styles.deep}`} aria-labelledby="sale-spaces-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-spaces-title"
            eyebrow="A ház"
            title="A ház és terei"
            lead="Csak olyan tereket mutatunk, amelyek fotón láthatók vagy a korábbi nyilvános leírásokban szerepelnek."
          />
          <p className={styles.sectionNote}>
            <StatusBadge status={spacesFact.status} label={spacesFact.statusLabel} />
            <span>A fotók a terek létét mutatják; aktuális állapotukat nem igazolják.</span>
          </p>

          <div className={styles.subhead}>
            <h3>Szálláshelyek</h3>
            <p>
              <strong>{roomsFact.label}:</strong> {roomsFact.value}.
            </p>
            <StatusBadge status={roomsFact.status} label={roomsFact.statusLabel} />
            <p className={styles.subNote}>Hivatalos szobatípus-lista nincs; az alábbiak a fotókon látható elhelyezési formák.</p>
          </div>
          <ul className={`${styles.cards} ${styles.cards4}`}>
            {ACCOMMODATION.map((form) => (
              <li key={form.id} className={styles.photoCard}>
                <MediaImage
                  asset={getMedia(form.media)}
                  ratio="landscape"
                  sizes="(min-width: 1100px) 290px, (min-width: 640px) 45vw, calc(100vw - 2rem)"
                />
                <h4>{form.title}</h4>
                <p>{form.description}</p>
              </li>
            ))}
          </ul>

          <div className={styles.subhead}>
            <h3>Közösségi terek és szolgáltatások</h3>
            <p className={styles.subNote}>Nyitvatartást és működést itt nem ígérünk; a tulajdonossal egyeztetve tisztázzuk.</p>
          </div>
          <ul className={`${styles.cards} ${styles.cards3}`}>
            {GUEST_SERVICES.map((service) => (
              <li key={service.id} className={styles.photoCard}>
                {service.media ? (
                  <MediaImage
                    asset={getMedia(service.media)}
                    ratio="landscape"
                    sizes="(min-width: 1100px) 380px, (min-width: 640px) 45vw, calc(100vw - 2rem)"
                  />
                ) : null}
                <h4>{service.title}</h4>
                <p>{service.description}</p>
                <StatusBadge status={service.status} label={FACT_STATUS_PUBLIC_LABEL[service.status]} />
              </li>
            ))}
          </ul>

          <div className={styles.strip}>
            <div className={styles.stripHead}>
              <h3>További képek</h3>
              <Link href={GALLERY_HREF} className={styles.textLink}>
                Teljes galéria
              </Link>
            </div>
            <ul className={styles.stripList}>
              {stripImages.map((asset) => (
                <li key={asset.id}>
                  <MediaImage asset={asset} ratio="landscape" withCaption sizes="(min-width: 1100px) 290px, (min-width: 640px) 45vw, 50vw" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* D) Környék */}
      <section id={SALE_SECTIONS.area} className={`hvh-surface-dark ${styles.section}`} aria-labelledby="sale-area-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-area-title"
            eyebrow="Környék"
            title="Környék és elhelyezkedés"
            lead="Afritz am See a karintiai tóvidéken fekszik. A környékre vonatkozó adatok hivatalos települési és turisztikai forrásokból származnak; utazási időt itt nem közlünk."
          />
          <ul className={`${styles.cards} ${styles.cards2}`}>
            {AREA_HIGHLIGHTS.map((item) => (
              <li key={item.title} className={styles.darkCard}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
          <dl className={`${styles.factList} ${styles.lakeFact}`}>
            <div className={styles.factRow}>
              <dt>{lakeFact.label}</dt>
              <dd>
                <span className={styles.factValue}>{lakeFact.value}</span>
                <StatusBadge status={lakeFact.status} label={lakeFact.statusLabel} />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* E) Működés */}
      <section id={SALE_SECTIONS.operations} className={styles.section} aria-labelledby="sale-operations-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-operations-title"
            eyebrow="Működés"
            title="Működés és üzemeltetési háttér"
            lead="A működésről jelenleg rendelkezésre álló információk."
          />
          <div>
            <div className={styles.group}>
              <h3>Amit jelenleg tudunk</h3>
              <dl className={styles.factList}>
                {OPERATIONS.knownFactIds.map((id) => (
                  <FactRow key={id} id={id} />
                ))}
              </dl>
            </div>
          </div>
          <aside className={styles.direction} aria-labelledby="sale-direction-title">
            <StatusBadge status="ismeretlen" label="Lehetséges irány, nem ígéret" />
            <h3 id="sale-direction-title">{POSSIBLE_DIRECTIONS.title}</h3>
            <p>{POSSIBLE_DIRECTIONS.text}</p>
          </aside>
        </div>
      </section>

      {/* F) Kinek lehet érdekes? */}
      <section id={SALE_SECTIONS.audience} className={`${styles.section} ${styles.deep}`} aria-labelledby="sale-audience-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-audience-title"
            eyebrow="Érdeklődők"
            title="Kinek lehet érdekes?"
            lead="Négy olyan kör, amelynek a lehetőség a saját szempontjai szerint megfontolásra érdemes lehet. Mindegyiknél más a fő kérdés."
          />
          <ul className={`${styles.cards} ${styles.cards2}`}>
            {AUDIENCES.map((audience) => (
              <li key={audience.id} className={styles.audienceCard}>
                <h3>{audience.title}</h3>
                <p>{audience.why}</p>
                <p className={styles.question}>
                  <strong>Fő kérdés:</strong> {audience.question}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* G) Vásárlási utak */}
      <section id={SALE_SECTIONS.paths} className={styles.section} aria-labelledby="sale-paths-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-paths-title"
            eyebrow="Vásárlási utak"
            title="Két vásárlási út"
            lead="Saját üzemeltetés vagy szakmai üzemeltető bevonása."
          />
          <ul className={`${styles.cards} ${styles.cards2}`}>
            {PURCHASE_PATHS.map((path) => (
              <li key={path.id} className={styles.pathCard}>
                <h3>{path.title}</h3>
                <p>{path.forWhom}</p>
                <div>
                  <p className={styles.listLabel}>Amit közösen átnézünk</p>
                  <ul className={styles.topics}>
                    {path.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
                <p className={`hvh-notice ${path.id === "with-operator" ? "hvh-notice--warning" : ""}`}>
                  <strong>Jelenlegi állapot</strong>
                  <span>{path.status}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* H) Értékesítési feltételek */}
      <section id={SALE_SECTIONS.terms} className={`hvh-surface-dark ${styles.section}`} aria-labelledby="sale-terms-title">
        <div className="hvh-container">
          <SectionHead id="sale-terms-title" eyebrow="Feltételek" title="Értékesítési feltételek" />
          <p className={styles.price}>{SALE_TERMS.price}</p>
          <ul className={`${styles.cards} ${styles.cards3}`}>
            {SALE_TERMS.items.map((item) => (
              <li key={item.title} className={styles.darkCard}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* I) Dokumentumok és megtekintés */}
      <section id={SALE_SECTIONS.documents} className={styles.section} aria-labelledby="sale-documents-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-documents-title"
            eyebrow="Dokumentumok"
            title="Dokumentumok és megtekintés"
            lead="A dokumentumokat az első egyeztetés után, bizalmassági feltételek mellett osztjuk meg. Letölthető anyag ezen az oldalon nincs."
          />
          <p className={styles.sectionNote}>
            <span>Az alábbi témákat az egyeztetésen tisztázzuk: mely dokumentumok állnak rendelkezésre, és milyen feltételekkel ismerhetők meg.</span>
          </p>
          <ul className={`${styles.cards} ${styles.cards4}`}>
            {DOCUMENT_TOPICS.map((topic) => (
              <li key={topic.title} className={styles.card}>
                <h3>{topic.title}</h3>
                <p>{topic.detail}</p>
              </li>
            ))}
          </ul>
          <div className={styles.viewing}>
            <h3>{VIEWING.title}</h3>
            <p>{VIEWING.text}</p>
          </div>
        </div>
      </section>

      {/* J) GYIK */}
      <section id={SALE_SECTIONS.faq} className={`${styles.section} ${styles.deep}`} aria-labelledby="sale-faq-title">
        <div className={`hvh-container ${styles.narrow}`}>
          <SectionHead id="sale-faq-title" eyebrow="Gyakori kérdések" title="Gyakori kérdések" />
          <div className={styles.faq}>
            {SALE_FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* K) Folyamat */}
      <section id={SALE_SECTIONS.process} className={styles.section} aria-labelledby="sale-process-title">
        <div className="hvh-container">
          <SectionHead
            id="sale-process-title"
            eyebrow="Folyamat"
            title="A vásárlási folyamat"
            lead="Hat lépés az első kapcsolattól az ajánlatig és a tárgyalásig."
          />
          <ol className={styles.steps}>
            {PURCHASE_PROCESS.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* L) Ajánlatkérő */}
      <section id={SALE_SECTIONS.inquiry} className={`${styles.section} ${styles.deep}`} aria-labelledby="sale-inquiry-title">
        <div className={`hvh-container ${styles.inquiry}`}>
          <header className={styles.inquiryIntro}>
            <p className="hvh-eyebrow">Ajánlatkérő</p>
            <h2 id="sale-inquiry-title">Bemutató és egyeztetés kérése</h2>
            <p className="hvh-lead">
              Rövid megkeresés is elegendő. Vagyon- vagy finanszírozási adatot nem kérünk; ezekről az első egyeztetésen, az Ön szándékának megfelelően beszélünk.
            </p>
          </header>
          <InquiryForm deliveryMode={deliveryMode} />
        </div>
      </section>

      <StickyCta label={SALE_CTA_LABEL} href={`#${SALE_SECTIONS.inquiry}`} heroCtaId={HERO_CTA_ID} formId={SALE_SECTIONS.inquiry} />
    </>
  );
}
