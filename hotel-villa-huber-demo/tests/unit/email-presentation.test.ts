import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACCOMMODATION, AREA_HIGHLIGHTS, GUEST_SERVICES } from "@/content/guest";
import { FACT_STATUS_EXPLANATION, FACT_STATUS_ORDER, FACT_STATUS_PUBLIC_LABEL, publicFactView } from "@/content/property";
import {
  AUDIENCES,
  DOCUMENT_TOPICS,
  FIRST_CALL_TOPICS,
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
import { SALE_SECTIONS } from "@/content/site";
import { BASE_INTRO, DEFAULT_PREHEADER, DEFAULT_SUBJECT, adaptForEmail } from "@/features/email/presentation";
import { compose, htmlToText, norm } from "./helpers/email";

const SRC = join(__dirname, "../../src");

describe("bemutató email — A–L megfeleltetés", () => {
  const { doc, text } = compose();
  const all = norm(text);
  const has = (s: string) => expect(all, s).toContain(norm(s));

  it("a landing mind a 12 szekciója megvan, A–L sorrendben, a landing horgonyaival", () => {
    expect(doc.sections.map((s) => s.letter)).toEqual("ABCDEFGHIJKL".split(""));
    expect(doc.sections.map((s) => s.anchor)).toEqual(Object.values(SALE_SECTIONS));
  });

  it("A) összefoglaló és valódi homlokzatfotó", () => {
    has(SALE_SUMMARY.title);
    has(SALE_SUMMARY.subtitle);
    SALE_SUMMARY.points.forEach(has);
    expect(doc.hero?.src).toMatch(/\/media\/booking-export\/.+\.jpg$/);
    expect(doc.hero?.alt.length).toBeGreaterThan(20);
  });

  it("B) minden ingatlanadat az állapotcímkéjével, a jelmagyarázat és az egyeztetendő témák", () => {
    const rows = doc.sections.find((s) => s.letter === "B")!.blocks.flatMap((b) => (b.kind === "facts" ? b.rows : []));
    for (const group of PROPERTY_DATA_GROUPS) {
      has(group.title);
      for (const id of group.factIds) {
        const view = publicFactView(id);
        const row = rows.find((r) => r.label === view.label);
        expect(row, id).toBeDefined();
        expect(row?.value).toBe(view.value);
        expect(row?.status).toBe(view.status);
        expect(row?.statusLabel).toBe(view.statusLabel);
      }
    }
    for (const status of FACT_STATUS_ORDER) {
      has(FACT_STATUS_PUBLIC_LABEL[status]);
      has(FACT_STATUS_EXPLANATION[status]);
    }
    OPEN_DATA_TOPICS.forEach((topic) => {
      has(topic.title);
      has(topic.detail);
    });
  });

  it("a 14 szoba, kb. 45 fő, 50 fős étterem, kb. 35 autó és busz csak a regiszter értékével és megerősítendő állapottal szerepel", () => {
    const rows = doc.sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === "facts" ? b.rows : [])));
    const expected: [string, string][] = [
      ["rooms", "14 szoba és lakosztály, köztük családi lakosztályok"],
      ["beds", "legfeljebb 45 vendég reggelivel vagy félpanzióval"],
      ["restaurant", "kb. 50 fős étterem, kávézó-bár és terasz"],
      ["parking", "kb. 35 személyautó és egy busz"],
    ];
    for (const [id, value] of expected) {
      const view = publicFactView(id as Parameters<typeof publicFactView>[0]);
      expect(view.value).toBe(value);
      const row = rows.find((r) => r.label === view.label);
      expect(row?.value).toBe(value);
      expect(row?.status).toBe("nyilvanos-megerositendo");
      expect(row?.statusLabel).toBe("Korábbi nyilvános közlés — tulajdonosi megerősítésre vár");
    }
    expect(all).not.toMatch(/busz[^.]*\d+\s*(fő|férőhely)/);
  });

  it("C) szobák, terek és szolgáltatások, a tér léte nem működési ígéret", () => {
    has(publicFactView("rooms").value);
    has("A fotók a terek létét mutatják; aktuális állapotukat nem igazolják.");
    has("Nyitvatartást és működést itt nem ígérünk");
    has("Hivatalos szobatípus-lista nincs");
    ACCOMMODATION.forEach((a) => {
      has(a.title);
      has(a.description);
    });
    GUEST_SERVICES.forEach((s) => {
      has(s.title);
      has(s.description);
      has(FACT_STATUS_PUBLIC_LABEL[s.status]);
    });
  });

  it("D) környék, tó-távolság a forrásolt jelöléssel, menetidő nélkül", () => {
    AREA_HIGHLIGHTS.forEach((a) => {
      has(a.title);
      has(a.description);
    });
    has(publicFactView("lake-distance").value);
    has("utazási időt nem közlünk");
    expect(all).not.toMatch(/\bperc\b.*(autó|sípálya)|ski-?in|ski-?out|lift/);
  });

  it("E) 2026-os működés és lehetséges irány (a landinggel azonos tartalom)", () => {
    OPERATIONS.knownFactIds.forEach((id) => {
      const view = publicFactView(id);
      has(view.value);
      has(view.statusLabel);
    });
    has("A működésről jelenleg rendelkezésre álló információk.");
    has(POSSIBLE_DIRECTIONS.title);
    has(POSSIBLE_DIRECTIONS.text);
    has("Lehetséges irány, nem ígéret");
    has("A tulajdonos tájékoztatása szerint a hotel 2026 nyarán működött.");
    expect(all).not.toContain("szakmai üzemeltető");
  });

  it("F) a négy célcsoport szempontjaikkal", () => {
    expect(AUDIENCES).toHaveLength(4);
    AUDIENCES.forEach((a) => {
      has(a.title);
      has(a.why);
      has(a.question);
    });
  });

  it("G) vásárlási szempontok, külső üzemeltető ajánlása nélkül", () => {
    expect(PURCHASE_PATHS).toHaveLength(1);
    PURCHASE_PATHS.forEach((p) => {
      has(p.title);
      has(p.forWhom);
      p.topics.forEach(has);
      has(p.status);
    });
    expect(all).not.toContain("szakmai üzemeltető");
  });

  it("H) irányárszöveg változatlanul, a feltételek és az értékesítés tárgya", () => {
    expect(SALE_TERMS.price).toBe("Irányár és értékesítési feltételek egyeztetés alapján.");
    has(SALE_TERMS.price);
    SALE_TERMS.items.forEach((i) => {
      has(i.title);
      has(i.detail);
    });
  });

  it("I) dokumentumtémák és megtekintés, kész adatszoba állítása nélkül", () => {
    DOCUMENT_TOPICS.forEach((d) => {
      has(d.title);
      has(d.detail);
    });
    has(VIEWING.title);
    has(VIEWING.text);
    has("A dokumentumokat az első egyeztetés után, bizalmassági feltételek mellett osztjuk meg.");
    expect(all).not.toMatch(/adatszoba/);
  });

  it("J) minden GYIK-kérdés és -válasz nyitott szövegként, az email-hez igazított két kifejezéssel", () => {
    SALE_FAQ.forEach((f) => {
      has(f.q);
      has(adaptForEmail(f.a));
    });
    expect(all).not.toContain("ezen az oldalon");
    expect(all).not.toContain("az űrlappal");
    has("Korábbi nyilvános hirdetésekben szereplő összegek nem jóváhagyott aktuális árak.");
  });

  it("K) a vásárlási folyamat hat lépése és az első egyeztetés témái", () => {
    expect(PURCHASE_PROCESS).toHaveLength(6);
    PURCHASE_PROCESS.forEach((s) => {
      has(s.title);
      has(s.detail);
    });
    FIRST_CALL_TOPICS.forEach((t) => {
      has(t.title);
      has(t.detail);
    });
  });

  it("L) kérhető dolgok, válasz emailben, kapcsolati cím és az ajánlatkérőre vezető link", () => {
    REQUEST_OPTIONS.forEach((o) => has(o.label));
    has("Erre a levélre válaszolva is kezdeményezheti az egyeztetést");
    expect(text).toContain("sale@hotelvillahuber.com");
    expect(doc.secondaryCta.href).toBe("https://hotel-villa-huber-hotel-villa-huber.vercel.app/elado-hotel#ajanlatkeres");
  });
});

describe("bemutató email — alapszövegek és tilalmak", () => {
  const { doc, html, text, readiness } = compose();

  it("tárgy, preheader, megszólítás és bevezető a briefnek megfelelően", () => {
    expect(DEFAULT_SUBJECT).toBe("Hotel Villa Huber – részletes ingatlanbemutató");
    expect(doc.greeting).toBe("Tisztelt Minta Címzett!");
    expect(BASE_INTRO).toBe(
      "Az alábbiakban bemutatom a karintiai, Afritz am See településen található Hotel Villa Huber vásárlási lehetőségét. Összefoglaltam az ingatlan fő jellemzőit, a lehetséges működtetési irányokat és a következő egyeztetés témáit.",
    );
    expect(doc.intro).toBe(BASE_INTRO);
    expect(DEFAULT_PREHEADER).not.toMatch(/hozam|üzemeltető(?! )|megtérül|garant/i);
    expect(DEFAULT_PREHEADER.length).toBeLessThan(200);
  });

  it("nincs előzetes beszélgetés, ajánlás, korábbi érdeklődés, régi teaser-logika", () => {
    expect(norm(text)).not.toMatch(/korábbi (beszélgetés|érdeklődés|levél)|ajánlás alapján|érdekes lehet önnek|elküldöm a rövid bemutatót/);
  });

  it("nincs saját díj, sikerdíj, ár, hozam, méret, belső megjegyzés vagy helyőrző", () => {
    for (const out of [html, text]) {
      expect(out).not.toMatch(/sikerdíj|250[\s .]?000|150[\s .]?000|1[,.]2 millió|1[.\s]?200[.\s]?000|990[\s.,]?000|€|\bEUR\b|\bFt\b/);
      expect(out).not.toMatch(/hozam|megtérül|garantált|m²|négyzetméter|Gasthof|Deák Klára|1830|1911/);
      expect(out === html ? htmlToText(html) : out).not.toMatch(/\[[^\]]+\]|\{[^}]+\}/);
    }
    expect(readiness.ready).toBe(true);
    expect(readiness.blocked).toEqual([]);
  });

  it("a kapcsolati cím a megadott értékesítési cím, és a levél nem hivatkozik a foglalási demóra", () => {
    expect(text).toContain("sale@hotelvillahuber.com");
    expect(norm(text)).not.toMatch(/foglalási demó|bemutató foglalási folyamat|minta szálloda/);
  });

  it("az email-feature nem importál belső tartalmi modult", () => {
    for (const file of ["presentation.ts", "model.ts", "validate.ts", "render-html.ts", "render-text.ts", "compose.ts", "document-text.ts", "draft.ts", "export.ts"]) {
      const source = readFileSync(join(SRC, "features/email", file), "utf8");
      expect(source, file).not.toMatch(/content\/internal|COMMERCIAL_DRAFT|INTERNAL_FACTS/);
    }
  });

  it("az ajánlatkérő horgonyazonosítója a landing kódjában stabilan szerepel", () => {
    expect(SALE_SECTIONS.inquiry).toBe("ajanlatkeres");
    const page = readFileSync(join(SRC, "features/sale/SalePage.tsx"), "utf8");
    expect(page).toContain("id={SALE_SECTIONS.inquiry}");
  });
});
