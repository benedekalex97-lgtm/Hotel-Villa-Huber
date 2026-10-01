# Tartalmi források és megerősítendő adatok

A gépi nyilvántartás: `src/content/sources.ts`, `src/content/property.ts`, `src/content/media.ts`, `src/content/sales.ts`. Ez a dokumentum ennek olvasható összefoglalója.

## Elsőbbségi sorrend

1. A 2026-09-30-i megvalósítási brief és a felhasználó új utasításai határozzák meg a build scope-ot.
2. A szeptember 30-i elfogadott anyagok (célcsoport, stratégia, emailek) frissebbek a szeptember 21–25-i projektarchívumnál.
3. Elavult ebben a körben: az EN/DE elsődleges nyelv és a kötelező újrafotózás mint előfeltétel. A master nyelv magyar.

## Felhasznált források

Mindegyiket a hitelesített Google Drive-connectoron keresztül olvastuk, 2026-10-01-én.

| Azonosító | Forrás | Mire használtuk |
|---|---|---|
| SRC-BRIEF-0930 | Megvalósítási brief v1.0 (2026-09-30) | scope, tiltott állítások, alapadatok, sablonszöveg |
| SRC-CELCSOPORT-V1 | [Célcsoport — tárgyalási változat v1.0](https://docs.google.com/document/d/1FUHAk9xFCvQBSAxeHw8m5UxAa06ocGYCpXYEaMehUNE/edit) | a négy célcsoport („Miért lehet érdekes?”, „Fő kérdése”), a négy szűrő |
| SRC-STRATEGIA-V1 | [Értékesítési stratégia v1.0](https://drive.google.com/file/d/1bQWwRENJ7luRvfw8E34NN_K_ZJsS9bA9/view) | két vásárlási út, az érdeklődő útja, első egyeztetés témái |
| SRC-EMAILEK-V1.1 | [Megkereső emailek v1.1](https://drive.google.com/file/d/1YtcHHitKvgR9OD-pY-WPtOBGZIdt6opW/view) | a három sablon. A szöveg betű szerint egyezik a brief 8. pontjával. |
| SRC-KOLTSEGTERV-V0.2 | [Költség- és díjjavaslat v0.2](https://drive.google.com/file/d/1fdInPeJOUxhY46K1ora_q6hdgSqkD2AP/view) | csak belső háttér (`src/content/internal/commercial.ts`); nyilvános oldalra nem kerül |
| SRC-KEPINVENTAR-V2 | [06_IMAGE_ASSET_INVENTORY v2.0](https://drive.google.com/file/d/16BQ3mL75hKyM9DkyV1bEd3Rqem19eg_9/view) | képválasztás, kizárások, kockázatok |
| SRC-BOOKING-EXPORT | [Képmappa (45 JPG)](https://drive.google.com/drive/folders/1a4UhWIlj2wX-O2-nFOe7Y6pZilxmXy8l) | a 10 felhasznált kép. Mindegyiket megnyitottuk és vizuálisan ellenőriztük. |
| — | 00_SOURCE_SEED_LIST.md | háttér: a régi nyilvános források listája. Ezeket ebben a körben nem nyitottuk meg újra. |

A Drive-hivatkozások belső jegyzetek, nem kép-URL-ek. A képek helyi másolatként szerepelnek a `public/media/` alatt.

## Adatállapotok

`jóváhagyott` · `nyilvános közlés, megerősítendő` · `tulajdonosi közlés` · `ismeretlen`. A jóváhagyást nem következtetjük ki pusztán abból, hogy egy fájl létezik.

### Nyilvános oldalon megjelenik

| Adat | Érték | Állapot | Forrás |
|---|---|---|---|
| Név | Hotel Villa Huber | jóváhagyott | brief |
| Helyszín | Afritz am See, Karintia, Ausztria | jóváhagyott | brief |
| Jelleg | karintiai villa-hotel | jóváhagyott | brief |
| Kapcsolati cím | sale@hotelvillahuber.com | jóváhagyott | brief (kapcsolati cím, nem integrált fiók) |
| Vásárlási utak | saját üzemeltetés / szakmai partner | jóváhagyott | stratégia (a partnermodell lehetőség) |
| Fotókon látható terek | homlokzat és kert, fedett terasz, lépcsőház, folyosó és recepció, szalon, vendégszoba, szauna | nyilvános közlés, megerősítendő | Booking-képek: a terek léte látszik, az aktuális állapotuk nem igazolt |

### Nem jelenik meg, megerősítésre vár

| Adat | Ismert érték | Állapot | Megjegyzés |
|---|---|---|---|
| Működés 2026 nyarán | a tulajdonos szerint működött | tulajdonosi közlés | nem bizonyítja a nyitvatartást, foglalhatóságot vagy éves működést |
| Szobák | 14 | nyilvános, megerősítendő | régi nyilvános közlés |
| Férőhely | kb. 45 | nyilvános, megerősítendő | régi nyilvános közlés |
| Étterem | 50 fős | nyilvános, megerősítendő | régi nyilvános közlés |
| Wellness | wellness-rész (szauna a képeken) | nyilvános, megerősítendő | régi nyilvános közlés |
| Parkoló | kb. 35 autó + busz | nyilvános, megerősítendő | régi nyilvános közlés |
| Üzemeltető | nincs leszerződött | jóváhagyott (belső) | megállapodást csak akkor mutatunk be, ha valóban létrejött |
| Irányár | — | ismeretlen | a korábbi 1,2 M EUR (hirdetésben 1,25 M EUR) nem jóváhagyott aktuális ár |
| Hozam / pénzügyi eredmény | — | ismeretlen | |
| Állapotminősítés | — | ismeretlen | a képek alapján a belső dekoráció régebbi generációs; ez nem minősítés |
| Felújítási költség | — | ismeretlen | |
| Magánhasználati / átalakítási engedély | — | ismeretlen | |
| Építési év | — | ismeretlen | |
| Működési, műszaki, jogi dokumentáció | hiányos | jóváhagyott (belső) | |

### Belső háttér: nem kerül a vevőknek szánt oldalra

Ajánlati tervezet, nem elfogadott szerződés (`SRC-KOLTSEGTERV-V0.2`): indulási díj 250 000 Ft nettó, havi díj 150 000 Ft nettó, javasolt sikerdíj 2% a munkadíjak beszámításával. Az első 90 nap nem garantált eladási határidő. A `npm run verify:public` ellenőrzi, hogy ezek az értékek nincsenek benne a publikus buildben.

## Adatbekérési lista a tulajdonostól

1. Aktuális irányár, vagy döntés arról, hogy legyen-e nyilvános ár.
2. Kapacitás: szobák száma és típusa, férőhely, étterem- és bárkapacitás, wellness-tartalom, parkoló. Ezek a megerősítésig nem jelennek meg.
3. A 2026-os működés: időszak, foglaltság, üzemeltetési forma, személyzet.
4. Pénzügyi háttér: árbevétel, költségek, az elmúlt 3 év eredménye.
5. Műszaki állapot: felújítások éve és tartalma, gépészet, tető, ismert hibák.
6. Jogi háttér: tulajdoni lap, terhek, övezeti besorolás, szállodai üzemeltetési és esetleges átalakítási engedélyek, építési év.
7. Átadható eszközök: berendezés, márkanév, domain, weboldal, OTA-fiókok.
8. A korábbi nyilvános eladási hirdetések (Nest Beyond Borders, Instagram, Facebook) státusza és összehangolása.
9. Képek és videó felhasználási joga, beleértve a Booking-képeket és az új, pendrive-os anyagot.
10. Hivatalos logó vagy arculati elem, ha van.
11. Pontos cím, és hogy megjelenhet-e nyilvánosan. A mostani oldal csak a települést nevezi meg.
