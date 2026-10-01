import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_FACTS } from "@/content/property";
import { INTERNAL_FACTS } from "@/content/internal/fact-register";
import { GALLERY, MEDIA, MEDIA_SLOTS } from "@/content/media";
import { SOURCES } from "@/content/sources";

describe("tartalommodell", () => {
  it("a publikus modulban csak publikus, a belsőben csak nem publikus adat van", () => {
    expect(PUBLIC_FACTS.every((f) => f.visibility === "public")).toBe(true);
    expect(INTERNAL_FACTS.every((f) => (f.visibility as string) !== "public")).toBe(true);
    for (const f of [...PUBLIC_FACTS, ...INTERNAL_FACTS]) expect(SOURCES[f.source]).toBeDefined();
  });

  it("a nem igazolt kapacitás- és áradatok nem publikusak", () => {
    const ids = PUBLIC_FACTS.map((f) => f.id as string);
    for (const id of ["rooms", "beds", "restaurant", "parking", "asking-price", "yield", "build-year"]) {
      expect(ids).not.toContain(id);
    }
  });

  it("asset-manifest: kizárt képek nincsenek, minden elem teljes és létező fájlra mutat", () => {
    const files = Object.values(MEDIA).map((m) => m.sourceFile as string);
    for (const banned of ["34324365.jpg", "19333173.jpg", "34324366.jpg"]) expect(files).not.toContain(banned);
    for (const m of Object.values(MEDIA)) {
      expect(m.alt.length).toBeGreaterThan(20);
      expect(m.caption.length).toBeGreaterThan(0);
      expect(m.focal.x).toBeGreaterThanOrEqual(0);
      expect(m.focal.y).toBeLessThanOrEqual(100);
      expect(existsSync(join(__dirname, "../../public", m.src))).toBe(true);
    }
    expect(GALLERY.length).toBeGreaterThanOrEqual(6);
    expect(GALLERY.length).toBeLessThanOrEqual(8);
    for (const id of Object.values(MEDIA_SLOTS)) if (id) expect(MEDIA[id]).toBeDefined();
  });
});
