import { PROPERTY } from "./property";

/** Útvonalak és oldalon belüli horgonyok — mindkét oldal ezeket használja. */
export const ROUTES = {
  home: "/",
  sale: "/elado-hotel",
} as const;

export const HOME_SECTIONS = {
  villa: "villa",
  gallery: "galeria",
  location: "elhelyezkedes",
  sale: "ertekesites",
  contact: "kapcsolat",
} as const;

export const SALE_SECTIONS = {
  property: "ingatlan",
  audience: "kinek",
  paths: "vasarlasi-utak",
  firstCall: "elso-egyeztetes",
  steps: "kovetkezo-lepesek",
  contact: "kapcsolatfelvetel",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

/** Fő navigáció (fejléc). Belső útvonal nem szerepelhet benne. */
export const MAIN_NAV: readonly NavItem[] = [
  { label: "A villa", href: `${ROUTES.home}#${HOME_SECTIONS.villa}` },
  { label: "Galéria", href: `${ROUTES.home}#${HOME_SECTIONS.gallery}` },
  { label: "Elhelyezkedés", href: `${ROUTES.home}#${HOME_SECTIONS.location}` },
  { label: "Eladó hotel", href: ROUTES.sale },
  { label: "Kapcsolat", href: `${ROUTES.home}#${HOME_SECTIONS.contact}` },
];

export const CONTACT = {
  email: PROPERTY.contactEmail,
  mailtoHref: `mailto:${PROPERTY.contactEmail}`,
} as const;

export const SITE = {
  name: PROPERTY.name,
  lang: "hu",
  description: `${PROPERTY.name} — ${PROPERTY.tagline.replace(/\.$/, "")}, ${PROPERTY.locality} településen.`,
} as const;
