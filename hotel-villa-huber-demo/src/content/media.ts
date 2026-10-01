import type { MediaAsset, MediaSlotId } from "./types";

/**
 * Asset-manifest. A pendrive-os új média ugyanebbe a listába kerül
 * (`generation: "pendrive-2026-10"`), a cserét a MEDIA_SLOTS és a GALLERY
 * azonosítóinak átírása végzi. Lépések: docs/HVH_MEDIA_REPLACEMENT.md
 *
 * Kizárt képek (nem kerülhetnek ide):
 * - 34324365.jpg — idegen vár és motoros, nem a hotel;
 * - 19333173.jpg, 34324366.jpg — tóképek, eredetük nem tisztázott;
 * - felismerhető vendégeket vagy domináns idegen márkát mutató képek.
 */
export const MEDIA = {
  "facade-summer": {
    id: "facade-summer",
    src: "/media/booking-export/19333297.jpg",
    alt: "A Hotel Villa Huber sárga homlokzata saroktoronnyal és virágos erkéllyel, napsütésben; mögötte erdős hegyoldal.",
    caption: "A villa homlokzata az út felől",
    sourceFile: "19333297.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 659,
    focal: { x: 62, y: 48 },
    note: "Elsődleges hero-jelölt. Kis kereskedelmi táblák a bejáratnál, nem dominánsak.",
  },
  "facade-valley": {
    id: "facade-valley",
    src: "/media/booking-export/19333057.jpg",
    alt: "A villa emelt nézőpontból: előtte kert és fedett melléképület, mögötte a völgy erdős hegyei.",
    caption: "A ház és a völgy",
    sourceFile: "19333057.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 660,
    focal: { x: 52, y: 55 },
    note: "Jobb szélen biztonsági kamera és kisebb reklámtábla — vágásnál a fókusz balra tolható.",
  },
  terrace: {
    id: "terrace",
    src: "/media/booking-export/19332795.jpg",
    alt: "Fedett kerti terasz fonott asztalokkal és székekkel, futónövényes sövénnyel és függő virágkosarakkal.",
    caption: "Fedett kerti terasz",
    sourceFile: "19332795.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 703,
    focal: { x: 45, y: 55 },
  },
  staircase: {
    id: "staircase",
    src: "/media/booking-export/34324379.jpg",
    alt: "Felülnézet a lépcsőházba: sötét fa korlát és vörös futószőnyeg több szinten.",
    caption: "Lépcsőház",
    sourceFile: "34324379.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 768,
    focal: { x: 50, y: 50 },
    note: "A szőnyeg kopott; színkorrekció nélkül használva.",
  },
  corridor: {
    id: "corridor",
    src: "/media/booking-export/87275722.jpg",
    alt: "Gerendás mennyezetű folyosó fali lámpákkal és festménnyel; a végén a recepciópult.",
    caption: "Folyosó a recepció felé",
    sourceFile: "87275722.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 683,
    focal: { x: 50, y: 50 },
  },
  salon: {
    id: "salon",
    src: "/media/booking-export/38856066.jpg",
    alt: "Közösségi tér üvegezett fa válaszfallal, két fotellel, kis asztallal és festett, hagyományos szekrénnyel.",
    caption: "Szalon festett szekrénnyel",
    sourceFile: "38856066.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 691,
    focal: { x: 58, y: 55 },
  },
  room: {
    id: "room",
    src: "/media/booking-export/125610505.jpg",
    alt: "Vendégszoba franciaággyal, kék fotellel, állólámpákkal és intarziás fa szekrénnyel.",
    caption: "Vendégszoba",
    sourceFile: "125610505.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 683,
    focal: { x: 45, y: 55 },
    note: "A legfrissebb feltöltési generáció (G8) szobaképe.",
  },
  sauna: {
    id: "sauna",
    src: "/media/booking-export/87275544.jpg",
    alt: "Világos fa borítású szauna padokkal, fa vödörrel és kályhával.",
    caption: "Szauna",
    sourceFile: "87275544.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 683,
    focal: { x: 50, y: 60 },
  },
  "facade-winter-dusk": {
    id: "facade-winter-dusk",
    src: "/media/booking-export/38856055.jpg",
    alt: "A villa télen, alkonyatkor: havas tetők, kivilágított ablakok és bejárat.",
    caption: "Télen, alkonyatkor",
    sourceFile: "38856055.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 642,
    focal: { x: 58, y: 50 },
  },
  "afritz-sign": {
    id: "afritz-sign",
    src: "/media/booking-export/79475626.jpg",
    alt: "Afritz am See helységnévtábla az út mentén; háttérben erdős hegyek és szivárvány.",
    caption: "Afritz am See",
    sourceFile: "79475626.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 960,
    height: 720,
    focal: { x: 62, y: 50 },
    note: "Nem a szállodát ábrázolja. Erős szűrős (telefonos) feldolgozás; a felhasználási jog a többi képpel együtt tisztázandó.",
  },
  "room-family": {
    id: "room-family",
    src: "/media/booking-export/34324370.jpg",
    alt: "Tágas vendégszoba franciaággyal, külön ággyal, íróasztallal és bal oldalt egy gyerekággyal.",
    caption: "Családi elhelyezés",
    sourceFile: "34324370.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 768,
    focal: { x: 55, y: 55 },
    note: "A képinventárban családi/összenyitható szobaként szerepel; gyerekágy látható.",
  },
  "room-double": {
    id: "room-double",
    src: "/media/booking-export/87275827.jpg",
    alt: "Vendégszoba franciaággyal, éjjeliszekrényekkel, rozsdaszín függönnyel és csillárral.",
    caption: "Kétágyas szoba",
    sourceFile: "87275827.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 683,
    focal: { x: 55, y: 55 },
  },
  "room-living": {
    id: "room-living",
    src: "/media/booking-export/34324368.jpg",
    alt: "Szoba nappali résszel: fa szekrény televízióval, kék fotel, íróasztal, bordó függöny és csillár.",
    caption: "Szoba nappali résszel",
    sourceFile: "34324368.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 768,
    focal: { x: 45, y: 55 },
    note: "Inventár: legjobb elérhető lakosztály-referencia; a TV-egység régebbi.",
  },
  bathroom: {
    id: "bathroom",
    src: "/media/booking-export/125610447.jpg",
    alt: "Világos fürdőszoba sarokzuhannyal, mosdóval, törölközőszárító radiátorral és ablakkal.",
    caption: "Fürdőszoba",
    sourceFile: "125610447.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 683,
    focal: { x: 50, y: 50 },
  },
  restaurant: {
    id: "restaurant",
    src: "/media/booking-export/38851398.jpg",
    alt: "Megterített étteremasztal zöld szalvétákkal, poharakkal és gyertyával az ablak előtt.",
    caption: "Terített asztal az étteremben",
    sourceFile: "38851398.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 515,
    height: 768,
    focal: { x: 50, y: 60 },
    note: "Álló kép, 515 px széles: csak kis méretben használható.",
  },
  bar: {
    id: "bar",
    src: "/media/booking-export/34324381.jpg",
    alt: "Kávézó-bár sötét fa pulttal, bárszékekkel, poharakkal teli polcokkal és kávégéppel.",
    caption: "Kávézó és bár",
    sourceFile: "34324381.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 768,
    focal: { x: 50, y: 55 },
    note: "Az inventár szerint elavult tapéta és rendezetlen kábelek látszanak.",
  },
  "terrace-loungers": {
    id: "terrace-loungers",
    src: "/media/booking-export/87276588.jpg",
    alt: "Kőburkolatos teraszrész két nyugággyal, alacsony asztallal és virágos hordóval.",
    caption: "Pihenősarok a teraszon",
    sourceFile: "87276588.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 683,
    focal: { x: 50, y: 55 },
  },
  "sauna-bench": {
    id: "sauna-bench",
    src: "/media/booking-export/34324380.jpg",
    alt: "Világos fa szauna kétszintes padokkal.",
    caption: "Szauna",
    sourceFile: "34324380.jpg",
    source: "SRC-BOOKING-EXPORT",
    generation: "booking-export",
    width: 1024,
    height: 768,
    focal: { x: 50, y: 55 },
    note: "Tisztázandó, hogy azonos-e a 87275544.jpg szaunával.",
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof MEDIA;

/** Oldalankénti képhelyek. Cserénél csak ezt kell átírni. `null` = rendezett üres képterület. */
export const MEDIA_SLOTS: Record<MediaSlotId, MediaId | null> = {
  "home.hero": "facade-summer",
  "home.villa": "facade-valley",
  "home.location": "afritz-sign",
  "home.saleTeaser": "facade-winter-dusk",
  "booking.hero": "terrace",
  "sale.hero": "facade-valley",
  "sale.property": "facade-summer",
};

/** Galéria sorrendje. */
export const GALLERY: readonly MediaId[] = [
  "facade-valley",
  "terrace",
  "corridor",
  "staircase",
  "salon",
  "room",
  "room-family",
  "bathroom",
  "bar",
  "sauna",
  "terrace-loungers",
  "facade-winter-dusk",
];

export function getMedia(id: MediaId): MediaAsset {
  return MEDIA[id];
}

export function getSlot(slot: MediaSlotId): MediaAsset | null {
  const id = MEDIA_SLOTS[slot];
  return id ? MEDIA[id] : null;
}

/** CSS object-position a manifest fókuszpontjából. */
export function objectPosition(asset: Pick<MediaAsset, "focal">): string {
  return `${asset.focal.x}% ${asset.focal.y}%`;
}
