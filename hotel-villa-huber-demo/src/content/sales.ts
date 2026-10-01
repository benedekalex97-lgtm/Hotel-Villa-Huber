import type { SourceId } from "./types";

/**
 * Értékesítési tartalom az elfogadott szeptember 30-i anyagokból.
 * Nem hozamígéret és nem igazolt piaci kereslet: a célcsoport-rangsor munkahipotézis.
 */

export interface Audience {
  id: string;
  title: string;
  /** „Miért lehet érdekes neki?” — elfogadott szöveg. */
  why: string;
  /** „Fő kérdése” — elfogadott szöveg. */
  question: string;
  /** Elérési csatorna — belső, nem publikus. */
  reachInternal: string;
  source: SourceId;
}

export const AUDIENCES: readonly Audience[] = [
  {
    id: "private-wealth",
    title: "Vállalkozói magánvagyon, családi befektetők",
    why: "Ausztriai ingatlantulajdon, szakmai üzemeltető bevonásával.",
    question: "Ki működteti, milyen költségekkel és eredménnyel?",
    reachInternal: "Személyes ajánlások, üzleti és vagyonkezelői kapcsolatok.",
    source: "SRC-CELCSOPORT-V1",
  },
  {
    id: "hotel-groups",
    title: "Kisebb magyar hotelcsoportok",
    why: "Ausztriai portfólióbővítés, karakteres szálláshely.",
    question: "Illik-e a méret és a működés a portfóliójukba?",
    reachInternal: "Tulajdonosok és akvizíciós döntéshozók célzott elérése.",
    source: "SRC-CELCSOPORT-V1",
  },
  {
    id: "owner-operators",
    title: "Magyar szállodatulajdonos-üzemeltetők",
    why: "Saját tapasztalatra épülő második szálláshely.",
    question: "Hogyan oldható meg a személyzet és a helyi működés?",
    reachInternal: "Szállodás kapcsolatok, szakmai közösségek.",
    source: "SRC-CELCSOPORT-V1",
  },
  {
    id: "tourism-businesses",
    title: "Vásárlásra képes turisztikai vállalkozók",
    why: "Saját utazásokhoz és csoportokhoz szálláskapacitás.",
    question: "Van-e elegendő saját kereslet és finanszírozás?",
    reachInternal: "Utazásszervezői kapcsolatok és ajánlások.",
    source: "SRC-CELCSOPORT-V1",
  },
];

export interface PurchasePath {
  id: "own-operation" | "with-operator";
  title: string;
  forWhom: string;
  /** Mit tekintünk át az egyeztetés során. */
  topics: readonly string[];
  /** Kötelező, őszinte állapotjelzés. */
  status: string;
  source: SourceId;
}

export const PURCHASE_PATHS: readonly PurchasePath[] = [
  {
    id: "own-operation",
    title: "Vásárlás saját üzemeltetéssel",
    forWhom: "Hotelcsoportoknak, szállodatulajdonosoknak és turisztikai vállalkozóknak, akik maguk működtetnék a házat.",
    topics: ["az ingatlan és terei", "a működési előzmények", "a kapacitás és az állapot", "az átvehető eszközök"],
    status: "Az ehhez szükséges adatokat és dokumentumokat a tulajdonossal közösen készítjük elő.",
    source: "SRC-STRATEGIA-V1",
  },
  {
    id: "with-operator",
    title: "Vásárlás szakmai partner bevonásával",
    forWhom: "Vállalkozói magánvagyonnak és családi befektetőknek, akik a működtetést szakmai üzemeltetőre bíznák.",
    topics: ["az ingatlan és terei", "a lehetséges üzemeltetői modell", "a szóba jöhető partnerjelöltek"],
    status: "Lehetséges modell. Az üzemeltetői partnerkeresés még előkészítés alatt áll; leszerződött üzemeltető jelenleg nincs.",
    source: "SRC-STRATEGIA-V1",
  },
];

/** Az első egyeztetés témái — elfogadott négy szűrő. */
export const FIRST_CALL_TOPICS: readonly { title: string; detail: string }[] = [
  { title: "Vásárlási szándék", detail: "Milyen célból vizsgálja a lehetőséget, és milyen típusú szálláshelyet keres." },
  { title: "Finanszírozás", detail: "Milyen forrásból és szerkezetben képzeli el a vásárlást." },
  { title: "Időzítés", detail: "Mikor szeretne döntést hozni, és milyen lépésekre van szüksége addig." },
  { title: "Üzemeltetési elképzelés", detail: "Saját működtetésben vagy szakmai partnerrel gondolkodik." },
];

/** Következő lépések a nyilvános oldalon (a stratégia első három lépésének vevőoldali változata). */
export const NEXT_STEPS: readonly { title: string; detail: string }[] = [
  { title: "Rövid egyeztetés", detail: "Egy rövid beszélgetésben tisztázzuk a vásárlási szándékot és az elképzeléseket." },
  { title: "Részletes tájékoztatás", detail: "A rendelkezésre álló ingatlanadatokat és háttéranyagokat ezután adjuk át." },
  { title: "Helyszíni megtekintés", detail: "Előre egyeztetett időpontban, a tulajdonossal összehangolt programmal." },
];

/** A kapcsolatfelvételi űrlap érdeklődési irányai. */
export const INTEREST_OPTIONS = [
  { value: "sajat-uzemeltetes", label: "Vásárlás saját üzemeltetéssel" },
  { value: "szakmai-partner", label: "Vásárlás szakmai partner bevonásával" },
  { value: "nyitott", label: "Még nyitott, először tájékozódnék" },
] as const;

export type InterestValue = (typeof INTEREST_OPTIONS)[number]["value"];
