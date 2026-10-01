import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_URL } from "@/content/site-url";
import { composeEmail } from "@/features/email/compose";
import { countManualEdits, draftReducer, initialDraftState, type DraftAction, type DraftState } from "@/features/email/draft";
import { DEFAULT_PREHEADER, DEFAULT_SUBJECT } from "@/features/email/presentation";
import { compose } from "./helpers/email";

const run = (state: DraftState, ...actions: DraftAction[]) => actions.reduce(draftReducer, state);
const view = (state: DraftState) => composeEmail(state, DEFAULT_SITE_URL);

describe("készenlét és helyőrző-validáció", () => {
  it("üres kezdőállapot: nem kész, a három kötelező személyes mező hiányzik, az opcionálisak nem", () => {
    const { readiness, doc } = view(initialDraftState());
    expect(readiness.ready).toBe(false);
    expect(readiness.missingFields).toEqual(["recipientName", "senderName", "senderPhone"]);
    expect(doc.greeting).toBe("Tisztelt [Név]!");
    expect(doc.signature.name).toBe("[Név]");
    expect(doc.signature.phone).toBe("[Telefonszám]");
  });

  it("a címzett és a feladó külön mező: az egyik kitöltése a másik [Név] helyőrzőjét nem érinti", () => {
    let state = run(initialDraftState(), { type: "setPersonal", field: "recipientName", value: "Kiss Béla" }, { type: "setPersonal", field: "senderPhone", value: "+36 1 111 1111" });
    let { doc, readiness } = view(state);
    expect(doc.greeting).toBe("Tisztelt Kiss Béla!");
    expect(doc.signature.name).toBe("[Név]");
    expect(readiness.personalPlaceholders).toEqual([{ where: "Aláírás – név", text: "[Név]" }]);
    expect(readiness.missingFields).toEqual(["senderName"]);

    state = run(state, { type: "setPersonal", field: "recipientName", value: "" }, { type: "setPersonal", field: "senderName", value: "Nagy Anna" });
    ({ doc, readiness } = view(state));
    expect(doc.greeting).toBe("Tisztelt [Név]!");
    expect(doc.signature.name).toBe("Nagy Anna");
    expect(readiness.personalPlaceholders).toEqual([{ where: "Megszólítás", text: "[Név]" }]);
  });

  it("teljes kitöltéssel kész; a megerősítésre váró ingatlanadat külön számolódik és nem hiba", () => {
    const { readiness } = compose();
    expect(readiness.ready).toBe(true);
    expect(readiness.personalPlaceholders).toEqual([]);
    expect(readiness.contentPlaceholders).toEqual([]);
    expect(readiness.pendingConfirmation).toBeGreaterThan(15);
    expect(readiness.openTopics).toBeGreaterThanOrEqual(4);
  });

  it("a szövegben maradt vagy beírt helyőrző (pl. [adat később]) hibát ad, és nem személyes helyőrzőként számolódik", () => {
    const out = compose({}, { overrides: { "B.fact.rooms": "[adat később]", intro: "Szia {recipientName}" } });
    expect(out.readiness.ready).toBe(false);
    expect(out.readiness.contentPlaceholders.map((h) => h.text).sort()).toEqual(["[adat később]", "{recipientName}"].sort());
    expect(out.readiness.personalPlaceholders).toEqual([]);
  });

  it("a személyes bevezetőbe írt helyőrző is hiba", () => {
    expect(compose({ personalIntro: "Kedves [Keresztnév]," }).readiness.ready).toBe(false);
  });

  it("hibás címzett-email és üres tárgy blokkolja a készenlétet; érvényes email nem kerül a levélbe", () => {
    expect(compose({ recipientEmail: "nem-email" }).readiness.invalidFields).toHaveLength(1);
    const ok = compose({ recipientEmail: "kiss.bela@example.com" });
    expect(ok.readiness.ready).toBe(true);
    expect(ok.html).not.toContain("kiss.bela@example.com");
    expect(ok.text).not.toContain("kiss.bela@example.com");
    expect(compose({}, { subject: "  " }).readiness.subjectMissing).toBe(true);
  });

  it("saját díjat, összeget vagy hozamállítást tartalmazó kézi szerkesztés blokkolja az exportot", () => {
    for (const bad of ["Sikerdíjunk 2%", "Az ár 1,2 millió EUR", "Garantált hozam", "Beépített terület 2000 m²", "ski-in elhelyezkedés"]) {
      const out = compose({}, { overrides: { intro: bad } });
      expect(out.readiness.ready, bad).toBe(false);
      expect(out.readiness.blocked.length, bad).toBeGreaterThan(0);
    }
  });
});

describe("kézi szerkesztés megőrzése és visszaállítás", () => {
  it("név-, telefonszám- és más mezőváltozás nem írja felül a kézi szekciószöveget, tárgyat és preheadert", () => {
    let state = run(
      initialDraftState(),
      { type: "setOverride", key: "intro", value: "Saját bevezető.", base: "alap" },
      { type: "setSubject", value: "Saját tárgy" },
      { type: "setPreheader", value: "Saját preheader" },
    );
    state = run(state, { type: "setPersonal", field: "recipientName", value: "Kiss Béla" }, { type: "setPersonal", field: "senderPhone", value: "+36 30 000 0000" }, { type: "setPersonal", field: "senderName", value: "Nagy Anna" });
    const out = view(state);
    expect(out.doc.intro).toBe("Saját bevezető.");
    expect(out.subject).toBe("Saját tárgy");
    expect(out.doc.preheader).toBe("Saját preheader");
    expect(out.fields.find((f) => f.key === "intro")?.edited).toBe(true);
    expect(countManualEdits(state)).toBe(3);
  });

  it("az alapértékre visszaírt mező már nem kézi módosítás", () => {
    const base = view(initialDraftState()).fields.find((f) => f.key === "intro")!.base;
    const state = run(initialDraftState(), { type: "setOverride", key: "intro", value: "x", base }, { type: "setOverride", key: "intro", value: base, base });
    expect(state.overrides).toEqual({});
    expect(run(state, { type: "clearOverride", key: "nincs" })).toBe(state);
  });

  it("az üresre törölt opcionális szöveg nem hagy üres bekezdést", () => {
    const out = compose({}, { overrides: { "C.rooms.note": "" } });
    expect(out.html).not.toMatch(/<p[^>]*>\s*<\/p>/);
    expect(out.text).not.toMatch(/\n\n\n/);
  });

  it("a visszaállítás a központi alapra állítja a tartalmat, a személyes adatokat megtartja", () => {
    const edited = run(
      initialDraftState(),
      { type: "setPersonal", field: "recipientName", value: "Kiss Béla" },
      { type: "setOverride", key: "intro", value: "x", base: "y" },
      { type: "setSubject", value: "z" },
      { type: "setPreheader", value: "w" },
    );
    const reset = run(edited, { type: "resetContent" });
    expect(reset.subject).toBe(DEFAULT_SUBJECT);
    expect(reset.preheader).toBe(DEFAULT_PREHEADER);
    expect(reset.overrides).toEqual({});
    expect(reset.personal.recipientName).toBe("Kiss Béla");
    expect(countManualEdits(reset)).toBe(0);
  });
});
