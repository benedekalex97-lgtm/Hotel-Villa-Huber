<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hotel Villa Huber — projektszabályok (v2.1 scope, 2026-10-01)

- Master nyelv: magyar, magázó („Ön”) hangnem; nyugodt, tényszerű.
- Publikus útvonalak: `/` (vendégoldal), `/foglalas` (foglalási DEMÓ), `/elado-hotel` (eladási landing + ajánlatkérő). Belső: `/munka/*` (`*.internal.tsx`, publikus buildben nincs).
- Ingatlanadat csak a `src/content/*` modulokból jöhet (`property.ts` PUBLIC_FACTS, `guest.ts`, `sales.ts`, `media.ts`, `site.ts`). A `src/content/internal/*` modult publikus kód nem importálhatja.
- Nem megerősített adat csak az állapotcímkéjével együtt jelenhet meg (`publicFactView()` → `statusLabel`). Korábbi nyilvános közlést nem nevezünk ellenőrzöttnek.
- Tilos: irányár szám (csak „Irányár és értékesítési feltételek egyeztetés alapján.”), hozam/megtérülés, állapotminősítés, felújítási költség, engedély-állítás, épület/telekméret, építési év, menetidő/távolság (kivéve a forrásolt, jelölt tó-távolság), ski-in/ski-out, luxus, garantált eladás/hozam, azonnal átvehető üzemeltetés, leszerződött üzemeltető, kész memorandum/adatszoba/letöltés, saját díjaink.
- Vendégoldal: nincs kitalált szobatípus, ár, felszereltség, nyitvatartás. Vendégkapcsolat csak `GUEST_CONTACT`-ból (most null) — a sale@ cím értékesítési cím, nem vendégfoglalási.
- Foglalás: kizárólag demó. `BOOKING_DEMO_NOTICE` a widgetnél és a lezárásnál; nincs fizetés, nincs valódi visszaigazolás, vendégadat csak React-állapotban.
- Nincs tracker, cookie-banner, külső beágyazás, localStorage/sessionStorage személyes adattal, console.log személyes adattal.
- Design tokenek és alaposztályok: `src/app/globals.css` (`.hvh-*`, `.hvh-surface-dark`). Komponensstílus CSS Modules-szal, a saját feature-mappában.
- Képek: `MEDIA`, `MEDIA_SLOTS`, `GALLERY` (`src/content/media.ts`), megjelenítés `MediaImage`-dzsel; natív szélesség ≤ 1024 px, nem nyújtjuk teljes képernyősre.
- Ellenőrzés: `npm run typecheck`, `npm run lint`, `npm test`; képernyőkép: `node scripts/shot.mjs <url> <png> <szélesség> <full>`.
