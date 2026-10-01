# Hotel Villa Huber — build riport (v2.1)

Állapot: 2026-10-01 · ág: `claude/hotel-villa-huber-demo-qqrcvp`

## Röviden

- **Útvonalak:** három nyilvános útvonal (`/`, `/foglalas`, `/elado-hotel`) és két belső (`/munka/email`, `/munka/brand`).
- **Ellenőrzések:** minden lefuttatott ellenőrzés sikeres. Ide tartozik a GitHub Actions CI is: typecheck, lint, egységtesztek, statikus build, szivárgásellenőrzés és 23/23 e2e.
- **Production:** a kiadás egy repóbeállításon áll. Be kell kapcsolni a GitHub Pages-t (Source: GitHub Actions), és újra kell futtatni a workflow-t. Részletek lent, a „Production-kiadás” részben.

## Mi készült

| Útvonal | Tartalom | Kiadás |
|---|---|---|
| `/` | Vendégeknek szóló hotelweboldal: hero, a hotel, szobák (valódi képek, nem hivatalos kategóriák), élmények és szolgáltatások, 12 képes galéria lightboxszal, környék, foglalási widget, diszkrét átvezetés az eladási oldalra, kapcsolat | nyilvános |
| `/foglalas` | Végigkattintható foglalási **demó**: időpont → vendégek → elérhetőség és elhelyezés (mintaadat) → vendégadatok → összesítő → „Demó befejezése” | nyilvános |
| `/elado-hotel` | Teljes vevői tájékoztató A–L szekciókkal és ajánlatkérővel | nyilvános |
| `/api/ajanlatkeres` | Szerveroldali ajánlatkérő-végpont | csak Node-hosztingon; a statikus Pages-kiadásban nincs |
| `/munka/email`, `/munka/brand` | Belső emailsablon-szerkesztő és brand board | csak helyben vagy belső buildben; a nyilvános kiadásban nincs |

### Az eladási landing (`/elado-hotel`) szekciói

| | Szekció | Tartalom |
|---|---|---|
| A | Összefoglaló | valódi kép, fő CTA: „Részletes bemutatót és egyeztetést kérek”; a CTA a tartalom utáni ajánlatkérőre visz |
| B | Ingatlanadatok | minden adat állapotcímkével (Megerősített / Korábbi nyilvános közlés / Tulajdonosi közlés / Egyeztetés tárgya), jelmagyarázattal; méret, építési év, műszaki állapot és engedélyek egyeztetési témaként |
| C | A ház és terei | |
| D | Környék | |
| E | Működés | tulajdonosi közlés a 2026-os nyárról; tisztázandó elemek; a retreat lehetséges irányként, nem ígéretként |
| F | Kinek lehet érdekes? | a négy célcsoport |
| G | Két vásárlási út | |
| H | Feltételek | „Irányár és értékesítési feltételek egyeztetés alapján.” |
| I | Dokumentumok és megtekintés | nincs letöltés, nincs adatszoba-állítás |
| J | GYIK | |
| K | Folyamat | |
| L | Ajánlatkérő | |

Mobilon egy diszkrét, ragadós CTA-sáv is megjelenik.

### A foglalási demó bemutatási menete (kb. 2 perc)

1. **Indítás.** A főoldalon a „Foglalási lehetőségek” gombbal a foglalási blokkhoz jut. Látható a jelölés: „Bemutató foglalási folyamat — valódi foglalás nem történik.”
2. **Keresés.** Válasszon dátumot és vendégszámot, majd nyomja meg az „Elérhetőség megtekintése” gombot. Ez átvisz a `/foglalas` oldalra, előtöltött adatokkal.
3. **Elhelyezés.** A mintaadatos elhelyezések valódi hotelképekkel jelennek meg, „Mintaadat” jelöléssel és ár nélkül. Válasszon egyet.
4. **Vendégadatok.** Töltse ki az űrlapot. A validáció mezőszinten jelez; a lépésjelzővel visszalépve minden adat megmarad.
5. **Lezárás.** Az összesítő után nyomja meg a „Demó befejezése” gombot. Ez nem foglal, nem küld és nem igazol vissza; az adatok a lap bezárásával elvesznek.

Felépítés (`src/features/booking/`):

- `model.ts`: típusok és validáció;
- `provider.ts`: `BookingProvider` interfész;
- `demo-data.ts` és `demo-provider.ts`: a demó mintaadat-forrása;
- `provider-registry.ts`: ezen keresztül köthető be később valódi foglalómotor, a felület újraépítése nélkül;
- UI-komponensek.

### Ajánlatkérő — tényleges működési státusz

- **Mezők:** név, email, telefon (opcionális), cég (opcionális), érdeklődési irány, kérés, üzenet. Teljes validáció kliensen és szerveren ugyanazzal a kóddal (`src/features/inquiry/schema.ts`).
- **Jelenlegi mód: mailto.** Nincs konfigurált küldő backend. A gomb felirata „Email előkészítése”: megnyitja a látogató levelezőjét a `sale@hotelvillahuber.com` címre előkészített levéllel. Mellette másolási alternatíva és újranyitó link van. „Elküldve” állapot nem jelenik meg.
- **Szerveres mód (kész, kikapcsolva):** `POST /api/ajanlatkeres`. Tartalmaz:
  - 16 KB-os méretkorlátot és JSON-ellenőrzést;
  - honeypot mezőt és minimális kitöltési időt;
  - IP-alapú korlátot (best-effort);
  - szerveroldali validációt;
  - a személyes adatok naplózásának tilalmát.
  
  Sikert csak a provider 2xx válasza után jelez („továbbítottuk”), ami nem igazolt postafiók-kézbesítés. Hibánál hibaüzenet és mailto-alternatíva jelenik meg. Kipróbálva mockolt elfogadás és hiba esetén, valamint valódi, elérhetetlen webhookkal.
- **A szerveres küldés bekapcsolásához szükséges:**
  1. **Node-futtatókörnyezet.** A GitHub Pages statikus, ott API nem fut. Ehhez Vercel-projekt kell (a gyökérkönyvtár `hotel-villa-huber-demo`), vagy más Node-hoszt.
  2. **Provider-beállítás** szerveroldali környezeti változókban (nem `NEXT_PUBLIC_`):
     - **Resend:** `INQUIRY_PROVIDER=resend`, `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`. A feladó domainje legyen hitelesítve a Resendben (például `hotelvillahuber.com` DNS-rekordokkal; ezt a tulajdonosnak kell jóváhagynia).
     - **Webhook:** `INQUIRY_PROVIDER=webhook`, `INQUIRY_WEBHOOK_URL` (HTTPS), opcionálisan `INQUIRY_WEBHOOK_SECRET`.
  3. **Új build.** A mód buildkor dől el az `/elado-hotel` oldalon.
  4. **Postafiók-ellenőrzés.** Meg kell erősíteni, hogy a `sale@hotelvillahuber.com` postafiók létezik és fogad levelet.

## Production-kiadás

**Választott hoszting: GitHub Pages.** A repó nyilvános, a Pages ingyenes, és a meglévő jogosultságokkal elérhető. URL a bekapcsolás után: **https://benedekalex97-lgtm.github.io/Hotel-Villa-Huber/**

- **Workflow:** `.github/workflows/pages.yml`. Pushra fut a munkaágon, vagy kézzel indítható. Lépései:
  1. typecheck, lint és egységtesztek;
  2. statikus build (`HVH_STATIC_EXPORT=1`, basePath `/Hotel-Villa-Huber`);
  3. szivárgásellenőrzés;
  4. e2e a statikus csomagon, Pages-szerű kiszolgálóval;
  5. feltöltés és deploy.
- **A kiadásba nem kerül be:** `/munka/*`, az API, a proxy, a belső díjak, az árak és a közvetítői adatok. Ezt a build szintje és a `verify:pages` ellenőrzés is garantálja.

**Blokkoló, ami a production URL-t még megakadályozza:**

- **GitHub Pages nincs bekapcsolva a repóban.** A workflow `GITHUB_TOKEN`-je nem hozhatja létre a Pages-oldalt („Create Pages site failed — Resource not accessible by integration”, run #1, 2026-10-01 05:22 UTC). A munkakörnyezet proxyja a Pages API-t tiltja.
- **Teendő (egyszeri, kb. 1 perc):**
  1. GitHub → Hotel-Villa-Huber → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
  2. Actions → „Production — GitHub Pages” → Run workflow (ág: `claude/hotel-villa-huber-demo-qqrcvp`), vagy a legutóbbi futás újraindítása.
  3. Ha a Settings → Environments → `github-pages` környezet ágkorlátozást kér, engedélyezni kell rajta a `claude/hotel-villa-huber-demo-qqrcvp` ágat.

**Vercel (nem sikerült):**

- A Vercel-connector a csapatban nem hozhat létre projektet („You don't have permission to create the project”, 403). Git-alapú deploymenttel sem: „You don't have permission to create a project”.
- A Vercel API a munkakörnyezetből hálózatilag nem érhető el.
- Meglévő, más ügyfélhez tartozó Vercel-projektet szándékosan nem használtunk.

**Pull request és merge:**

- A repóban csak a munkaág létezik (ez az alapértelmezett ág); `main` vagy más alapág nincs, ezért PR nem nyitható.
- A `main` ág létrehozását (orphan commitból, illetve az első commitra mutató push-sal) a munkakörnyezet biztonsági szabálya romboló git-műveletként letiltotta.
- Megoldás: a felhasználó létrehoz egy alapágat (pl. `main` a c528551 commitból), ezután a PR megnyitható. A Pages-kiadáshoz merge nem szükséges, mert a workflow a tesztelt munkaágból dolgozik.

## Indítás helyben

```bash
cd hotel-villa-huber-demo
npm install
npm run dev                                       # http://localhost:3000 — minden útvonal, a belsők is
npm run build:public && npm run start:public      # Node-kiadás API-val: http://localhost:3100
npm run build:internal && npm run start:internal  # belső: http://localhost:3101/munka/email
npm run build:pages && node scripts/serve-static.mjs 3200   # Pages-kiadás: http://localhost:3200/Hotel-Villa-Huber/
```

## Ellenőrzések (2026-10-01)

| Ellenőrzés | Eredmény |
|---|---|
| `npm run typecheck`, `npm run lint` | hibátlan (helyben és CI-ban) |
| `npm test` (vitest) | 7 fájl, 51 teszt — sikeres (helyben és CI-ban) |
| `npm run build:public` + `verify:public` | sikeres; Node-kiadás: `/`, `/foglalas`, `/elado-hotel`, `/api/ajanlatkeres`, proxy |
| `npm run build:internal` | sikeres; `/munka/email`, `/munka/brand` |
| `npm run build:pages` + `verify:pages` | sikeres; statikus oldalak: `/`, `/foglalas/`, `/elado-hotel/`, 404; `/munka` és API nincs |
| Playwright, Node-kiadások (publikus + belső) | 26/26 sikeres |
| Playwright, statikus Pages-kiadás basePath alatt (helyben és CI-ban) | 23/23 sikeres |
| Ajánlatkérő szerveres mód (mock elfogadás, mock hiba, valódi elérhetetlen webhook) | elfogadásnál siker, hibánál hibaüzenet és mailto-alternatíva |
| Vízszintes túlcsordulás: `/`, `/foglalas`, `/elado-hotel`, `/munka/email` × 390 és 1440 px | 0 px |
| Production URL ellenőrzése | **nem futott** — a Pages még nincs bekapcsolva (lásd a blokkolót) |

Mit fednek le a tesztek:

- **Foglalás:** minden lépés; dátum- és létszámvalidáció; visszalépés adatmegőrzéssel; nincs `/api` kérés; nincs „sikeres foglalás”; demó-jelölés a widgetnél és a lezárásnál.
- **Eladási landing:** A–L sorrend; a CTA az ajánlatkérőre visz; pontos ársor, árszám és euró nélkül; minden adat állapotcímkével; GYIK billentyűzettel; ajánlatkérő-validáció és mailto mód.
- **Belső felület:** a `/munka/*` 404 a publikus kiadásokban.
- **Emailszerkesztő:** külön címzett és aláíró, kézi szerkesztés megőrzése, visszaállítás, vágólap.

Nem futott:

- Firefox és Safari;
- automatizált akadálymentességi audit (axe) és Lighthouse;
- valódi levelezőkliens megnyitása;
- valódi email-provider (nincs konfigurálva).

## Munkamód és modellek

- **Fő agent:** `claude-opus-5-5`, high effort (session-beállítás). Ő végezte az adatmodellt és a tartalmat, a navigációt, az ajánlatkérő-backendet, a kiadási módokat, a workflow-t, az integrációt és az ellenőrzést.
- **Két subagent** (`claude-sonnet-5-5`, saját jelentésük szerint) dolgozott párhuzamosan, külön fájltulajdonlással:
  - **A:** vendégoldal és foglalási demó;
  - **B:** eladási landing és ajánlatkérő-frontend.
- **Effort:** a delegáló eszköz nem állít be effortot. A B agent kontextusa „low”-t jelzett, az A agenté nem jelzett szintet. Ezért nem állítjuk, hogy high volt. A munkájukat a fő agent átnézte, javította és teljes tesztkörrel ellenőrizte.

## Valódi hiányok

- **Production:** a GitHub Pages bekapcsolása (felhasználói beállítás, lásd fent).
- **PR:** alapág hiányzik (lásd fent).
- **Ajánlatkérő:** szerveres küldéshez Node-hoszt, provider-kulcs és hitelesített feladó kell; a `sale@` postafiók működése nincs ellenőrizve.
- **Vendégkapcsolat:** nincs megerősített vendégkapcsolati email vagy telefonszám. A `NEXT_PUBLIC_GUEST_EMAIL` és `NEXT_PUBLIC_GUEST_PHONE` változóval adható meg; addig az oldal ezt semlegesen jelzi.
- **Adatok:** minden kapacitás- és szolgáltatásadat korábbi nyilvános közlés, tulajdonosi megerősítés nélkül. Ár, méret, építési év, műszaki és jogi háttér egyeztetés tárgya (lásd `HVH_CONTENT_SOURCES.md`).
- **Média:** a pendrive-os média nincs feldolgozva; a képek 1024 px-esek (`HVH_MEDIA_REPLACEMENT.md`).
- **Statikus hosztolás:** nincs `X-Robots-Tag` fejléc. A `noindex` meta és a `robots.txt` megmarad; mivel a `robots.txt` basePath alatt van, a domain gyökerében nem hat.
