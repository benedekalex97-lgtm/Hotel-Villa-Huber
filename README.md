# Hotel Villa Huber

A Hotel Villa Huber (Afritz am See, Karintia) weboldala:

- `/` — vendégeknek szóló hotelweboldal;
- `/foglalas` — bemutató foglalási folyamat (valódi foglalás nem történik);
- `/elado-hotel` — teljes eladási tájékoztató ajánlatkérővel;
- `/munka/email` — belső emailsablon-szerkesztő, csak helyben.

A projekt a [`hotel-villa-huber-demo/`](hotel-villa-huber-demo/) mappában van (Next.js + TypeScript).

Production: **https://hotel-villa-huber-hotel-villa-huber.vercel.app** (Vercel, a gyökérkönyvtár `hotel-villa-huber-demo`). Tartalék statikus kiadás: GitHub Pages, kézi workflow-val.

```bash
cd hotel-villa-huber-demo
npm install
npm run dev   # http://localhost:3000
```

Dokumentáció:

- [build riport](hotel-villa-huber-demo/docs/HVH_BUILD_REPORT.md)
- [források és megerősítendő adatok](hotel-villa-huber-demo/docs/HVH_CONTENT_SOURCES.md)
- [médiacsere](hotel-villa-huber-demo/docs/HVH_MEDIA_REPLACEMENT.md)
- [arculat](hotel-villa-huber-demo/docs/HVH_BRAND.md)
- [screenshotok](hotel-villa-huber-demo/docs/screenshots/)
