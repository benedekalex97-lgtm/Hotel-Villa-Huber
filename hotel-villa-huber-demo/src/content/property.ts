import type { Fact, FactStatus } from "./types";

/**
 * Hotel Villa Huber — központi ingatlanadat-nyilvántartás, publikus rész.
 *
 * Itt csak `visibility: "public"` adat szerepelhet (teszt ellenőrzi). Minden tételnek
 * forrása és állapota van; a publikus oldalak az állapotot is megjelenítik, ahol
 * az adat nem megerősített (FACT_STATUS_PUBLIC_LABEL).
 *
 * A belső és rejtett tételek (ár, közvetítői adatok, ismeretlen adatok)
 * a `src/content/internal/fact-register.ts` fájlban vannak, hogy publikus
 * bundle-be se kerülhessenek. A kettő együtt a teljes forrásnyilvántartás.
 * Részletes forrásnapló: Drive 02_FACT_REGISTER.md v1.1 (F-azonosítók).
 */

export const PROPERTY = {
  name: "Hotel Villa Huber",
  type: "villa-hotel",
  locality: "Afritz am See",
  region: "Karintia",
  country: "Ausztria",
  /** Rövid helymegjelölés a szövegekhez. */
  placeLine: "Afritz am See, Karintia",
  placeLineFull: "Afritz am See, Karintia, Ausztria",
  /** Nyilvános közlés (korábbi hotelweboldal), tulajdonosi megerősítés nélkül. */
  address: "Millstätter Straße 101, 9542 Afritz am See, Ausztria",
  tagline: "Karakteres villa-hotel Karintiában.",
  /** Értékesítési kapcsolati cím — nem vendégfoglalási cím. */
  contactEmail: "sale@hotelvillahuber.com",
} as const;

/** Vevőknek és vendégeknek szóló, közérthető állapotcímkék. */
export const FACT_STATUS_PUBLIC_LABEL: Record<FactStatus, string> = {
  jovahagyott: "Megerősített",
  "nyilvanos-megerositendo": "Korábbi nyilvános közlés — tulajdonosi megerősítésre vár",
  "tulajdonosi-kozles": "Tulajdonosi közlés — dokumentummal még nem igazolt",
  ismeretlen: "Egyeztetés tárgya",
};

/** Az állapotcímkék sorrendje és magyarázata — a landing jelmagyarázata és az emailbemutató közös forrása. */
export const FACT_STATUS_ORDER: readonly FactStatus[] = ["jovahagyott", "nyilvanos-megerositendo", "tulajdonosi-kozles", "ismeretlen"];

export const FACT_STATUS_EXPLANATION: Record<FactStatus, string> = {
  jovahagyott: "A projekt elfogadott anyagaiban rögzített adat.",
  "nyilvanos-megerositendo": "Korábbi nyilvános anyagból származik; a tulajdonos még nem erősítette meg.",
  "tulajdonosi-kozles": "A tulajdonos közölte, dokumentum még nem igazolja.",
  ismeretlen: "Nincs megbízható adat; az egyeztetés során tisztázzuk.",
};

export const PUBLIC_FACTS = [
  // — Alapadatok —
  {
    id: "name",
    label: "Név",
    value: PROPERTY.name,
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "public",
  },
  {
    id: "location",
    label: "Helyszín",
    value: PROPERTY.placeLineFull,
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "public",
  },
  {
    id: "type",
    label: "Ingatlantípus",
    value: "Karintiai villa-hotel, étteremmel",
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "public",
  },
  {
    id: "address",
    label: "Cím",
    value: PROPERTY.address,
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-002. Az SRC-06 házszám nélkül említi.",
  },
  {
    id: "contact",
    label: "Értékesítési kapcsolat",
    value: PROPERTY.contactEmail,
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "public",
    note: "Kapcsolati cím; a postafiók működése nincs ellenőrizve.",
  },

  // — Kapacitás és terek (korábbi nyilvános közlések) —
  {
    id: "rooms",
    label: "Szobák",
    value: "14 szoba és lakosztály, köztük családi lakosztályok",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-020: három nyilvános forrás egyezik (hotelweboldal, OTA, közvetítő).",
  },
  {
    id: "beds",
    label: "Férőhely",
    value: "legfeljebb 45 vendég reggelivel vagy félpanzióval",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-022, egyetlen forrás (korábbi hotelweboldal).",
  },
  {
    id: "restaurant",
    label: "Étterem",
    value: "kb. 50 fős étterem, kávézó-bár és terasz",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-023, F-024.",
  },
  {
    id: "wellness",
    label: "Wellness",
    value: "finn szauna, jakuzzi, kültéri fadézsa",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-026, F-027. A szauna a fotókon látható; a jakuzzi és a dézsa nem.",
  },
  {
    id: "parking",
    label: "Parkolás",
    value: "kb. 35 személyautó és egy busz",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-028, egyetlen forrás.",
  },
  {
    id: "room-features",
    label: "Szobák felszereltsége (korábbi leírás)",
    value: "műholdas TV, wifi, masszázszuhany-kabin, erkély",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-029; nem minden szobára igazolt.",
  },
  {
    id: "wine-cellar",
    label: "Borpince",
    value: "korábbi leírás szerint borkóstolásra alkalmas pince",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-025; fotó nincs róla.",
  },
  {
    id: "category",
    label: "Besorolás",
    value: "három csillag (korábbi közlés)",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-006; hatósági besorolás ellenőrzendő.",
  },
  {
    id: "renovation",
    label: "Felújítás",
    value: "2010-től bel- és kültéri felújítás (korábbi közlés)",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-014; terjedelme és műszaki tartalma ismeretlen.",
  },
  {
    id: "lake-distance",
    label: "Az Afritzi-tó",
    value: "a korábbi hotelleírás szerint kb. 700 méterre",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
    visibility: "public",
    note: "F-005. Nem tóparti ingatlan.",
  },
  {
    id: "spaces",
    label: "Fotókon látható terek",
    value: "Homlokzat és kert, fedett kerti terasz, lépcsőház, folyosó és recepció, szalon, vendégszobák, fürdőszoba, kávézó-bár, étterem, szauna",
    status: "nyilvanos-megerositendo",
    source: "SRC-BOOKING-EXPORT",
    visibility: "public",
    note: "A Booking-képek alapján. A terek léte látható, aktuális állapotuk nem igazolt.",
  },

  // — Működés —
  {
    id: "operated-summer-2026",
    label: "Működés",
    value: "A tulajdonos tájékoztatása szerint a hotel 2026 nyarán működött.",
    status: "tulajdonosi-kozles",
    source: "SRC-OWNER-VERBAL",
    visibility: "public",
    note: "Nem bizonyítja a jelenlegi nyitvatartást, foglalhatóságot vagy éves működést. A 09-25-i tényregiszter F-035 még szünetelő működést jelzett — a szept. 30-i közlés frissebb.",
  },
  {
    id: "reviews",
    label: "Vendégértékelések",
    value: "Tripadvisor: 4,3/5, 58 értékelés (2026. 09. 21-i állapot)",
    status: "nyilvanos-megerositendo",
    source: "SRC-OTA",
    visibility: "public",
    note: "F-033; dátumozott, változhat.",
  },
  {
    id: "operator",
    label: "Üzemeltetői partner",
    value: "Leszerződött üzemeltető jelenleg nincs; a partnerkeresés előkészítés alatt áll.",
    status: "jovahagyott",
    source: "SRC-STRATEGIA-V1",
    visibility: "public",
  },
  {
    id: "sale-paths",
    label: "Vásárlási utak",
    value: "Saját üzemeltetés vagy szakmai üzemeltető bevonása",
    status: "jovahagyott",
    source: "SRC-STRATEGIA-V1",
    visibility: "public",
  },
  {
    id: "asking-price",
    label: "Irányár",
    value: "Irányár és értékesítési feltételek egyeztetés alapján.",
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "public",
    note: "Megerősített aktuális ár nincs. Korábbi számok: belső nyilvántartás.",
  },
] as const satisfies readonly Fact[];

export type PublicFactId = (typeof PUBLIC_FACTS)[number]["id"];

export function getPublicFact(id: PublicFactId): Fact {
  const fact = PUBLIC_FACTS.find((f) => f.id === id);
  if (!fact) throw new Error(`Ismeretlen adat: ${id}`);
  return fact;
}

/** Csak publikusan megjeleníthető adatok. */
export function publicFacts(): Fact[] {
  return PUBLIC_FACTS.filter((f) => f.visibility === "public");
}

/** Csak publikus adat értékét adja vissza; minden más esetben hibát dob. */
export function publicValue(id: PublicFactId): string {
  const fact = getPublicFact(id);
  if (fact.visibility !== "public" || fact.value === null) {
    throw new Error(`A(z) "${id}" adat nem jeleníthető meg publikus oldalon.`);
  }
  return fact.value;
}

/** Megjelenítéshez: érték + közérthető állapotcímke. */
export function publicFactView(id: PublicFactId): { label: string; value: string; status: FactStatus; statusLabel: string } {
  const fact = getPublicFact(id);
  return { label: fact.label, value: publicValue(id), status: fact.status, statusLabel: FACT_STATUS_PUBLIC_LABEL[fact.status] };
}
