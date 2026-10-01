import type { FactStatus } from "@/content/types";

/**
 * Az emailbemutató dokumentummodellje. Ebből készül a HTML és a plain text is,
 * így a két változat azonos információt és linkeket tartalmaz.
 * Minden szöveg egyszerű szöveg: HTML-t a modell nem ismer, az escape a megjelenítőben történik.
 */

export interface FactRow {
  label: string;
  value: string;
  /** Állapot az adat mellett; `null`, ha az adatnak nincs minősítése. */
  status: FactStatus | null;
  statusLabel: string | null;
}

export interface CardItem {
  title: string;
  text: string;
  /** Címkézett kiegészítő sorok, pl. „Fő kérdés: …”. */
  lines?: { label?: string; text: string }[];
  bulletsLabel?: string;
  bullets?: string[];
  /** Kiemelt állapotsor, pl. „Jelenlegi állapot: …”. */
  note?: { label: string; text: string };
  status?: FactStatus;
  statusLabel?: string;
}

export interface ImageItem {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export type EmailBlock =
  | { kind: "paragraph"; text: string; strong?: boolean }
  | { kind: "subheading"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "steps"; items: { title: string; text: string }[] }
  | { kind: "facts"; rows: FactRow[] }
  | { kind: "legend"; items: { status: FactStatus; label: string; text: string }[] }
  | { kind: "cards"; items: CardItem[] }
  | { kind: "notice"; tone: "info" | "warning"; title?: string; text: string; tag?: string }
  | { kind: "qa"; items: { q: string; a: string }[] }
  | { kind: "images"; items: ImageItem[] }
  | { kind: "link"; label: string; href: string };

export interface EmailSection {
  /** A landing szekciójának betűjele (A–L) — csak a dokumentációhoz és a teszthez, a levélben nem jelenik meg. */
  letter: string;
  /** A landing horgonyazonosítója. */
  anchor: string;
  eyebrow: string;
  title: string;
  blocks: EmailBlock[];
}

export interface Cta {
  label: string;
  href: string;
  /** Gomb alatti szöveges link felirata. */
  fallbackLead: string;
}

export interface EmailDocument {
  subject: string;
  preheader: string;
  /** A hero kép. */
  hero: ImageItem | null;
  greeting: string;
  /** Személyes bevezető bekezdései (üres, ha nincs). */
  personalIntro: string[];
  intro: string;
  /** A levél tartalma: a szekciócímek felsorolása. */
  outline: string[];
  primaryCta: Cta;
  sections: EmailSection[];
  secondaryCta: Cta;
  closingNotes: string[];
  signature: { lead: string; name: string; phone: string; email: string };
  contactMailto: string;
  footer: string;
}

/** A feladó által kitöltendő személyes mezők. */
export type PersonalField = "recipientName" | "recipientEmail" | "senderName" | "senderPhone" | "personalIntro";

export type PersonalValues = Record<PersonalField, string>;

export const EMPTY_PERSONAL: PersonalValues = {
  recipientName: "",
  recipientEmail: "",
  senderName: "",
  senderPhone: "",
  personalIntro: "",
};

/** Személyes helyőrzők a levélben, amíg a mező üres (látható hiba, nem küldhető). */
export const PERSONAL_PLACEHOLDER = {
  recipientName: "[Név]",
  senderName: "[Név]",
  senderPhone: "[Telefonszám]",
} as const;

export interface PersonalFieldMeta {
  label: string;
  required: boolean;
  where: string;
  multiline?: boolean;
  autoComplete: string;
  inputMode?: "tel" | "email" | "text";
  type?: "text" | "email" | "tel";
}

export const PERSONAL_FIELD_META: Record<PersonalField, PersonalFieldMeta> = {
  recipientName: { label: "Címzett neve", required: true, where: "megszólítás", autoComplete: "off" },
  recipientEmail: { label: "Címzett emailje", required: false, where: "csak a belső felületen, a levélben nem szerepel", autoComplete: "off", type: "email", inputMode: "email" },
  senderName: { label: "Feladó neve", required: true, where: "aláírás", autoComplete: "off" },
  senderPhone: { label: "Feladó telefonszáma", required: true, where: "aláírás", autoComplete: "off", type: "tel", inputMode: "tel" },
  personalIntro: { label: "Személyes bevezető", required: false, where: "a bemutató bevezetője előtt", multiline: true, autoComplete: "off" },
};

export const PERSONAL_FIELD_ORDER: PersonalField[] = ["recipientName", "recipientEmail", "senderName", "senderPhone", "personalIntro"];

/** Egy szerkeszthető szövegmező a bemutatóban (szekciószöveg). */
export interface EditableField {
  key: string;
  /** A szekció betűjele (vagy „–” a szekción kívüli mezőknél). */
  section: string;
  label: string;
  base: string;
  value: string;
  multiline: boolean;
  edited: boolean;
}
