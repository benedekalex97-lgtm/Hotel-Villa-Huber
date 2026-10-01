import type { FactStatus, SourceId } from "./types";
import type { MediaId } from "./media";

/**
 * Vendégoldal tartalma. Csak forrásból ismert vagy fotón azonosítható elem.
 * Nincs hivatalos szobatípus, ár, nyitvatartás vagy működési ígéret.
 */

export interface GuestContact {
  /** Megerősített vendégkapcsolati email; hiányában `null` (nem találunk ki címet). */
  email: string | null;
  /** Megerősített vendégkapcsolati telefonszám; hiányában `null`. */
  phone: string | null;
}

/**
 * Vendégkapcsolat külön konfigurációból (Vercel env: NEXT_PUBLIC_GUEST_EMAIL, NEXT_PUBLIC_GUEST_PHONE).
 * A sale@ cím értékesítési cím, ide nem kerülhet automatikusan.
 */
export const GUEST_CONTACT: GuestContact = {
  email: process.env.NEXT_PUBLIC_GUEST_EMAIL?.trim() || null,
  phone: process.env.NEXT_PUBLIC_GUEST_PHONE?.trim() || null,
};

export const GUEST_INTRO = {
  title: "Villa-hotel a Gegendtal völgyben",
  paragraphs: [
    "A Hotel Villa Huber sárga homlokzatú, saroktornyos villa Afritz am See településen, Karintiában. A házat virágos erkély, fedett kerti terasz és a völgy erdős hegyei veszik körül.",
    "Belül faragott fa lépcsőház, gerendás folyosó, hagyományos festett bútorral berendezett szalon és meleg tónusú vendégszobák fogadják a vendégeket.",
  ],
  source: "SRC-BOOKING-EXPORT" as SourceId,
};

export interface AccommodationForm {
  id: string;
  title: string;
  description: string;
  media: MediaId;
}

/**
 * A fotókon látható elhelyezési formák — nem hivatalos szobatípusok.
 * A korábbi leírás szerint 14 szoba és lakosztály van (PUBLIC_FACTS "rooms").
 */
export const ACCOMMODATION: readonly AccommodationForm[] = [
  {
    id: "double",
    title: "Kétágyas szoba",
    description: "Franciaágy, éjjeliszekrények, meleg színű textilek és csillár.",
    media: "room-double",
  },
  {
    id: "family",
    title: "Családi elhelyezés",
    description: "Tágas szoba franciaággyal és külön ággyal; a képen gyerekágy is látható.",
    media: "room-family",
  },
  {
    id: "living",
    title: "Szoba nappali résszel",
    description: "Ülősarok, íróasztal és fa szekrény a hálórész mellett.",
    media: "room-living",
  },
  {
    id: "room-13",
    title: "Vendégszoba",
    description: "Franciaágy, fotel, állólámpák és intarziás fa szekrény.",
    media: "room",
  },
];

export interface GuestService {
  id: string;
  title: string;
  description: string;
  media: MediaId | null;
  status: FactStatus;
  source: SourceId;
}

/** Szolgáltatások és közösségi terek — nyitvatartást és működést nem ígérünk. */
export const GUEST_SERVICES: readonly GuestService[] = [
  {
    id: "restaurant",
    title: "Étterem",
    description: "A korábbi leírások szerint a háznak saját étterme van; a homlokzaton a „Hotel Restaurant Huber” felirat látható.",
    media: "restaurant",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
  },
  {
    id: "bar",
    title: "Kávézó és bár",
    description: "Sötét fa pult, bárszékek és kávégép a földszinten.",
    media: "bar",
    status: "nyilvanos-megerositendo",
    source: "SRC-BOOKING-EXPORT",
  },
  {
    id: "terrace",
    title: "Fedett kerti terasz",
    description: "Fonott bútorok, futónövények és függő virágkosarak a kert felőli oldalon.",
    media: "terrace",
    status: "nyilvanos-megerositendo",
    source: "SRC-BOOKING-EXPORT",
  },
  {
    id: "wellness",
    title: "Szauna és wellness",
    description: "Világos fa borítású finn szauna. A korábbi leírások jakuzzit és kültéri fadézsát is említenek.",
    media: "sauna",
    status: "nyilvanos-megerositendo",
    source: "SRC-HVH-WEB",
  },
  {
    id: "salon",
    title: "Szalon és közösségi terek",
    description: "Üvegezett fa válaszfal, festett szekrény, gerendás folyosó a recepció felé.",
    media: "salon",
    status: "nyilvanos-megerositendo",
    source: "SRC-BOOKING-EXPORT",
  },
];

export interface AreaHighlight {
  title: string;
  description: string;
  source: SourceId;
}

/** Környék — hivatalos települési/turisztikai forrásokból (tényregiszter F-052…F-057). Távolság és menetidő nélkül. */
export const AREA_HIGHLIGHTS: readonly AreaHighlight[] = [
  {
    title: "Gegendtal",
    description: "Afritz am See a Gegendtal völgy közepén fekszik, a Millstätter See és az Ossiacher See között, a Nockberge hegyei övezetében.",
    source: "SRC-OFFICIAL-REGION",
  },
  {
    title: "Afritzi-tó és Brennsee",
    description: "A település területén található az Afritzi-tó és a Brennsee; az Afritzi-tó mentén természetvédelmi területen vezet a 4,6 km-es Slow Trail sétaút.",
    source: "SRC-OFFICIAL-REGION",
  },
  {
    title: "Villach régió",
    description: "Afritz a „Villach – Faaker See – Ossiacher See” turisztikai régió része, Karintia déli tóvidékén.",
    source: "SRC-OFFICIAL-REGION",
  },
  {
    title: "Téli hegyek",
    description: "A régió ismert téli sportközpontjai közé tartozik a Gerlitzen Alpe és Bad Kleinkirchheim.",
    source: "SRC-OFFICIAL-REGION",
  },
];
