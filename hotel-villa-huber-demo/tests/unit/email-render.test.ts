import { describe, expect, it } from "vitest";
import { PROPERTY } from "@/content/property";
import { articleAdjusted, articleFor, computeReadiness, findPlaceholders, missingRequired, renderTemplate } from "@/features/email/render";
import { EMPTY_VALUES, TEMPLATES, getTemplate, usedVars, type Values } from "@/features/email/templates";

// Az eredeti, jóváhagyott szövegek — betűre pontosan, a megbízásból másolva.
const ORIGINAL = {
  investor: {
    subject: "Hotel Villa Huber – ausztriai szállodai befektetési lehetőség",
    body: [
      "Tisztelt [Név]!",
      "",
      "[Ajánló neve / korábbi beszélgetésünk / konkrét üzleti kapcsolódás] alapján keresem a karintiai Hotel Villa Huber értékesítésével kapcsolatban.",
      "",
      "A lehetőség olyan befektető számára lehet érdekes, aki ausztriai szállodai ingatlan vásárlásában gondolkodik, és a működtetést szakmai üzemeltetővel képzeli el. Az üzemeltető bevonása külön előkészítendő feladat.",
      "",
      "Érdekes lehet Önnek ez a befektetési irány? Ha igen, elküldöm a rövid bemutatót, majd egy 15 perces beszélgetésben egyeztethetjük az elképzeléseit.",
      "",
      "Üdvözlettel:",
      "[Név]",
      "[Telefonszám]",
      "sale@hotelvillahuber.com",
    ].join("\n"),
  },
  hotelier: {
    subject: "Hotel Villa Huber – vásárlási lehetőség saját üzemeltetésre",
    body: [
      "Tisztelt [Név]!",
      "",
      "A [cégnév] [konkrét, ellenőrzött szakmai kapcsolódása] miatt keresem a karintiai Hotel Villa Huber értékesítésével kapcsolatban.",
      "",
      "A szállodát olyan szakmai vevőnek szeretnénk bemutatni, aki saját üzemeltetésű ausztriai egység vásárlását mérlegeli. Az első egyeztetésen azt tisztáznánk, hogy a ház mérete, elhelyezkedése és működési háttere illeszkedhet-e az Önök terveihez.",
      "",
      "Napirenden van Önöknél hasonló vásárlás? Ha igen, szívesen elküldöm a rövid bemutatót, és egyeztetek egy 15 perces telefonbeszélgetést.",
      "",
      "Üdvözlettel:",
      "[Név]",
      "[Telefonszám]",
      "sale@hotelvillahuber.com",
    ].join("\n"),
  },
  followup: {
    subject: "Hotel Villa Huber – korábbi megkeresésem",
    body: [
      "Tisztelt [Név]!",
      "",
      "A Hotel Villa Huberrel kapcsolatos korábbi levelemre szeretnék röviden visszatérni.",
      "",
      "Aktuális lehet Önnek egy karintiai szállodai ingatlan vásárlásának megvizsgálása? Ha igen, elküldöm a rövid bemutatót, vagy egyeztethetünk egy rövid beszélgetést.",
      "",
      "Ha jelenleg nem aktuális, egy rövid visszajelzés is elegendő. Ha a cégnél más foglalkozik ilyen vásárlásokkal, köszönöm, ha megjelöli az illetékes kollégát.",
      "",
      "Üdvözlettel:",
      "[Név]",
      "[Telefonszám]",
      "sale@hotelvillahuber.com",
    ].join("\n"),
  },
} as const;

const values = (patch: Partial<Values>): Values => ({ ...EMPTY_VALUES, ...patch });

describe("email sablonok", () => {
  it("üres értékekkel pontosan az eredeti szöveget adják (helyőrzők megmaradnak)", () => {
    for (const t of TEMPLATES) {
      const out = renderTemplate(t, EMPTY_VALUES);
      expect(out.subject).toBe(ORIGINAL[t.id].subject);
      expect(out.body).toBe(ORIGINAL[t.id].body);
    }
  });

  it("a kapcsolati cím szó szerint sale@hotelvillahuber.com", () => {
    expect(PROPERTY.contactEmail).toBe("sale@hotelvillahuber.com");
  });

  it("a mezőkonfiguráció egyezik a szegmensekben használt változókkal", () => {
    for (const t of TEMPLATES) {
      expect(t.fields.map((f) => f.var)).toEqual(usedVars(t));
    }
  });

  it("a címzett és az aláíró neve független", () => {
    const out = renderTemplate(getTemplate("investor"), values({ recipientName: "Kiss Béla", senderName: "Nagy Anna" }));
    const lines = out.body.split("\n");
    expect(lines[0]).toBe("Tisztelt Kiss Béla!");
    expect(lines[lines.length - 3]).toBe("Nagy Anna");
    expect(out.body.match(/Kiss Béla/g)).toHaveLength(1);
    expect(out.body.match(/Nagy Anna/g)).toHaveLength(1);
    // Az üres telefon helyén a helyőrző marad, a másik név nem szivárog át.
    expect(out.body).toContain("[Telefonszám]");
    expect(out.body).not.toContain("[Név]");
  });

  it("az értékek szó szerint, egyszer kerülnek be, és nem helyettesítődnek újra", () => {
    const tricky = "$& [Név] {{x}} <b>";
    const out = renderTemplate(getTemplate("investor"), values({ recipientName: tricky, connection: "$1 $$ $`" }));
    expect(out.body.split(tricky)).toHaveLength(2); // pontosan egyszer
    expect(out.body.startsWith(`Tisztelt ${tricky}!`)).toBe(true);
    expect(out.body).toContain("$1 $$ $` alapján keresem");
    // A beírt „[Név]” utólag sem cserélődik: az aláírás helyén továbbra is a saját helyőrzője áll.
    expect(out.body).toContain("Üdvözlettel:\n[Név]\n[Telefonszám]");
  });

  it("az értékek levágottak, a sortörések szóközzé alakulnak", () => {
    const out = renderTemplate(getTemplate("followup"), values({ recipientName: "  Kiss\r\nBéla \n" }));
    expect(out.body.startsWith("Tisztelt Kiss Béla!")).toBe(true);
  });

  it("a névelő a cégnévhez igazodik (A/Az)", () => {
    const t = getTemplate("hotelier");
    const body = (companyName: string) => renderTemplate(t, values({ companyName })).body;
    expect(body("Accor")).toContain("\n\nAz Accor [konkrét");
    expect(body("Minta Kft.")).toContain("\n\nA Minta Kft. [konkrét");
    expect(body("Óbuda Hotel")).toContain("\n\nAz Óbuda Hotel [konkrét");
    expect(body("őrségi Panzió")).toContain("\n\nAz őrségi Panzió [konkrét");
    expect(body("")).toContain("\n\nA [cégnév] [konkrét");
    expect(articleFor("Ünnep Zrt.")).toBe("Az");
    expect(articleFor("  Hotel")).toBe("A");
    expect(articleAdjusted(t, values({ companyName: "Accor" }))).toBe(true);
    expect(articleAdjusted(t, values({ companyName: "Minta Kft." }))).toBe(false);
    expect(articleAdjusted(getTemplate("investor"), values({ companyName: "Accor" }))).toBe(false);
  });

  it("a helyőrzők felismerhetők, kézzel szerkesztett szövegben is", () => {
    expect(findPlaceholders("Tisztelt [Név]! Üdv, [Név] [Telefonszám]")).toEqual(["[Név]", "[Telefonszám]"]);
    expect(findPlaceholders("nincs benne semmi")).toEqual([]);
    expect(findPlaceholders("[nem\nlezárt]")).toEqual([]);
  });

  it("a készenléti állapot hamis, amíg bármilyen helyőrző marad", () => {
    const t = getTemplate("followup");
    const full = values({ recipientName: "Kiss Béla", senderName: "Nagy Anna", senderPhone: "+36 1 234 5678" });
    const rendered = renderTemplate(t, full);
    expect(computeReadiness(t, full, rendered.subject, rendered.body).ready).toBe(true);

    // Kézzel szerkesztett szöveg, benne visszamaradt „[Név]”.
    const edited = computeReadiness(t, full, rendered.subject, `${rendered.body}\nÜdv, [Név]`);
    expect(edited.ready).toBe(false);
    expect(edited.placeholders).toEqual(["[Név]"]);

    // Hiányzó kötelező mező, még ha a szövegből a helyőrző kikerült is.
    expect(computeReadiness(t, EMPTY_VALUES, "Tárgy", "Szöveg").ready).toBe(false);
    expect(missingRequired(t, EMPTY_VALUES)).toEqual(["recipientName", "senderName", "senderPhone"]);
  });

  it("a nem használt mezők értéke nem szivárog a levélbe", () => {
    const out = renderTemplate(getTemplate("followup"), values({ companyName: "Titkos Kft.", connection: "Titkos kapcsolat" }));
    expect(out.subject + out.body).not.toContain("Titkos");
    expect(missingRequired(getTemplate("followup"), EMPTY_VALUES)).not.toContain("companyName");
  });
});
