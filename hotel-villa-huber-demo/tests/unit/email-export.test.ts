import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EXPORT_FILES, copyRichText, copyText } from "@/features/email/export";
import { compose } from "./helpers/email";

afterEach(() => vi.unstubAllGlobals());

class FakeItem {
  static last: Record<string, Blob> | null = null;
  constructor(data: Record<string, Blob>) {
    FakeItem.last = data;
  }
}

function domError(name: string, message = "x"): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

describe("vágólap", () => {
  it("sikeres szöveg-másolás csak tényleges siker után ad ok-t", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await copyText("szöveg")).toEqual({ ok: true });
    expect(writeText).toHaveBeenCalledWith("szöveg");
  });

  it("elutasított hozzáférésnél valós hibaüzenet jár, siker nélkül", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(domError("NotAllowedError")) } });
    const result = await copyText("szöveg");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/elutasította/);
  });

  it("nem támogatott környezetben is hibát ad", async () => {
    vi.stubGlobal("navigator", {});
    const result = await copyText("szöveg");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/nem támogatja/);
  });

  it("a formázott másolás text/html és text/plain reprezentációt is ír", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write } });
    vi.stubGlobal("ClipboardItem", FakeItem);
    expect(await copyRichText("<p>html</p>", "text")).toEqual({ ok: true });
    expect(Object.keys(FakeItem.last ?? {}).sort()).toEqual(["text/html", "text/plain"]);
    expect(await FakeItem.last!["text/html"]!.text()).toBe("<p>html</p>");
    expect(await FakeItem.last!["text/plain"]!.text()).toBe("text");
  });

  it("a formázott másolás hibája nem jelez sikert", async () => {
    vi.stubGlobal("navigator", { clipboard: { write: vi.fn().mockRejectedValue(domError("NotAllowedError")) } });
    vi.stubGlobal("ClipboardItem", FakeItem);
    const denied = await copyRichText("<p>x</p>", "x");
    expect(denied.ok).toBe(false);
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("ClipboardItem", undefined);
    const unsupported = await copyRichText("<p>x</p>", "x");
    expect(unsupported.ok).toBe(false);
    if (!unsupported.ok) expect(unsupported.message).toMatch(/nem támogatja/);
  });
});

describe("export fájlok és dokumentációs minta", () => {
  it("UTF-8 fájlnevek és MIME típusok", () => {
    expect(EXPORT_FILES.html.mime).toBe("text/html;charset=utf-8");
    expect(EXPORT_FILES.text.mime).toBe("text/plain;charset=utf-8");
    expect(EXPORT_FILES.html.name).toMatch(/\.html$/);
    expect(EXPORT_FILES.text.name).toMatch(/\.txt$/);
    expect(EXPORT_FILES.html.name + EXPORT_FILES.text.name).not.toMatch(/kiss|minta/i);
  });

  it("a docs/samples mintafájlok a jelenlegi generátor kimenetével egyeznek (UPDATE_SAMPLES=1 frissíti)", () => {
    const { html, text } = compose();
    const dir = join(__dirname, "../../docs/samples");
    const files = { "hvh-bemutato-minta.html": html, "hvh-bemutato-minta.txt": text };
    for (const [name, content] of Object.entries(files)) {
      const path = join(dir, name);
      if (process.env.UPDATE_SAMPLES === "1") writeFileSync(path, content, "utf8");
      expect(existsSync(path), name).toBe(true);
      expect(readFileSync(path, "utf8"), name).toBe(content);
    }
  });
});
