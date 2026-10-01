import type { EmailTemplate, Segment, Values, VarName } from "./templates";

/**
 * Tiszta (állapotmentes) megjelenítő függvények.
 * A behelyettesítés pozíció szerinti, szegmensenkénti összefűzés — nincs
 * reguláris csere, így a `$&`, `$1`, `[Név]` stb. tartalmú értékek szó szerint
 * kerülnek a szövegbe, és nem helyettesítődnek újra.
 */

/** Bármely, szögletes zárójeles helyőrző (egy soron belül). */
const PLACEHOLDER_SOURCE = String.raw`\[[^\]\n]+\]`;

/** Egysoros mező értéke: sortörések szóközzé, szélek levágva. */
export function cleanValue(value: string): string {
  return value.replace(/\s*[\r\n]+\s*/g, " ").trim();
}

const VOWELS = "AÁEÉIÍOÓÖŐUÚÜŰ";

/** Magyar határozott névelő a cégnévhez: magánhangzóval kezdődőnél „Az”, egyébként „A”. */
export function articleFor(name: string): "A" | "Az" {
  const first = cleanValue(name).charAt(0).toUpperCase();
  return first && VOWELS.includes(first) ? "Az" : "A";
}

function renderSegments(segments: Segment[], values: Values): string {
  let out = "";
  for (const seg of segments) {
    if (typeof seg === "string") out += seg;
    else if ("var" in seg) out += cleanValue(values[seg.var]) || seg.placeholder;
    else out += articleFor(values[seg.article]);
  }
  return out;
}

export function renderTemplate(template: EmailTemplate, values: Values): { subject: string; body: string } {
  return {
    subject: renderSegments(template.subject, values),
    body: renderSegments(template.body, values),
  };
}

/** A szövegben maradt szögletes zárójeles helyőrzők, egyedileg, megjelenési sorrendben. */
export function findPlaceholders(text: string): string[] {
  const found = text.match(new RegExp(PLACEHOLDER_SOURCE, "g")) ?? [];
  return [...new Set(found)];
}

export interface TextPart {
  text: string;
  placeholder: boolean;
}

/** Az előnézet kiemeléséhez: a szöveg darabolása helyőrzőkre és köztes szövegre. */
export function splitPlaceholders(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const re = new RegExp(PLACEHOLDER_SOURCE, "g");
  let last = 0;
  for (const m of text.matchAll(re)) {
    const index = m.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), placeholder: false });
    parts.push({ text: m[0], placeholder: true });
    last = index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), placeholder: false });
  return parts;
}

/** A sablonban kötelező, de még üres változók. */
export function missingRequired(template: EmailTemplate, values: Values): VarName[] {
  return template.fields.filter((f) => f.required && !cleanValue(values[f.var])).map((f) => f.var);
}

export interface Readiness {
  missingFields: VarName[];
  placeholders: string[];
  ready: boolean;
}

/** „Kész a másolásra” csak ha minden kötelező mező kitöltött ÉS nincs helyőrző a tárgyban/szövegben. */
export function computeReadiness(template: EmailTemplate, values: Values, subject: string, body: string): Readiness {
  const missingFields = missingRequired(template, values);
  const placeholders = findPlaceholders(`${subject}\n${body}`);
  return { missingFields, placeholders, ready: missingFields.length === 0 && placeholders.length === 0 };
}

/** Igaz, ha a cégnév miatt a névelőt „Az”-ra igazítottuk (a sablon használ névelő-szegmenst). */
export function articleAdjusted(template: EmailTemplate, values: Values): boolean {
  const usesArticle = template.body.some((s) => typeof s !== "string" && "article" in s);
  return usesArticle && articleFor(values.companyName) === "Az";
}
