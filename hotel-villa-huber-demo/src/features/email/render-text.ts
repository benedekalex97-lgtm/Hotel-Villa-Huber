import type { Cta, EmailBlock, EmailDocument } from "./model";

/**
 * Plain text megjelenítő ugyanabból a dokumentumból, mint a HTML: minden szöveg, állapotcímke és link benne van.
 * A sorokat nem törjük meg (a levelezők beillesztéskor maguk tördelnek), a képek helyén a képaláírás áll.
 */

function rule(char: string, length: number): string {
  return char.repeat(Math.max(8, Math.min(length, 72)));
}

function indent(text: string, pad: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : line))
    .join("\n");
}

function blockText(b: EmailBlock): string {
  switch (b.kind) {
    case "paragraph":
      return b.text;
    case "subheading":
      return `${b.text}\n${rule("-", b.text.length)}`;
    case "bullets":
      return b.items.map((i) => `- ${indent(i, "  ").trimStart()}`).join("\n");
    case "steps":
      return b.items.map((s, i) => `${i + 1}. ${s.title}\n${indent(s.text, "   ")}`).join("\n");
    case "facts":
      return b.rows.map((r) => `- ${r.label}: ${r.value}` + (r.status && r.statusLabel ? `\n  Állapot: ${r.statusLabel}` : "")).join("\n");
    case "legend":
      return b.items.map((i) => `- ${i.label}: ${i.text}`).join("\n");
    case "cards":
      return b.items
        .map((c) => {
          const lines = [`* ${c.title}`];
          if (c.text) lines.push(indent(c.text, "  "));
          for (const l of c.lines ?? []) lines.push(indent(`${l.label ? `${l.label} ` : ""}${l.text}`, "  "));
          if (c.bullets?.length) {
            if (c.bulletsLabel) lines.push(`  ${c.bulletsLabel}:`);
            for (const item of c.bullets) lines.push(`  - ${item}`);
          }
          if (c.note) lines.push(indent(`${c.note.label}: ${c.note.text}`, "  "));
          if (c.status && c.statusLabel) lines.push(`  Állapot: ${c.statusLabel}`);
          return lines.join("\n");
        })
        .join("\n\n");
    case "notice":
      return [b.tag ? `${b.tag}` : null, b.title ? `${b.title}` : null, b.text].filter(Boolean).join("\n");
    case "qa":
      return b.items.map((i) => `${i.q}\n${indent(i.a, "  ")}`).join("\n\n");
    case "images":
      return b.items.map((i) => `Fotó: ${i.caption}`).join("\n");
    case "link":
      return `${b.label}: ${b.href}`;
  }
}

function ctaText(cta: Cta): string {
  return `>> ${cta.label}\n   ${cta.fallbackLead} ${cta.href}`;
}

export function renderText(doc: EmailDocument): string {
  const out: string[] = [];
  out.push("HOTEL VILLA HUBER\nAfritz am See · Karintia · Ausztria");
  out.push(doc.greeting);
  for (const p of doc.personalIntro) out.push(p);
  out.push(doc.intro);
  out.push(ctaText(doc.primaryCta));
  if (doc.outline.length) out.push(`A levél tartalma: ${doc.outline.join(" · ")}`);

  for (const section of doc.sections) {
    const heading = `${section.eyebrow.toUpperCase()}\n${section.title}`;
    out.push(`${rule("=", 60)}\n${heading}\n${rule("=", 60)}`);
    for (const b of section.blocks) out.push(blockText(b));
  }

  out.push(`${rule("=", 60)}\n${doc.secondaryCta.label}\n${rule("=", 60)}\n${ctaText(doc.secondaryCta)}`);
  for (const n of doc.closingNotes) out.push(n);
  out.push(`${doc.signature.lead}\n${doc.signature.name}\n${doc.signature.phone}\n${doc.signature.email}`);
  out.push(doc.footer);
  return `${out.filter(Boolean).join("\n\n")}\n`;
}
