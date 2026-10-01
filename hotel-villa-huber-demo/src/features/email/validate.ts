import { collectTexts } from "./document-text";
import { PERSONAL_FIELD_META, type EmailDocument, type PersonalField, type PersonalValues } from "./model";
import { cleanLine } from "./presentation";

/** Szögletes vagy kapcsos zárójeles helyőrző egy soron belül, pl. „[Név]”, „[adat később]”, „{recipientName}”. */
const PLACEHOLDER = /\[[^\]\n]+\]|\{[^}\n]+\}/g;

export interface Hit {
  where: string;
  text: string;
}

/**
 * Tiltott tartalom: saját díj, pénzösszeg, hozam- vagy megtérülési állítás, terület, síállítás.
 * Az alaplevél nem tartalmaz ilyet (teszt); kézi szerkesztéssel sem kerülhet be küldhető levélbe.
 */
const BLOCKED: readonly { label: string; pattern: RegExp }[] = [
  { label: "saját díj vagy sikerdíj", pattern: /sikerdíj|megbízási díj|szolgáltatási díj|havi díj|indulási díj|onboarding/i },
  { label: "pénzösszeg", pattern: /€|\beur\b|\beuró|\bhuf\b|\bft\b|forint|millió/i },
  { label: "hozam-, megtérülési vagy garanciaállítás", pattern: /hozam|megtérül|garantált|\broi\b|kamat/i },
  { label: "terület- vagy méretadat", pattern: /m²|\bm2\b|négyzetméter|\bnm\b/i },
  { label: "síállítás vagy luxusminősítés", pattern: /ski-?in|ski-?out|luxus/i },
];

export interface Readiness {
  /** Üres kötelező személyes mezők. */
  missingFields: PersonalField[];
  invalidFields: { field: PersonalField; message: string }[];
  /** A hiányzó személyes mezők helyén álló helyőrzők (megszólítás, aláírás). */
  personalPlaceholders: Hit[];
  /** Egyéb, a szövegben maradt vagy beírt helyőrzők. */
  contentPlaceholders: Hit[];
  blocked: Hit[];
  subjectMissing: boolean;
  /** Szabályos adatok, amelyek megerősítésre várnak (nem hiba). */
  pendingConfirmation: number;
  /** „Egyeztetés tárgya” állapotú tételek (nem hiba). */
  openTopics: number;
  ready: boolean;
}

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function missingPersonal(personal: PersonalValues): PersonalField[] {
  return (Object.keys(PERSONAL_FIELD_META) as PersonalField[]).filter(
    (f) => PERSONAL_FIELD_META[f].required && !cleanLine(personal[f]),
  );
}

export function computeReadiness(doc: EmailDocument, personal: PersonalValues, counts: { pending: number; open: number }): Readiness {
  const missingFields = missingPersonal(personal);
  const invalidFields: Readiness["invalidFields"] = [];
  const email = cleanLine(personal.recipientEmail);
  if (email && !EMAIL_PATTERN.test(email)) invalidFields.push({ field: "recipientEmail", message: "Az email cím formátuma hibás." });

  const personalPlaceholders: Hit[] = [];
  const contentPlaceholders: Hit[] = [];
  const blocked: Hit[] = [];
  for (const leaf of collectTexts(doc)) {
    for (const match of leaf.text.matchAll(PLACEHOLDER)) {
      (leaf.origin === "personal" ? personalPlaceholders : contentPlaceholders).push({ where: leaf.where, text: match[0] });
    }
    for (const rule of BLOCKED) if (rule.pattern.test(leaf.text)) blocked.push({ where: leaf.where, text: rule.label });
  }
  const subjectMissing = !doc.subject;
  const ready =
    missingFields.length === 0 &&
    invalidFields.length === 0 &&
    personalPlaceholders.length === 0 &&
    contentPlaceholders.length === 0 &&
    blocked.length === 0 &&
    !subjectMissing;
  return {
    missingFields,
    invalidFields,
    personalPlaceholders,
    contentPlaceholders,
    blocked,
    subjectMissing,
    pendingConfirmation: counts.pending,
    openTopics: counts.open,
    ready,
  };
}
