import type { Source, SourceId } from "./types";

/**
 * Forrásnyilvántartás. A `ref` belső hivatkozás; nyilvános oldalon nem jelenik meg,
 * és nem használható közvetlen kép-URL-ként.
 */
export const SOURCES: Record<SourceId, Source> = {
  "SRC-BRIEF-0930": {
    id: "SRC-BRIEF-0930",
    title: "Megvalósítási brief v1.0 (brand, weboldal, landing, email UI)",
    kind: "brief",
    date: "2026-09-30",
    note: "Build scope és tartalmi korlátok. Elsőbbséget élvez a szept. 21–25-i archívummal szemben.",
  },
  "SRC-CELCSOPORT-V1": {
    id: "SRC-CELCSOPORT-V1",
    title: "Célcsoport — tárgyalási változat v1.0",
    kind: "elfogadott-dokumentum",
    ref: "https://docs.google.com/document/d/1FUHAk9xFCvQBSAxeHw8m5UxAa06ocGYCpXYEaMehUNE/edit",
    date: "2026-09-30",
    note: "A felhasználó által elfogadott tárgyalási tartalom. A vevői rangsor munkahipotézis.",
  },
  "SRC-STRATEGIA-V1": {
    id: "SRC-STRATEGIA-V1",
    title: "Értékesítési stratégia v1.0",
    kind: "elfogadott-dokumentum",
    ref: "https://drive.google.com/file/d/1bQWwRENJ7luRvfw8E34NN_K_ZJsS9bA9/view",
    date: "2026-09-30",
  },
  "SRC-EMAILEK-V1.1": {
    id: "SRC-EMAILEK-V1.1",
    title: "Megkereső emailek — három másolható tervezet v1.1",
    kind: "elfogadott-dokumentum",
    ref: "https://drive.google.com/file/d/1YtcHHitKvgR9OD-pY-WPtOBGZIdt6opW/view",
    date: "2026-09-30",
    note: "A sablonszöveg betű szerint megegyezik a brief 8. pontjával.",
  },
  "SRC-KOLTSEGTERV-V0.2": {
    id: "SRC-KOLTSEGTERV-V0.2",
    title: "Költség- és díjjavaslat v0.2 — belső tárgyalási tervezet",
    kind: "belso-tervezet",
    ref: "https://drive.google.com/file/d/1fdInPeJOUxhY46K1ora_q6hdgSqkD2AP/view",
    date: "2026-09-30",
    note: "Belső. Vevőknek szánt oldalra nem kerül.",
  },
  "SRC-KEPINVENTAR-V2": {
    id: "SRC-KEPINVENTAR-V2",
    title: "06_IMAGE_ASSET_INVENTORY v2.0 — vizuális audit",
    kind: "elfogadott-dokumentum",
    ref: "https://drive.google.com/file/d/16BQ3mL75hKyM9DkyV1bEd3Rqem19eg_9/view",
    date: "2026-09-21",
    note: "Az újrafotózást előfeltételként kezelő következtetése ebben a demókörben elavult.",
  },
  "SRC-BOOKING-EXPORT": {
    id: "SRC-BOOKING-EXPORT",
    title: "Booking-exportból származó képállomány (45 JPG, max. 1024 px)",
    kind: "kepforras",
    ref: "https://drive.google.com/drive/folders/1a4UhWIlj2wX-O2-nFOe7Y6pZilxmXy8l",
    date: "2026-09-21",
    note: "Web-optimalizált OTA-képek; a felvételi dátum képenként nem ismert.",
  },
  "SRC-PUBLIC-LEGACY": {
    id: "SRC-PUBLIC-LEGACY",
    title: "Korábbi nyilvános közlések (hotelvillahuber.com, OTA-oldalak, hirdetések)",
    kind: "nyilvanos",
    date: "2026-09-21",
    note: "Kapacitás- és szolgáltatásadatok forrása; tulajdonosi megerősítés hiányzik.",
  },
  "SRC-OWNER-VERBAL": {
    id: "SRC-OWNER-VERBAL",
    title: "Tulajdonosi közlés (szóbeli, a brief alapján)",
    kind: "tulajdonosi",
    date: "2026-09-30",
  },
};
