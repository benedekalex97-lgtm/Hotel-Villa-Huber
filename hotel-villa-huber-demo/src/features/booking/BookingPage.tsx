import { Suspense } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import { getSlot } from "@/content/media";
import { PROPERTY } from "@/content/property";
import { BookingFlow } from "./BookingFlow";
import { DemoNotice } from "./DemoNotice";
import styles from "./BookingPage.module.css";

/**
 * A /foglalas oldal váza (szerveroldali): cím, kötelező demó-jelölés, majd a kliensoldali folyamat.
 * A folyamat külön Suspense-ben van, mert az URL-paramétereket a kliensen olvassa.
 */
export function BookingPage() {
  const hero = getSlot("booking.hero");
  return (
    <>
      <section className={styles.top} aria-labelledby="booking-title">
        <div className={`hvh-container ${styles.topGrid}`}>
          <div className={styles.topText}>
            <p className="hvh-eyebrow">{PROPERTY.name}</p>
            <h1 id="booking-title">Foglalás — bemutató</h1>
            <p className="hvh-lead">
              Próbálja ki, hogyan működne a foglalás: időpont, vendégek, elhelyezés és vendégadatok. A folyamat végén foglalás nem történik.
            </p>
            <DemoNotice />
          </div>
          <MediaImage asset={hero} ratio="wide" sizes="420px" className={styles.topImage} />
        </div>
      </section>
      <section className={styles.body} aria-label="Foglalási folyamat">
        <div className="hvh-container">
          <Suspense fallback={<p className={styles.fallback}>Foglalási folyamat betöltése…</p>}>
            <BookingFlow />
          </Suspense>
        </div>
      </section>
    </>
  );
}
