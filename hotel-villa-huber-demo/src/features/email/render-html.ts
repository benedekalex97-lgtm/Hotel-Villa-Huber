import type { FactStatus } from "@/content/types";
import type { CardItem, Cta, EmailBlock, EmailDocument, EmailSection, FactRow, ImageItem } from "./model";

/**
 * HTML-email megjelenítő: táblázatos elrendezés, inline stílusok, kiegészítő media query.
 * Nincs JavaScript, flex/grid vagy külső webfont. Minden szöveg escape-elve kerül a kimenetbe;
 * a modell nem hordoz nyers HTML-t.
 */

const C = {
  paper: "#F6F1E7",
  paperAlt: "#F8F3E8",
  surface: "#FFFCF6",
  white: "#FFFFFF",
  forest: "#2C4636",
  forestStrong: "#1F3427",
  bronze: "#9B6B3A",
  bronzeInk: "#7A5226",
  bronzeLight: "#D9B98C",
  ink: "#1E221F",
  muted: "#4A5049",
  line: "#D8CDB9",
  tint: "#F1EADB",
} as const;

const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS = "'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const BADGE: Record<FactStatus, { bg: string; fg: string; border: string }> = {
  jovahagyott: { bg: "#E3EDE6", fg: "#1F3427", border: "#A9C2B0" },
  "nyilvanos-megerositendo": { bg: "#F3E8D6", fg: "#6B4620", border: "#D3B88F" },
  "tulajdonosi-kozles": { bg: "#E6ECEF", fg: "#2F4452", border: "#AFC0CB" },
  ismeretlen: { bg: "#ECE4D4", fg: "#4A5049", border: "#BFB39B" },
};

export function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Szöveg HTML-be: escape + sortörések. */
function html(text: string): string {
  return esc(text).replace(/\n/g, "<br>");
}

/** Csak https és mailto hivatkozás kerülhet a levélbe. */
function safeUrl(url: string, allowMailto = false): string {
  if (/^https:\/\//i.test(url) || (allowMailto && /^mailto:/i.test(url))) return esc(url);
  throw new Error(`Nem engedélyezett hivatkozás a levélben: ${url}`);
}

const P = `margin:0 0 14px 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink};`;

function badge(status: FactStatus, label: string): string {
  const b = BADGE[status];
  return `<span style="display:inline-block;padding:2px 9px;border:1px solid ${b.border};border-radius:10px;background:${b.bg};color:${b.fg};font-family:${SANS};font-size:12px;line-height:1.5;font-weight:700;">${html(label)}</span>`;
}

function tag(label: string): string {
  return `<span style="display:inline-block;padding:2px 9px;border:1px solid ${C.bronze};border-radius:10px;background:${C.tint};color:${C.bronzeInk};font-family:${SANS};font-size:12px;line-height:1.5;font-weight:700;">${html(label)}</span>`;
}

function image(img: ImageItem, width: number, rounded = true): string {
  // Magasság-attribútum nélkül: képtiltás esetén nem marad nagy üres terület, csak az alt szöveg látszik.
  return (
    `<img src="${safeUrl(img.src)}" alt="${esc(img.alt)}" width="${width}" class="img" ` +
    `style="display:block;width:100%;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none;${rounded ? "border-radius:4px;" : ""}">`
  );
}

function button(cta: Cta, bg: string): string {
  return (
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 10px 0;"><tr>` +
    `<td align="center" bgcolor="${bg}" style="border-radius:6px;background:${bg};">` +
    `<a href="${safeUrl(cta.href)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:16px;line-height:1.25;font-weight:700;color:${C.surface};text-decoration:none;border-radius:6px;">${html(cta.label)}</a>` +
    `</td></tr></table>` +
    `<p style="margin:0 0 6px 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.muted};">${html(cta.fallbackLead)} ` +
    `<a href="${safeUrl(cta.href)}" target="_blank" style="color:${C.forest};text-decoration:underline;word-break:break-all;">${esc(cta.href)}</a></p>`
  );
}

function factsTable(rows: FactRow[]): string {
  const body = rows
    .map(
      (row, i) =>
        `<tr>` +
        `<td class="stack fact-label" width="34%" valign="top" style="padding:10px 14px 10px 0;${i === 0 ? "" : `border-top:1px solid ${C.line};`}font-family:${SANS};font-size:14px;line-height:1.5;font-weight:700;color:${C.muted};">${html(row.label)}</td>` +
        `<td class="stack fact-value" valign="top" style="padding:10px 0;${i === 0 ? "" : `border-top:1px solid ${C.line};`}font-family:${SANS};font-size:16px;line-height:1.55;color:${C.ink};">${html(row.value)}` +
        (row.status && row.statusLabel ? `<br><span style="display:inline-block;margin-top:5px;">${badge(row.status, row.statusLabel)}</span>` : "") +
        `</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px 0;border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};">${body}</table>`;
}

function legendTable(items: { status: FactStatus; label: string; text: string }[]): string {
  const body = items
    .map(
      (item) =>
        `<tr><td class="stack" width="42%" valign="top" style="padding:6px 12px 6px 0;">${badge(item.status, item.label)}</td>` +
        `<td class="stack" valign="top" style="padding:6px 0 10px 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.muted};">${html(item.text)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px 0;">${body}</table>`;
}

function card(item: CardItem): string {
  let inner = `<p style="margin:0 0 6px 0;font-family:${SERIF};font-size:18px;line-height:1.3;font-weight:700;color:${C.forest};">${html(item.title)}</p>`;
  if (item.text) inner += `<p style="margin:0 0 8px 0;font-family:${SANS};font-size:15px;line-height:1.55;color:${C.ink};">${html(item.text)}</p>`;
  for (const line of item.lines ?? []) {
    inner += `<p style="margin:0 0 8px 0;font-family:${SANS};font-size:15px;line-height:1.55;color:${C.ink};">` + (line.label ? `<strong>${html(line.label)}</strong> ` : "") + `${html(line.text)}</p>`;
  }
  if (item.bullets?.length) {
    if (item.bulletsLabel) inner += `<p style="margin:0 0 4px 0;font-family:${SANS};font-size:13px;line-height:1.4;font-weight:700;color:${C.bronzeInk};">${html(item.bulletsLabel)}</p>`;
    inner += `<ul style="margin:0 0 8px 0;padding:0 0 0 20px;font-family:${SANS};font-size:15px;line-height:1.55;color:${C.ink};">${item.bullets.map((b) => `<li style="margin:0 0 3px 0;">${html(b)}</li>`).join("")}</ul>`;
  }
  if (item.note) {
    inner += `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 6px 0;"><tr><td style="padding:8px 12px;border-left:4px solid ${C.bronze};background:${C.tint};font-family:${SANS};font-size:14px;line-height:1.5;color:${C.ink};"><strong>${html(item.note.label)}:</strong> ${html(item.note.text)}</td></tr></table>`;
  }
  if (item.status && item.statusLabel) inner += `<p style="margin:2px 0 0 0;">${badge(item.status, item.statusLabel)}</p>`;
  return (
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 12px 0;border:1px solid ${C.line};border-radius:6px;background:${C.white};">` +
    `<tr><td style="padding:14px 16px;">${inner}</td></tr></table>`
  );
}

function block(b: EmailBlock): string {
  switch (b.kind) {
    case "paragraph":
      return b.strong
        ? `<p style="margin:0 0 14px 0;font-family:${SERIF};font-size:19px;line-height:1.45;font-weight:700;color:${C.forest};">${html(b.text)}</p>`
        : `<p style="${P}">${html(b.text)}</p>`;
    case "subheading":
      return `<h3 style="margin:22px 0 8px 0;padding:0 0 6px 0;border-bottom:1px solid ${C.line};font-family:${SERIF};font-size:19px;line-height:1.3;font-weight:700;color:${C.forest};">${html(b.text)}</h3>`;
    case "bullets":
      return `<ul style="margin:0 0 14px 0;padding:0 0 0 22px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink};">${b.items.map((i) => `<li style="margin:0 0 6px 0;">${html(i)}</li>`).join("")}</ul>`;
    case "steps":
      return (
        `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px 0;">` +
        b.items
          .map(
            (s, i) =>
              `<tr><td width="44" valign="top" style="padding:0 0 12px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" width="32" height="32" bgcolor="${C.forest}" style="width:32px;height:32px;border-radius:16px;background:${C.forest};font-family:${SANS};font-size:15px;line-height:32px;font-weight:700;color:${C.surface};">${i + 1}</td></tr></table></td>` +
              `<td valign="top" style="padding:0 0 12px 0;font-family:${SANS};font-size:16px;line-height:1.55;color:${C.ink};"><strong style="color:${C.forest};">${html(s.title)}</strong><br>${html(s.text)}</td></tr>`,
          )
          .join("") +
        `</table>`
      );
    case "facts":
      return factsTable(b.rows);
    case "legend":
      return legendTable(b.items);
    case "cards":
      return b.items.map(card).join("");
    case "notice":
      return (
        `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px 0;"><tr>` +
        `<td style="padding:12px 16px;border-left:4px solid ${C.bronze};background:${C.tint};font-family:${SANS};font-size:15px;line-height:1.55;color:${C.ink};">` +
        (b.tag ? `<p style="margin:0 0 6px 0;">${tag(b.tag)}</p>` : "") +
        (b.title ? `<p style="margin:0 0 4px 0;font-family:${SERIF};font-size:17px;line-height:1.3;font-weight:700;color:${C.forest};">${html(b.title)}</p>` : "") +
        `<p style="margin:0;">${html(b.text)}</p></td></tr></table>`
      );
    case "qa":
      return b.items
        .map(
          (item) =>
            `<p style="margin:0 0 4px 0;font-family:${SERIF};font-size:17px;line-height:1.4;font-weight:700;color:${C.forest};">${html(item.q)}</p>` +
            `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink};">${html(item.a)}</p>`,
        )
        .join("");
    case "images": {
      const [first] = b.items;
      if (b.items.length === 1 && first) {
        const img = first;
        return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 14px 0;"><tr><td>${image(img, 568)}<p style="margin:5px 0 0 0;font-family:${SANS};font-size:12px;line-height:1.4;color:${C.muted};">${html(img.caption)}</p></td></tr></table>`;
      }
      const rows: string[] = [];
      for (let i = 0; i < b.items.length; i += 2) {
        const pair = b.items.slice(i, i + 2);
        rows.push(
          `<tr>` +
            pair
              .map(
                (img, j) =>
                  `<td class="stack img-cell" width="50%" valign="top" style="padding:0 ${j === 0 && pair.length > 1 ? "6px" : "0"} 12px ${j === 1 ? "6px" : "0"};">${image(img, 278)}<p style="margin:5px 0 0 0;font-family:${SANS};font-size:12px;line-height:1.4;color:${C.muted};">${html(img.caption)}</p></td>`,
              )
              .join("") +
            `</tr>`,
        );
      }
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 8px 0;">${rows.join("")}</table>`;
    }
    case "link":
      return `<p style="margin:0 0 14px 0;font-family:${SANS};font-size:16px;line-height:1.5;"><a href="${safeUrl(b.href)}" target="_blank" style="color:${C.forest};font-weight:700;text-decoration:underline;">${html(b.label)}</a></p>`;
  }
}

function sectionRow(section: EmailSection, index: number): string {
  const bg = index % 2 === 0 ? C.surface : C.paperAlt;
  return (
    `<tr><td class="px" bgcolor="${bg}" style="padding:34px 36px 22px 36px;background:${bg};border-top:1px solid ${C.line};">` +
    `<p style="margin:0 0 6px 0;font-family:${SANS};font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.bronzeInk};">${html(section.eyebrow)}</p>` +
    `<h2 class="title" style="margin:0 0 16px 0;font-family:${SERIF};font-size:26px;line-height:1.25;font-weight:700;color:${C.forest};">${html(section.title)}</h2>` +
    section.blocks.map(block).join("") +
    `</td></tr>`
  );
}

const STYLE = `
@media only screen and (max-width:480px){
  .outer{padding:0 !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
  .stack{display:block !important;width:100% !important;box-sizing:border-box !important;}
  .fact-label{padding:10px 0 0 0 !important;}
  .fact-value{padding:2px 0 10px 0 !important;}
  .img-cell{padding:0 0 12px 0 !important;}
  .title{font-size:23px !important;}
  .img{width:100% !important;height:auto !important;}
}
`;

export function renderHtml(doc: EmailDocument): string {
  const spacer = "&nbsp;&zwnj;".repeat(40);
  const personal = doc.personalIntro.map((p) => `<p style="${P}">${html(p)}</p>`).join("");
  const outline = doc.outline.length
    ? `<p style="margin:0 0 6px 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${C.muted};"><strong>A levél tartalma:</strong> ${html(doc.outline.join(" · "))}</p>`
    : "";

  const header =
    `<tr><td class="px" bgcolor="${C.forestStrong}" style="padding:22px 36px;background:${C.forestStrong};">` +
    `<p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.32em;text-transform:uppercase;color:${C.bronzeLight};">Hotel</p>` +
    `<p style="margin:0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:700;color:${C.surface};">Villa Huber</p>` +
    `<p style="margin:2px 0 0 0;font-family:${SANS};font-size:13px;line-height:1.4;color:${C.line};">Afritz am See · Karintia · Ausztria</p>` +
    `</td></tr>`;

  const hero = doc.hero
    ? `<tr><td bgcolor="${C.forestStrong}" style="padding:0;line-height:0;font-size:0;">${image(doc.hero, 640, false)}</td></tr>`
    : "";

  const introRow =
    `<tr><td class="px" bgcolor="${C.surface}" style="padding:34px 36px 20px 36px;background:${C.surface};">` +
    `<p style="${P}font-size:17px;">${html(doc.greeting)}</p>` +
    personal +
    (doc.intro ? `<p style="${P}">${html(doc.intro)}</p>` : "") +
    button(doc.primaryCta, C.forest) +
    `<div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>` +
    outline +
    `</td></tr>`;

  const closing =
    `<tr><td class="px" bgcolor="${C.forestStrong}" style="padding:30px 36px;background:${C.forestStrong};">` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="font-family:${SANS};color:${C.surface};">` +
    `<p style="margin:0 0 14px 0;font-family:${SERIF};font-size:21px;line-height:1.3;font-weight:700;color:${C.surface};">${html(doc.secondaryCta.label)}</p>` +
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 10px 0;"><tr><td align="center" bgcolor="${C.bronzeInk}" style="border-radius:6px;background:${C.bronzeInk};">` +
    `<a href="${safeUrl(doc.secondaryCta.href)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:16px;line-height:1.25;font-weight:700;color:${C.surface};text-decoration:none;border-radius:6px;border:1px solid ${C.bronzeLight};">${html(doc.secondaryCta.label)}</a>` +
    `</td></tr></table>` +
    `<p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.line};">${html(doc.secondaryCta.fallbackLead)} ` +
    `<a href="${safeUrl(doc.secondaryCta.href)}" target="_blank" style="color:${C.bronzeLight};text-decoration:underline;word-break:break-all;">${esc(doc.secondaryCta.href)}</a></p>` +
    `</td></tr></table></td></tr>`;

  const signature =
    `<tr><td class="px" bgcolor="${C.surface}" style="padding:30px 36px 26px 36px;background:${C.surface};">` +
    doc.closingNotes.map((n) => `<p style="margin:0 0 18px 0;font-family:${SANS};font-size:14px;line-height:1.55;color:${C.muted};">${html(n)}</p>`).join("") +
    `<p style="margin:0;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink};">${html(doc.signature.lead)}<br>` +
    `<strong>${html(doc.signature.name)}</strong><br>${html(doc.signature.phone)}<br>` +
    `<a href="${safeUrl(doc.contactMailto, true)}" style="color:${C.forest};text-decoration:underline;">${esc(doc.signature.email)}</a></p>` +
    `</td></tr>`;

  const footer =
    `<tr><td class="px" bgcolor="${C.paper}" style="padding:18px 36px 26px 36px;background:${C.paper};border-top:1px solid ${C.line};">` +
    `<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.muted};">${html(doc.footer)}</p></td></tr>`;

  return (
    `<!DOCTYPE html>\n<html lang="hu" xmlns="http://www.w3.org/1999/xhtml">\n<head>\n` +
    `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n` +
    `<meta http-equiv="X-UA-Compatible" content="IE=edge">\n<meta name="x-apple-disable-message-reformatting">\n` +
    `<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">\n` +
    `<meta name="color-scheme" content="light">\n<meta name="supported-color-schemes" content="light">\n` +
    `<title>${esc(doc.subject)}</title>\n<style>${STYLE}</style>\n</head>\n` +
    `<body style="margin:0;padding:0;background:${C.paper};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">\n` +
    (doc.preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.paper};opacity:0;">${esc(doc.preheader)}${spacer}</div>\n`
      : "") +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.paper}" style="background:${C.paper};">\n` +
    `<tr><td align="center" class="outer" style="padding:24px 12px;">\n` +
    `<!--[if mso]><table role="presentation" width="640" align="center" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->\n` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;margin:0 auto;border:1px solid ${C.line};background:${C.surface};">\n` +
    [header, hero, introRow, ...doc.sections.map(sectionRow), closing, signature, footer].filter(Boolean).join("\n") +
    `\n</table>\n<!--[if mso]></td></tr></table><![endif]-->\n</td></tr>\n</table>\n</body>\n</html>\n`
  );
}
