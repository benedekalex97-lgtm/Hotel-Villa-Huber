import { expect, test } from "@playwright/test";

test.describe("publikus kiadási mód — belső felület elérhetetlen", () => {
  for (const path of ["./munka/email/", "./munka/brand/", "./munka/"]) {
    test(`${path} → 404, belső tartalom nélkül`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(404);
      const body = await res.text();
      expect(body).not.toContain("korábbi megkeresésem");
      expect(body).not.toContain("Alapsablon visszaállítása");
    });
  }

  test("a publikus oldalakon nincs hivatkozás a belső útvonalra", async ({ page }) => {
    for (const path of ["./", "./elado-hotel/"]) {
      await page.goto(path);
      await expect(page.locator('a[href^="/munka"]')).toHaveCount(0);
    }
  });

  test("noindex: meta és X-Robots-Tag fejléc", async ({ page }) => {
    const res = await page.goto("./");
    // Statikus hoszton (GitHub Pages) nincs egyedi fejléc; ott a meta robots és a robots.txt marad.
    if (!process.env.E2E_STATIC) expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
