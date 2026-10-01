// Tárgyalási screenshotok: három útvonal × mobil (390) és desktop (1440), teljes oldal.
// Használat: node scripts/screenshots.mjs [publicBase=http://localhost:3100] [internalBase=http://localhost:3101] [outDir=docs/screenshots]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [, , publicBase = "http://localhost:3100", internalBase = "http://localhost:3101", outDir = "docs/screenshots"] = process.argv;
mkdirSync(outDir, { recursive: true });

const targets = [
  { name: "01-fooldal", url: `${publicBase}/` },
  { name: "02-elado-hotel", url: `${publicBase}/elado-hotel` },
  { name: "03-munka-email", url: `${internalBase}/munka/email`, demoFill: true },
];
const viewports = [
  { name: "mobil-390", width: 390, height: 844, deviceScaleFactor: 2 },
  { name: "desktop-1440", width: 1440, height: 900, deviceScaleFactor: 1 },
];

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium" });
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, reducedMotion: "reduce" });
  for (const t of targets) {
    const page = await context.newPage();
    await page.goto(t.url, { waitUntil: "networkidle" });
    if (t.demoFill) {
      const btn = page.getByRole("button", { name: /Demó kitöltés/i });
      if (await btn.count()) await btn.first().click();
    }
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager")));
    await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const file = `${outDir}/${t.name}-${vp.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    // első képernyő külön (prezentációhoz)
    await page.screenshot({ path: `${outDir}/${t.name}-${vp.name}-elso-kepernyo.png`, fullPage: false });
    console.log(`${file} (túlcsordulás: ${overflow}px)`);
    await page.close();
  }
  await context.close();
}
await browser.close();
