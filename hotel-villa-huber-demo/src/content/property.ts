import type { Fact } from "./types";

/**
 * Hotel Villa Huber — központi ingatlanadat-nyilvántartás.
 *
 * Szabály: publikus oldal csak `visibility: "public"` adatot renderelhet,
 * a `publicFacts()` segédfüggvényen keresztül. A többi tétel az
 * adatbekérési listát és a belső dokumentációt táplálja.
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

export const FACTS = [
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

  // — Tulajdonosi közlés, nem megjelenített —
  {
    id: "operated-summer-2026",
    label: "Működés 2026 nyarán",
    value: "A tulajdonos közlése szerint a hotel 2026 nyarán működött.",
    status: "tulajdonosi-kozles",
    source: "SRC-OWNER-VERBAL",
    visibility: "internal",
    note: "Nem bizonyítja a jelenlegi nyitvatartást, foglalhatóságot vagy teljes éves működést.",
  },
  {
    id: "operator",
    label: "Üzemeltetői partner",
    value: "Nincs igazolt, leszerződött üzemeltető.",
    status: "jovahagyott",
    source: "SRC-STRATEGIA-V1",
    visibility: "internal",
    note: "Meglévő megállapodást csak akkor mutatunk be, ha valóban létrejött.",
  },

  // — Régi nyilvános közlések, tulajdonosi megerősítés nélkül —
  {
    id: "rooms",
    label: "Szobák száma",
    value: "14",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "beds",
    label: "Férőhely",
    value: "kb. 45",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "restaurant",
    label: "Étterem",
    value: "50 fős",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "wellness",
    label: "Wellness",
    value: "Wellness-rész (szauna a fotókon látható)",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "parking",
    label: "Parkoló",
    value: "kb. 35 autó, buszparkolás",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },

  // — Ismeretlen / nem jóváhagyott, sehol nem jelenik meg —
  {
    id: "asking-price",
    label: "Irányár",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
    note: "A korábbi 1,2 millió EUR (és nyilvános hirdetésekben 1,25 millió EUR) nem jóváhagyott aktuális ár.",
  },
  {
    id: "yield",
    label: "Hozam, pénzügyi eredmény",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "condition",
    label: "Állapotminősítés",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "renovation-cost",
    label: "Felújítási költség",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "permits",
    label: "Magánhasználati vagy átalakítási engedély",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "build-year",
    label: "Építési év",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "documents",
    label: "Működési, műszaki és jogi dokumentáció",
    value: "Hiányos",
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "internal",
  },
] as const satisfies readonly Fact[];

export type FactId = (typeof FACTS)[number]["id"];

export function getFact(id: FactId): Fact {
  const fact = FACTS.find((f) => f.id === id);
  if (!fact) throw new Error(`Ismeretlen adat: ${id}`);
  return fact;
}

/** Csak publikusan megjeleníthető adatok. */
export function publicFacts(): Fact[] {
  return FACTS.filter((f) => f.visibility === "public");
}

/** Csak publikus adat értékét adja vissza; minden más esetben hibát dob. */
export function publicValue(id: FactId): string {
  const fact = getFact(id);
  if (fact.visibility !== "public" || fact.value === null) {
    throw new Error(`A(z) "${id}" adat nem jeleníthető meg publikus oldalon.`);
  }
  return fact.value;
}
