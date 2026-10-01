import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { getSlot } from "@/content/media";
import { PROPERTY, publicValue } from "@/content/property";
import { AUDIENCES, FIRST_CALL_TOPICS, NEXT_STEPS, PURCHASE_PATHS } from "@/content/sales";
import { HOME_SECTIONS, ROUTES, SALE_SECTIONS } from "@/content/site";
import { InquiryForm } from "./InquiryForm";
import styles from "./SalePage.module.css";

export function SalePage() {
  const heroImage = getSlot("sale.hero");
  const propertyImage = getSlot("sale.property");

  return (
    <>
      {/* Hero */}
      <section className={styles.hero} aria-labelledby="sale-title">
        <div className={`hvh-container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="hvh-eyebrow">Értékesítés</p>
            <h1 id="sale-title" className={styles.heroTitle}>
              {PROPERTY.name} — vásárlási lehetőség Karintiában.
            </h1>
            <p className="hvh-lead">
              Magyar befektetőknek és szállodás vállalkozásoknak, saját üzemeltetésre vagy szakmai partner bevonásával.
            </p>
            <div className={styles.actions}>
              <a href={`#${SALE_SECTIONS.contact}`} className="hvh-btn">
                Részletes bemutatót kérek.
              </a>
            </div>
          </div>
          <MediaImage
            asset={heroImage}
            ratio="hero"
            priority
            sizes="(min-width: 1024px) 700px, calc(100vw - 2rem)"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* Ingatlanbemutató */}
      <section id={SALE_SECTIONS.property} className={`${styles.section} ${styles.deep}`} aria-labelledby="ingatlan-title">
        <div className={`hvh-container ${styles.split}`}>
          <div className={styles.splitText}>
            <p className="hvh-eyebrow">Az ingatlan</p>
            <h2 id="ingatlan-title">A villa-hotel röviden</h2>
            <div className="hvh-prose">
              <p>
                A {PROPERTY.name} karintiai villa-hotel, amelyet a vásárlási lehetőség keretében mutatunk be.
                A részletes tájékoztatás az első egyeztetés után következik.
              </p>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Helyszín</dt>
                <dd>{publicValue("location")}</dd>
              </div>
              <div>
                <dt>Jelleg</dt>
                <dd>{publicValue("type")}</dd>
              </div>
              <div>
                <dt>Fotókon látható terek</dt>
                <dd className={styles.factText}>{publicValue("spaces")}</dd>
              </div>
            </dl>
            <Link href={`${ROUTES.home}#${HOME_SECTIONS.gallery}`} className="hvh-btn hvh-btn--secondary">
              Képek megtekintése a galériában
            </Link>
          </div>
          <MediaImage
            asset={propertyImage}
            ratio="landscape"
            withCaption
            sizes="(min-width: 960px) 600px, calc(100vw - 2rem)"
            className={styles.splitMedia}
          />
        </div>
      </section>

      {/* Kinek lehet érdekes? */}
      <section id={SALE_SECTIONS.audience} className={styles.section} aria-labelledby="kinek-title">
        <div className="hvh-container">
          <div className={styles.head}>
            <p className="hvh-eyebrow">Érdeklődők</p>
            <h2 id="kinek-title">Kinek lehet érdekes?</h2>
            <p className="hvh-lead">
              Négy olyan kör, amelynek a lehetőség a saját szempontjai szerint megfontolásra érdemes lehet. Mindegyiknél más a fő kérdés.
            </p>
          </div>
          <ul className={styles.cards}>
            {AUDIENCES.map((audience, i) => (
              <li key={audience.id} className={styles.card}>
                <span className={styles.cardNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
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

      {/* Két vásárlási út */}
      <section id={SALE_SECTIONS.paths} className={`${styles.section} ${styles.deep}`} aria-labelledby="utak-title">
        <div className="hvh-container">
          <div className={styles.head}>
            <p className="hvh-eyebrow">Vásárlási utak</p>
            <h2 id="utak-title">Két vásárlási út</h2>
            <p className="hvh-lead">{publicValue("sale-paths")}.</p>
          </div>
          <ul className={`${styles.cards} ${styles.paths}`}>
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
                <p className="hvh-notice">
                  <strong>Jelenlegi állapot</strong>
                  <span>{path.status}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Első egyeztetés */}
      <section id={SALE_SECTIONS.firstCall} className={styles.section} aria-labelledby="egyeztetes-title">
        <div className="hvh-container">
          <div className={styles.head}>
            <p className="hvh-eyebrow">Első egyeztetés</p>
            <h2 id="egyeztetes-title">Mit tisztázunk?</h2>
            <p className="hvh-lead">
              Az első egyeztetés rövid beszélgetés. Ezekben a témákban egyeztetünk, hogy lássuk, érdemes-e a részletes tájékoztatással folytatni.
            </p>
          </div>
          <ul className={`${styles.cards} ${styles.topicCards}`}>
            {FIRST_CALL_TOPICS.map((topic) => (
              <li key={topic.title} className={styles.card}>
                <h3>{topic.title}</h3>
                <p>{topic.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Következő lépések */}
      <section id={SALE_SECTIONS.steps} className={`hvh-surface-dark ${styles.band}`} aria-labelledby="lepesek-title">
        <div className="hvh-container">
          <div className={styles.head}>
            <p className="hvh-eyebrow">Következő lépések</p>
            <h2 id="lepesek-title">Három lépés</h2>
            <p className="hvh-lead">
              A részletes tájékoztatás az első egyeztetés után, a rendelkezésre álló anyagok alapján történik.
            </p>
          </div>
          <ol className={styles.steps}>
            {NEXT_STEPS.map((step, i) => (
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

      {/* Kapcsolatfelvétel */}
      <section id={SALE_SECTIONS.contact} className={styles.section} aria-labelledby="kapcsolatfelvetel-title">
        <div className={`hvh-container ${styles.contact}`}>
          <div className={styles.contactIntro}>
            <p className="hvh-eyebrow">Kapcsolatfelvétel</p>
            <h2 id="kapcsolatfelvetel-title">Részletes bemutatót kérek</h2>
            <p className="hvh-lead">
              Írja meg röviden, mi érdekli. Az űrlap előkészíti az emailt az értékesítési címre; a levelet Ön küldi el a saját levelezőalkalmazásából.
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
