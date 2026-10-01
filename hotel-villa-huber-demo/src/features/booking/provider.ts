import type { BookingQuery, Offer } from "./model";

/**
 * Foglalási szolgáltató — a UI kizárólag ezen a felületen keresztül kér adatot.
 *
 * Szándékosan nincs `createReservation`: a bemutató nem foglal. Élő szolgáltatónál
 * (PMS / channel manager) egy külön, szerveroldali végpontot kell bevezetni a tényleges
 * foglaláshoz, a vendégadat kezelési tájékoztatóval, fizetési és visszaigazolási lépéssel együtt.
 */
export interface BookingProvider {
  searchAvailability(query: BookingQuery): Promise<Offer[]>;
  describe(): { kind: "demo" | "live"; label: string };
}
