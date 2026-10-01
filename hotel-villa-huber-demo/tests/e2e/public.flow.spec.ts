import { expect, test } from "@playwright/test";

test("főoldal: vendégnavigáció, szekciók és átvezetés az eladási oldalra", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1, name: "Hotel Villa Huber" })).toBeVisible();
  for (const id of ["hotel", "szobak", "szolgaltatasok", "galeria", "kornyek", "foglalas", "elado-hotel", "kapcsolat"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  const nav = page.getByRole("navigation", { name: "Fő navigáció" }).first();
  for (const label of ["A hotel", "Szobák", "Élmények és szolgáltatások", "Galéria", "Környék", "Foglalás", "Eladó hotel", "Kapcsolat"]) {
    await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
  await page.locator("#elado-hotel").getByRole("link", { name: "Az eladási tájékoztató megnyitása" }).click();
  await expect(page).toHaveURL(/\/elado-hotel\/?$/);
});

test("galéria: lightbox nyitás, lapozás, Escape, fókusz vissza", async ({ page }) => {
  await page.goto("./#galeria");
  const thumbs = page.locator("#galeria ul button");
  const total = await thumbs.count();
  expect(total).toBeGreaterThanOrEqual(8);
  await thumbs.nth(1).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Bezárás" })).toBeFocused();
  await expect(dialog).toContainText(`2 / ${total}`);
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText(`3 / ${total}`);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(thumbs.nth(1)).toBeFocused();
});

test("kapcsolat: a sale@ cím értékesítési címként, nem foglalási címként jelenik meg", async ({ page }) => {
  await page.goto("./");
  const contact = page.locator("#kapcsolat");
  await expect(contact.locator('a[href="mailto:sale@hotelvillahuber.com"]').first()).toBeVisible();
  await expect(contact).toContainText("Értékesítés");
});
