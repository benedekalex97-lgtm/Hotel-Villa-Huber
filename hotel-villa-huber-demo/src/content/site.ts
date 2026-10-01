import { PROPERTY } from "./property";

/** Útvonalak és oldalon belüli horgonyok — mindkét oldal ezeket használja. */
export const ROUTES = {
  home: "/",
  booking: "/foglalas",
  sale: "/elado-hotel",
} as const;

/** A főoldal (vendégoldal) szekcióinak horgonyai. */
export const HOME_SECTIONS = {
  hotel: "hotel",
  rooms: "szobak",
  services: "szolgaltatasok",
  gallery: "galeria",
  area: "kornyek",
  booking: "foglalas",
  sale: "elado-hotel",
  contact: "kapcsolat",
} as const;

/** Az eladási landing szekcióinak horgonyai (A–L). */
export const SALE_SECTIONS = {
  summary: "osszefoglalo",
  data: "ingatlanadatok",
  spaces: "terek",
  area: "kornyek",
  operations: "mukodes",
  audience: "kinek",
  paths: "vasarlasi-utak",
  terms: "feltetelek",
  documents: "dokumentumok",
  faq: "gyik",
  process: "folyamat",
  inquiry: "ajanlatkeres",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

/** Fő navigáció (fejléc). Belső útvonal nem szerepelhet benne. */
export const MAIN_NAV: readonly NavItem[] = [
  { label: "A hotel", href: `${ROUTES.home}#${HOME_SECTIONS.hotel}` },
  { label: "Szobák", href: `${ROUTES.home}#${HOME_SECTIONS.rooms}` },
  { label: "Élmények és szolgáltatások", href: `${ROUTES.home}#${HOME_SECTIONS.services}` },
  { label: "Galéria", href: `${ROUTES.home}#${HOME_SECTIONS.gallery}` },
  { label: "Környék", href: `${ROUTES.home}#${HOME_SECTIONS.area}` },
  { label: "Foglalás", href: ROUTES.booking },
  { label: "Eladó hotel", href: ROUTES.sale },
  { label: "Kapcsolat", href: `${ROUTES.home}#${HOME_SECTIONS.contact}` },
];

/** A fejlécben kiemelt (gombként megjelenő) útvonalak. */
export const NAV_EMPHASIS: readonly string[] = [ROUTES.booking];

/** Értékesítési kapcsolat — nem vendégfoglalási cím. */
export const CONTACT = {
  email: PROPERTY.contactEmail,
  mailtoHref: `mailto:${PROPERTY.contactEmail}`,
} as const;

/** Kötelező jelölés a foglalási demónál (widget és lezárás). */
export const BOOKING_DEMO_NOTICE = "Bemutató foglalási folyamat — valódi foglalás nem történik.";

export const SITE = {
  name: PROPERTY.name,
  lang: "hu",
  description: `${PROPERTY.name} — ${PROPERTY.tagline.replace(/\.$/, "")}, ${PROPERTY.locality} településen.`,
} as const;
