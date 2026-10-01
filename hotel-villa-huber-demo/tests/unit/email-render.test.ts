import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectLinks, collectTexts } from "@/features/email/document-text";
import { esc } from "@/features/email/render-html";
import { compose, htmlToText, norm } from "./helpers/email";

const BASE = "https://hotel-villa-huber-hotel-villa-huber.vercel.app";

describe("HTML email", () => {
  const { doc, html, text } = compose();

  it("levelezőbarát váz: táblázatos, inline stílusok, UTF-8, 640 px, media query, szkript/flex/grid/webfont nélkül", () => {
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain('<html lang="hu"');
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain("max-width:640px");
    expect(html).toContain('role="presentation"');
    expect(html).toContain("@media only screen and (max-width:480px)");
    expect(html).toContain("<!--[if mso]>");
    expect(html).not.toMatch(/<script|display:\s*(flex|grid)|@import|@font-face|<link\b|url\(|<iframe|<form|javascript:/i);
    expect(html).toMatch(/Georgia/);
    expect(html).toMatch(/Segoe UI/);
    expect(html).toContain("#2C4636"); // mély zöld
    expect(html).toContain("#9B6B3A"); // bronz
    expect(html).toContain("#F6F1E7"); // törtfehér
    // A wordmark szöveges, nem csak kép.
    expect(html).toContain("Villa Huber");
  });

  it("a képek abszolút, nyilvános https URL-ek, a manifestből, alt szöveggel, mérettel, létező fájlra mutatnak", () => {
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(imgs.length).toBeGreaterThanOrEqual(5);
    expect(imgs.length).toBeLessThanOrEqual(10);
    for (const tag of imgs) {
      const src = /src="([^"]+)"/.exec(tag)?.[1] ?? "";
      expect(src).toMatch(new RegExp(`^${BASE}/media/booking-export/[\\w-]+\\.jpg$`));
      expect(existsSync(join(__dirname, "../../public", src.replace(BASE, "")))).toBe(true);
      expect(/alt="([^"]{20,})"/.test(tag)).toBe(true);
      expect(tag).toMatch(/width="\d+"/);
      expect(tag).not.toMatch(/height="/);
    }
    expect(html).not.toMatch(/localhost|drive\.google|src="\/|src="\.|src="data:/);
  });

  it("a hivatkozások valódi, abszolút HTML-linkek; a gombok <a> elemek; nincs követés vagy személyes paraméter", () => {
    const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(hrefs)).toEqual(new Set(collectLinks(doc)));
    for (const href of hrefs) {
      expect(href).toMatch(/^(https:\/\/[^\s?]+(#[\w-]+)?|mailto:sale@hotelvillahuber\.com)$/);
    }
    expect(html).not.toMatch(/utm_|\?[a-z]+=|tracking|pixel|width="1" height="1"/i);
    expect(html).toMatch(new RegExp(`<a href="${BASE}/elado-hotel"[^>]*>Hotel részletes bemutatója</a>`));
    expect(html).toMatch(new RegExp(`<a href="${BASE}/elado-hotel#ajanlatkeres"[^>]*>Egyeztetést vagy megtekintést kérek</a>`));
    // Gombok alatt olvasható szöveges link is van.
    expect(html).toContain(`>${BASE}/elado-hotel</a>`);
    expect(html).toContain(`>${BASE}/elado-hotel#ajanlatkeres</a>`);
    expect(html).toContain('href="mailto:sale@hotelvillahuber.com"');
  });

  it("a HTML és a plain text azonos információt és linkeket tartalmaz", () => {
    const htmlPlain = norm(htmlToText(html));
    const plain = norm(text);
    const skipInText = new Set(["Tárgy", "Előnézeti szöveg"]);
    for (const leaf of collectTexts(doc)) {
      const needle = norm(leaf.text);
      // A tárgy a HTML <title> elemében van (a törzs-szöveg kivonatban nem).
      if (leaf.where !== "Tárgy") expect(htmlPlain, `HTML: ${leaf.where}: ${leaf.text}`).toContain(needle);
      if (!skipInText.has(leaf.where)) expect(plain, `TXT: ${leaf.where}: ${leaf.text}`).toContain(needle);
    }
    for (const link of collectLinks(doc)) {
      expect(html).toContain(link);
      expect(text).toContain(link.replace("mailto:", ""));
    }
    // Minden állapotcímke ugyanannyiszor szerepel mindkét változatban.
    for (const label of ["Korábbi nyilvános közlés — tulajdonosi megerősítésre vár", "Tulajdonosi közlés — dokumentummal még nem igazolt", "Egyeztetés tárgya"]) {
      const inHtml = htmlToText(html).split(label).length - 1;
      const inText = text.split(label).length - 1;
      expect(inHtml, label).toBe(inText);
      expect(inHtml, label).toBeGreaterThan(0);
    }
  });

  it("a plain text teljes, nem rövidített kivonat", () => {
    expect(text.length).toBeGreaterThan(9000);
    expect(text.split("\n").length).toBeGreaterThan(150);
    expect(text).toContain("Tisztelt Minta Címzett!");
    expect(text).toContain("Üdvözlettel:\nMinta Feladó\n+36 1 000 0000\nsale@hotelvillahuber.com");
  });

  it("magyar ékezetek UTF-8-ban sértetlenek", () => {
    for (const out of [html, text]) {
      const roundTrip = new TextDecoder("utf-8", { fatal: true }).decode(new TextEncoder().encode(out));
      expect(roundTrip).toBe(out);
      expect(out).toMatch(/ő/);
      expect(out).toMatch(/ű/);
      expect(out).not.toContain("�");
    }
  });

  it("az üres opcionális személyes bevezető nem hagy üres bekezdést, helyőrzőt vagy állítást", () => {
    expect(html).not.toMatch(/<p[^>]*>\s*<\/p>/);
    expect(text).not.toMatch(/\n\n\n/);
    const filled = compose({ personalIntro: "Köszönöm, hogy időt szánt rám.\n\nÜdvözlettel később." });
    expect(filled.html).toContain("Köszönöm, hogy időt szánt rám.");
    expect(filled.text).toContain("Köszönöm, hogy időt szánt rám.\n\nÜdvözlettel később.");
  });
});

describe("escape és nyers HTML tiltása", () => {
  it("a személyes mezők és a szerkesztett szövegek HTML-escape-eltek", () => {
    const hostile = `<script>alert(1)</script> & "x" 'y' <img src=x onerror=alert(1)>`;
    const out = compose(
      { recipientName: hostile, senderName: hostile, senderPhone: "<b>+36</b>", personalIntro: `<b>félkövér</b>\nsor` },
      { overrides: { intro: `<a href="javascript:alert(1)">kattints</a>`, "B.fact.rooms": "<i>14</i>" }, subject: "<u>Tárgy</u> & más" },
    );
    expect(out.html).not.toMatch(/<script|<img src=x|<b>|<i>|<u>|<a href="javascript:/);
    expect(out.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot; &#39;y&#39;");
    expect(out.html).toContain("&lt;b&gt;félkövér&lt;/b&gt;<br>sor");
    expect(out.html).toContain("<title>&lt;u&gt;Tárgy&lt;/u&gt; &amp; más</title>");
    // A plain text nyers szöveg, a HTML nem.
    expect(out.text).toContain("<b>félkövér</b>");
    expect(esc(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("a megszólítás sortörést tartalmazó névnél egy sorban marad", () => {
    expect(compose({ recipientName: "Minta\nCímzett" }).doc.greeting).toBe("Tisztelt Minta Címzett!");
  });
});

describe("konfigurálható alapcím", () => {
  it("más alapcímnél minden link és kép az új alapcímet használja", () => {
    const next = "https://hotel.example.hu";
    const out = compose({}, {}, next);
    expect(out.html).not.toContain("vercel.app");
    expect(out.text).not.toContain("vercel.app");
    expect(out.html).toContain(`${next}/elado-hotel#ajanlatkeres`);
    for (const m of out.html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) expect(m[1]).toMatch(/^https:\/\/hotel\.example\.hu\/media\//);
  });
});
