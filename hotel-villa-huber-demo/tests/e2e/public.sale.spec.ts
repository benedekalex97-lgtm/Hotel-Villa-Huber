import { expect, test } from "@playwright/test";

/**
 * /elado-hotel — vevői tájékoztató oldal és ajánlatkérő.
 * A publikus build szolgáltató nélkül fut, ezért az űrlap „mailto” módban működik
 * (levél előkészítése; a site nem küld és nem tárol).
 */

const SALE_EMAIL = "sale@hotelvillahuber.com";
const CTA_LABEL = "Részletes bemutatót és egyeztetést kérek";
const PRICE_LINE = "Irányár és értékesítési feltételek egyeztetés alapján.";

const HEADINGS_IN_ORDER = [
  "Hotel Villa Huber — vásárlási lehetőség Karintiában.",
  "Ingatlanadatok",
  "A ház és terei",
  "Környék és elhelyezkedés",
  "Működés és üzemeltetési háttér",
  "Kinek lehet érdekes?",
  "Két vásárlási út",
  "Értékesítési feltételek",
  "Dokumentumok és megtekintés",
  "Gyakori kérdések",
  "A vásárlási folyamat",
  "Bemutató és egyeztetés kérése",
];

const SECTION_IDS_IN_ORDER = [
  "osszefoglalo",
  "ingatlanadatok",
  "terek",
  "kornyek",
  "mukodes",
  "kinek",
  "vasarlasi-utak",
  "feltetelek",
  "dokumentumok",
  "gyik",
  "folyamat",
  "ajanlatkeres",
];

const FORM_NAME = "Részletes bemutató és egyeztetés kérése";

test("az A–L szekciók fejlécei és azonosítói a megadott sorrendben vannak", async ({ page }) => {
  await page.goto("./elado-hotel");
  await expect(page.locator("main h1, main h2")).toHaveText(HEADINGS_IN_ORDER);
  const ids = await page.evaluate(() => Array.from(document.querySelectorAll("main > section[id]")).map((s) => s.id));
  expect(ids).toEqual(SECTION_IDS_IN_ORDER);
});

test("fő CTA az ajánlatkérőre visz, amely a GYIK és a folyamat után van", async ({ page }) => {
  await page.goto("./elado-hotel");
  const cta = page.locator("#osszefoglalo").getByRole("link", { name: CTA_LABEL });
  await expect(cta).toHaveAttribute("href", "#ajanlatkeres");
  await cta.click();
  await expect(page).toHaveURL(/\/elado-hotel\/?#ajanlatkeres$/);
  await expect(page.getByRole("form", { name: FORM_NAME })).toBeInViewport();

  const order = await page.evaluate(() => {
    const pos = (id: string) => document.getElementById(id)!;
    const after = (a: string, b: string) => Boolean(pos(a).compareDocumentPosition(pos(b)) & Node.DOCUMENT_POSITION_FOLLOWING);
    return { faqBeforeForm: after("gyik", "ajanlatkeres"), processBeforeForm: after("folyamat", "ajanlatkeres") };
  });
  expect(order).toEqual({ faqBeforeForm: true, processBeforeForm: true });
});

test("az irányár-sor pontos szövege látszik, árszám és euró-jelölés nincs", async ({ page }) => {
  await page.goto("./elado-hotel");
  const terms = page.locator("#feltetelek");
  await expect(terms.getByText(PRICE_LINE, { exact: true })).toBeVisible();
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/€|\bEUR\b|\beuró/i);
  // Dokumentumok: nincs letöltés, nincs kész adatszoba-állítás.
  await expect(page.locator("a[download], a[href$='.pdf']")).toHaveCount(0);
  await expect(page.locator("#dokumentumok")).toContainText("Letölthető anyag ezen az oldalon nincs.");
});

test("az ingatlanadatoknál minden nem megerősített érték állapotcímkével jelenik meg", async ({ page }) => {
  await page.goto("./elado-hotel");
  const rows = page.locator("#ingatlanadatok dl > div");
  const count = await rows.count();
  expect(count).toBeGreaterThan(10);
  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator("dd")).toContainText(/Megerősített|megerősítésre vár|dokumentummal még nem igazolt|Egyeztetés tárgya/);
  }
  await expect(page.locator("#ingatlanadatok")).toContainText("Egyeztetés tárgya");
  await expect(page.locator("#mukodes")).toContainText("Tulajdonosi közlés");
});

test("GYIK: billentyűzettel nyitható részletek", async ({ page }) => {
  await page.goto("./elado-hotel");
  const first = page.locator("#gyik summary").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#gyik details").first()).toHaveAttribute("open", "");
});

test("ajánlatkérő: üres küldésre hibák jelennek meg, a Név mezőre kerül a fókusz", async ({ page }) => {
  await page.goto("./elado-hotel#ajanlatkeres");
  const form = page.getByRole("form", { name: FORM_NAME });
  await form.getByRole("button", { name: "Email előkészítése" }).click();
  const name = form.getByLabel("Név", { exact: true });
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByText("Kérjük, adja meg a nevét.").first()).toBeVisible();
  await expect(form.getByText("Kérjük, válassza ki az érdeklődési irányt.").first()).toBeVisible();
  await expect(page.locator("#inquiry-prepared-text")).toHaveCount(0);

  // Élő törlés: kitöltés után a hiba eltűnik.
  await name.fill("Minta Péter");
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
});

test("ajánlatkérő mailto módban: előkészített levél, sale@ címzett, nincs „elküldve” állítás; a címzett másolható", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./elado-hotel#ajanlatkeres");
  const form = page.getByRole("form", { name: FORM_NAME });

  await expect(form).toContainText(SALE_EMAIL);
  await expect(form).toContainText("nem küldi el és nem tárolja");

  await form.getByLabel("Név", { exact: true }).fill("Minta Péter");
  await form.getByLabel("Email", { exact: true }).fill("minta@example.com");
  await form.getByRole("textbox", { name: /^Telefon/ }).fill("+36 30 123 4567");
  await form.getByRole("textbox", { name: /^Cég/ }).fill("Minta Kft.");
  await form.getByRole("radio", { name: "Saját üzemeltetés" }).check();
  await form.getByRole("radio", { name: "Részletes bemutató" }).check();
  await form.getByRole("textbox", { name: /^Rövid üzenet/ }).fill("Érdekel a ház, kérek egy rövid egyeztetést és részleteket.");
  await form.getByRole("button", { name: "Email előkészítése" }).click();

  const prepared = page.locator("#inquiry-prepared-text");
  await expect(prepared).toBeVisible();
  await expect(prepared).toHaveValue(/Minta Péter/);
  await expect(page.getByText("Ha a levelezőalkalmazása megnyílt, ott ellenőrizheti és elküldheti a levelet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Levelezőprogram megnyitása újra" })).toHaveAttribute("href", new RegExp(`^mailto:${SALE_EMAIL}\\?`));

  const bodyText = await page.locator("main").innerText();
  expect(bodyText).not.toMatch(/elküldve|elküldtük|sikeresen/i);

  await page.getByRole("button", { name: "Címzett másolása" }).click();
  await expect(page.getByText("A címzett a vágólapra másolva.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(SALE_EMAIL);

  await page.getByRole("button", { name: "Levél másolása" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Minta Péter");
});

test.describe("mobil nézet", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("alsó CTA-sáv: a hero után jelenik meg, az ajánlatkérőnél eltűnik, nincs vízszintes túlcsordulás", async ({ page }) => {
    await page.goto("./elado-hotel");
    const bar = page.locator("div[data-visible]");
    await expect(bar).toHaveAttribute("data-visible", "false");

    await page.evaluate(() => document.getElementById("ingatlanadatok")!.scrollIntoView());
    await expect(bar).toHaveAttribute("data-visible", "true");
    await expect(bar.getByRole("link", { name: CTA_LABEL })).toBeVisible();

    await bar.getByRole("link", { name: CTA_LABEL }).click();
    await expect(page).toHaveURL(/#ajanlatkeres$/);
    await expect(bar).toHaveAttribute("data-visible", "false");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
});
