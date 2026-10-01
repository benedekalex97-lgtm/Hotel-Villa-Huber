import { INTEREST_OPTIONS, REQUEST_OPTIONS } from "@/content/sales";
import { CONTACT } from "@/content/site";

/**
 * Ajánlatkérő — közös (kliens + szerver) adatmodell, validáció és mailto-összeállítás.
 * A foglalási demó adataitól teljesen elkülönül.
 */

export interface InquiryInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  interest: string;
  request: string;
  message: string;
}

export type InquiryField = keyof InquiryInput;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const EMPTY_INQUIRY: InquiryInput = {
  name: "",
  email: "",
  phone: "",
  company: "",
  interest: "",
  request: "",
  message: "",
};

export const LIMITS = {
  nameMax: 120,
  emailMax: 254,
  phoneMax: 40,
  companyMax: 160,
  messageMin: 10,
  messageMax: 2000,
  /** A teljes kérés maximális mérete bájtban (szerveroldali korlát). */
  requestBytesMax: 16_384,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;
/** Nemzetközi formátumot is elfogad: számjegy, szóköz, +, -, /, zárójel; legalább 6 számjegy. */
const PHONE_PATTERN = /^\+?[0-9\s\-/().]{6,}$/;

/** Egysoros mezők: sortörés és vezérlőkarakter nélkül (fejlécinjektálás ellen). */
function singleLine(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Többsoros mező: egységes LF sortörés, vezérlőkarakterek nélkül. */
function multiLine(value: unknown): string {
  return String(value ?? "")
    .replace(/\r\n|\r|\u2028|\u2029/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
}

/** Ismeretlen bemenetből (pl. JSON-törzs) tiszta, csak a várt mezőket tartalmazó objektum. */
export function normalizeInquiry(input: Partial<Record<InquiryField, unknown>>): InquiryInput {
  return {
    name: singleLine(input.name),
    email: singleLine(input.email),
    phone: singleLine(input.phone),
    company: singleLine(input.company),
    interest: singleLine(input.interest),
    request: singleLine(input.request),
    message: multiLine(input.message),
  };
}

export function interestLabel(value: string): string {
  return INTEREST_OPTIONS.find((o) => o.value === value)?.label ?? "";
}

export function requestLabel(value: string): string {
  return REQUEST_OPTIONS.find((o) => o.value === value)?.label ?? "";
}

/** Mezőszintű magyar hibaüzenetek; érvényes adatnál üres objektum. Kliensen és szerveren ugyanez fut. */
export function validateInquiry(input: Partial<Record<InquiryField, unknown>>): InquiryErrors {
  const v = normalizeInquiry(input);
  const errors: InquiryErrors = {};

  if (v.name.length < 2) errors.name = "Kérjük, adja meg a nevét.";
  else if (v.name.length > LIMITS.nameMax) errors.name = `A név legfeljebb ${LIMITS.nameMax} karakter lehet.`;

  if (v.email.length === 0) errors.email = "Kérjük, adja meg az email-címét.";
  else if (v.email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(v.email)) {
    errors.email = "Kérjük, érvényes email-címet adjon meg, például nev@pelda.hu.";
  }

  if (v.phone) {
    const digits = v.phone.replace(/\D/g, "").length;
    if (v.phone.length > LIMITS.phoneMax || !PHONE_PATTERN.test(v.phone) || digits < 6) {
      errors.phone = "Kérjük, érvényes telefonszámot adjon meg, például +36 30 123 4567.";
    }
  }

  if (v.company.length > LIMITS.companyMax) errors.company = `A cégnév legfeljebb ${LIMITS.companyMax} karakter lehet.`;

  if (!interestLabel(v.interest)) errors.interest = "Kérjük, válassza ki az érdeklődési irányt.";
  if (!requestLabel(v.request)) errors.request = "Kérjük, válassza ki, mit szeretne kérni.";

  if (v.message.length < LIMITS.messageMin) errors.message = `Kérjük, írjon legalább ${LIMITS.messageMin} karakternyi üzenetet.`;
  else if (v.message.length > LIMITS.messageMax) errors.message = `Az üzenet legfeljebb ${LIMITS.messageMax} karakter lehet.`;

  return errors;
}

export interface InquiryEmail {
  to: string;
  subject: string;
  /** Egyszerű szöveges törzs, LF sortörésekkel. */
  text: string;
}

/** A levél tárgya és törzse — a szerveres küldés és a mailto ugyanezt használja. Címzett mindig az értékesítési cím. */
export function composeInquiryEmail(input: InquiryInput): InquiryEmail {
  const v = normalizeInquiry(input);
  const subject = `Hotel Villa Huber – ${requestLabel(v.request).toLowerCase() || "érdeklődés"} – ${v.name}`;
  const lines = [
    `Név: ${v.name}`,
    `Email: ${v.email}`,
    ...(v.phone ? [`Telefon: ${v.phone}`] : []),
    ...(v.company ? [`Cég: ${v.company}`] : []),
    `Érdeklődési irány: ${interestLabel(v.interest)}`,
    `Kérés: ${requestLabel(v.request)}`,
    "",
    "Üzenet:",
    v.message,
  ];
  return { to: CONTACT.email, subject, text: lines.join("\n") };
}

export interface InquiryMailto extends InquiryEmail {
  href: string;
}

/** mailto: hivatkozás (encodeURIComponent, CRLF) — nem URLSearchParams, mert az a szóközt '+'-ra cseréli. */
export function buildInquiryMailto(input: InquiryInput): InquiryMailto {
  const mail = composeInquiryEmail(input);
  const body = mail.text.replace(/\n/g, "\r\n");
  const href = `mailto:${mail.to}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(body)}`;
  return { ...mail, href };
}

/** A teljes levél egyszerű szövegként (másoláshoz): tárgy, üres sor, törzs. */
export function inquiryPlainText(mail: Pick<InquiryEmail, "subject" | "text">): string {
  return `Tárgy: ${mail.subject}\n\n${mail.text}`;
}
