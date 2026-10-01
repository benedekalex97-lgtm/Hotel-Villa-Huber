import { INTEREST_OPTIONS } from "@/content/sales";
import { CONTACT } from "@/content/site";

/** Az űrlap mezői — mind szövegként érkezik a böngészőből. */
export interface InquiryInput {
  name: string;
  email: string;
  company: string;
  interest: string;
  message: string;
}

export type InquiryField = keyof InquiryInput;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const NAME_MAX = 120;
export const COMPANY_MAX = 120;
export const EMAIL_MAX = 254;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 1500;

export interface InquiryMailto {
  to: string;
  subject: string;
  body: string;
  href: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;

/** Egysoros mezők: sortörés és vezérlőkarakter nélkül (fejlécinjektálás ellen). */
function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").replace(/ {2,}/g, " ").trim();
}

/** Többsoros mező: sortörések egységesen CRLF-re, szélén szóköz nélkül. */
function multiLine(value: string): string {
  return value
    .replace(/\r\n|\r|\n|\u2028|\u2029/g, "\n")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .replace(/\n/g, "\r\n");
}

function normalize(input: InquiryInput): InquiryInput {
  return {
    name: singleLine(input.name),
    email: singleLine(input.email),
    company: singleLine(input.company),
    interest: input.interest.trim(),
    message: multiLine(input.message),
  };
}

/** Mezőszintű magyar hibaüzenetek; érvényes adatnál üres objektum. */
export function validateInquiry(input: InquiryInput): InquiryErrors {
  const v = normalize(input);
  const errors: InquiryErrors = {};

  if (v.name.length < 2) errors.name = "Kérjük, adja meg a nevét.";
  else if (v.name.length > NAME_MAX) errors.name = `A név legfeljebb ${NAME_MAX} karakter lehet.`;

  if (v.email.length === 0) errors.email = "Kérjük, adja meg az email-címét.";
  else if (v.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(v.email)) {
    errors.email = "Kérjük, érvényes email-címet adjon meg, például nev@pelda.hu.";
  }

  if (v.company.length > COMPANY_MAX) errors.company = `A cégnév legfeljebb ${COMPANY_MAX} karakter lehet.`;

  if (!INTEREST_OPTIONS.some((option) => option.value === v.interest)) {
    errors.interest = "Kérjük, válassza ki az érdeklődési irányt.";
  }

  // A hosszt az űrlapon látható karakterekben mérjük (CRLF = 1 karakter).
  const messageLength = v.message.replace(/\r\n/g, "\n").length;
  if (messageLength < MESSAGE_MIN) errors.message = `Kérjük, írjon legalább ${MESSAGE_MIN} karakternyi üzenetet.`;
  else if (messageLength > MESSAGE_MAX) errors.message = `Az üzenet legfeljebb ${MESSAGE_MAX} karakter lehet.`;

  return errors;
}

/** A levél tárgya, törzse és a mailto: hivatkozás. A címzett mindig az értékesítési cím. */
export function buildInquiryMailto(input: InquiryInput): InquiryMailto {
  const v = normalize(input);
  const to = CONTACT.email;
  const interestLabel = INTEREST_OPTIONS.find((option) => option.value === v.interest)?.label ?? "";

  const subject = `Hotel Villa Huber – részletes bemutató kérése – ${v.name}`;
  const lines = [
    `Név: ${v.name}`,
    `Email: ${v.email}`,
    ...(v.company ? [`Cég: ${v.company}`] : []),
    `Érdeklődési irány: ${interestLabel}`,
    "",
    "Üzenet:",
    v.message,
  ];
  const body = lines.join("\r\n");

  // encodeURIComponent, nem URLSearchParams: utóbbi a szóközt '+'-ra cseréli, amit a levelezők szó szerint mutatnak.
  const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { to, subject, body, href };
}

/** A teljes levél egyszerű szövegként (másoláshoz): tárgy, üres sor, törzs. */
export function inquiryPlainText(mail: Pick<InquiryMailto, "subject" | "body">): string {
  return `Tárgy: ${mail.subject}\n\n${mail.body.replace(/\r\n/g, "\n")}`;
}
