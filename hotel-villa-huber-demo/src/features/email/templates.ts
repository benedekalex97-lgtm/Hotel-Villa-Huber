import { PROPERTY } from "@/content/property";

/**
 * Az email-sablonok szegmens-modellje.
 *
 * Minden sablon (tárgy és szöveg) explicit szegmenslista: a behelyettesítés
 * pozíció szerinti, nem szövegcsere — így a „[Név]” megszólítás és aláírás
 * soha nem keveredhet, és a beírt érték sem helyettesítődik újra.
 * A jóváhagyott alapszöveg betűre pontosan megmarad.
 */

/** A felületen kitölthető változók. */
export type VarName = "recipientName" | "companyName" | "connection" | "senderName" | "senderPhone";

export type TemplateId = "investor" | "hotelier" | "followup";

export type Segment =
  | string
  /** Behelyettesítendő változó; hiányzó érték esetén a `placeholder` marad a szövegben. */
  | { var: VarName; placeholder: string }
  /** A cégnév előtti névelő (A/Az) — az egyetlen megengedett szöveges igazítás. */
  | { article: "companyName" };

export interface FieldConfig {
  var: VarName;
  /** Kötelező-e a mező a „kész a másolásra” állapothoz. */
  required: boolean;
}

export interface EmailTemplate {
  id: TemplateId;
  label: string;
  description: string;
  subject: Segment[];
  body: Segment[];
  /** Csak a sablon által használt mezők, megjelenítési sorrendben. */
  fields: FieldConfig[];
}

/** Az aláírásban szereplő kapcsolati cím (szó szerint). */
export const CONTACT_EMAIL = PROPERTY.contactEmail;

export const VAR_ORDER: VarName[] = ["recipientName", "companyName", "connection", "senderName", "senderPhone"];

export interface VarMeta {
  label: string;
  /** Hol szerepel a levélben (a státuszüzenethez). */
  where?: string;
  autoComplete: string;
  inputMode?: "tel" | "text";
}

export const VAR_META: Record<VarName, VarMeta> = {
  recipientName: { label: "Címzett neve", where: "megszólítás", autoComplete: "off" },
  companyName: { label: "Cégnév", autoComplete: "off" },
  connection: { label: "Személyes kapcsolódás", autoComplete: "off" },
  senderName: { label: "Aláíró neve", where: "aláírás", autoComplete: "off" },
  senderPhone: { label: "Aláíró telefonszáma", autoComplete: "off", inputMode: "tel" },
};

export type Values = Record<VarName, string>;

export const EMPTY_VALUES: Values = {
  recipientName: "",
  companyName: "",
  connection: "",
  senderName: "",
  senderPhone: "",
};

/** Kitöltött mintaadatok a bemutatóhoz — egyértelműen fiktívek. */
export const DEMO_VALUES: Values = {
  recipientName: "Minta Péter",
  companyName: "Minta Szálloda Kft.",
  connection: "Minta Gábor ajánlása",
  senderName: "Kovács Anna",
  senderPhone: "+36 30 123 4567",
};

/**
 * A kapcsolódás mondattani helye sablononként eltér (mondatkezdő a befektetőinél,
 * mondatközi a szállodásnál), ezért a mintaérték a kiválasztott sablonhoz igazodik.
 */
const DEMO_CONNECTION: Partial<Record<TemplateId, string>> = {
  investor: "Minta Gábor ajánlása",
  hotelier: "ausztriai terjeszkedési tervei",
};

export function demoValuesFor(id: TemplateId): Values {
  return { ...DEMO_VALUES, connection: DEMO_CONNECTION[id] ?? DEMO_VALUES.connection };
}

const recipient: Segment = { var: "recipientName", placeholder: "[Név]" };
const sender: Segment = { var: "senderName", placeholder: "[Név]" };
const phone: Segment = { var: "senderPhone", placeholder: "[Telefonszám]" };

/** A három levél közös záró blokkja: aláírás, telefon, kapcsolati cím. */
const SIGNATURE: Segment[] = ["Üdvözlettel:\n", sender, "\n", phone, "\n", CONTACT_EMAIL];

const INVESTOR_CONNECTION: Segment = {
  var: "connection",
  placeholder: "[Ajánló neve / korábbi beszélgetésünk / konkrét üzleti kapcsolódás]",
};

const HOTELIER_CONNECTION: Segment = {
  var: "connection",
  placeholder: "[konkrét, ellenőrzött szakmai kapcsolódása]",
};

export const TEMPLATES: EmailTemplate[] = [
  {
    id: "investor",
    label: "Befektető",
    description: "Első megkeresés befektetőnek, külső szakmai üzemeltetéssel.",
    subject: ["Hotel Villa Huber – ausztriai szállodai befektetési lehetőség"],
    body: [
      "Tisztelt ",
      recipient,
      "!\n\n",
      INVESTOR_CONNECTION,
      " alapján keresem a karintiai Hotel Villa Huber értékesítésével kapcsolatban.\n\n" +
        "A lehetőség olyan befektető számára lehet érdekes, aki ausztriai szállodai ingatlan vásárlásában gondolkodik, és a működtetést szakmai üzemeltetővel képzeli el. Az üzemeltető bevonása külön előkészítendő feladat.\n\n" +
        "Érdekes lehet Önnek ez a befektetési irány? Ha igen, elküldöm a rövid bemutatót, majd egy 15 perces beszélgetésben egyeztethetjük az elképzeléseit.\n\n",
      ...SIGNATURE,
    ],
    fields: [
      { var: "recipientName", required: true },
      { var: "connection", required: true },
      { var: "senderName", required: true },
      { var: "senderPhone", required: true },
    ],
  },
  {
    id: "hotelier",
    label: "Szállodás",
    description: "Első megkeresés szállodásnak, saját üzemeltetésű vásárlás esetére.",
    subject: ["Hotel Villa Huber – vásárlási lehetőség saját üzemeltetésre"],
    body: [
      "Tisztelt ",
      recipient,
      "!\n\n",
      { article: "companyName" },
      " ",
      { var: "companyName", placeholder: "[cégnév]" },
      " ",
      HOTELIER_CONNECTION,
      " miatt keresem a karintiai Hotel Villa Huber értékesítésével kapcsolatban.\n\n" +
        "A szállodát olyan szakmai vevőnek szeretnénk bemutatni, aki saját üzemeltetésű ausztriai egység vásárlását mérlegeli. Az első egyeztetésen azt tisztáznánk, hogy a ház mérete, elhelyezkedése és működési háttere illeszkedhet-e az Önök terveihez.\n\n" +
        "Napirenden van Önöknél hasonló vásárlás? Ha igen, szívesen elküldöm a rövid bemutatót, és egyeztetek egy 15 perces telefonbeszélgetést.\n\n",
      ...SIGNATURE,
    ],
    fields: [
      { var: "recipientName", required: true },
      { var: "companyName", required: true },
      { var: "connection", required: true },
      { var: "senderName", required: true },
      { var: "senderPhone", required: true },
    ],
  },
  {
    id: "followup",
    label: "Utánkövetés",
    description: "Rövid visszatérés egy korábbi levélre.",
    subject: ["Hotel Villa Huber – korábbi megkeresésem"],
    body: [
      "Tisztelt ",
      recipient,
      "!\n\n" +
        "A Hotel Villa Huberrel kapcsolatos korábbi levelemre szeretnék röviden visszatérni.\n\n" +
        "Aktuális lehet Önnek egy karintiai szállodai ingatlan vásárlásának megvizsgálása? Ha igen, elküldöm a rövid bemutatót, vagy egyeztethetünk egy rövid beszélgetést.\n\n" +
        "Ha jelenleg nem aktuális, egy rövid visszajelzés is elegendő. Ha a cégnél más foglalkozik ilyen vásárlásokkal, köszönöm, ha megjelöli az illetékes kollégát.\n\n",
      ...SIGNATURE,
    ],
    fields: [
      { var: "recipientName", required: true },
      { var: "senderName", required: true },
      { var: "senderPhone", required: true },
    ],
  },
];

export const DEFAULT_TEMPLATE_ID: TemplateId = "investor";

export function getTemplate(id: TemplateId): EmailTemplate {
  const found = TEMPLATES.find((t) => t.id === id);
  if (!found) throw new Error(`Ismeretlen sablon: ${id}`);
  return found;
}

/** A sablonban szereplő (első) helyőrző szövege egy változóhoz, pl. „[Név]”. */
export function placeholderFor(template: EmailTemplate, name: VarName): string | null {
  for (const seg of [...template.subject, ...template.body]) {
    if (typeof seg !== "string" && "var" in seg && seg.var === name) return seg.placeholder;
  }
  return null;
}

/** A sablon szegmenseiben ténylegesen használt változók (konzisztencia-ellenőrzéshez). */
export function usedVars(template: EmailTemplate): VarName[] {
  const used = new Set<VarName>();
  for (const seg of [...template.subject, ...template.body]) {
    if (typeof seg === "string") continue;
    if ("var" in seg) used.add(seg.var);
    else used.add(seg.article);
  }
  return VAR_ORDER.filter((v) => used.has(v));
}
