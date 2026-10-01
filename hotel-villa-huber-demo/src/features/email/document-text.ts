import type { EmailBlock, EmailDocument } from "./model";

/**
 * A dokumentum minden megjelenő szövege, helycímkével. Ebből ellenőrizzük a helyőrzőket,
 * a tiltott tartalmat és (tesztben) a HTML–plain text egyezést.
 */
export interface TextLeaf {
  where: string;
  text: string;
  /** `personal`: a hiányzó személyes mezők helyén generált helyőrző (megszólítás, aláírás). */
  origin: "personal" | "content";
}

function blockLeaves(block: EmailBlock, where: string, out: TextLeaf[]): void {
  const push = (text: string | undefined, suffix = "") => {
    if (text) out.push({ where: `${where}${suffix}`, text, origin: "content" });
  };
  switch (block.kind) {
    case "paragraph":
    case "subheading":
      push(block.text);
      break;
    case "bullets":
      block.items.forEach((item) => push(item));
      break;
    case "steps":
      block.items.forEach((item) => {
        push(item.title);
        push(item.text);
      });
      break;
    case "facts":
      block.rows.forEach((row) => {
        push(row.label);
        push(row.value);
        push(row.statusLabel ?? undefined);
      });
      break;
    case "legend":
      block.items.forEach((item) => {
        push(item.label);
        push(item.text);
      });
      break;
    case "cards":
      block.items.forEach((card) => {
        push(card.title);
        push(card.text);
        card.lines?.forEach((l) => {
          push(l.label);
          push(l.text);
        });
        push(card.bulletsLabel);
        card.bullets?.forEach((b) => push(b));
        push(card.note?.label);
        push(card.note?.text);
        push(card.statusLabel);
      });
      break;
    case "notice":
      push(block.title);
      push(block.tag);
      push(block.text);
      break;
    case "qa":
      block.items.forEach((item) => {
        push(item.q);
        push(item.a);
      });
      break;
    case "images":
      block.items.forEach((img) => push(img.caption));
      break;
    case "link":
      push(block.label);
      break;
  }
}

export function collectTexts(doc: EmailDocument): TextLeaf[] {
  const out: TextLeaf[] = [];
  const add = (where: string, text: string, origin: TextLeaf["origin"] = "content") => {
    if (text) out.push({ where, text, origin });
  };
  add("Tárgy", doc.subject);
  add("Előnézeti szöveg", doc.preheader);
  add("Megszólítás", doc.greeting, "personal");
  doc.personalIntro.forEach((p) => add("Személyes bevezető", p));
  add("Bevezető", doc.intro);
  add("Tartalom", doc.outline.join(" · "));
  add("Fő gomb", doc.primaryCta.label);
  add("Fő gomb", doc.primaryCta.fallbackLead);
  for (const section of doc.sections) {
    const where = `${section.letter}) ${section.title}`;
    add(where, section.eyebrow);
    add(where, section.title);
    section.blocks.forEach((b) => blockLeaves(b, where, out));
  }
  add("Záró gomb", doc.secondaryCta.label);
  add("Záró gomb", doc.secondaryCta.fallbackLead);
  doc.closingNotes.forEach((n) => add("Záró tájékoztatás", n));
  add("Aláírás – név", doc.signature.name, "personal");
  add("Aláírás – telefonszám", doc.signature.phone, "personal");
  add("Aláírás – kapcsolati cím", doc.signature.email);
  add("Lábléc", doc.footer);
  return out;
}

/** A dokumentum minden linkje (a képek forrása nélkül), megjelenési sorrendben, egyedileg. */
export function collectLinks(doc: EmailDocument): string[] {
  const links: string[] = [doc.primaryCta.href];
  for (const section of doc.sections) {
    for (const block of section.blocks) if (block.kind === "link") links.push(block.href);
  }
  links.push(doc.secondaryCta.href, doc.contactMailto);
  return [...new Set(links)];
}

/** Az információt hordozó státuszok darabszáma (megerősítésre váró / egyeztetés tárgya). */
export function countStatuses(doc: EmailDocument): { confirmed: number; pending: number; open: number } {
  let confirmed = 0;
  let pending = 0;
  let open = 0;
  const tally = (status: string | null | undefined) => {
    if (!status) return;
    if (status === "jovahagyott") confirmed += 1;
    else if (status === "ismeretlen") open += 1;
    else pending += 1;
  };
  for (const section of doc.sections) {
    for (const block of section.blocks) {
      if (block.kind === "facts") block.rows.forEach((r) => tally(r.status));
      else if (block.kind === "cards") block.items.forEach((c) => tally(c.status));
    }
  }
  return { confirmed, pending, open };
}
