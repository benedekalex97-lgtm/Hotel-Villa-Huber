/**
 * Központi tartalommodell típusai.
 * Minden ingatlanadat forrással, állapottal és megjeleníthetőséggel együtt él.
 */

/** Az adat ellenőrzöttségi állapota. */
export type FactStatus =
  /** A tulajdonos vagy a felhasználó kifejezetten jóváhagyta ezt a megfogalmazást. */
  | "jovahagyott"
  /** Korábbi nyilvános közlésben szerepel, tulajdonosi megerősítés még hiányzik. */
  | "nyilvanos-megerositendo"
  /** A tulajdonos szóban vagy írásban közölte, dokumentum még nem igazolja. */
  | "tulajdonosi-kozles"
  /** Nincs megbízható adat. */
  | "ismeretlen";

export const FACT_STATUS_LABEL: Record<FactStatus, string> = {
  jovahagyott: "jóváhagyott",
  "nyilvanos-megerositendo": "nyilvános közlés, megerősítendő",
  "tulajdonosi-kozles": "tulajdonosi közlés",
  ismeretlen: "ismeretlen",
};

export type SourceId =
  | "SRC-BRIEF-0930"
  | "SRC-CELCSOPORT-V1"
  | "SRC-STRATEGIA-V1"
  | "SRC-EMAILEK-V1.1"
  | "SRC-KOLTSEGTERV-V0.2"
  | "SRC-KEPINVENTAR-V2"
  | "SRC-BOOKING-EXPORT"
  | "SRC-PUBLIC-LEGACY"
  | "SRC-OWNER-VERBAL";

export interface Source {
  id: SourceId;
  title: string;
  kind: "brief" | "elfogadott-dokumentum" | "belso-tervezet" | "kepforras" | "nyilvanos" | "tulajdonosi";
  /** Belső hivatkozás (Drive). Nyilvános oldalon nem jelenik meg. */
  ref?: string;
  date: string;
  note?: string;
}

/**
 * Hol jelenhet meg az adat.
 * - `public`: a vevőknek szánt oldalakon megjelenhet;
 * - `internal`: csak belső felületen és dokumentációban;
 * - `hidden`: sehol nem jelenik meg, csak a nyilvántartásban.
 */
export type Visibility = "public" | "internal" | "hidden";

export interface Fact<T = string> {
  id: string;
  label: string;
  value: T | null;
  status: FactStatus;
  source: SourceId;
  visibility: Visibility;
  /** Belső megjegyzés — soha nem renderelődik publikus oldalon. */
  note?: string;
}

export interface FocalPoint {
  /** 0–100, vízszintes fókusz százalékban. */
  x: number;
  /** 0–100, függőleges fókusz százalékban. */
  y: number;
}

export type MediaGeneration = "booking-export" | "pendrive-2026-10";

export interface MediaAsset {
  id: string;
  /** Publikus útvonal a /public mappán belül. */
  src: string;
  alt: string;
  /** Rövid, nyilvános képaláírás. */
  caption: string;
  /** Eredeti fájlnév a forrásmappában. */
  sourceFile: string;
  source: SourceId;
  generation: MediaGeneration;
  width: number;
  height: number;
  focal: FocalPoint;
  /** Belső megjegyzés a képről (vágás, kockázat, jogtisztázás). */
  note?: string;
}

export type MediaSlotId =
  | "home.hero"
  | "home.villa"
  | "home.location"
  | "home.saleTeaser"
  | "sale.hero"
  | "sale.property";
