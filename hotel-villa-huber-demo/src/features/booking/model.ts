import type { MediaId } from "@/content/media";

/**
 * Foglalási modell — tiszta típusok és segédfüggvények, UI- és szolgáltatófüggetlenül.
 * A teljes foglalási folyamat ezekre épül, így valódi foglalómotor később cserélhető.
 */

/** Keresési feltételek. A dátumok `YYYY-MM-DD` formátumúak. Az URL-be csak ez kerülhet. */
export interface BookingQuery {
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  rooms: number;
}

/** Egy elhelyezési ajánlat a szolgáltatótól. */
export interface Offer {
  id: string;
  title: string;
  description: string;
  mediaId: MediaId;
  /** A mintaadatban megadott legnagyobb létszám (egy szobára). */
  maxGuests: number;
  /** `true`: mintaadat, nem valós elérhetőség. Élő szolgáltató `false`-t ad. */
  demo: boolean;
  /** Opcionális ármegjegyzés. A demóban soha nincs kitöltve. */
  priceNote?: string;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface BookingDraft {
  query: BookingQuery;
  offerId?: string;
  guest?: GuestDetails;
}

export const LIMITS = {
  maxNights: 30,
  maxAdults: 10,
  maxChildren: 6,
  maxRooms: 5,
} as const;

export const EMPTY_GUEST: GuestDetails = { firstName: "", lastName: "", email: "", phone: "", notes: "" };

export const DEFAULT_QUERY: BookingQuery = { arrival: "", departure: "", adults: 2, children: 0, rooms: 1 };

export type QueryErrors = Partial<Record<keyof BookingQuery, string>>;
export type GuestErrors = Partial<Record<keyof GuestDetails, string>>;

/** Mezősorrend — az első hibás mezőre fókuszálunk. */
export const QUERY_FIELD_ORDER: readonly (keyof BookingQuery)[] = ["arrival", "departure", "adults", "children", "rooms"];
export const GUEST_FIELD_ORDER: readonly (keyof GuestDetails)[] = ["lastName", "firstName", "email", "phone", "notes"];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** `YYYY-MM-DD` → UTC éjfél időbélyeg; érvénytelen dátumra `null`. */
export function parseIsoDate(value: string): number | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return time;
}

/** Az éjszakák száma; érvénytelen vagy fordított időszakra 0. */
export function nightsBetween(arrival: string, departure: string): number {
  const from = parseIsoDate(arrival);
  const to = parseIsoDate(departure);
  if (from === null || to === null || to <= from) return 0;
  return Math.round((to - from) / DAY_MS);
}

/** Dátum eltolása napokkal (`YYYY-MM-DD` → `YYYY-MM-DD`); érvénytelen bemenetre üres szöveg. */
export function addDays(value: string, days: number): string {
  const time = parseIsoDate(value);
  if (time === null) return "";
  return new Date(time + days * DAY_MS).toISOString().slice(0, 10);
}

/** A mai nap helyi időben, `YYYY-MM-DD`. Az `now` injektálható a tesztekhez. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function countError(value: number, min: number, max: number, tooLow: string, tooHigh: string): string | undefined {
  if (!Number.isInteger(value)) return "Egész számot adjon meg.";
  if (value < min) return tooLow;
  if (value > max) return tooHigh;
  return undefined;
}

/** Keresési feltételek ellenőrzése; mezőnkénti magyar hibaüzenetekkel. Üres objektum = érvényes. */
export function validateQuery(query: BookingQuery, today: string): QueryErrors {
  const errors: QueryErrors = {};

  const arrival = parseIsoDate(query.arrival);
  const departure = parseIsoDate(query.departure);
  const todayTime = parseIsoDate(today);

  if (!query.arrival) errors.arrival = "Adja meg az érkezés napját.";
  else if (arrival === null) errors.arrival = "Az érkezés dátuma nem érvényes.";
  else if (todayTime !== null && arrival < todayTime) errors.arrival = "Az érkezés nem lehet a múltban.";

  if (!query.departure) errors.departure = "Adja meg a távozás napját.";
  else if (departure === null) errors.departure = "A távozás dátuma nem érvényes.";
  else if (arrival !== null && departure <= arrival) errors.departure = "A távozásnak az érkezés utáni napra kell esnie.";
  else if (arrival !== null && nightsBetween(query.arrival, query.departure) > LIMITS.maxNights)
    errors.departure = `A tartózkodás legfeljebb ${LIMITS.maxNights} éjszaka lehet.`;

  const adults = countError(query.adults, 1, LIMITS.maxAdults, "Legalább 1 felnőtt szükséges.", `Legfeljebb ${LIMITS.maxAdults} felnőtt adható meg.`);
  if (adults) errors.adults = adults;

  const children = countError(query.children, 0, LIMITS.maxChildren, "A gyermekek száma nem lehet negatív.", `Legfeljebb ${LIMITS.maxChildren} gyermek adható meg.`);
  if (children) errors.children = children;

  const rooms = countError(query.rooms, 1, LIMITS.maxRooms, "Legalább 1 szoba szükséges.", `Legfeljebb ${LIMITS.maxRooms} szoba adható meg.`);
  if (rooms) errors.rooms = rooms;
  else if (!errors.adults && query.rooms > query.adults)
    errors.rooms = "A szobák száma nem haladhatja meg a felnőttek számát.";

  return errors;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()./-]{6,24}$/;

/** Vendégadatok ellenőrzése. A név és az email kötelező, a telefon opcionális. */
export function validateGuest(guest: GuestDetails): GuestErrors {
  const errors: GuestErrors = {};
  const firstName = guest.firstName.trim();
  const lastName = guest.lastName.trim();
  const email = guest.email.trim();
  const phone = guest.phone.trim();

  if (!firstName) errors.firstName = "Adja meg a keresztnevét.";
  else if (firstName.length > 60) errors.firstName = "A keresztnév legfeljebb 60 karakter lehet.";

  if (!lastName) errors.lastName = "Adja meg a vezetéknevét.";
  else if (lastName.length > 60) errors.lastName = "A vezetéknév legfeljebb 60 karakter lehet.";

  if (!email) errors.email = "Adja meg az email-címét.";
  else if (email.length > 120 || !EMAIL_PATTERN.test(email)) errors.email = "Az email-cím formátuma nem megfelelő (például nev@pelda.hu).";

  if (phone && (!PHONE_PATTERN.test(phone) || phone.replace(/\D/g, "").length < 6))
    errors.phone = "A telefonszám formátuma nem megfelelő (például +36 30 123 4567).";

  if (guest.notes.length > 500) errors.notes = "A megjegyzés legfeljebb 500 karakter lehet.";

  return errors;
}

/** Az első hibás mező a megadott mezősorrendben. */
export function firstErrorKey<K extends string>(errors: Partial<Record<K, string>>, order: readonly K[]): K | null {
  return order.find((key) => Boolean(errors[key])) ?? null;
}

// — URL (csak dátumok és darabszámok, személyes adat soha) —

export const QUERY_PARAMS = {
  arrival: "erkezes",
  departure: "tavozas",
  adults: "felnott",
  children: "gyermek",
  rooms: "szoba",
} as const;

function intParam(raw: string | null, fallback: number): number {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isInteger(n) ? n : fallback;
}

/** URL-paraméterekből keresési feltétel; ismeretlen vagy hibás érték az alapértelmezést kapja. */
export function queryFromParams(get: (key: string) => string | null): BookingQuery {
  const date = (key: string) => {
    const raw = get(key)?.trim() ?? "";
    return parseIsoDate(raw) === null ? "" : raw;
  };
  return {
    arrival: date(QUERY_PARAMS.arrival),
    departure: date(QUERY_PARAMS.departure),
    adults: intParam(get(QUERY_PARAMS.adults), DEFAULT_QUERY.adults),
    children: intParam(get(QUERY_PARAMS.children), DEFAULT_QUERY.children),
    rooms: intParam(get(QUERY_PARAMS.rooms), DEFAULT_QUERY.rooms),
  };
}

export function queryToSearchParams(query: BookingQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set(QUERY_PARAMS.arrival, query.arrival);
  params.set(QUERY_PARAMS.departure, query.departure);
  params.set(QUERY_PARAMS.adults, String(query.adults));
  params.set(QUERY_PARAMS.children, String(query.children));
  params.set(QUERY_PARAMS.rooms, String(query.rooms));
  return params;
}

/** Stabil kulcs a keresés eredményének újrahasznosításához. */
export function queryKey(query: BookingQuery): string {
  return [query.arrival, query.departure, query.adults, query.children, query.rooms].join("|");
}

// — Megjelenítés —

const DATE_FORMAT = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export function formatDateHu(value: string): string {
  const time = parseIsoDate(value);
  return time === null ? "—" : DATE_FORMAT.format(new Date(time));
}

export function formatPeriodHu(arrival: string, departure: string): string {
  if (parseIsoDate(arrival) === null || parseIsoDate(departure) === null) return "—";
  return `${formatDateHu(arrival)} – ${formatDateHu(departure)}`;
}

export function formatGuestsHu(adults: number, children: number): string {
  const parts = [`${adults} felnőtt`];
  if (children > 0) parts.push(`${children} gyermek`);
  return parts.join(", ");
}

export function formatNightsHu(nights: number): string {
  return `${nights} éjszaka`;
}
