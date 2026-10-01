import { describe, expect, it } from "vitest";
import { createDemoProvider } from "@/features/booking/demo-provider";
import { DEMO_OFFERS } from "@/features/booking/demo-data";
import { getBookingProvider } from "@/features/booking/provider-registry";
import {
  addDays,
  EMPTY_GUEST,
  formatPeriodHu,
  nightsBetween,
  queryFromParams,
  queryToSearchParams,
  todayIso,
  validateGuest,
  validateQuery,
  type BookingQuery,
} from "@/features/booking/model";

const TODAY = "2026-10-01";
const valid: BookingQuery = { arrival: "2026-12-10", departure: "2026-12-13", adults: 2, children: 1, rooms: 1 };

describe("nightsBetween", () => {
  it("megszámolja az éjszakákat, hónap- és szökőévhatáron is", () => {
    expect(nightsBetween("2026-12-10", "2026-12-13")).toBe(3);
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
    expect(nightsBetween("2028-02-28", "2028-03-01")).toBe(2);
  });
  it("érvénytelen vagy fordított időszakra 0", () => {
    expect(nightsBetween("2026-12-13", "2026-12-10")).toBe(0);
    expect(nightsBetween("2026-12-10", "2026-12-10")).toBe(0);
    expect(nightsBetween("", "2026-12-10")).toBe(0);
    expect(nightsBetween("2026-02-30", "2026-03-05")).toBe(0);
  });
  it("addDays és todayIso", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(todayIso(new Date(2026, 9, 1, 12))).toBe("2026-10-01");
  });
});

describe("validateQuery", () => {
  it("érvényes feltétel hibátlan", () => {
    expect(validateQuery(valid, TODAY)).toEqual({});
    expect(validateQuery({ ...valid, arrival: TODAY, departure: "2026-10-02" }, TODAY)).toEqual({});
  });
  it("a távozás nem lehet az érkezés előtt vagy vele azonos napon", () => {
    expect(validateQuery({ ...valid, departure: "2026-12-10" }, TODAY).departure).toBeTruthy();
    expect(validateQuery({ ...valid, departure: "2026-12-01" }, TODAY).departure).toBeTruthy();
  });
  it("múltbeli érkezés elutasítva az injektált mai nap alapján", () => {
    const errors = validateQuery({ ...valid, arrival: "2026-09-30", departure: "2026-10-03" }, TODAY);
    expect(errors.arrival).toMatch(/múlt/);
    expect(validateQuery({ ...valid, arrival: "2026-09-30", departure: "2026-10-03" }, "2026-09-01").arrival).toBeUndefined();
  });
  it("hiányzó dátumok és túl hosszú tartózkodás", () => {
    const missing = validateQuery({ ...valid, arrival: "", departure: "" }, TODAY);
    expect(missing.arrival).toBeTruthy();
    expect(missing.departure).toBeTruthy();
    expect(validateQuery({ ...valid, departure: "2027-02-01" }, TODAY).departure).toMatch(/30 éjszaka/);
  });
  it("legalább 1 felnőtt kell", () => {
    expect(validateQuery({ ...valid, adults: 0, rooms: 1 }, TODAY).adults).toBeTruthy();
    expect(validateQuery({ ...valid, adults: Number.NaN }, TODAY).adults).toBeTruthy();
  });
  it("a szobák száma nem haladhatja meg a felnőttekét", () => {
    expect(validateQuery({ ...valid, adults: 2, rooms: 3 }, TODAY).rooms).toMatch(/felnőtt/);
    expect(validateQuery({ ...valid, adults: 3, rooms: 3 }, TODAY).rooms).toBeUndefined();
  });
  it("felső korlátok és negatív gyermekszám", () => {
    expect(validateQuery({ ...valid, adults: 11 }, TODAY).adults).toBeTruthy();
    expect(validateQuery({ ...valid, children: 7 }, TODAY).children).toBeTruthy();
    expect(validateQuery({ ...valid, children: -1 }, TODAY).children).toBeTruthy();
    expect(validateQuery({ ...valid, adults: 10, rooms: 6 }, TODAY).rooms).toBeTruthy();
  });
});

describe("validateGuest", () => {
  const ok = { ...EMPTY_GUEST, firstName: "Péter", lastName: "Minta", email: "minta@example.com" };
  it("a név és az email kötelező", () => {
    const errors = validateGuest(EMPTY_GUEST);
    expect(Object.keys(errors).sort()).toEqual(["email", "firstName", "lastName"]);
  });
  it("érvényes adat hibátlan, a telefon opcionális", () => {
    expect(validateGuest(ok)).toEqual({});
    expect(validateGuest({ ...ok, phone: "+36 30 123 4567" })).toEqual({});
  });
  it("hibás email és telefon", () => {
    expect(validateGuest({ ...ok, email: "nem-email" }).email).toBeTruthy();
    expect(validateGuest({ ...ok, email: "a@b" }).email).toBeTruthy();
    expect(validateGuest({ ...ok, phone: "abc" }).phone).toBeTruthy();
    expect(validateGuest({ ...ok, phone: "12" }).phone).toBeTruthy();
  });
  it("csak szóközt tartalmazó név nem érvényes", () => {
    expect(validateGuest({ ...ok, firstName: "   " }).firstName).toBeTruthy();
  });
});

describe("URL-paraméterek", () => {
  it("oda-vissza alakítás, személyes adat nélkül", () => {
    const params = queryToSearchParams(valid);
    expect([...params.keys()].sort()).toEqual(["erkezes", "felnott", "gyermek", "szoba", "tavozas"]);
    expect(queryFromParams((k) => params.get(k))).toEqual(valid);
  });
  it("hibás paraméterekre alapértelmezés", () => {
    const q = queryFromParams((k) => ({ erkezes: "nem-datum", felnott: "x" })[k as "erkezes"] ?? null);
    expect(q).toMatchObject({ arrival: "", adults: 2, children: 0, rooms: 1 });
  });
  it("magyar időszak-formázás", () => {
    expect(formatPeriodHu("2026-12-10", "2026-12-13")).toBe("2026. december 10. – 2026. december 13.");
  });
});

describe("demo szolgáltató", () => {
  const provider = createDemoProvider({ latencyMs: 0 });

  it("csak mintaajánlatot ad, ár nélkül", async () => {
    const offers = await provider.searchAvailability(valid);
    expect(offers.length).toBeGreaterThan(0);
    for (const offer of offers) {
      expect(offer.demo).toBe(true);
      expect(offer.priceNote).toBeUndefined();
      expect(offer.title).toMatch(/\(minta\)/);
      expect(Object.keys(offer).join()).not.toMatch(/price(?!Note)/i);
    }
    for (const offer of DEMO_OFFERS) expect(offer.demo).toBe(true);
  });
  it("determinisztikus: ugyanarra a keresésre ugyanaz", async () => {
    expect(await provider.searchAvailability(valid)).toEqual(await provider.searchAvailability({ ...valid }));
  });
  it("nem találgat: túl nagy létszámra üres lista, megfelelőre mindig van ajánlat", async () => {
    expect(await provider.searchAvailability({ ...valid, adults: 10, children: 6, rooms: 1 })).toEqual([]);
    for (let day = 0; day < 40; day += 1) {
      const arrival = addDays("2026-11-01", day);
      const offers = await provider.searchAvailability({ ...valid, arrival, departure: addDays(arrival, 2), adults: 2, children: 0 });
      expect(offers.length).toBeGreaterThan(0);
    }
  });
  it("nincs foglalási művelet, és a regisztráló a demót adja", () => {
    expect("createReservation" in provider).toBe(false);
    expect(provider.describe().kind).toBe("demo");
    expect(getBookingProvider().describe().kind).toBe("demo");
  });
});
