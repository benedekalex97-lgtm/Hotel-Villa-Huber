import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { BookingWidget } from "@/features/booking/BookingWidget";
import { ACCOMMODATION, AREA_HIGHLIGHTS, GUEST_CONTACT, GUEST_INTRO, GUEST_SERVICES } from "@/content/guest";
import { GALLERY, getMedia, getSlot } from "@/content/media";
import { FACT_STATUS_PUBLIC_LABEL, PROPERTY, publicFactView } from "@/content/property";
import { CONTACT, HOME_SECTIONS, ROUTES } from "@/content/site";
import { Gallery } from "./Gallery";
import styles from "./HomePage.module.css";

const MAP_URL = "https://www.openstreetmap.org/search?query=Afritz%20am%20See";

interface SectionHeadProps {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
}

function SectionHead({ id, eyebrow, title, lead }: SectionHeadProps) {
  return (
    <div className={styles.head}>
      <p className="hvh-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {lead ? <p className="hvh-lead">{lead}</p> : null}
    </div>
  );
}

/** Telefonszám → tel: hivatkozás (csak számjegyek és vezető +). */
function telHref(phone: string): string {
  return `tel:${phone.replace(/(?!^\+)[^\d]/g, "")}`;
}

export function HomePage() {
  const hero = getSlot("home.hero");
  const villa = getSlot("home.villa");
  const location = getSlot("home.location");
  const rooms = publicFactView("rooms");
  const roomFeatures = publicFactView("room-features");
  const lake = publicFactView("lake-distance");
  const address = publicFactView("address");
  const hasGuestContact = Boolean(GUEST_CONTACT.email || GUEST_CONTACT.phone);

  return (
    <>
      {/* 1. Hero — keretezett, osztott elrendezés: a kép nem lépi túl a natív ~1024 px szélességet. */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`hvh-container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.heroTitle}>
              {PROPERTY.name}
            </h1>
            <p className={styles.place}>{PROPERTY.placeLine}</p>
            <p className="hvh-lead">{PROPERTY.tagline}</p>
            <div className={styles.actions}>
              <a href={`#${HOME_SECTIONS.booking}`} className="hvh-btn">
                Foglalási lehetőségek
              </a>
              <a href={`#${HOME_SECTIONS.rooms}`} className="hvh-btn hvh-btn--secondary">
                Szobák
              </a>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <MediaImage
              asset={hero}
              ratio="hero"
              priority
              sizes="(min-width: 960px) 680px, calc(100vw - 2rem)"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* 2. A hotel */}
      <section id={HOME_SECTIONS.hotel} className={`${styles.section} ${styles.deep}`} aria-labelledby="hotel-title">
        <div className={`hvh-container ${styles.split}`}>
          <figure className={styles.figure}>
            <MediaImage asset={villa} ratio="landscape" sizes="(min-width: 960px) 600px, calc(100vw - 2rem)" className={styles.photo} />
            {villa ? <figcaption className={styles.figCaption}>{villa.caption}</figcaption> : null}
          </figure>
          <div className={styles.splitText}>
            <p className="hvh-eyebrow">A hotel</p>
            <h2 id="hotel-title">{GUEST_INTRO.title}</h2>
            <div className="hvh-prose">
              {GUEST_INTRO.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Szobák */}
      <section id={HOME_SECTIONS.rooms} className={styles.section} aria-labelledby="szobak-title">
        <div className="hvh-container">
          <SectionHead
            id="szobak-title"
            eyebrow="Szobák"
            title="Elhelyezés a képeken"
            lead="Példák a ház szobáiból. A fotók néhány jellemző elhelyezést mutatnak — ezek nem hivatalos szobakategóriák."
          />
          <p className={styles.factLine}>
            <span>{rooms.value}.</span>
            <small className={styles.status}>{rooms.statusLabel}</small>
          </p>
          <ul className={styles.roomGrid}>
            {ACCOMMODATION.map((item) => (
              <li key={item.id} className={styles.card}>
                <MediaImage asset={getMedia(item.media)} ratio="landscape" sizes="(min-width: 960px) 580px, calc(100vw - 2rem)" className={styles.cardImage} />
                <div className={styles.cardBody}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a href={`#${HOME_SECTIONS.booking}`} className="hvh-btn hvh-btn--secondary hvh-btn--sm">
                    Foglalási lehetőségek<span className="hvh-visually-hidden"> — {item.title}</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className={`${styles.split} ${styles.bath}`}>
            <figure className={styles.figure}>
              <MediaImage asset={getMedia("bathroom")} ratio="landscape" sizes="(min-width: 960px) 520px, calc(100vw - 2rem)" className={styles.photo} />
              <figcaption className={styles.figCaption}>{getMedia("bathroom").caption}</figcaption>
            </figure>
            <div className={styles.splitText}>
              <h3>A szobák felszereltsége</h3>
              <p>
                A korábbi leírás szerint: {roomFeatures.value}.
              </p>
              <small className={styles.status}>{roomFeatures.statusLabel}</small>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Élmények és szolgáltatások */}
      <section id={HOME_SECTIONS.services} className={`${styles.section} ${styles.deep}`} aria-labelledby="szolgaltatasok-title">
        <div className="hvh-container">
          <SectionHead
            id="szolgaltatasok-title"
            eyebrow="Élmények és szolgáltatások"
            title="Közösségi terek és szolgáltatások"
            lead="A fotókon látható terek és a korábbi leírásokban szereplő szolgáltatások. Az aktuális működést és nyitvatartást ez az oldal nem tartalmazza."
          />
          <ul className={styles.serviceGrid}>
            {GUEST_SERVICES.map((service) => (
              <li key={service.id} className={styles.card}>
                <MediaImage
                  asset={service.media ? getMedia(service.media) : null}
                  ratio="landscape"
                  sizes="(min-width: 960px) 580px, (min-width: 640px) 45vw, calc(100vw - 2rem)"
                  className={styles.cardImage}
                />
                <div className={styles.cardBody}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {service.status !== "jovahagyott" ? <small className={styles.status}>{FACT_STATUS_PUBLIC_LABEL[service.status]}</small> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Galéria */}
      <section id={HOME_SECTIONS.gallery} className={styles.section} aria-labelledby="galeria-title">
        <div className="hvh-container">
          <SectionHead id="galeria-title" eyebrow="Galéria" title="A ház képekben" lead="Válasszon egy képet a nagyobb méretű megtekintéshez." />
          <Gallery items={GALLERY.map((id) => getMedia(id))} />
        </div>
      </section>

      {/* 6. Környék */}
      <section id={HOME_SECTIONS.area} className={`${styles.section} ${styles.deep}`} aria-labelledby="kornyek-title">
        <div className="hvh-container">
          <SectionHead id="kornyek-title" eyebrow="Környék" title="Afritz am See és a Gegendtal" />
          <div className={styles.areaGrid}>
            <div className={styles.areaMain}>
              <ul className={styles.highlights}>
                {AREA_HIGHLIGHTS.map((item) => (
                  <li key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
              <div className={styles.lake}>
                <p className={styles.lakeLabel}>{lake.label}</p>
                <p className={styles.lakeValue}>{lake.value}</p>
                <small className={styles.status}>{lake.statusLabel}</small>
              </div>
              <p>
                <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
                  Afritz am See megnyitása az OpenStreetMap térképen
                </a>{" "}
                <span className={styles.newTab}>(új lapon nyílik)</span>
              </p>
            </div>
            <figure className={styles.areaFigure}>
              <MediaImage asset={location} ratio="native" sizes="(min-width: 960px) 480px, calc(100vw - 2rem)" className={styles.photo} />
              <figcaption className={styles.figCaption}>Afritz am See helységnévtáblája az út mentén</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 7. Foglalás */}
      <section id={HOME_SECTIONS.booking} className={`hvh-surface-dark ${styles.section}`} aria-labelledby="foglalas-title">
        <div className="hvh-container">
          <SectionHead
            id="foglalas-title"
            eyebrow="Foglalás"
            title="Foglalási lehetőségek"
            lead="Adja meg az utazás időpontját és a vendégek számát, és próbálja ki a bemutató foglalási folyamatot."
          />
          <BookingWidget />
        </div>
      </section>

      {/* 8. Eladó hotel — visszafogott híd az eladási tájékoztatóhoz */}
      <section id={HOME_SECTIONS.sale} className={styles.saleBand} aria-labelledby="elado-title">
        <div className={`hvh-container ${styles.saleInner}`}>
          <div className={styles.saleText}>
            <h2 id="elado-title">A hotel eladó</h2>
            <p>A Hotel Villa Huber ingatlan jelenleg eladó. Az értékesítéssel kapcsolatos tudnivalók az eladási tájékoztatóban olvashatók.</p>
          </div>
          <Link href={ROUTES.sale} className="hvh-btn hvh-btn--secondary">
            Az eladási tájékoztató megnyitása
          </Link>
        </div>
      </section>

      {/* 9. Kapcsolat */}
      <section id={HOME_SECTIONS.contact} className={styles.section} aria-labelledby="kapcsolat-title">
        <div className="hvh-container">
          <SectionHead id="kapcsolat-title" eyebrow="Kapcsolat" title="Elérhetőségek" />
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3>Vendégkapcsolat</h3>
              {hasGuestContact ? (
                <ul className={styles.contactList}>
                  {GUEST_CONTACT.email ? (
                    <li>
                      Email: <a href={`mailto:${GUEST_CONTACT.email}`}>{GUEST_CONTACT.email}</a>
                    </li>
                  ) : null}
                  {GUEST_CONTACT.phone ? (
                    <li>
                      Telefon: <a href={telHref(GUEST_CONTACT.phone)}>{GUEST_CONTACT.phone}</a>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p>A vendégkapcsolati elérhetőségeket később tesszük közzé.</p>
              )}
              <div className={styles.address}>
                <p className={styles.contactLabel}>Cím</p>
                <address>{address.value}</address>
                <small className={styles.status}>{address.statusLabel}</small>
              </div>
            </div>
            <div className={styles.contactCard}>
              <h3>Értékesítés</h3>
              <p>
                Az ingatlan értékesítésével kapcsolatos megkeresésekhez: <a href={CONTACT.mailtoHref}>{CONTACT.email}</a>
              </p>
              <p className={styles.contactNote}>Ez a cím nem szobafoglalási cím.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
