import type { Fact } from "../types";

/**
 * BELSŐ adatnyilvántartás — nem publikus és ismeretlen adatok.
 * Publikus kód nem importálhatja (teszt és verify:public ellenőrzi).
 * A régi nyilvános kapacitásadatok tulajdonosi megerősítésig nem jelennek meg.
 */
export const INTERNAL_FACTS = [
  // — Tulajdonosi közlés, nem megjelenített —
  {
    id: "operated-summer-2026",
    label: "Működés 2026 nyarán",
    value: "A tulajdonos közlése szerint a hotel 2026 nyarán működött.",
    status: "tulajdonosi-kozles",
    source: "SRC-OWNER-VERBAL",
    visibility: "internal",
    note: "Nem bizonyítja a jelenlegi nyitvatartást, foglalhatóságot vagy teljes éves működést.",
  },
  {
    id: "operator",
    label: "Üzemeltetői partner",
    value: "Nincs igazolt, leszerződött üzemeltető.",
    status: "jovahagyott",
    source: "SRC-STRATEGIA-V1",
    visibility: "internal",
    note: "Meglévő megállapodást csak akkor mutatunk be, ha valóban létrejött.",
  },

  // — Régi nyilvános közlések, tulajdonosi megerősítés nélkül —
  {
    id: "rooms",
    label: "Szobák száma",
    value: "14",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "beds",
    label: "Férőhely",
    value: "kb. 45",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "restaurant",
    label: "Étterem",
    value: "50 fős",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "wellness",
    label: "Wellness",
    value: "Wellness-rész (szauna a fotókon látható)",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },
  {
    id: "parking",
    label: "Parkoló",
    value: "kb. 35 autó, buszparkolás",
    status: "nyilvanos-megerositendo",
    source: "SRC-PUBLIC-LEGACY",
    visibility: "internal",
  },

  // — Ismeretlen / nem jóváhagyott, sehol nem jelenik meg —
  {
    id: "asking-price",
    label: "Irányár",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
    note: "A korábbi 1,2 millió EUR (és nyilvános hirdetésekben 1,25 millió EUR) nem jóváhagyott aktuális ár.",
  },
  {
    id: "yield",
    label: "Hozam, pénzügyi eredmény",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "condition",
    label: "Állapotminősítés",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "renovation-cost",
    label: "Felújítási költség",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "permits",
    label: "Magánhasználati vagy átalakítási engedély",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "build-year",
    label: "Építési év",
    value: null,
    status: "ismeretlen",
    source: "SRC-BRIEF-0930",
    visibility: "hidden",
  },
  {
    id: "documents",
    label: "Működési, műszaki és jogi dokumentáció",
    value: "Hiányos",
    status: "jovahagyott",
    source: "SRC-BRIEF-0930",
    visibility: "internal",
  },
] as const satisfies readonly Fact[];
