import { ACCOMMODATION, AREA_HIGHLIGHTS, GUEST_SERVICES } from "@/content/guest";
import { MEDIA_SLOTS, getMedia, getSlot, type MediaId } from "@/content/media";
import {
  FACT_STATUS_EXPLANATION,
  FACT_STATUS_ORDER,
  FACT_STATUS_PUBLIC_LABEL,
  PROPERTY,
  publicFactView,
  type PublicFactId,
} from "@/content/property";
import {
  AUDIENCES,
  DOCUMENT_TOPICS,
  FIRST_CALL_TOPICS,
  INTEREST_OPTIONS,
  OPEN_DATA_TOPICS,
  OPERATIONS,
  POSSIBLE_DIRECTIONS,
  PROPERTY_DATA_GROUPS,
  PURCHASE_PATHS,
  PURCHASE_PROCESS,
  REQUEST_OPTIONS,
  SALE_FAQ,
  SALE_SUMMARY,
  SALE_TERMS,
  VIEWING,
} from "@/content/sales";
import { CONTACT, SALE_SECTIONS } from "@/content/site";
import { siteLinks } from "@/content/site-url";
import type { FactStatus } from "@/content/types";
import {
  PERSONAL_PLACEHOLDER,
  type CardItem,
  type EditableField,
  type EmailBlock,
  type EmailDocument,
  type EmailSection,
  type FactRow,
  type ImageItem,
  type PersonalValues,
} from "./model";

/**
 * A bemutató összeállítása a központi tartalmi modulokból (property, sales, guest, media).
 * Itt nincs önálló ténylista: az adatok, állapotcímkék és szövegek a landinggel közös forrásból
 * jönnek, a levél csak a megfogalmazást (bevezetők, tagolás) adja hozzá.
 */

export const DEFAULT_SUBJECT = "Hotel Villa Huber – részletes ingatlanbemutató";

export const DEFAULT_PREHEADER =
  "Karintiai villa-hotel Afritz am See településen: az ingatlan fő jellemzői, a lehetséges működtetési irányok és a következő egyeztetés témái.";

export const BASE_INTRO =
  "Az alábbiakban bemutatom a karintiai, Afritz am See településen található Hotel Villa Huber vásárlási lehetőségét. Összefoglaltam az ingatlan fő jellemzőit, a lehetséges működtetési irányokat és a következő egyeztetés témáit.";

export const PRIMARY_CTA_LABEL = "Hotel részletes bemutatója";
export const SECONDARY_CTA_LABEL = "Egyeztetést vagy megtekintést kérek";

/**
 * A landing két szövege önmagára mutat („ezen az oldalon”, „az űrlappal”). Az emailben ez félrevezető,
 * ezért a központi szöveget változatlanul használjuk, és csak ezt a két kifejezést igazítjuk a levélhez.
 */
const EMAIL_WORDING: readonly (readonly [string, string])[] = [
  ["ezen az oldalon", "az eladási oldalon"],
  ["Az űrlappal", "Az eladási oldal ajánlatkérőjével vagy erre a levélre adott válasszal"],
];

export function adaptForEmail(text: string): string {
  return EMAIL_WORDING.reduce((out, [from, to]) => out.split(from).join(to), text);
}

export interface BuildInput {
  personal: PersonalValues;
  subject: string;
  preheader: string;
  /** Kézi szövegmódosítások mezőkulcs szerint; csak az alapértéktől eltérő érték kerül ide. */
  overrides: Readonly<Record<string, string>>;
  baseUrl: string;
}

export interface BuildResult {
  doc: EmailDocument;
  fields: EditableField[];
}

/** Egysoros mező értéke: sortörések szóközzé, szélek levágva. */
export function cleanLine(value: string): string {
  return value.replace(/\s*[\r\n]+\s*/g, " ").trim();
}

/** Többsoros szöveg: sorvégek egységesítve, szélek levágva, legfeljebb egy üres sor egymás után. */
export function cleanMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toImage(id: MediaId, baseUrl: string): ImageItem {
  const asset = getMedia(id);
  return { src: siteLinks(baseUrl).media(asset.src), alt: asset.alt, caption: asset.caption, width: asset.width, height: asset.height };
}

function toImageFromSlot(slot: Parameters<typeof getSlot>[0], baseUrl: string): ImageItem | null {
  const id = MEDIA_SLOTS[slot];
  return id ? toImage(id, baseUrl) : null;
}

/** Az üresre törölt szövegek kimaradnak: nincs üres bekezdés, üres lista- vagy kártyaelem. */
function pruneBlocks(blocks: EmailBlock[]): EmailBlock[] {
  const out: EmailBlock[] = [];
  for (const block of blocks) {
    switch (block.kind) {
      case "paragraph":
      case "subheading":
        if (block.text) out.push(block);
        break;
      case "bullets": {
        const items = block.items.filter(Boolean);
        if (items.length) out.push({ ...block, items });
        break;
      }
      case "steps": {
        const items = block.items.filter((i) => i.title || i.text);
        if (items.length) out.push({ ...block, items });
        break;
      }
      case "facts": {
        const rows = block.rows.filter((r) => r.value);
        if (rows.length) out.push({ ...block, rows });
        break;
      }
      case "cards": {
        const items = block.items
          .filter((c) => c.title)
          .map((c) => ({ ...c, bullets: c.bullets?.filter(Boolean), lines: c.lines?.filter((l) => l.text), note: c.note?.text ? c.note : undefined }));
        if (items.length) out.push({ ...block, items });
        break;
      }
      case "notice":
        if (block.text) out.push(block);
        break;
      case "qa": {
        const items = block.items.filter((i) => i.q && i.a);
        if (items.length) out.push({ ...block, items });
        break;
      }
      default:
        out.push(block);
    }
  }
  return out;
}

export function buildDocument(input: BuildInput): BuildResult {
  const { personal, overrides, baseUrl } = input;
  const links = siteLinks(baseUrl);
  const fields: EditableField[] = [];
  let currentSection = "–";

  /** Szerkeszthető szöveg: az alapérték vagy a kézi módosítás; a mezőt a szerkesztő is megkapja. */
  function t(key: string, label: string, base: string, multiline = false): string {
    const override = Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : undefined;
    const edited = override !== undefined && override !== base;
    const value = edited ? override : base;
    fields.push({ key, section: currentSection, label, base, value, multiline, edited });
    return multiline ? cleanMultiline(value) : cleanLine(value);
  }

  const factRow = (id: PublicFactId, key: string): FactRow => {
    const view = publicFactView(id);
    return { label: view.label, value: t(key, `${view.label} (érték)`, view.value), status: view.status, statusLabel: view.statusLabel };
  };

  const section = (letter: string, anchor: string, eyebrow: string, title: string, build: () => EmailBlock[]): EmailSection => {
    currentSection = letter;
    const heading = t(`${letter}.title`, "Szekciócím", title);
    return { letter, anchor, eyebrow, title: heading, blocks: pruneBlocks(build()) };
  };

  const lead = (letter: string, text: string): EmailBlock => ({ kind: "paragraph", text: t(`${letter}.lead`, "Bevezető mondat", text, true) });

  const statusCard = (card: CardItem, status: FactStatus): CardItem => ({ ...card, status, statusLabel: FACT_STATUS_PUBLIC_LABEL[status] });

  // — A) Hotel és értékesítési összefoglaló —
  const sectionA = section("A", SALE_SECTIONS.summary, "Értékesítés", SALE_SUMMARY.title, () => {
    const blocks: EmailBlock[] = [lead("A", SALE_SUMMARY.subtitle), { kind: "bullets", items: SALE_SUMMARY.points.map((p, i) => t(`A.point.${i}`, `Összefoglaló pont ${i + 1}`, p, true)) }];
    const facade = toImageFromSlot("sale.property", baseUrl);
    if (facade) blocks.push({ kind: "images", items: [facade] });
    return blocks;
  });

  // — B) Ingatlanadatok —
  const sectionB = section("B", SALE_SECTIONS.data, "Az ingatlan", "Ingatlanadatok", () => {
    const blocks: EmailBlock[] = [
      lead("B", "Minden adat mellett jelezzük, mennyire ellenőrzött. A nem megerősített adatokat a tulajdonossal, dokumentum alapján erősítjük meg."),
      { kind: "subheading", text: "Állapotjelölések" },
      { kind: "legend", items: FACT_STATUS_ORDER.map((status) => ({ status, label: FACT_STATUS_PUBLIC_LABEL[status], text: FACT_STATUS_EXPLANATION[status] })) },
    ];
    for (const group of PROPERTY_DATA_GROUPS) {
      blocks.push({ kind: "subheading", text: group.title });
      blocks.push({ kind: "facts", rows: group.factIds.map((id) => factRow(id, `B.fact.${id}`)) });
    }
    blocks.push({ kind: "subheading", text: "Ami még egyeztetés tárgya" });
    blocks.push({
      kind: "paragraph",
      text: t("B.open.lead", "Egyeztetési témák bevezetője", "Ezekről az adatokról jelenleg nincs megbízható forrásunk, ezért nem közlünk számot vagy minősítést. A tulajdonossal dokumentumok alapján tisztázzuk őket.", true),
    });
    blocks.push({
      kind: "cards",
      items: OPEN_DATA_TOPICS.map((topic, i) => statusCard({ title: topic.title, text: t(`B.open.${i}`, `${topic.title} (szöveg)`, topic.detail, true) }, "ismeretlen")),
    });
    return blocks;
  });

  // — C) A ház és terei —
  const sectionC = section("C", SALE_SECTIONS.spaces, "A ház", "A ház és terei", () => {
    const rooms = publicFactView("rooms");
    const spaces = publicFactView("spaces");
    const roomsValue = t("C.rooms", "Szálláshelyek – szobák (érték)", rooms.value);
    const blocks: EmailBlock[] = [
      lead("C", "Csak olyan tereket mutatunk, amelyek fotón láthatók vagy a korábbi nyilvános leírásokban szerepelnek."),
      { kind: "notice", tone: "warning", tag: spaces.statusLabel, text: t("C.note", "Terek megjegyzés", "A fotók a terek létét mutatják; aktuális állapotukat nem igazolják.", true) },
      { kind: "subheading", text: "Szálláshelyek" },
      { kind: "facts", rows: [{ label: rooms.label, value: roomsValue, status: rooms.status, statusLabel: rooms.statusLabel }] },
      { kind: "paragraph", text: t("C.rooms.note", "Szálláshelyek megjegyzés", "Hivatalos szobatípus-lista nincs; az alábbiak a fotókon látható elhelyezési formák.", true) },
      { kind: "cards", items: ACCOMMODATION.map((form) => ({ title: form.title, text: t(`C.acc.${form.id}`, `${form.title} (szöveg)`, form.description, true) })) },
      { kind: "subheading", text: "Közösségi terek és szolgáltatások" },
      { kind: "paragraph", text: t("C.services.note", "Szolgáltatások megjegyzés", "Nyitvatartást és működést itt nem ígérünk; a tulajdonossal egyeztetve tisztázzuk.", true) },
      {
        kind: "cards",
        items: GUEST_SERVICES.map((service) => ({
          title: service.title,
          text: t(`C.service.${service.id}`, `${service.title} (szöveg)`, service.description, true),
          status: service.status,
          statusLabel: FACT_STATUS_PUBLIC_LABEL[service.status],
        })),
      },
    ];
    const photoIds: MediaId[] = ["room", "terrace", "sauna", "salon"];
    blocks.push({ kind: "images", items: photoIds.map((id) => toImage(id, baseUrl)) });
    blocks.push({ kind: "link", label: "Teljes fotógaléria", href: links.gallery });
    return blocks;
  });

  // — D) Elhelyezkedés és környék —
  const sectionD = section("D", SALE_SECTIONS.area, "Környék", "Környék és elhelyezkedés", () => {
    const lake = publicFactView("lake-distance");
    const blocks: EmailBlock[] = [
      lead("D", "Afritz am See a karintiai tóvidéken fekszik. A környékre vonatkozó adatok hivatalos települési és turisztikai forrásokból származnak; utazási időt nem közlünk."),
      { kind: "cards", items: AREA_HIGHLIGHTS.map((item, i) => ({ title: item.title, text: t(`D.area.${i}`, `${item.title} (szöveg)`, item.description, true) })) },
      { kind: "facts", rows: [{ label: lake.label, value: t("D.lake", `${lake.label} (érték)`, lake.value), status: lake.status, statusLabel: lake.statusLabel }] },
    ];
    const sign = toImage("afritz-sign", baseUrl);
    blocks.push({ kind: "images", items: [sign] });
    return blocks;
  });

  // — E) Működési és átadási háttér —
  const sectionE = section("E", SALE_SECTIONS.operations, "Működés", "Működés és üzemeltetési háttér", () => [
    lead("E", "A működésről jelenleg rendelkezésre álló információk."),
    { kind: "subheading", text: "Amit jelenleg tudunk" },
    { kind: "facts", rows: OPERATIONS.knownFactIds.map((id) => factRow(id, `E.fact.${id}`)) },
    {
      kind: "notice",
      tone: "info",
      tag: "Lehetséges irány, nem ígéret",
      title: POSSIBLE_DIRECTIONS.title,
      text: t("E.direction", "Lehetséges irány (szöveg)", POSSIBLE_DIRECTIONS.text, true),
    },
  ]);

  // — F) Kinek lehet érdekes? —
  const sectionF = section("F", SALE_SECTIONS.audience, "Érdeklődők", "Kinek lehet érdekes?", () => [
    lead("F", "Négy olyan kör, amelynek a lehetőség a saját szempontjai szerint megfontolásra érdemes lehet. Mindegyiknél más a fő kérdés."),
    {
      kind: "cards",
      items: AUDIENCES.map((a) => ({
        title: a.title,
        text: t(`F.${a.id}.why`, `${a.title} (indok)`, a.why, true),
        lines: [{ label: "Fő kérdés:", text: t(`F.${a.id}.question`, `${a.title} (fő kérdés)`, a.question, true) }],
      })),
    },
  ]);

  // — G) Vásárlási szempontok —
  const sectionG = section("G", SALE_SECTIONS.paths, "Vásárlás", "Vásárlási szempontok", () => [
    lead("G", "Az ingatlanról és az átadás feltételeiről szóló egyeztetés."),
    {
      kind: "cards",
      items: PURCHASE_PATHS.map((path) => ({
        title: path.title,
        text: t(`G.${path.id}.for`, `${path.title} (kinek)`, path.forWhom, true),
        bulletsLabel: "Amit közösen átnézünk",
        bullets: path.topics.map((topic, i) => t(`G.${path.id}.topic.${i}`, `${path.title} (téma ${i + 1})`, topic)),
        note: { label: "Jelenlegi állapot", text: t(`G.${path.id}.status`, `${path.title} (jelenlegi állapot)`, path.status, true) },
      })),
    },
  ]);

  // — H) Az értékesítés tartalma, ár és feltételek —
  const sectionH = section("H", SALE_SECTIONS.terms, "Feltételek", "Értékesítési feltételek", () => [
    { kind: "paragraph", strong: true, text: t("H.price", "Irányár szöveg", SALE_TERMS.price, true) },
    { kind: "cards", items: SALE_TERMS.items.map((item, i) => ({ title: item.title, text: t(`H.item.${i}`, `${item.title} (szöveg)`, item.detail, true) })) },
  ]);

  // — I) Dokumentumok és megtekintés —
  const sectionI = section("I", SALE_SECTIONS.documents, "Dokumentumok", "Dokumentumok és megtekintés", () => [
    lead("I", adaptForEmail("A dokumentumokat az első egyeztetés után, bizalmassági feltételek mellett osztjuk meg. Letölthető anyag ezen az oldalon nincs.")),
    { kind: "paragraph", text: t("I.note", "Dokumentumok megjegyzés", "Az alábbi témákat az egyeztetésen tisztázzuk: mely dokumentumok állnak rendelkezésre, és milyen feltételekkel ismerhetők meg.", true) },
    { kind: "cards", items: DOCUMENT_TOPICS.map((topic, i) => ({ title: topic.title, text: t(`I.doc.${i}`, `${topic.title} (szöveg)`, topic.detail, true) })) },
    { kind: "subheading", text: VIEWING.title },
    { kind: "paragraph", text: t("I.viewing", "Helyszíni megtekintés (szöveg)", VIEWING.text, true) },
  ]);

  // — J) Gyakori kérdések —
  const sectionJ = section("J", SALE_SECTIONS.faq, "Gyakori kérdések", "Gyakori kérdések", () => [
    {
      kind: "qa",
      items: SALE_FAQ.map((item, i) => ({ q: item.q, a: t(`J.faq.${i}`, `${item.q} (válasz)`, adaptForEmail(item.a), true) })),
    },
  ]);

  // — K) Vásárlási és egyeztetési folyamat —
  const sectionK = section("K", SALE_SECTIONS.process, "Folyamat", "A vásárlási folyamat", () => [
    lead("K", "Hat lépés az első kapcsolattól az ajánlatig és a tárgyalásig."),
    { kind: "steps", items: PURCHASE_PROCESS.map((step, i) => ({ title: step.title, text: t(`K.step.${i}`, `${step.title} (szöveg)`, step.detail, true) })) },
    { kind: "subheading", text: "Az első egyeztetés témái" },
    { kind: "bullets", items: FIRST_CALL_TOPICS.map((topic, i) => `${topic.title}: ${t(`K.first.${i}`, `${topic.title} (szöveg)`, topic.detail, true)}`) },
  ]);

  // — L) Kapcsolat és továbblépés —
  const sectionL = section("L", SALE_SECTIONS.inquiry, "Kapcsolat", "Bemutató és egyeztetés kérése", () => [
    lead("L", "Rövid megkeresés is elegendő. Vagyon- vagy finanszírozási adatot nem kérünk; ezekről az első egyeztetésen, az Ön szándékának megfelelően beszélünk."),
    { kind: "subheading", text: "Mit kérhet" },
    { kind: "bullets", items: REQUEST_OPTIONS.map((o) => o.label) },
    {
      kind: "paragraph",
      text: `Jelezheti az érdeklődési irányát is: ${INTEREST_OPTIONS.map((o) => o.label.toLowerCase()).join(", ")}.`,
    },
    {
      kind: "paragraph",
      text: t("L.reply", "Válaszadás emailben", `Erre a levélre válaszolva is kezdeményezheti az egyeztetést, vagy írhat az értékesítési címre: ${CONTACT.email}.`, true),
    },
  ]);

  const sections = [sectionA, sectionB, sectionC, sectionD, sectionE, sectionF, sectionG, sectionH, sectionI, sectionJ, sectionK, sectionL];

  // — Szekción kívüli szövegek —
  currentSection = "–";
  const intro = t("intro", "Bevezető bekezdés", BASE_INTRO, true);
  const disclaimer = t(
    "disclaimer",
    "Záró tájékoztatás",
    "A levélben szereplő adatok tájékoztató jellegűek, nem vételi ajánlatot jelentenek, és a megerősítésig a megjelölt állapotukkal értendők.",
    true,
  );
  const footer = `${PROPERTY.name} · ${PROPERTY.placeLineFull}`;

  const recipientName = cleanLine(personal.recipientName);
  const senderName = cleanLine(personal.senderName);
  const senderPhone = cleanLine(personal.senderPhone);
  const personalIntro = cleanMultiline(personal.personalIntro)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const doc: EmailDocument = {
    subject: cleanLine(input.subject),
    preheader: cleanLine(input.preheader),
    hero: toImageFromSlot("sale.hero", baseUrl),
    greeting: `Tisztelt ${recipientName || PERSONAL_PLACEHOLDER.recipientName}!`,
    personalIntro,
    intro,
    outline: sections.map((s) => s.title),
    primaryCta: { label: PRIMARY_CTA_LABEL, href: links.sale, fallbackLead: "A részletes bemutató elérhető itt:" },
    sections,
    secondaryCta: { label: SECONDARY_CTA_LABEL, href: links.inquiry, fallbackLead: "Az ajánlatkérő közvetlen címe:" },
    closingNotes: disclaimer ? [disclaimer] : [],
    signature: {
      lead: "Üdvözlettel:",
      name: senderName || PERSONAL_PLACEHOLDER.senderName,
      phone: senderPhone || PERSONAL_PLACEHOLDER.senderPhone,
      email: CONTACT.email,
    },
    contactMailto: CONTACT.mailtoHref,
    footer,
  };
  return { doc, fields };
}
