import { sampleOffersFor } from "./demo-data";
import type { BookingProvider } from "./provider";

interface DemoProviderOptions {
  /** Szimulált válaszidő; a tesztekben 0. */
  latencyMs?: number;
}

/** Bemutató szolgáltató: hálózat nélkül, mintaadatból válaszol. Foglalni nem tud. */
export function createDemoProvider({ latencyMs = 700 }: DemoProviderOptions = {}): BookingProvider {
  return {
    searchAvailability(query) {
      const offers = sampleOffersFor(query);
      if (latencyMs <= 0) return Promise.resolve(offers);
      return new Promise((resolve) => setTimeout(() => resolve(offers), latencyMs));
    },
    describe() {
      return { kind: "demo", label: "Mintaadat — bemutató szolgáltató" };
    },
  };
}
