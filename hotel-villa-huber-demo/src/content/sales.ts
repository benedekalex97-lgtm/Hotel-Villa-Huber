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
    why: "Ausztriai szállodai ingatlan megvásárlása és tulajdonlása.",
    question: "Milyen adatok és feltételek alapján mérlegelhető a vásárlás?",
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
  id: "property-purchase";
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
    id: "property-purchase",
    title: "Az ingatlan megvásárlása",
    forWhom: "Magánszemélyeknek és vállalkozásoknak, akik tulajdonosként vizsgálják a Hotel Villa Huber lehetőségét.",
    topics: ["az ingatlan és terei", "a működési előzmények", "a kapacitás és az állapot", "az átvehető eszközök"],
    status: "Az ehhez szükséges adatokat és dokumentumokat a tulajdonossal közösen készítjük elő.",
    source: "SRC-STRATEGIA-V1",
  },
];

/** Az első egyeztetés témái — elfogadott négy szűrő. */
export const FIRST_CALL_TOPICS: readonly { title: string; detail: string }[] = [
  { title: "Vásárlási szándék", detail: "Milyen célból vizsgálja a lehetőséget, és milyen típusú szálláshelyet keres." },
  { title: "Finanszírozás", detail: "Milyen forrásból és szerkezetben képzeli el a vásárlást." },
  { title: "Időzítés", detail: "Mikor szeretne döntést hozni, és milyen lépésekre van szüksége addig." },
  { title: "Vásárlási cél", detail: "Hogyan illeszkedik az ingatlan az Ön terveihez." },
];

/** Következő lépések a nyilvános oldalon (a stratégia első három lépésének vevőoldali változata). */
export const NEXT_STEPS: readonly { title: string; detail: string }[] = [
  { title: "Rövid egyeztetés", detail: "Egy rövid beszélgetésben tisztázzuk a vásárlási szándékot és az elképzeléseket." },
  { title: "Részletes tájékoztatás", detail: "A rendelkezésre álló ingatlanadatokat és háttéranyagokat ezután adjuk át." },
  { title: "Helyszíni megtekintés", detail: "Előre egyeztetett időpontban, a tulajdonossal összehangolt programmal." },
];

/** Ajánlatkérő: érdeklődési irány (kötelező). */
export const INTEREST_OPTIONS = [
  { value: "sajat-uzemeltetes", label: "Saját üzemeltetés" },
  { value: "ingatlan-befektetes", label: "Ingatlanvásárlás, befektetés" },
  { value: "meg-vizsgalom", label: "Még vizsgálom" },
] as const;

export type InterestValue = (typeof INTEREST_OPTIONS)[number]["value"];

/** Ajánlatkérő: mit kér az érdeklődő (kötelező). */
export const REQUEST_OPTIONS = [
  { value: "bemutato", label: "Részletes bemutató" },
  { value: "telefon", label: "Telefonos egyeztetés" },
  { value: "megtekintes", label: "Helyszíni megtekintés" },
] as const;

export type RequestValue = (typeof REQUEST_OPTIONS)[number]["value"];

/** Az eladási landing fő CTA-ja — a tartalom utáni ajánlatkérőre visz. */
export const SALE_CTA_LABEL = "Részletes bemutatót és egyeztetést kérek";

export const SALE_SUMMARY = {
  title: "Tulajdonos lennél?",
  subtitle: "Hotel Villa Huber: vásárlási lehetőség Karintiában, magyar befektetőknek és szállodás vállalkozásoknak.",
  points: [
    "Karakteres, saroktornyos villa-hotel Afritz am See településen, a Gegendtal völgyben.",
    "Korábbi nyilvános közlések szerint 14 szoba és lakosztály, étterem, kávézó-bár, terasz és wellness.",
    "Részletes ingatlanbemutató és előre egyeztetett helyszíni megtekintés.",
    "Irányár és értékesítési feltételek egyeztetés alapján.",
  ],
} as const;

/** Ingatlanadatok blokk — a PUBLIC_FACTS azonosítói, megjelenítési sorrendben. */
export const PROPERTY_DATA_GROUPS = [
  { title: "Azonosítás", factIds: ["name", "location", "address", "type", "category"] },
  { title: "Kapacitás és terek", factIds: ["rooms", "beds", "restaurant", "wellness", "wine-cellar", "parking", "room-features"] },
  { title: "Épület", factIds: ["renovation", "lake-distance"] },
] as const;

/** Adatok, amelyekről nincs megbízható forrás — konkrét egyeztetési témaként jelennek meg. */
export const OPEN_DATA_TOPICS: readonly { title: string; detail: string }[] = [
  { title: "Épület- és telekméret", detail: "Alaprajzok szintenként, méretkimutatással és friss tulajdoni lappal egyeztetjük." },
  { title: "Építési év és történet", detail: "A nyilvános források ellentmondanak egymásnak; dokumentum alapján tisztázzuk." },
  { title: "Műszaki állapot", detail: "Gépészet, tető, fűtés és energetikai tanúsítvány (Energieausweis) alapján." },
  { title: "Engedélyek és hasznosítás", detail: "Használatbavételi engedély, övezeti besorolás és a településen hatályos beépítési szabályok." },
];

/** Publikus működési háttér. A tulajdonosi adatbekérés külön belső modulban van. */
export const OPERATIONS = {
  knownFactIds: ["operated-summer-2026", "reviews"],
} as const;

/** Lehetséges hasznosítási irány — nem igazolt üzleti vagy jogi lehetőség. */
export const POSSIBLE_DIRECTIONS = {
  title: "Lehetséges irány: közösségi és retreat-hasznosítás",
  text: "Csoportos programok, elvonulások vagy szezonhosszabbító ajánlatok lehetséges iránynak tekinthetők. Megvalósíthatóságuk üzleti és jogi vizsgálatot igényel; ezt nem kész lehetőségként mutatjuk be.",
} as const;

/** Az értékesítés tárgya és feltételek. */
export const SALE_TERMS = {
  price: "Irányár és értékesítési feltételek egyeztetés alapján.",
  items: [
    { title: "Az értékesítés tárgya", detail: "Az ingatlan és a hozzá tartozó eszközök pontos köre a tulajdonossal egyeztetendő (ingatlan, berendezés, márkanév, digitális eszközök)." },
    { title: "Tranzakciós forma", detail: "Ingatlan- vagy üzletrész-adásvétel — a tulajdonosi szerkezet ismeretében egyeztetjük." },
    { title: "Időzítés", detail: "Az átadás időpontja és az esetleges szezonális működés a felek egyeztetése alapján." },
  ],
} as const;

/** Dokumentumok és megtekintés — mit tisztázhatunk a következő egyeztetésen. Kész adatszobát nem állítunk. */
export const DOCUMENT_TOPICS: readonly { title: string; detail: string }[] = [
  { title: "Tulajdon és terhek", detail: "Friss tulajdoni lap (Grundbuchauszug), tehermentesség, a tulajdonos jogi entitása." },
  { title: "Tervek és engedélyek", detail: "Alaprajzok, építési és használatbavételi engedély, övezeti besorolás, esetleges védettség." },
  { title: "Műszaki dokumentáció", detail: "Energetikai tanúsítvány, a felújítások dokumentációja, gépészeti és tűzvédelmi iratok." },
  { title: "Pénzügyi és működési adatok", detail: "Lezárt évek beszámolói, kihasználtság, költségstruktúra, élő szerződések." },
];

export const VIEWING = {
  title: "Helyszíni megtekintés",
  text: "Előre egyeztetett időpontban, a tulajdonossal összehangolt programmal. A részletes dokumentumok a szükséges bizalmassági feltételek mellett, az egyeztetések előrehaladtával ismerhetők meg.",
} as const;

export const SALE_FAQ: readonly { q: string; a: string }[] = [
  { q: "Mennyi az irányár?", a: "Az irányárat és az értékesítési feltételeket egyeztetés alapján adjuk meg. Korábbi nyilvános hirdetésekben szereplő összegek nem jóváhagyott aktuális árak." },
  { q: "Működik jelenleg a hotel?", a: "A tulajdonos tájékoztatása szerint a hotel 2026 nyarán működött. A jelenlegi nyitvatartást és foglalhatóságot az egyeztetés során tisztázzuk." },
  { q: "Ellenőrzött adatok a kapacitásszámok?", a: "Nem. A szobaszám, a férőhely, az étterem és a parkoló adatai korábbi nyilvános közlésekből származnak; a tulajdonossal dokumentum alapján erősítjük meg őket." },
  { q: "Milyen dokumentumokat láthatok?", a: "A következő egyeztetésen tisztázzuk, mely dokumentumok állnak rendelkezésre, és milyen bizalmassági feltételekkel ismerhetők meg. Letölthető anyag ezen az oldalon nincs." },
  { q: "Meg kell adnom a finanszírozási forrást az érdeklődéshez?", a: "Nem. Az első egyeztetésen beszélünk a vásárlási szándékról, finanszírozásról, időzítésről és üzemeltetési elképzelésről — vagyonadatot nem kérünk." },
  { q: "Kötelez valamire az ajánlatkérő?", a: "Nem. Az űrlappal további információt, egyeztetést vagy megtekintést kérhet; ez nem vételi ajánlat." },
];

/** A vásárlási folyamat — az elfogadott stratégia hat lépése. */
export const PURCHASE_PROCESS: readonly { title: string; detail: string }[] = [
  { title: "Első kapcsolat", detail: "Ajánlatkérő, személyes ajánlás vagy közvetlen megkeresés." },
  { title: "Rövid egyeztetés", detail: "Vásárlási szándék, finanszírozás, időzítés és üzemeltetési elképzelés." },
  { title: "Részletes bemutató", detail: "Ingatlanadatok, értékesítési feltételek és működési háttér." },
  { title: "Dokumentumok megismerése", detail: "A szükséges bizalmassági feltételekkel." },
  { title: "Helyszíni megtekintés", detail: "Előre egyeztetett programmal." },
  { title: "Ajánlat és tárgyalás", detail: "Konkrét feltételek, határidők és tulajdonosi döntés." },
];
