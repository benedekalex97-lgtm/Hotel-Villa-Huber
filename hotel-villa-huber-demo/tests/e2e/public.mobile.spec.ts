import { expect, test } from "@playwright/test";

test("mobil: menü nyit/zár, nincs vízszintes túlcsordulás", async ({ page }) => {
  for (const path of ["./", "./elado-hotel/"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  }
  await page.goto("./");
  // A felirat nyitva „Bezárás”-ra vált, ezért az aria-expanded attribútumra keresünk.
  const toggle = page.locator("header button[aria-expanded]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const mobileNav = page.getByRole("navigation", { name: "Fő navigáció (mobil)" });
  await expect(mobileNav.getByRole("link", { name: "Eladó hotel" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await mobileNav.getByRole("link", { name: "Eladó hotel" }).click();
  await expect(page).toHaveURL(/\/elado-hotel\/?$/);
});
