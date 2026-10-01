import { ACCOMMODATION } from "@/content/guest";
import { addDays, nightsBetween, type BookingQuery, type Offer } from "./model";

/**
 * MINTAADAT — a bemutató foglalási folyamat külön adatforrása.
 * Nem a hotel tényleges szobakészlete: a fotókon látható elhelyezési formákból készült minták.
 * Ár nincs benne. Valódi adat csak élő szolgáltatótól jöhet (provider-registry.ts).
 */

/** Mintaként megadott férőhely egy szobára — nem hivatalos adat. */
const SAMPLE_MAX_GUESTS: Record<string, number> = {
  double: 2,
  family: 4,
  living: 3,
  "room-13": 2,
};

export const DEMO_OFFERS: readonly Offer[] = ACCOMMODATION.map((form) => ({
  id: `demo-${form.id}`,
  title: `${form.title} (minta)`,
  description: form.description,
  mediaId: form.media,
  maxGuests: SAMPLE_MAX_GUESTS[form.id] ?? 2,
  demo: true as const,
}));

/** Egyszerű, determinisztikus hash (FNV-1a) — ugyanarra a dátumra mindig ugyanaz a minta. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Egy minta-elhelyezés „elérhető-e” az időszakban: minden éjszakára külön hash, ~85% esély. */
function isSampleAvailable(offerId: string, arrival: string, nights: number): boolean {
  for (let night = 0; night < nights; night += 1) {
    if (hash(`${offerId}@${addDays(arrival, night)}`) % 100 >= 85) return false;
  }
  return true;
}

/**
 * Mintaajánlatok a keresési feltételekhez. A létszámnak megfelelő elhelyezések közül
 * a dátumok alapján determinisztikusan marad néhány; ha a hash mindet kizárná,
 * az első megfelelő elhelyezés elérhető marad (a minta kiszámítható legyen).
 * Ha a létszám nem fér el a mintaelhelyezésekben, az eredmény üres.
 */
export function sampleOffersFor(query: BookingQuery): Offer[] {
  const guests = query.adults + query.children;
  const nights = nightsBetween(query.arrival, query.departure);
  const fitting = DEMO_OFFERS.filter((offer) => offer.maxGuests * query.rooms >= guests);
  const available = fitting.filter((offer) => isSampleAvailable(offer.id, query.arrival, nights));
  const picked = available.length > 0 ? available : fitting.slice(0, 1);
  return picked.map((offer) => ({ ...offer }));
}
