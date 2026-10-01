<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hotel Villa Huber demó — projektszabályok

- Master nyelv: magyar, magázó („Ön”) hangnem; nyugodt, tényszerű.
- Ingatlanadat csak a `src/content/*` modulokból jöhet. Publikus oldal kizárólag `visibility: "public"` adatot jeleníthet meg; a `src/content/internal/*` modult publikus kód nem importálhatja.
- Tilos állítani vagy megjeleníteni: irányár, hozam, megtérülés, állapotminősítés, felújítási költség, engedélyek, építési év, kapacitásszámok (szoba, férőhely, étterem, parkoló), ski-in/ski-out, luxus, garantált eladás vagy hozam, azonnal átvehető üzemeltetés, leszerződött üzemeltető, kész memorandum vagy adatszoba, menetidő, tóparti tulajdon, sípálya-kapcsolat.
- Nincs foglalás, szobaár, elérhetőségi naptár, éttermi nyitvatartás, tracker, cookie-banner, külső beágyazás.
- Nyilvános szövegben nem szerepelhet belső kommentár, TBD/NULL, „megerősítendő”, modellnév vagy megvalósítási magyarázat.
- Design tokenek és alaposztályok: `src/app/globals.css` (`.hvh-*`). Komponensstílus CSS Modules-szal, a saját feature-mappában.
- Képek: `MEDIA`, `MEDIA_SLOTS`, `GALLERY` a `src/content/media.ts`-ből, megjelenítés a `MediaImage` komponenssel. A képek natív szélessége ≤ 1024 px: nem nyújtjuk teljes képernyősre.
- Belső útvonalak (`/munka/*`) fájljai `*.internal.tsx` végűek; publikus buildben nem épülnek be.
- Ellenőrzés: `npm run typecheck`, `npm run lint`, `npm test`; képernyőkép: `node scripts/shot.mjs <url> <png> <szélesség> <full>`.
