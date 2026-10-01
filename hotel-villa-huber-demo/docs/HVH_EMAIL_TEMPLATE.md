# Hotel Villa Huber bemutató email

Egyetlen aktív sablon: **„Hotel Villa Huber bemutató”** — magyar nyelvű, önmagában érdemi ingatlanbemutató a befektetőknek. A levél tartalmazza az eladási landing (`/elado-hotel`) minden fontos vevői információját, és a landingre vezet további böngészéshez és egyeztetéshez. A link nem helyettesíti a levélből kihagyott adatot.

A levél előállítása és kézi használatra átadása a feladat: az eszköz **nem küld levelet**, nincs szerveres vázlattárolás, nincs tömeges küldés, és az ajánlatkérő backendje változatlan.

## Használat

```bash
cd hotel-villa-huber-demo
npm install
npm run dev                                       # http://localhost:3000/munka/email
npm run build:internal && npm run start:internal  # belső build: http://localhost:3101/munka/email
```

A `/munka/*` csak helyben vagy belső buildben fut. A publikus buildben (`npm run build:public`, Vercel production) nincs ilyen útvonal; a `verify:public` ellenőrzi, hogy a szerkesztő szövegei nem kerültek bele.

### Mezők

| Mező | Kötelező | Hol jelenik meg |
|---|---|---|
| Címzett neve | igen | megszólítás: „Tisztelt {recipientName}!” |
| Címzett emailje | nem | csak a belső felületen validálva; a levélbe nem kerül |
| Feladó neve | igen | aláírás |
| Feladó telefonszáma | igen | aláírás |
| Személyes bevezető | nem | a bemutató bevezetője előtt; üresen nincs belőle üres sor, helyőrző vagy állítás |
| Tárgy | igen | szerkeszthető; alap: „Hotel Villa Huber – részletes ingatlanbemutató” |
| Előnézeti szöveg (preheader) | nem | rejtett sor a levél elején |
| Szekciószövegek | — | A–L szekciók és a bevezető/záró szövegek, szekciónként nyitható csoportokban |

A `recipientName` és a `senderName` külön mező: a két `[Név]` helyőrző nem keveredik, mindkettő a saját mezőjéhez kötött (a hibajelzés megmondja, hogy a megszólításban vagy az aláírásban maradt).

### Műveletek

1. **Tárgy másolása**
2. **Formázott levél másolása** — `text/html` és `text/plain` reprezentáció együtt (Clipboard API `ClipboardItem`; tartalék: `copy` esemény). A formázott beillesztés levelezőnként eltérhet, ezt nem garantáljuk.
3. **Teljes szöveges levél másolása**
4. **HTML letöltése** (UTF-8, `hotel-villa-huber-bemutato.html`)
5. **TXT letöltése** (UTF-8, `hotel-villa-huber-bemutato.txt`)
6. **Visszaállítás a központi alapváltozatra** — megerősítéssel; a kézi tartalmi módosítások elvesznek, a címzett/feladó adatai megmaradnak.

Másolási hiba (elutasított vagy nem támogatott vágólap) esetén valós hibaüzenet jelenik meg, sikerjelzés nélkül, és kézi másolásra alkalmas szövegmező, valamint a letöltés áll rendelkezésre.

### Készenlét és védelem

Hiányos levél megtekinthető, de **nem exportálható és nem tekinthető küldésre késznek**. Blokkoló hibák:

- üres kötelező személyes mező (a levélben ilyenkor `[Név]` / `[Telefonszám]` látszik);
- hibás címzett-email formátum, üres tárgy;
- bármely szövegben maradt vagy beírt helyőrző (`[…]`, `{…}`, pl. `[adat később]`);
- tiltott tartalom a szövegben: saját díj/sikerdíj, pénzösszeg, hozam-/megtérülés-/garanciaállítás, terület-/méretadat, síállítás/luxus (kézi szerkesztéssel sem vihető be).

Külön, **nem hibaként** jelenik meg a „Megerősítésre váró ingatlanadat: N tétel” — ezek szabályos, állapotcímkével szereplő adatok (korábbi nyilvános vagy tulajdonosi közlés), nem helyőrzők.

A kézi tartalmi szerkesztés (tárgy, preheader, szekciószövegek) nem vész el név- vagy telefonszám-változtatáskor, sem az előnézeti méret váltásakor. Az állapotcímkék nem szerkeszthetők. A vázlat kizárólag a böngészőfül memóriájában él (nincs `localStorage`, nincs szerveres tárolás).

### Előnézet

Asztali és mobil (390 px) HTML-előnézet sandboxolt `iframe`-ben, **pontosan ugyanazzal a HTML-lel**, amelyet letöltés/másolás exportál (`srcDoc`; az e2e-teszt bájtra egyezést ellenőriz). Ez böngészős előnézet, **nem emailkliens-teszt**.

Személyre szabott levelet a `public/` alá nem mentünk; a letöltés a belső felületről történik.

## Adatforrások

A levél a landinggel **közös központi tartalomból** épül; nincs külön ténylista.

| Forrás | Mit ad |
|---|---|
| `src/content/property.ts` | `PUBLIC_FACTS`, állapotcímkék (`FACT_STATUS_PUBLIC_LABEL`), a jelmagyarázat szövegei (`FACT_STATUS_EXPLANATION`, `FACT_STATUS_ORDER`) |
| `src/content/sales.ts` | összefoglaló, adatcsoportok, célcsoportok, vásárlási utak, feltételek, dokumentumok, GYIK, folyamat, kérések |
| `src/content/guest.ts` | szálláshelyformák, közösségi terek és szolgáltatások, környék |
| `src/content/media.ts` | képek (manifest: src, alt, caption, méret) |
| `src/content/site.ts` | útvonalak, landing-horgonyok (`SALE_SECTIONS`), kapcsolati cím |
| `src/content/site-url.ts` | validált production alapcím és abszolút linkek |

A levél megfogalmazása (bevezető, szekció-lead mondatok) a `src/features/email/presentation.ts`-ben van. A landing két önmagára mutató kifejezését („ezen az oldalon”, „az űrlappal”) az email egyetlen, tesztelt függvénye (`adaptForEmail`) igazítja; minden más központi szöveg változatlanul kerül a levélbe.

A `src/content/internal/*` modult az email-feature nem importálja (teszt ellenőrzi), így saját díj, sikerdíj, korábbi árak, közvetítői adatok nem kerülhetnek a levélbe.

### Felépítés

- tartalom: `src/features/email/presentation.ts` → `EmailDocument` (`model.ts`);
- összeállítás: `compose.ts` (dokumentum → `render-html.ts` + `render-text.ts` + `validate.ts`);
- kezelőfelület: `EmailWorkbench.tsx` és társai (`PersonalPanel`, `SectionsEditor`, `ActionPanel`, `PreviewPane`), vágólap/letöltés: `export.ts`;
- vázlatállapot: `draft.ts`.

A HTML-renderer determinisztikus TypeScript (nincs React Email). Táblázatos elrendezés, inline stílusok, 640 px max. szélesség, `@media` kiegészítés ≤ 480 px-re, Outlook `mso` keret, szöveges wordmark, Georgia / Segoe UI–Arial tartalék; nincs JavaScript, flex/grid, webfont, követő pixel. Minden szöveg HTML-escape-elt; a modell nem hordoz nyers HTML-t, a feladó nem szerkeszthet végrehajtható HTML-t. A hivatkozások csak `https:` és `mailto:` lehetnek.

## Konfigurálható production alapcím

Az összes landing-, galéria- és képlink a `NEXT_PUBLIC_SITE_URL` környezeti változóból épül (`src/content/site-url.ts`); alapérték: `https://hotel-villa-huber-hotel-villa-huber.vercel.app`. Domaincsere: állítsa be az új gyökércímet (csak `https://`, nyilvános domain, útvonal/paraméter/horgony nélkül), majd építse újra a belső buildet. Érvénytelen érték esetén az alapérték marad, és a felület hibát jelez. A belső felület kiírja az éppen használt alapcímet.

A linkekben nincs követőparaméter és nincs megnyitáskövető pixel.

## CTA-k

| Gomb | Cél |
|---|---|
| „Hotel részletes bemutatója” (a bevezető után) | `{alapcím}/elado-hotel` |
| „Egyeztetést vagy megtekintést kérek” (a levél végén) | `{alapcím}/elado-hotel#ajanlatkeres` |

A horgony a landing kódjából való: `SalePage.tsx` — `<section id={SALE_SECTIONS.inquiry}>`, `SALE_SECTIONS.inquiry = "ajanlatkeres"`. Nem kellett új ID-t bevezetni. A gombok valódi HTML-linkek, alattuk olvasható szöveges link is van; a „Teljes fotógaléria” a `{alapcím}/#galeria` horgonyra mutat.

## Landing A–L → email megfeleltetés

| | Landing szekció (`horgony`) | Email-szekció | Tartalom az emailben |
|---|---|---|---|
| A | Hotel és összefoglaló (`osszefoglalo`) | „Hotel Villa Huber — vásárlási lehetőség Karintiában.” | összefoglaló, alcím, négy pont; hero: `sale.hero` homlokzatfotó, a szekcióban `sale.property` homlokzatfotó |
| B | Ingatlanadatok (`ingatlanadatok`) | „Ingatlanadatok” | négy állapotjelölés magyarázattal; Azonosítás / Kapacitás és terek / Épület adatcsoportok minden adata az állapotcímkéjével; „Ami még egyeztetés tárgya” (építési év, méret, műszaki állapot, engedélyek) |
| C | A ház és terei (`terek`) | „A ház és terei” | szobák (állapottal), szálláshelyformák, közösségi terek és szolgáltatások állapotcímkével, „a fotók a terek létét mutatják” és „nyitvatartást nem ígérünk” megkülönböztetések, válogatott fotók, galéria-link |
| D | Környék (`kornyek`) | „Környék és elhelyezkedés” | Gegendtal, Afritzi-tó és Brennsee, Villach régió, téli hegyek; tó-távolság a forrásolt jelöléssel; menetidő nincs |
| E | Működés (`mukodes`) | „Működés és üzemeltetési háttér” | 2026-os tulajdonosi közlés, értékelés, üzemeltető-státusz (állapottal); „Lehetséges irány, nem ígéret”. A landingről a tulajdonosi adatbekérési („Tisztázandó”) lista kikerült, ezért az emailben sincs; az átadás időzítése a H, a nyitvatartás/foglalhatóság tisztázása a J (GYIK) szekcióban szerepel |
| F | Kinek lehet érdekes? (`kinek`) | „Kinek lehet érdekes?” | a négy célcsoport indoklással és fő kérdéssel |
| G | Vásárlási szempontok (`vasarlasi-utak`) | „Vásárlási szempontok” | Az ingatlan megvásárlása, az átadás és az előkészítendő adatok egyeztetése. Külső üzemeltető bevonását nem kínáljuk. |
| H | Feltételek (`feltetelek`) | „Értékesítési feltételek” | „Irányár és értékesítési feltételek egyeztetés alapján.”; az értékesítés tárgya, tranzakciós forma, időzítés |
| I | Dokumentumok és megtekintés (`dokumentumok`) | „Dokumentumok és megtekintés” | négy dokumentumtéma, bizalmassági feltételek, helyszíni megtekintés; letölthető anyag/adatszoba nincs |
| J | Gyakori kérdések (`gyik`) | „Gyakori kérdések” | mind a 7 kérdés és válasz nyitott szövegként |
| K | Folyamat (`folyamat`) | „A vásárlási folyamat” | hat lépés; az első egyeztetés négy témája |
| L | Ajánlatkérő (`ajanlatkeres`) | „Bemutató és egyeztetés kérése” | kérhető: bemutató, telefonos egyeztetés, helyszíni megtekintés; érdeklődési irány; válasz emailben; záró gomb az ajánlatkérőre; a webes űrlap nincs beágyazva |

A megfeleltetés teljességét a `tests/unit/email-presentation.test.ts` ellenőrzi: a központi tartalom minden eleme (adat, állapotcímke, feltétel, GYIK-válasz stb.) szerepel a levélben.

## Tényekre vonatkozó szabályok (érvényesítve)

- A 14 szoba, kb. 45 vendég, kb. 50 fős étterem, kb. 35 személyautó és egy busz csak a regiszter szerinti értékkel és „Korábbi nyilvános közlés — tulajdonosi megerősítésre vár” állapottal szerepel; a busz férőhelyét nem értelmezzük újra.
- Az irányár szövege kizárólag a központi; korábbi vagy nem jóváhagyott ár nem jelenik meg (teszt: nincs ár, összeg, hozam, megtérülés, terület, építési év a HTML-ben és a TXT-ben).
- Nincs saját szolgáltatási díj, sikerdíj vagy belső megjegyzés; a foglalási demó mintaadatai nincsenek benne.
- A levél nem állít előzetes beszélgetést, ajánlást vagy korábbi érdeklődést; nem használja a régi „Érdekes lehet Önnek?” logikát.

## Képek

Hero és válogatott valódi hotelfotók a média-manifestből (`facade-valley` hero, `facade-summer`, `room`, `terrace`, `sauna`, `salon`, `afritz-sign`), mind abszolút `https://…/media/booking-export/….jpg` URL-lel, alt szöveggel, méretattribútummal (magasság nélkül, hogy képtiltásnál ne maradjon nagy üres terület). A képek a production `public/media/` mappából szolgálnak; a fontos információ nem csak képen jelenik meg. A pendrive-os anyag még nincs átadva, nincs idegen vagy generált fotó.

## Mintafájlok

Személyes adat nélküli, egyértelműen fiktív mintakitöltéssel (Minta Címzett / Minta Feladó / +36 1 000 0000) készült generikus minta, dokumentációs artifactként:

- `docs/samples/hvh-bemutato-minta.html`
- `docs/samples/hvh-bemutato-minta.txt`

Egység-teszt őrzi, hogy a minta a jelenlegi generátor kimenetével egyezik; frissítés: `UPDATE_SAMPLES=1 npx vitest run tests/unit/email-export.test.ts`. A mintában a képek a production címre mutatnak.

Képernyőképek: `docs/screenshots/05-munka-email-*` (szerkesztő) és `06-email-level-*` (a levél 390 px és 1440 px szélességen, képekkel és képek nélkül).

## Tesztelt emailkliensek

**Egyik valódi levelezőkliens sem lett tesztelve** (Gmail, Outlook, Apple Mail, mobilkliensek): ehhez nincs hozzáférhető tesztkörnyezet, valódi címzettnek pedig nem küldtünk tesztlevelet. Tesztelve van:

- a HTML Chromiumban (böngészős előnézet, 390 px és 1440 px, képekkel és képek nélkül; vízszintes túlcsordulás 0 px);
- a vágólap-másolás és letöltés Chromiumban (Playwright).

Ez nem emailkliens-teszt. Küldés előtt ajánlott egy kézi próba saját Gmail/Outlook fiókba a formázott beillesztéssel.

## Megmaradt hiányok

- Gmail/Outlook/Apple Mail rendering és formázott beillesztés nem tesztelt.
- A production képek elérhetőségét ebből a környezetből nem lehetett ellenőrizni (a vercel.app kimenő hozzáférése tiltott); a fájlok léteznek a `public/media/` alatt, és a production ugyanebből a repóból épül. Küldés előtt nyissa meg a levelet képekkel.
- A `sale@hotelvillahuber.com` postafiók működése nincs ellenőrizve.
- A kapacitás- és szolgáltatásadatok mind megerősítésre várnak (tulajdonosi közlés/dokumentum hiányzik); ár, méret, építési év, műszaki és jogi háttér egyeztetés tárgya.
- A kézi szerkesztés a levélben szabad szöveg: a tiltott-tartalom ellenőrzés mintaalapú, nem helyettesíti az emberi átolvasást.
- Kézzel hozzáadott képek nincsenek; a pendrive-os média feldolgozása még hátra van.
