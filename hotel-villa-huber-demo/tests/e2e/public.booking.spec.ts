import { expect, test, type Page } from "@playwright/test";

const DEMO_NOTICE = "Bemutató foglalási folyamat — valódi foglalás nem történik.";

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ARRIVAL = isoInDays(40);
const DEPARTURE = isoInDays(43);

/** Oldalbetöltés a hidratálás végéig, hogy a kitöltött értékeket ne írja felül a React. */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

/** A főoldali widget kitöltése és elküldése. */
async function searchFromHome(page: Page) {
  await open(page, "./");
  const widget = page.getByRole("form", { name: "Elérhetőség keresése" });
  await widget.getByLabel("Érkezés").fill(ARRIVAL);
  await widget.getByLabel("Távozás").fill(DEPARTURE);
  await widget.getByRole("button", { name: "Elérhetőség megtekintése" }).click();
}

test("főoldali widget → /foglalas előtöltött paraméterekkel, demó-jelöléssel", async ({ page }) => {
  await open(page, "./");
  const section = page.locator("#foglalas");
  await expect(section.getByText(DEMO_NOTICE)).toBeVisible();

  const widget = page.getByRole("form", { name: "Elérhetőség keresése" });
  await widget.getByLabel("Érkezés").fill(ARRIVAL);
  await widget.getByLabel("Távozás").fill(DEPARTURE);
  await widget.getByRole("button", { name: "Felnőttek: növelés" }).click();
  await widget.getByRole("button", { name: "Elérhetőség megtekintése" }).click();

  await expect(page).toHaveURL(new RegExp(`/foglalas\\/?\\?erkezes=${ARRIVAL}&tavozas=${DEPARTURE}&felnott=3&gyermek=0&szoba=1$`));
  await expect(page.getByRole("heading", { level: 1, name: "Foglalás — bemutató" })).toBeVisible();
  await expect(page.getByText(DEMO_NOTICE).first()).toBeVisible();
  // Érvényes paraméterekkel a keresés azonnal lefut: 3. lépés, mintaajánlatokkal.
  await expect(page.locator('[aria-current="step"]')).toContainText("Elérhetőség és elhelyezés");
  await expect(page.getByRole("heading", { level: 2, name: "Elérhetőség és elhelyezés" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Kiválasztás: / }).first()).toBeVisible();
  await expect(page.getByText("Mintaadat").first()).toBeVisible();
  await expect(page.getByText("3 éjszaka").first()).toBeVisible();
});

test("érvénytelen dátumok: mezőszintű hiba, fókusz az első hibás mezőre", async ({ page }) => {
  await open(page, "./");
  const widget = page.getByRole("form", { name: "Elérhetőség keresése" });
  await widget.getByLabel("Érkezés").fill(DEPARTURE);
  await widget.getByLabel("Távozás").fill(ARRIVAL);
  await widget.getByRole("button", { name: "Elérhetőség megtekintése" }).click();

  const departure = widget.getByLabel("Távozás");
  await expect(departure).toHaveAttribute("aria-invalid", "true");
  await expect(departure).toBeFocused();
  await expect(widget.getByText("A távozásnak az érkezés utáni napra kell esnie.")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);

  // Üres dátumok: az érkezésre kerül a fókusz.
  await page.reload();
  await page.waitForLoadState("networkidle");
  await widget.getByRole("button", { name: "Elérhetőség megtekintése" }).click();
  await expect(widget.getByLabel("Érkezés")).toBeFocused();
  await expect(widget.getByLabel("Érkezés")).toHaveAttribute("aria-invalid", "true");
});

test("szobák száma nem haladhatja meg a felnőttekét", async ({ page }) => {
  await open(page, "./");
  const widget = page.getByRole("form", { name: "Elérhetőség keresése" });
  await widget.getByLabel("Érkezés").fill(ARRIVAL);
  await widget.getByLabel("Távozás").fill(DEPARTURE);
  await widget.getByLabel("Felnőttek", { exact: true }).fill("1");
  await widget.getByLabel("Szobák", { exact: true }).fill("2");
  await widget.getByRole("button", { name: "Elérhetőség megtekintése" }).click();
  await expect(widget.getByLabel("Szobák", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(widget.getByLabel("Szobák", { exact: true })).toBeFocused();
});

test("teljes foglalási demó: minden lépés, visszalépés megőrzi az adatot, nincs /api kérés, nincs siker-visszaigazolás", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api")) apiRequests.push(request.url());
  });

  await searchFromHome(page);
  const current = page.locator('[aria-current="step"]');
  await expect(current).toContainText("Elérhetőség és elhelyezés");

  // 3. lépés: kiválasztás
  const offer = page.getByRole("button", { name: /^Kiválasztás: / }).first();
  await expect(offer).toBeVisible();
  const offerLabel = (await offer.getAttribute("aria-label")) ?? "";
  const offerTitle = offerLabel.replace("Kiválasztás: ", "");
  await offer.click();

  // 4. lépés: vendégadatok — üres űrlap hibái
  await expect(page.getByRole("heading", { level: 2, name: "Vendégadatok" })).toBeFocused();
  await expect(current).toContainText("Vendégadatok");
  await page.getByRole("button", { name: "Tovább az összesítőhöz" }).click();
  await expect(page.getByLabel("Vezetéknév")).toBeFocused();
  await expect(page.getByLabel("Vezetéknév")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Email-cím")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Vezetéknév").fill("Minta");
  await page.getByLabel("Keresztnév").fill("Péter");
  await page.getByLabel("Email-cím").fill("nem-email");
  await page.getByRole("button", { name: "Tovább az összesítőhöz" }).click();
  await expect(page.getByLabel("Email-cím")).toBeFocused();
  await page.getByLabel("Email-cím").fill("minta@example.com");
  await page.getByRole("button", { name: "Tovább az összesítőhöz" }).click();

  // 5. lépés: összesítő
  const summaryHeading = page.getByRole("heading", { level: 2, name: "Összesítő" });
  await expect(summaryHeading).toBeVisible();
  const main = page.getByRole("main");
  await expect(main).toContainText("3 éjszaka");
  await expect(main).toContainText("2 felnőtt");
  await expect(main).toContainText("1 szoba");
  await expect(main).toContainText(offerTitle);
  await expect(main).toContainText("Minta Péter");
  await expect(main).toContainText("minta@example.com");

  // Visszalépés: az adat megmarad
  await page.getByRole("button", { name: "Visszalépés: Vendégadatok" }).click();
  await expect(page.getByLabel("Vezetéknév")).toHaveValue("Minta");
  await expect(page.getByLabel("Email-cím")).toHaveValue("minta@example.com");
  await page.getByRole("button", { name: "Visszalépés: Időpont" }).click();
  await expect(page.getByLabel("Érkezés")).toHaveValue(ARRIVAL);
  await expect(page.getByLabel("Távozás")).toHaveValue(DEPARTURE);
  await page.getByRole("button", { name: "Tovább a vendégekhez" }).click();
  await page.getByRole("button", { name: "Elérhetőség megtekintése" }).click();
  // Ugyanarra a keresésre a választás megmarad
  await expect(page.getByRole("button", { name: `Folytatás ezzel: ${offerTitle}` })).toBeVisible();
  await page.getByRole("button", { name: `Folytatás ezzel: ${offerTitle}` }).click();
  await expect(page.getByLabel("Keresztnév")).toHaveValue("Péter");
  await page.getByRole("button", { name: "Tovább az összesítőhöz" }).click();

  // 6. lépés: lezárás
  await page.getByRole("button", { name: "Demó befejezése" }).click();
  await expect(page.getByRole("heading", { level: 2, name: /foglalás nem történt/ })).toBeFocused();
  await expect(page.getByText(DEMO_NOTICE).first()).toBeVisible();
  await expect(main).toContainText("Nem történt foglalás.");
  await expect(main).toContainText("Semmit nem küldtünk el");
  await expect(main).toContainText("Nem készült visszaigazolás");
  await expect(main).toContainText("a lap bezárásakor elvesznek");
  await expect(main).toContainText("Minta Péter");
  await expect(main).toContainText(offerTitle);
  // Nem hasonlíthat sikeres foglalás-visszaigazolásra.
  const text = await main.innerText();
  expect(text).not.toMatch(/sikeres(en)?\s+(foglal|rögzít)|foglalás(a)?\s+(sikeres|visszaigazol|megtörtént)|köszönjük a foglal/i);
  expect(text).not.toMatch(/foglalási szám:|azonosító:/i);
  await expect(page.getByRole("link", { name: "Vissza a nyitóoldalra" })).toHaveAttribute("href", /\/$/);

  // Új keresés: üres lap az 1. lépésen
  await page.getByRole("button", { name: "Új keresés" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Mikor érkezik?" })).toBeVisible();
  await expect(page.getByLabel("Érkezés")).toHaveValue("");
  await expect(page).toHaveURL(/\/foglalas\/?$/);

  expect(apiRequests).toEqual([]);
  // A vendégadat nem kerülhet sem az URL-be, sem tárolóba.
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + document.cookie);
  expect(stored).not.toContain("minta@example.com");
});

test("/foglalas közvetlenül: 1. lépés, demó-jelölés, hibás paraméterek nem törnek el semmit", async ({ page }) => {
  await open(page, "./foglalas");
  await expect(page.getByText(DEMO_NOTICE).first()).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText("Időpont");
  await page.getByRole("button", { name: "Tovább a vendégekhez" }).click();
  await expect(page.getByLabel("Érkezés")).toBeFocused();

  await page.goto("./foglalas?erkezes=2020-01-01&tavozas=2020-01-03&felnott=2&gyermek=0&szoba=1");
  await expect(page.getByRole("heading", { level: 2, name: "Mikor érkezik?" })).toBeVisible();
  await expect(page.getByText("Az érkezés nem lehet a múltban.")).toBeVisible();
});

test("mobil nézet: nincs vízszintes túlcsordulás a /foglalas oldalon", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`./foglalas?erkezes=${ARRIVAL}&tavozas=${DEPARTURE}&felnott=2&gyermek=1&szoba=1`);
  await expect(page.getByRole("button", { name: /^Kiválasztás: / }).first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
