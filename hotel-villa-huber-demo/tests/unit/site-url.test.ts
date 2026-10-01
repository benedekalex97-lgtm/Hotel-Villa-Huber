import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_URL, absoluteUrl, parseSiteUrl, resolveSiteUrl, siteLinks } from "@/content/site-url";

describe("production alapcím", () => {
  it("az alapérték a jelenlegi production cím", () => {
    expect(DEFAULT_SITE_URL).toBe("https://hotel-villa-huber-hotel-villa-huber.vercel.app");
    expect(resolveSiteUrl(undefined)).toEqual({ url: DEFAULT_SITE_URL, source: "default", warning: null });
    expect(resolveSiteUrl("  ").url).toBe(DEFAULT_SITE_URL);
  });

  it("érvényes https cím elfogadva, záró perjel nélkül", () => {
    expect(parseSiteUrl("https://www.hotelvillahuber.com/")).toEqual({ ok: true, url: "https://www.hotelvillahuber.com" });
    expect(resolveSiteUrl("https://hotel.example.hu")).toEqual({ url: "https://hotel.example.hu", source: "env", warning: null });
  });

  it.each([
    ["http://hotel.example.hu", /https/],
    ["https://localhost:3000", /nyilvános/],
    ["https://192.168.0.5", /nyilvános/],
    ["https://valami.internal", /nyilvános/],
    ["https://user:pw@hotel.example.hu", /hitelesítő/],
    ["https://hotel.example.hu/elado-hotel", /gyökércím/],
    ["https://hotel.example.hu/?utm=1", /paraméter/],
    ["nem url", /URL/],
  ])("érvénytelen érték elutasítva: %s", (raw, reason) => {
    const parsed = parseSiteUrl(raw);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.reason).toMatch(reason);
    const resolved = resolveSiteUrl(raw);
    expect(resolved.url).toBe(DEFAULT_SITE_URL);
    expect(resolved.warning).toMatch(/érvénytelen/);
  });

  it("a linkek az alapcímből és a landing horgonyaiból épülnek", () => {
    const links = siteLinks("https://hotel.example.hu/");
    expect(links.sale).toBe("https://hotel.example.hu/elado-hotel");
    expect(links.inquiry).toBe("https://hotel.example.hu/elado-hotel#ajanlatkeres");
    expect(links.gallery).toBe("https://hotel.example.hu/#galeria");
    expect(links.media("/media/booking-export/19333057.jpg")).toBe("https://hotel.example.hu/media/booking-export/19333057.jpg");
    expect(absoluteUrl("https://a.hu/", "x")).toBe("https://a.hu/x");
  });
});
