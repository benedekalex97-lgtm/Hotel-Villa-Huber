import type { Fact } from "./types";

/**
 * Hotel Villa Huber — központi ingatlanadat-nyilvántartás, publikus rész.
 *
 * Itt csak `visibility: "public"` adat szerepelhet (teszt ellenőrzi).
 * A belső és rejtett tételek (kapacitás, ár, tulajdonosi közlések, ismeretlen adatok)
 * a `src/content/internal/fact-register.ts` fájlban vannak, hogy publikus
 * bundle-be se kerülhessenek. A kettő együtt a teljes forrásnyilvántartás.
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
  tagline: "Karakteres villa-hotel Karintiában.",
  contactEmail: "sale@hotelvillahuber.com",
} as const;

export const PUBLIC_FACTS = [
  // — Jóváhagyott, nyilvánosan megjeleníthető alapadatok —
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
    label: "Jelleg",
    value: "Karintiai villa-hotel",
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "public",
  },
  {
    id: "contact",
    label: "Kapcsolati cím",
    value: PROPERTY.contactEmail,
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "public",
    note: "Kapcsolati cím, nem integrált vagy küldésre hitelesített emailfiók.",
  },
  {
    id: "spaces",
    label: "Fotókon látható terek",
    value: "Homlokzat és kert, fedett kerti terasz, lépcsőház, folyosó és recepció, szalon, vendégszoba, szauna",
    status: "nyilvanos-megerositendo",
    source: "SRC-BOOKING-EXPORT",
    visibility: "public",
    note: "A Booking-képek alapján. A terek léte látható, aktuális állapotuk és berendezésük nem igazolt.",
  },
  {
    id: "sale-paths",
    label: "Vásárlási utak",
    value: "Saját üzemeltetés vagy szakmai üzemeltető bevonása",
    status: "jovahagyott",
    source: "SRC-STRATEGIA-V1",
    visibility: "public",
    note: "A második út lehetséges modell; nincs leszerződött üzemeltető.",
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
