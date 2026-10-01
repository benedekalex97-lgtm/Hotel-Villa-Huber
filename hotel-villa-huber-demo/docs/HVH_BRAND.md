# Hotel Villa Huber — arculati döntések (v0.1)

Látható brand board: `docs/brand/HVH_BRAND_BOARD.png`. Élő változat a helyi, belső felületen: `/munka/brand` (csak `npm run dev` vagy belső build alatt).
Tokenek egyetlen forrása: `src/app/globals.css`.

## Irány

Nyugodt, karakteres karintiai villa-hotel, befektető számára hiteles bemutatással. A ház saját karaktere (sárga homlokzat, saroktorony, faragott fa, festett bútor) adja a hangulatot. A felület visszafogott: nagy valódi képek, világos hierarchia, kevés egymással versengő elem. Nincs luxusnyelv, csillogás vagy dekoratív effekt.

## Wordmark

- **Ideiglenes** Hotel Villa Huber wordmark: a Drive-on nem volt használható eredeti logó. Hivatalos brandjóváhagyás nincs. Nincs benne címer, alapítási év vagy kitalált történeti elem.
- Felépítés: ritkított „HOTEL” sor (Source Sans 3, bronz) a „Villa Huber” felett (Fraunces, mély zöld). Mindkét betűtípus SIL OFL licencű.
- Fájlok: `public/brand/hvh-wordmark.svg` (zöld), `-ink.svg` (sötét), `-light.svg` (sötét háttérre); favicon: `src/app/icon.svg` (VH monogram).
- A szöveg SVG-útvonalakra konvertált, így betűtípus nélkül is pontos. Újragenerálás: `npm run wordmark` (fonttools + brotli kell).
- Minimum szélesség 120 px. Védőtér: a „HOTEL” sor magassága.
- Ha az eredeti logó előkerül, az elsőbbséget élvez: a `Wordmark` komponens és az SVG-fájlok cserélhetők.

## Színek

| Token | Érték | Szerep |
|---|---|---|
| `--hvh-paper` | #F6F1E7 | meleg törtfehér alap |
| `--hvh-paper-deep` | #ECE4D4 | homok, váltott szekció |
| `--hvh-surface` | #FFFCF6 | kártya, input |
| `--hvh-forest` | #2C4636 | mély természetes zöld: elsődleges gomb, link |
| `--hvh-forest-strong` | #1F3427 | hover, sötét sáv, lábléc |
| `--hvh-bronze` | #9B6B3A | visszafogott akcentus (vonal, szám); kis szövegre nem |
| `--hvh-bronze-ink` | #7A5226 | bronz szövegként (eyebrow) |
| `--hvh-ink` / `-muted` / `-subtle` | #1E221F / #4A5049 / #5F645B | szöveg |
| `--hvh-line` / `-strong` | #D8CDB9 / #8C806B | elválasztó / input keret |
| `--hvh-focus` / `-on-dark` | #A46A26 / #E0BD8A | fókuszgyűrű világos / sötét alapon |

Kontraszt a törtfehér alapon (WCAG): tinta 14,3:1 · halvány tinta 7,4:1 · segédszöveg 5,4:1 · mély zöld 9,2:1 · bronz szöveg 6,1:1 · input keret 3,8:1 · fókuszgyűrű 4,0:1. Sötét zöldön a törtfehér szöveg 11,8:1.

## Tipográfia

- Címek: **Fraunces** (variable, optikai méretezés), 500-as vastagság. Karakteres, de olvasható serif, teljes magyar ékezetkészlettel (ő, ű).
- Törzsszöveg: **Source Sans 3** (variable), 17 px alap, 1,6 sorköz.
- Betöltés helyben, npm-csomagból (`@fontsource-variable/*`): nincs külső betűkérés, nincs Google Fonts hívás. Tartalék: Georgia / system-ui.
- Skála (fluid `clamp`): display 40→68 px, H1 34→52 px, H2 28→40 px, H3 20→24 px, lead 18→21 px, kicsi 15 px, eyebrow 13 px nagybetűs, 0,14 em ritkítással.

## Térköz és elrendezés

- 4 px alapú skála (`--hvh-space-1` … `-9`: 4 → 96 px).
- Szekció függőleges térköz: `--hvh-section-y` = clamp(56 → 112 px). Oldalsó margó: `--hvh-gutter` = clamp(16 → 40 px).
- Tartalom max. 1216 px. Olvasási szélesség 40 rem. Kép max. szélesség 1024 px (`--hvh-max-media`).

## Gombok, mezők, fókusz

- `.hvh-btn` (elsődleges, zöld), `--secondary` (körvonalas), `--ghost`, `--on-dark`, `--sm`. Min. magasság 48 px (kicsi: 40 px).
- Mezők: `.hvh-input`, `.hvh-select`, `.hvh-textarea`, `.hvh-choice` (rádió/checkbox kártya). 16 px betűméret (iOS nem nagyít). Hibás állapot: `aria-invalid="true"` → piros keret, mezőszintű `.hvh-error` szöveg.
- Fókusz: 3 px bronz körvonal 2 px eltolással minden interaktív elemen (`:focus-visible`). Sötét felületen (`.hvh-surface-dark`) világos bronz.
- Állapotüzenet: `.hvh-notice` (`--warning`, `--danger`, `--success`).

## Képek

- Arányok: hero és fekvő 3:2, széles 16:9, álló 4:5, négyzet 1:1 (`--hvh-ratio-*`).
- A meglévő Booking-képek 1024 px szélesek: nem nagyítjuk teljes képernyősre. A hero osztott elrendezésű, a kép a natív méretén belül marad. A Next.js legfeljebb 1024 px-es változatot generál.
- Vágás a manifest fókuszpontja szerint (`object-position`). Hiányzó képnél rendezett, cserére előkészített képhely jelenik meg.

## Mobil és mozgás

- Töréspontok: 390 px mobil, 768 px tablet, 960 px (fejléc-navigáció), 1440 px desktop. Nincs vízszintes túlcsordulás.
- Mobilon a navigáció lenyíló panel (Escape zárja, a fókusz visszatér a gombra). Érintési cél legalább 44 px.
- Mozgás: csak rövid színátmenet. `prefers-reduced-motion` esetén minden átmenet kikapcsol. Nincs automatikus hang, scroll hijack vagy dekoratív 3D.

## Belső felület

A `/munka/*` ugyanazokat a tokeneket használja, sűrűbb, munkára alkalmas elrendezéssel: kisebb fejléc, „Belső · helyi használat” jelölés, többhasábos szerkesztő.
