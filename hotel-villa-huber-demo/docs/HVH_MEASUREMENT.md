# GA4 és Meta Pixel

Előkészített integráció, azonosítók nélkül kikapcsolva. Vercel build-környezet:

- NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…
- NEXT_PUBLIC_META_PIXEL_ID=… (számjegyek)

Az azonosítók beállítása után új build és production deploy szükséges. Publikus azonosítók, nem API-kulcsok. Ellenőrizzük a tulajdonos adatkezelési tájékoztatóját a választott szolgáltatásokkal, majd teszteljük elfogadás, elutasítás és visszavonás mellett. A GA4 Enhanced Measurement automatikus űrlap- és oldalváltásmérését kapcsoljuk ki; a saját eseményeket használjuk. A Meta automatikus eseményfelismerése és advanced matching maradjon kikapcsolva.

## Hozzájárulás

Külön GA4 és Meta választás, alapból mindkettő tiltott. Külső script csak a kiválasztott szolgáltatáshoz töltődik be. A választás 180 napig él, bármikor visszavonható. LocalStorage csak a választást őrzi. A foglalási demó és a belső oldalak nem adnak mérési eseményt. A Pixel queryt vagy hash-t tartalmazó URL-en nem töltődik be, mert saját maga is olvassa a lap URL-jét. Kampánykövetéshez ezért GA4 UTM-riport és a megkeresések forrásnyilvántartása szükséges; Pixel lefedettsége részleges. GA4 oldal-URL: origin + pathname, query és hash nélkül.

## Események

| Esemény | Jelentés | Valódi érdeklődő? |
| --- | --- | --- |
| page_view | Vendégoldal / értékesítési landing megtekintése | Nem |
| sale_cta_click | Ajánlatkérőre vezető CTA | Nem |
| form_start | Első kézi mezőváltoztatás | Nem |
| inquiry_mailto_open | Levelező megnyitásának kísérlete | Nem, elküldés nem ellenőrizhető |
| inquiry_copy | Előkészített levél vagy címzett sikeres másolása | Nem |
| generate_lead / Meta Lead | Szerveres provider által elfogadott megkeresés | Beérkezett kérés, minősítés még szükséges |

A kód semmilyen űrlapértéket, nevet, email-címet, telefonszámot vagy üzenetet nem ad át az eseményeknek. A szolgáltatások a hozzájárulás után saját technikai adatokat is kezelnek. A jelenlegi mailto-módban nincs generate_lead esemény. A ténylegesen beérkezett emaileket és telefonokat, a minősítést, a megtekintéseket és az ajánlatokat külön értékesítési nyilvántartásban vezetjük, duplikációk nélkül.

## Havi riport és 90 nap

Ez a módosítás az eseményeket és a bekötést készíti elő, nem készít automatikus riportexportot. A riport a GA4, a Meta hirdetéskezelő és az értékesítési nyilvántartás adataiból készül. Minden hónapban: tényleges ráfordítás, landinglátogatók és hozzájárulási korlátok, beérkezett kérések, minősített vevőjelöltek, megtartott megtekintések, írásos ajánlatok, következő változtatás és felelős. A két szolgáltató számait nem adjuk össze egyedi érdeklődőszámként.

Minősített vevőjelölt: valós vételi szándék, a finanszírozás útja, időzítés és következő egyeztetés rögzítve. CPQL = az időszak teljes tényleges marketing- és értékesítési ráfordítása / minősített vevőjelöltek száma. Nulla vevőjelöltnél nem számolunk nulla költséget: a mutató nem értelmezhető. A költségplafont és az eredménycélokat induláskor kell jóváhagyni.

30/60/90. nap: csatornánként értékelés, a szűk keresztmetszet javítása, majd folytatás / módosítás / szüneteltetés. Eladás hiányában a riport nem állít pénzügyi megtérülést.
