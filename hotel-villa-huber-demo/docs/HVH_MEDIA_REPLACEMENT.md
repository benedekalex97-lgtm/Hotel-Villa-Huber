# Médiacsere — a pendrive-os fotók és videók beépítése

A demó jelenleg a Booking-exportból származó, legfeljebb 1024 px-es képekre épül (`public/media/booking-export/`). Az új fotó- és videóanyag elkészült, de a pendrive-ot csak a tárgyaláson kapjuk meg. **Az új médiát ebben a körben nem dolgoztuk fel.**

Minden kép egyetlen helyen van nyilvántartva: `src/content/media.ts`.

- `MEDIA`: a kép-nyilvántartás (src, alt, caption, sourceFile, forrás, generáció, méret, fókuszpont, belső megjegyzés).
- `MEDIA_SLOTS`: melyik oldalhelyen melyik kép jelenik meg (`home.hero`, `home.villa`, `home.location`, `home.saleTeaser`, `booking.hero`, `sale.hero`, `sale.property`).
- `GALLERY`: a galéria sorrendje (jelenleg 12 kép).
- A szobák és szolgáltatások képeit a `src/content/guest.ts` (`ACCOMMODATION`, `GUEST_SERVICES`) a `MEDIA` azonosítóival hivatkozza; cserénél ott is az azonosítót kell átírni.

Az oldalak a képeket kizárólag ezeken keresztül érik el, ezért **a cseréhez kódot nem kell módosítani**.

## Lépések

1. **Másolás.** Az eredeti fájlok a Drive-ra kerülnek, változatlanul (javasolt hely: `01_SOURCE_MATERIALS/06_ORIGINAL_IMAGES/PENDRIVE_2026-10/`). Webes példány: `public/media/pendrive-2026-10/`. A GitHub Pages-kiadásban nincs szerveres képoptimalizálás (a fájlok változatlanul mennek ki), ezért a webes példányt előre méretezd és tömörítsd. Az eredeti fájlnevet tartsd meg, vagy rögzítsd a `sourceFile` mezőben.
2. **Előkészítés.** Fekvő képeknél a hosszabbik oldal 2400–3000 px, JPEG minőség ~85, sRGB, EXIF/GPS törölve. Például: `convert be.jpg -resize 3000x3000\> -strip -quality 85 ki.jpg`. A Next.js ebből generál reszponzív WebP/AVIF változatokat. Vágás és tömörítés megengedett. A látható állapotot (tárgyak, felújítás, ég, évszak) megváltoztatni tilos. Generatív kitöltés sem megengedett.
3. **Nyilvántartás.** Új elem a `MEDIA` objektumban:
   ```ts
   "facade-summer-2026": {
     id: "facade-summer-2026",
     src: "/media/pendrive-2026-10/IMG_1234.jpg",
     alt: "A villa homlokzata …",          // mit lát a néző, tényszerűen
     caption: "A villa homlokzata",        // rövid, nyilvános
     sourceFile: "IMG_1234.jpg",
     source: "SRC-PENDRIVE-2026-10",       // új forrásazonosító: types.ts SourceId + sources.ts
     generation: "pendrive-2026-10",
     width: 3000, height: 2000,            // a webes fájl valós mérete (identify)
     focal: { x: 50, y: 55 },              // a lényeges rész százalékban
   },
   ```
4. **Bekötés.** Írd át a megfelelő `MEDIA_SLOTS` értéket, illetve a `GALLERY` listát az új azonosítókra. A régi elemek maradhatnak a manifestben tartalékként.
5. **Nagy hero.** Ha a hero helyére legalább 2400 px-es fotó kerül, a `--hvh-max-media` token (most 64 rem = 1024 px) feljebb vehető. Ekkor a `next.config.ts` `deviceSizes` listáját is bővítsd (pl. 1280, 1920).
6. **Ellenőrzés.** `npm run typecheck && npm test`, majd nézd meg a `/` és az `/elado-hotel` oldalt 390, 768 és 1440 px-en (`node scripts/shot.mjs …`). Ellenőrizd a fókuszpontot és az alt szövegeket.

## Videó

A videó beépítése ebben a körben nincs megvalósítva. Javaslat: saját hosztolású MP4/WebM, `controls`, automatikus lejátszás és hang nélkül, posterképpel, felirattal. YouTube vagy más külső beágyazás nem javasolt, mert sütit és követést hozna.

## Felhasználási szabályok (maradnak)

- **Tilos:** `34324365.jpg`. Idegen vár és motoros, nem a hotel.
- **Most nem használható:** `19333173.jpg`, `34324366.jpg`. Tóképek, eredetük tisztázatlan, felismerhető személyek is láthatók rajtuk.
- Kimarad minden kép, amelyen felismerhető vendég vagy domináns idegen márka látható: `19332729.jpg`, `19333312.jpg`, `12692912.jpg`, `34324376.jpg`. Ebben a körben a `19332807.jpg` és a `38851000.jpg` is kimaradt a reklámtáblák, illetve a vágás miatt.
- Nem készítünk generált „felújított” szobát, kitalált medencét, drón- vagy panorámaképet.
- A pendrive-os anyag felhasználási jogát (fotós szerződés, licenc) rögzítsd a `sources.ts`-ben.

## Jelenleg felhasznált képek (18 db, mind a Booking-exportból)

| Manifest-azonosító | Fájl | Méret | Fő felhasználás |
|---|---|---|---|
| facade-summer | 19333297.jpg | 1024×659 | főoldal hero, eladási ingatlanbemutató |
| facade-valley | 19333057.jpg | 1024×660 | „A hotel”, eladási hero, galéria |
| terrace | 19332795.jpg | 1024×703 | szolgáltatások, foglalás oldal, galéria |
| terrace-loungers | 87276588.jpg | 1024×683 | galéria |
| corridor | 87275722.jpg | 1024×683 | galéria |
| staircase | 34324379.jpg | 1024×768 | galéria |
| salon | 38856066.jpg | 1024×691 | szolgáltatások, galéria |
| room | 125610505.jpg | 1024×683 | szobák, galéria |
| room-double | 87275827.jpg | 1024×683 | szobák |
| room-family | 34324370.jpg | 1024×768 | szobák, galéria |
| room-living | 34324368.jpg | 1024×768 | szobák |
| bathroom | 125610447.jpg | 1024×683 | szobák, galéria |
| restaurant | 38851398.jpg | 515×768 | szolgáltatások (álló, csak kis méretben) |
| bar | 34324381.jpg | 1024×768 | szolgáltatások, galéria |
| sauna | 87275544.jpg | 1024×683 | szolgáltatások, galéria |
| sauna-bench | 34324380.jpg | 1024×768 | tartalék |
| facade-winter-dusk | 38856055.jpg | 1024×642 | galéria, eladási átvezetés |
| afritz-sign | 79475626.jpg | 960×720 | környék (nem a hotelt ábrázolja) |

Megjegyzés: a képinventár a `34324375.jpg`-t „összenyitható szobák”-ként írja le, de a fájl ténylegesen csillárt ábrázol — ezért nincs felhasználva; az inventárt javítani kell.

## Hiányzó képek, amelyeket a pendrive-tól várunk

A brief szerint az új anyag elkészült. Ezek a jelenetek a mostani állományból hiányoznak vagy gyengék:

- nagy felbontású homlokzat (a mostani hero 1024 px);
- étterem és bár üresen, rendezetten (a meglévő képek elavult tapétát, illetve 500×500 px-es vágást mutatnak);
- több szobatípus (családi, összenyitható, lakosztály);
- wellness/szauna kellékhiba nélkül;
- telek, kert, parkoló;
- légi/drónfelvétel (csak ha valóban elkészült);
- lokációs képek, igazolt eredettel.
