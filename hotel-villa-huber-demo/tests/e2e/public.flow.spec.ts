import { expect, test } from "@playwright/test";

test("főoldal → értékesítési oldal CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Hotel Villa Huber" })).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Értékesítési bemutató" }).first().click();
  await expect(page).toHaveURL(/\/elado-hotel$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hotel Villa Huber — vásárlási lehetőség Karintiában.");
});

test("galéria: lightbox nyitás, lapozás, Escape, fókusz vissza", async ({ page }) => {
  await page.goto("/#galeria");
  const thumbs = page.locator("#galeria ul button");
  await expect(thumbs).toHaveCount(8);
  await thumbs.nth(1).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Bezárás" })).toBeFocused();
  await expect(dialog).toContainText("2 / 8");
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText("3 / 8");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(thumbs.nth(1)).toBeFocused();
});

test("kapcsolat: működő sale@ email-link a főoldalon", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('#kapcsolat a[href="mailto:sale@hotelvillahuber.com"]').first()).toBeVisible();
});

test("landing űrlap: validáció, majd előkészített levél másolási alternatívával", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/elado-hotel#kapcsolatfelvetel");
  const form = page.getByRole("form", { name: "Részletes bemutató kérése" });
  await form.getByRole("button", { name: "Email megnyitása" }).click();
  await expect(form.getByLabel("Név")).toBeFocused();
  await expect(form.getByLabel("Név")).toHaveAttribute("aria-invalid", "true");

  await form.getByLabel("Név").fill("Minta Péter");
  await form.getByLabel("Email").fill("minta@example.com");
  await form.getByLabel("Vásárlás saját üzemeltetéssel").check();
  await form.getByLabel("Rövid üzenet").fill("Érdekel a ház, kérek egy rövid egyeztetést & részleteket?");
  await form.getByRole("button", { name: "Email megnyitása" }).click();

  // Nincs „elküldve” állapot, csak előkészített levél és másolási alternatíva.
  await expect(page.getByText(/elküldtük|sikeresen elküldve/i)).toHaveCount(0);
  const prepared = page.locator("#inquiry-prepared-text");
  await expect(prepared).toBeVisible();
  await expect(prepared).toHaveValue(/Minta Péter/);
  await page.getByRole("button", { name: "Címzett másolása" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("sale@hotelvillahuber.com");
});
