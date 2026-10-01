import { expect, test } from "@playwright/test";

test("belső build: a /munka/email elérhető és noindex", async ({ page }) => {
  const res = await page.goto("/munka/email");
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1, name: "Hotel Villa Huber bemutató" })).toBeVisible();
});
