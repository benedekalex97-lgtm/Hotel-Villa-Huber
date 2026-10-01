import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const BASE = "https://hotel-villa-huber-hotel-villa-huber.vercel.app";

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/munka/email");
});

async function fillAll(page: Page) {
  await page.getByLabel("Címzett neve", { exact: true }).fill("Kiss Béla");
  await page.getByLabel("Feladó neve").fill("Kovács Anna");
  await page.getByLabel("Feladó telefonszáma").fill("+36 30 123 4567");
}

const srcdoc = (page: Page) => page.locator("iframe[title='Levél HTML-előnézete']").getAttribute("srcdoc");

test("hiányos levél megtekinthető, de nem exportálható; a hiányok láthatók", async ({ page }) => {
  await expect(page.getByText("Még nem kész — nem exportálható")).toBeVisible();
  await expect(page.getByText(/Kitöltendő személyes mezők: Címzett neve, Feladó neve, Feladó telefonszáma/)).toBeVisible();
  const html = await srcdoc(page);
  expect(html).toContain("Tisztelt [Név]!");
  const htmlBtn = page.getByRole("button", { name: "HTML letöltése" });
  await expect(htmlBtn).toHaveAttribute("aria-disabled", "true");
  const downloads: string[] = [];
  page.on("download", (d) => downloads.push(d.suggestedFilename()));
  await htmlBtn.click({ force: true }); // aria-disabled: a kattintás hibajelzést ad
  await expect(page.getByRole("status").getByText(/nem exportálható/)).toBeVisible();
  await expect(page.getByLabel("Címzett neve", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Teljes szöveges levél másolása" }).click({ force: true });
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain("Tisztelt");
  expect(downloads).toEqual([]);
  // A szabályos, megerősítésre váró ingatlanadat külön jelzés, nem hiba.
  await expect(page.getByTestId("pending-facts")).toContainText("Megerősítésre váró ingatlanadat");
});

test("a címzett és a feladó külön mező, a [Név] helyőrzők nem keverednek", async ({ page }) => {
  await page.getByLabel("Címzett neve", { exact: true }).fill("Kiss Béla");
  let html = (await srcdoc(page))!;
  expect(html).toContain("Tisztelt Kiss Béla!");
  expect(html).toContain("<strong>[Név]</strong>");
  await expect(page.getByText(/Kitöltetlen személyes helyőrző a levélben: „\[Név\]” \(aláírás – név\)/)).toBeVisible();
  await page.getByLabel("Feladó neve").fill("Kovács Anna");
  html = (await srcdoc(page))!;
  expect(html).toContain("<strong>Kovács Anna</strong>");
  expect(html).toContain("Tisztelt Kiss Béla!");
});

test("kész levél: másolás, letöltés, az előnézet és az export azonos", async ({ page }) => {
  await fillAll(page);
  await expect(page.getByText("Kész az exportra")).toBeVisible();

  await page.getByRole("button", { name: "Tárgy másolása" }).click();
  await expect(page.getByRole("status").getByText("A tárgy a vágólapon.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("Hotel Villa Huber – részletes ingatlanbemutató");

  const [htmlDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "HTML letöltése" }).click()]);
  const [txtDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "TXT letöltése" }).click()]);
  expect(htmlDownload.suggestedFilename()).toBe("hotel-villa-huber-bemutato.html");
  expect(txtDownload.suggestedFilename()).toBe("hotel-villa-huber-bemutato.txt");
  const htmlFile = await readFile((await htmlDownload.path())!);
  const txtFile = await readFile((await txtDownload.path())!);
  const html = new TextDecoder("utf-8", { fatal: true }).decode(htmlFile);
  const txt = new TextDecoder("utf-8", { fatal: true }).decode(txtFile);

  expect(html).toBe(await srcdoc(page)); // preview és export egyezik
  expect(html).toContain("Tisztelt Kiss Béla!");
  expect(html).toContain("ő");
  expect(txt).toContain("Tisztelt Kiss Béla!");
  expect(txt).toContain("Üdvözlettel:\nKovács Anna\n+36 30 123 4567\nsale@hotelvillahuber.com");
  expect(html).toContain(`href="${BASE}/elado-hotel"`);
  expect(html).toContain(`href="${BASE}/elado-hotel#ajanlatkeres"`);
  expect(txt).toContain(`${BASE}/elado-hotel#ajanlatkeres`);
  expect(txt).not.toMatch(/\[[^\]]+\]/);

  await page.getByRole("button", { name: "Teljes szöveges levél másolása" }).click();
  await expect(page.getByRole("status").getByText("A teljes szöveges levél a vágólapon.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(txt);

  await page.getByRole("button", { name: "Formázott levél másolása" }).click();
  await expect(page.getByRole("status").getByText(/A formázott levél a vágólapon/)).toBeVisible();
  const rich = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    return { types: item!.types, html: await (await item!.getType("text/html")).text() };
  });
  expect(rich.types).toEqual(expect.arrayContaining(["text/html", "text/plain"]));
  expect(rich.html).toContain("Tisztelt Kiss Béla!");
});

test("másolási hiba: valós hibaüzenet, nincs sikerjelzés, kézi alternatíva", async ({ page }) => {
  await page.addInitScript(() => {
    const denied = () => Promise.reject(Object.assign(new Error("denied"), { name: "NotAllowedError" }));
    Object.defineProperty(navigator, "clipboard", { value: { writeText: denied, write: denied, readText: denied }, configurable: true });
    document.execCommand = () => false;
  });
  await page.goto("/munka/email");
  await fillAll(page);
  await page.getByRole("button", { name: "Teljes szöveges levél másolása" }).click();
  await expect(page.getByRole("status").getByText(/elutasította a vágólap-hozzáférést/)).toBeVisible();
  await expect(page.getByText("A teljes szöveges levél a vágólapon.")).toHaveCount(0);
  const manual = page.getByRole("textbox", { name: "Kézi másolás: szöveges levél" });
  await expect(manual).toBeVisible();
  await expect(manual).toHaveValue(/^HOTEL VILLA HUBER/);
  // Letöltés továbbra is elérhető alternatíva.
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "TXT letöltése" }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.txt$/);
  await page.getByRole("button", { name: "Formázott levél másolása" }).click();
  await expect(page.getByRole("textbox", { name: "Kézi másolás: HTML-forrás" })).toBeVisible();
});

test("kézi szerkesztés megmarad névváltoztatáskor, telefonszámnál és előnézeti méretváltáskor; reset megerősítéssel", async ({ page }) => {
  await fillAll(page);
  await page.getByText("B) Ingatlanadatok").click();
  const rooms = page.getByLabel(/^Szobák \(érték\)/);
  await rooms.fill("14 szoba (kézzel módosítva)");
  await page.getByLabel("Tárgy", { exact: true }).fill("Saját tárgy");
  await expect(page.getByText("kézzel módosítva").first()).toBeVisible();

  await page.getByLabel("Címzett neve", { exact: true }).fill("Nagy Gábor");
  await page.getByLabel("Feladó telefonszáma").fill("+36 1 000 0000");
  await page.getByRole("button", { name: /Mobil/ }).click();
  await expect(page.locator("iframe[data-preview-size='mobile']")).toBeVisible();
  await page.getByRole("button", { name: "Asztali" }).click();
  await expect(rooms).toHaveValue("14 szoba (kézzel módosítva)");
  await expect(page.getByLabel("Tárgy", { exact: true })).toHaveValue("Saját tárgy");
  const html = (await srcdoc(page))!;
  expect(html).toContain("14 szoba (kézzel módosítva)");
  expect(html).toContain("Tisztelt Nagy Gábor!");
  expect(html).toContain("<title>Saját tárgy</title>");

  await page.getByRole("button", { name: "Visszaállítás a központi alapváltozatra" }).click();
  await expect(page.getByText(/Biztosan\?/)).toBeVisible();
  await page.getByRole("button", { name: "Mégse" }).click();
  await expect(rooms).toHaveValue("14 szoba (kézzel módosítva)");
  await page.getByRole("button", { name: "Visszaállítás a központi alapváltozatra" }).click();
  await page.getByRole("button", { name: "Visszaállítás", exact: true }).click();
  await expect(rooms).toHaveValue(/^14 szoba és lakosztály/);
  await expect(page.getByLabel("Tárgy", { exact: true })).toHaveValue("Hotel Villa Huber – részletes ingatlanbemutató");
  await expect(page.getByLabel("Címzett neve", { exact: true })).toHaveValue("Nagy Gábor");
});

test("nyers HTML nem szerkeszthető be: a bevitt jelölés escape-elve kerül a levélbe", async ({ page }) => {
  await fillAll(page);
  await page.getByLabel("Személyes bevezető").fill("<script>alert(1)</script><b>erős</b>");
  const html = (await srcdoc(page))!;
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<b>erős</b>");
  expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
});

test("bent maradt helyőrző a szerkesztett szövegben blokkolja az exportot", async ({ page }) => {
  await fillAll(page);
  await page.getByText("Bevezető és záró szövegek").click();
  await page.getByLabel("Bevezető bekezdés").fill("Szöveg [adat később] maradt.");
  await expect(page.getByText(/Bent maradt helyőrző a szövegben: „\[adat később\]”/)).toBeVisible();
  await expect(page.getByRole("button", { name: "HTML letöltése" })).toHaveAttribute("aria-disabled", "true");
});

test("mobil nézet 390 px: nincs vízszintes túlcsordulás, az előnézet iframe is elfér", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/munka/email");
  await page.getByRole("button", { name: /Mobil/ }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
