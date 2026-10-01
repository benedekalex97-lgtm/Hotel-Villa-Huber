import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { getSlot, getMedia, GALLERY } from "@/content/media";
import { PROPERTY, publicValue } from "@/content/property";
import { PURCHASE_PATHS } from "@/content/sales";
import { CONTACT, HOME_SECTIONS, ROUTES } from "@/content/site";
import { Gallery } from "./Gallery";
import styles from "./HomePage.module.css";

const MAP_URL = "https://www.openstreetmap.org/search?query=Afritz%20am%20See";

/** A „fotókon látható terek” tény vesszős felsorolásból lista. */
function visibleSpaces(): string[] {
  return publicValue("spaces")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
}

export function HomePage() {
  const heroImage = getSlot("home.hero");
  const villaImage = getSlot("home.villa");
  const locationImage = getSlot("home.location");
  const teaserImage = getSlot("home.saleTeaser");
  const galleryItems = GALLERY.map((id) => getMedia(id));
  const spaces = visibleSpaces();

  return (
    <>
      {/* 1. Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`hvh-container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.heroTitle}>
              {PROPERTY.name}
            </h1>
            <p className={styles.tagline}>{PROPERTY.tagline}</p>
            <p className="hvh-lead">
              Villa-hotel {PROPERTY.locality} településen, Karintiában (Ausztria).
            </p>
            <div className={styles.actions}>
              <Link href={ROUTES.sale} className="hvh-btn">
                Értékesítési bemutató
              </Link>
              <a href={`#${HOME_SECTIONS.gallery}`} className="hvh-btn hvh-btn--secondary">
                Megnézem a galériát
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

      {/* 2. A villa */}
      <section id={HOME_SECTIONS.villa} className={`${styles.section} ${styles.deep}`} aria-labelledby="villa-title">
        <div className={`hvh-container ${styles.split} ${styles.imageFirst}`}>
          <div className={styles.splitText}>
            <p className="hvh-eyebrow">A villa</p>
            <h2 id="villa-title">Villa-hotel Karintiában</h2>
            <div className="hvh-prose">
              <p>
                A {PROPERTY.name} karintiai villa-hotel, {PROPERTY.locality} településen. A fotókon a ház sárga
                homlokzata látható saroktoronnyal és virágos erkéllyel, a kert, valamint a völgy erdős hegyei.
              </p>
              <p>A képeken látható terek:</p>
            </div>
            <ul className={styles.spaceList}>
              {spaces.map((space) => (
                <li key={space}>{space}</li>
              ))}
            </ul>
          </div>
          <MediaImage
            asset={villaImage}
            ratio="landscape"
            withCaption
            sizes="(min-width: 960px) 600px, calc(100vw - 2rem)"
            className={styles.splitMedia}
          />
        </div>
      </section>

      {/* 3. Galéria */}
      <section id={HOME_SECTIONS.gallery} className={styles.section} aria-labelledby="galeria-title">
        <div className="hvh-container">
          <div className={styles.head}>
            <p className="hvh-eyebrow">Galéria</p>
            <h2 id="galeria-title">A ház képekben</h2>
            <p className="hvh-lead">Válasszon egy képet a nagyobb méretű megtekintéshez.</p>
          </div>
          <Gallery items={galleryItems} />
        </div>
      </section>

      {/* 4. Elhelyezkedés */}
      <section id={HOME_SECTIONS.location} className={`${styles.section} ${styles.deep}`} aria-labelledby="elhelyezkedes-title">
        <div className={`hvh-container ${styles.split}`}>
          <div className={styles.splitText}>
            <p className="hvh-eyebrow">Elhelyezkedés</p>
            <h2 id="elhelyezkedes-title">{PROPERTY.placeLineFull}</h2>
            <div className="hvh-prose">
              <p>
                A villa-hotel Afritz am See településen található, Ausztria Karintia tartományában.
              </p>
              <p>A helyszínnel és a környékkel kapcsolatos további tudnivalókat a részletes tájékoztatás során adjuk át.</p>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Település</dt>
                <dd>{PROPERTY.locality}</dd>
              </div>
              <div>
                <dt>Tartomány</dt>
                <dd>{PROPERTY.region}</dd>
              </div>
              <div>
                <dt>Ország</dt>
                <dd>{PROPERTY.country}</dd>
              </div>
            </dl>
            <p>
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
                Afritz am See megnyitása az OpenStreetMap térképen
              </a>{" "}
              <span className={styles.newTab}>(új lapon nyílik meg)</span>
            </p>
          </div>
          <figure className={`${styles.splitMedia} ${styles.locationFigure}`}>
            <MediaImage
              asset={locationImage}
              ratio="landscape"
              sizes="(min-width: 960px) 520px, calc(100vw - 2rem)"
            />
            <figcaption className={styles.figCaption}>
              {locationImage ? `${locationImage.caption} — a fotó a helységnévtáblát mutatja.` : null}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 5. Értékesítési átvezetés */}
      <section id={HOME_SECTIONS.sale} className={`hvh-surface-dark ${styles.band}`} aria-labelledby="ertekesites-title">
        <div className={`hvh-container ${styles.split}`}>
          <div className={styles.splitText}>
            <p className="hvh-eyebrow">Értékesítés</p>
            <h2 id="ertekesites-title">A villa-hotel értékesítésre kerül</h2>
            <p className={styles.bandText}>
              Ajánlatunk magyar befektetőknek és szállodás vállalkozásoknak szól. Két vásárlási utat mutatunk be:
            </p>
            <ul className={styles.pathList}>
              {PURCHASE_PATHS.map((path) => (
                <li key={path.id}>{path.title}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Link href={ROUTES.sale} className="hvh-btn hvh-btn--on-dark">
                Értékesítési bemutató
              </Link>
            </div>
          </div>
          <MediaImage
            asset={teaserImage}
            ratio="landscape"
            sizes="(min-width: 960px) 560px, calc(100vw - 2rem)"
            className={styles.splitMedia}
          />
        </div>
      </section>

      {/* 6. Kapcsolat */}
      <section id={HOME_SECTIONS.contact} className={styles.section} aria-labelledby="kapcsolat-title">
        <div className={`hvh-container ${styles.contact}`}>
          <div className={styles.head}>
            <p className="hvh-eyebrow">Kapcsolat</p>
            <h2 id="kapcsolat-title">Értékesítési kapcsolat</h2>
            <p className="hvh-lead">
              Ez a cím a villa-hotel értékesítésével kapcsolatos megkeresésekre szolgál.
            </p>
          </div>
          <div className={styles.contactCard}>
            <p className={styles.contactLabel}>Email</p>
            <p>
              <a href={CONTACT.mailtoHref} className={styles.contactMail}>
                {CONTACT.email}
              </a>
            </p>
            <p className={styles.contactNote}>
              Szobafoglalásra ezen az oldalon nincs lehetőség. Részletes bemutatót az{" "}
              <Link href={`${ROUTES.sale}#kapcsolatfelvetel`}>értékesítési oldalon</Link> kérhet.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
