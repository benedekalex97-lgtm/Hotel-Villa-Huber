// Képernyőkép készítése a futó előnézetről (fejlesztői segédszkript).
// Használat: node scripts/shot.mjs <url> <kimenet.png> [szélesség=1440] [full=1] [magasság=900]
import { chromium } from "@playwright/test";

const [, , url, out, width = "1440", full = "1", height = "900"] = process.argv;
if (!url || !out) {
  console.error("Használat: node scripts/shot.mjs <url> <kimenet.png> [szélesség] [full] [magasság]");
  process.exit(1);
}
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  // lazy képek betöltése teljes oldalas képhez
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo({ top: 0, behavior: "instant" });
});
await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(300);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await page.screenshot({ path: out, fullPage: full === "1" });
console.log(`ok ${out} (vízszintes túlcsordulás: ${overflow}px)`);
await browser.close();
