import { createDemoProvider } from "./demo-provider";
import type { BookingProvider } from "./provider";

let provider: BookingProvider | null = null;

/**
 * Az aktív foglalási szolgáltató. Most mindig a bemutató (minta) szolgáltató.
 *
 * Élő szolgáltató bekötése: írjon egy `BookingProvider`-t megvalósító modult
 * (pl. `live-provider.ts`, szerveroldali API-hívással), és itt, konfiguráció alapján
 * (pl. `process.env.NEXT_PUBLIC_BOOKING_PROVIDER === "live"`) azt adja vissza.
 * A UI nem változik: csak `searchAvailability()` és `describe()` hívások vannak.
 * A tényleges foglalás (createReservation), fizetés és visszaigazolás külön, szerveroldali
 * kontraktus — a demóban szándékosan nincs.
 */
export function getBookingProvider(): BookingProvider {
  provider ??= createDemoProvider();
  return provider;
}
