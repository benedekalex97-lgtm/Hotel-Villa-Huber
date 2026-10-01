import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { internalToolsEnabled, isInternalPath } from "@/lib/internal-gate";
import nextConfig from "../../next.config";

const ROOT = join(__dirname, "../..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("belső route-gate", () => {
  it("publikus kiadásban zárva, fejlesztésben vagy explicit belső flaggel nyitva", () => {
    expect(internalToolsEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(internalToolsEnabled({ NODE_ENV: "test" })).toBe(false);
    expect(internalToolsEnabled({ NODE_ENV: "production", HVH_INTERNAL_TOOLS: "true" })).toBe(false);
    expect(internalToolsEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(internalToolsEnabled({ NODE_ENV: "production", HVH_INTERNAL_TOOLS: "1" })).toBe(true);
  });

  it("csak a /munka előtagot kezeli belsőként", () => {
    expect(isInternalPath("/munka")).toBe(true);
    expect(isInternalPath("/munka/email")).toBe(true);
    expect(isInternalPath("/munkak")).toBe(false);
    expect(isInternalPath("/elado-hotel")).toBe(false);
  });

  it("a publikus build nem ismeri fel a *.internal.tsx oldalakat", () => {
    const saved = process.env.HVH_INTERNAL_TOOLS;
    delete process.env.HVH_INTERNAL_TOOLS;
    try {
      expect(nextConfig(PHASE_PRODUCTION_BUILD).pageExtensions).not.toContain("internal.tsx");
      expect(nextConfig(PHASE_PRODUCTION_SERVER).pageExtensions).not.toContain("internal.tsx");
      expect(nextConfig(PHASE_DEVELOPMENT_SERVER).pageExtensions).toContain("internal.tsx");
      process.env.HVH_INTERNAL_TOOLS = "1";
      expect(nextConfig(PHASE_PRODUCTION_BUILD).pageExtensions).toContain("internal.tsx");
    } finally {
      if (saved === undefined) delete process.env.HVH_INTERNAL_TOOLS;
      else process.env.HVH_INTERNAL_TOOLS = saved;
    }
  });

  it("a /munka alatti route-fájlok mind *.internal.tsx végűek", () => {
    const special = /^(page|layout|template|loading|error|not-found|route|default)\./;
    const offenders = walk(join(ROOT, "src/app/munka"))
      .filter((f) => special.test(f.split("/").pop() ?? ""))
      .filter((f) => !f.endsWith(".internal.tsx"))
      .map((f) => relative(ROOT, f));
    expect(offenders).toEqual([]);
  });

  it("publikus kód nem importál belső modult", () => {
    const publicDirs = ["src/app/(public)", "src/features/home", "src/features/sale", "src/components", "src/content"];
    const forbidden = /from\s+["'](@\/content\/internal|@\/features\/email|\.\.?\/.*internal)/;
    const offenders = publicDirs
      .flatMap((d) => walk(join(ROOT, d)))
      .filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes("/content/internal/"))
      .filter((f) => forbidden.test(readFileSync(f, "utf8")))
      .map((f) => relative(ROOT, f));
    expect(offenders).toEqual([]);
  });
});
