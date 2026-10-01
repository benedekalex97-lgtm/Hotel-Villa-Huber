import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/munka/email");
});

test("külön címzett és aláíró, hiányjelzés, vágólap", async ({ page }) => {
  const body = page.getByLabel("Szöveg", { exact: true });
  await expect(page.getByText("Még nem kész")).toBeVisible();

  await page.getByLabel("Címzett neve").fill("Kiss Béla");
  await page.getByLabel("Személyes kapcsolódás").fill("Nagy Gábor ajánlása");
  await page.getByLabel("Aláíró neve").fill("Kovács Anna");
  await expect(body).toHaveValue(/^Tisztelt Kiss Béla!/);
  await expect(body).toHaveValue(/Üdvözlettel:\nKovács Anna\n\[Telefonszám\]/);
  await expect(page.getByText("Még nem kész")).toBeVisible();

  // Helyőrző mellett az első másolás nem másol.
  await page.getByRole("button", { name: "Szöveg másolása" }).click();
  await expect(page.getByRole("button", { name: "Másolás így is" })).toBeVisible();

  await page.getByLabel("Aláíró telefonszáma").fill("+36 30 123 4567");
  await expect(page.getByText("Kész a másolásra")).toBeVisible();
  await page.getByRole("button", { name: "Tárgy másolása" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("Hotel Villa Huber – ausztriai szállodai befektetési lehetőség");
  await page.getByRole("button", { name: "Szöveg másolása" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await body.inputValue());
  expect(copied).not.toMatch(/\[[^\]]+\]/);
});

test("három sablon, kézi szerkesztés megmarad, visszaállítás megerősítéssel", async ({ page }) => {
  const subject = page.getByLabel("Tárgy", { exact: true });
  await page.getByLabel(/Szállodás/).check();
  await expect(subject).toHaveValue("Hotel Villa Huber – vásárlási lehetőség saját üzemeltetésre");
  await page.getByLabel(/Utánkövetés/).check();
  await expect(subject).toHaveValue("Hotel Villa Huber – korábbi megkeresésem");
  await page.getByLabel(/Befektető/).check();

  const body = page.getByLabel("Szöveg", { exact: true });
  await body.fill("Saját, kézzel írt szöveg [Név] nélkül.");
  await page.getByLabel("Címzett neve").fill("Kiss Béla");
  await expect(body).toHaveValue("Saját, kézzel írt szöveg [Név] nélkül.");
  await expect(page.getByRole("button", { name: /Frissítés a mezőkből/ })).toBeVisible();

  // Sablonváltás és vissza: a kézi szöveg nem vész el.
  await page.getByLabel(/Utánkövetés/).check();
  await page.getByLabel(/Befektető/).check();
  await expect(body).toHaveValue("Saját, kézzel írt szöveg [Név] nélkül.");

  await page.getByRole("button", { name: "Alapsablon visszaállítása" }).click();
  await page.getByRole("button", { name: "Mégse" }).click();
  await expect(body).toHaveValue("Saját, kézzel írt szöveg [Név] nélkül.");
  await page.getByRole("button", { name: "Alapsablon visszaállítása" }).click();
  await page.getByRole("button", { name: "Visszaállítás", exact: true }).click();
  await expect(body).toHaveValue(/^Tisztelt Kiss Béla!/);
});
