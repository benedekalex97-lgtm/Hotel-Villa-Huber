# Hotel Villa Huber demó — build riport

Állapot: 2026-10-01 · v0.1 · a 2026. október 1-jei tulajdonosi tárgyalásra.

## Mi készült

| Útvonal | Tartalom | Elérhetőség |
|---|---|---|
| `/` | Magyar hotelbemutató: hero, A villa, galéria (8 kép, lightbox), elhelyezkedés, értékesítési átvezetés, kapcsolat | publikus |
| `/elado-hotel` | Értékesítési landing: ingatlanbemutató, négy célcsoport, két vásárlási út, első egyeztetés, következő lépések, mailto-alapú kapcsolatfelvétel | publikus |
| `/munka/email` | Belső sablonszerkesztő a három jóváhagyott levélhez | csak helyben: `npm run dev` vagy belső build |
| `/munka/brand` | Élő brand board | csak helyben: mint fent |

Mellette készült:

- design tokenek (`src/app/globals.css`);
- ideiglenes SVG wordmark és favicon (`public/brand/`, `src/app/icon.svg`);
- központi tartalommodell (`src/content/`);
- asset-manifest (`src/content/media.ts`);
- brand board (`docs/brand/HVH_BRAND_BOARD.png`, döntések: `docs/HVH_BRAND.md`);
- tárgyalási screenshotok (`docs/screenshots/`).

## Indítás

```bash
cd hotel-villa-huber-demo
npm install

# Fejlesztői előnézet (minden útvonal, a belsők is): http://localhost:3000
npm run dev

# Publikus kiadási build: /munka/* nincs benne
npm run build:public && npm run start:public      # http://localhost:3100

# Belső build a sablonszerkesztővel
npm run build:internal && npm run start:internal  # http://localhost:3101/munka/email
```

Teljes ellenőrzés egy paranccsal: `npm run check`. Sorrendben: typecheck, lint, egységtesztek, publikus build, szivárgásellenőrzés, belső build, e2e.

## Belső route-gate

A `/munka/*` útvonalakat három réteg védi:

1. **Build.** A belső oldalak `*.internal.tsx` fájlok. A `next.config.ts` csak `next dev` alatt vagy `HVH_INTERNAL_TOOLS=1` esetén ismeri fel őket oldalként. A publikus buildben se a route, se a kódja nem épül be. Ezt a `npm run verify:public` ellenőrzi: route-manifest, valamint a szerver- és kliens-chunkok tiltott szövegekre (sablonszöveg, belső útvonal, díjak, ár, kapacitás).
2. **Proxy.** A `src/proxy.ts` a `/munka/*` kérésekre 404-et ad, ha a gate zárva.
3. **Oldal.** A belső layout és oldal szerveroldalon `notFound()`-ot hív, ha a gate zárva.

Teljes auth-rendszer nem készült, ez megfelel a briefnek. A belső build hálózatra kitéve nem védett, ezért csak helyben fusson.

## Ellenőrzések

### Lefuttatva (2026-10-01)

| Ellenőrzés | Eredmény |
|---|---|
| `npm run typecheck` (tsc) | hibátlan |
| `npm run lint` (eslint, next core-web-vitals + typescript) | hibátlan |
| `npm test` (vitest) | 5 fájl, 31 teszt, mind sikeres |
| `npm run build:public` | sikeres; útvonalak: `/`, `/elado-hotel` (statikus) |
| `npm run verify:public` | OK, 135 fájl, belső tartalom nélkül |
| `npm run build:internal` | sikeres; `/munka/email` és `/munka/brand` dinamikus |
| `npx playwright test` (Chromium, két szerver) | 13/13 sikeres |
| Vízszintes túlcsordulás (`/`, `/elado-hotel`, `/munka/email` × 390, 768, 1440 px) | 0 px mindenhol |
| HTTP: publikus szerveren `/munka/email` | 404 |
| HTTP: belső szerveren `/munka/email` | 200 |

Mit fednek le a tesztek:

- **Egységtesztek**
  - Emailsablon-renderelés: betű szerinti szövegmegőrzés; külön `recipientName` és `senderName`; literális, biztonságos behelyettesítés (`$&`, `[Név]`, HTML); A/Az névelő; helyőrző-felismerés; kézi szerkesztés védelme.
  - Mailto-kódolás: `encodeURIComponent`, `&`, `#`, `+`, `%`, ékezetek, CRLF, header-injekció.
  - Route-gate: env-logika, `pageExtensions` buildfázisonként, `/munka` fájlnevek, tiltott importok.
  - Tartalommodell: nincs publikus kapacitás- vagy áradat, kizárt képek, létező képfájlok.
- **E2E**
  - CTA a `/`-ról az `/elado-hotel`-re.
  - Lightbox: Escape, nyilak, fókusz visszaadása.
  - `sale@` link a főoldalon.
  - Űrlap: validáció, előkészített levél, címzett a vágólapon, nincs „elküldve” állapot.
  - Mobil menü és túlcsordulás.
  - Belső felület a publikus módban 404, `noindex` és nincs canonical.
  - Három sablon, kézi szerkesztés megtartása sablonváltáskor és mezőváltáskor, visszaállítás megerősítéssel, vágólap pontos tartalma, helyőrző-őr.

### Nem futtatva, vagy nem elérhető

- A tényleges `mailto:` megnyitást böngészőben nem automatizáltuk: headless Chromiumban nincs levelezőkliens. A link összeállítását egységteszt fedi.
- A sikertelen vágólap-másolás hibaágát böngészőben nem kényszerítettük ki (a kód kezeli: kijelölés + kézi másolási útmutatás).
- Firefoxban és Safariban nem teszteltünk; csak Chromiumban.
- Automatizált akadálymentességi audit (axe) nem futott. Billentyűzetes működés, fókusz, label, kontraszt (számolt WCAG-arányok: `docs/HVH_BRAND.md`) ellenőrizve.
- Lighthouse vagy teljesítménymérés nem futott.

## Munkamód és modellek

- Fő agent: `claude-opus-5-5`, high effort (session-beállítás, ellenőrizve). Ő végezte az arculatot, az adatmodellt, az útvonalakat, a közös komponenseket, a konfigurációt, az integrációt és a végső ellenőrzést.
- Két fejlesztő subagent párhuzamosan, szigorú fájltulajdonlással:
  - **A:** `src/features/home`, `src/features/sale`, mailto-teszt.
  - **B:** `src/features/email`, renderelési tesztek.
  - Mindkettő `claude-sonnet-5-5` modellen futott (saját jelentésük szerint).
- **Eltérés a brieftől:** a delegáló eszköz csak modellaliast enged (`sonnet`), effort-paramétert nem. A subagentek saját kontextusuk szerint **low** effort beállítással futottak, nem high-dal. Kitalált modellazonosítót vagy frontmatter-mezőt nem használtunk. A subagentek munkáját a fő agent átnézte, javította (pl. sablonfüggő mintaadat) és teljes tesztkörrel ellenőrizte.

## Integráció közben talált és javított hibák

- A belső útvonalnevek a közös `site.ts`-en keresztül a publikus kliens-bundle-be kerültek. Áthelyezve: `src/content/internal/routes.ts`.
- A nem publikus adatok (kapacitás, a korábbi ár megjegyzése) a publikus szerver-bundle-be kerültek. Szétválasztva: publikus rész `property.ts`, belső nyilvántartás `src/content/internal/fact-register.ts`.
- Kontraszt: a fókuszgyűrű, az input keret és a segédszöveg tokenje sötétebb lett. Sötét felületre külön fókuszszín került.
- A Next.js nem generál 1024 px-nél nagyobb képváltozatot, mivel a forrásképek 1024 px-esek.
- A demó kitöltés „személyes kapcsolódás” értéke a sablon mondattani helyéhez igazodik (mondatkezdő vagy mondatközi).

## Valódi hiányok

- **Új média:** a pendrive-os fotók és videó nincsenek feldolgozva (átvétel a tárgyaláson). Csere lépései: `docs/HVH_MEDIA_REPLACEMENT.md`.
- **Képminőség:** a jelenlegi képek 1024 px-es Booking-képek. A hero ezért osztott elrendezésű, nem teljes képernyős. A Booking-képek felhasználási joga tulajdonosi megerősítést igényel.
- **Adatok:** irányár, kapacitás, működési, műszaki és jogi háttér nincs megerősítve, ezért nem jelenik meg. Adatbekérési lista: `docs/HVH_CONTENT_SOURCES.md`.
- **Logó:** eredeti logó nem állt rendelkezésre; a wordmark ideiglenes.
- **Részletes tájékoztató:** memorandum, adatszoba vagy letölthető anyag nincs. Az oldal ilyet nem is ígér.
- **Domain:** nincs domain, ezért nincs canonical URL. Az oldal `noindex` (meta, `X-Robots-Tag`, `robots.txt`).
- **Kapcsolati cím:** a `sale@hotelvillahuber.com` működése (postafiók, továbbítás) nincs ellenőrizve. A demó nem küld levelet.
- **Hosting:** nincs. A futó előnézet a felhős munkakörnyezetben fut, kívülről nem érhető el. Helyi indítás: lásd fent.
- **Verziókezelés:** a brief szerint commit és push nem része ennek a körnek. A felhős munkakörnyezet viszont ideiglenes, és a munkamenet a kijelölt `claude/hotel-villa-huber-demo-qqrcvp` ágra mentést írja elő. Ezért a forráskód erre az ágra került. Pull request, merge és deploy nem történt.
