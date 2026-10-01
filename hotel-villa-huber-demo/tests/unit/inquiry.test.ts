import { describe, expect, it, vi } from "vitest";
import { buildInquiryMailto, composeInquiryEmail, normalizeInquiry, validateInquiry, type InquiryInput } from "@/features/inquiry/schema";
import { deliveryMode } from "@/features/inquiry/delivery";
import { sendInquiry } from "@/features/inquiry/send.server";
import { checkSpam, rateLimited } from "@/features/inquiry/guard.server";
import { POST } from "@/app/api/ajanlatkeres/route.server";
import { NextRequest } from "next/server";

const VALID: InquiryInput = {
  name: "Kovács Árpád",
  email: "arpad@pelda.hu",
  phone: "+36 30 123 4567",
  company: "Minta Kft.",
  interest: "sajat-uzemeltetes",
  request: "megtekintes",
  message: "Szeretnék helyszíni megtekintést egyeztetni.",
};

describe("ajánlatkérő — validáció és levél", () => {
  it("érvényes adatnál nincs hiba; hiányzó kötelező mezőknél mezőszintű hibák", () => {
    expect(validateInquiry(VALID)).toEqual({});
    const errors = validateInquiry({ name: "", email: "rossz", interest: "x", request: "", message: "rövid" });
    expect(Object.keys(errors).sort()).toEqual(["email", "interest", "message", "name", "request"]);
    expect(validateInquiry({ ...VALID, phone: "abc" }).phone).toBeTruthy();
    expect(validateInquiry({ ...VALID, phone: "" }).phone).toBeUndefined();
  });

  it("a fejlécinjektálást kiszűri, a címzett mindig a sale@ cím", () => {
    const mail = composeInquiryEmail(normalizeInquiry({ ...VALID, name: "Kovács\r\nBcc: rossz@pelda.hu" }));
    expect(mail.to).toBe("sale@hotelvillahuber.com");
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.text.split("\n")[0]).toBe("Név: Kovács Bcc: rossz@pelda.hu");
    expect(mail.text).toContain("Kérés: Helyszíni megtekintés");
  });

  it("a mailto encodeURIComponent-tel kódol és visszafejthető", () => {
    const mail = buildInquiryMailto({ ...VALID, message: "Ár? Mennyi & mikor #1 — 100% biztos: 1+1=2\nMásodik sor: ő, ű." });
    expect(mail.href.startsWith("mailto:sale@hotelvillahuber.com?subject=")).toBe(true);
    const body = mail.href.split("&body=")[1] ?? "";
    expect(decodeURIComponent(body)).toContain("1+1=2\r\nMásodik sor: ő, ű.");
    expect(body).toContain("%2B");
    expect(mail.href).not.toMatch(/[ #]/);
  });
});

describe("ajánlatkérő — kézbesítés és védelem", () => {
  it("provider nélkül mailto mód; hiányos konfiguráció sem kapcsol szerveres módot", () => {
    expect(deliveryMode({})).toBe("mailto");
    expect(deliveryMode({ INQUIRY_PROVIDER: "resend", RESEND_API_KEY: "k" })).toBe("mailto");
    expect(deliveryMode({ INQUIRY_PROVIDER: "webhook", INQUIRY_WEBHOOK_URL: "http://nem-https" })).toBe("mailto");
    expect(deliveryMode({ INQUIRY_PROVIDER: "resend", RESEND_API_KEY: "k", INQUIRY_FROM_EMAIL: "web@pelda.hu" })).toBe("server");
  });

  it("„accepted” csak a provider 2xx válasza után; hibánál és konfiguráció nélkül nem", async () => {
    const env = { INQUIRY_PROVIDER: "resend", RESEND_API_KEY: "titok", INQUIRY_FROM_EMAIL: "web@pelda.hu" };
    const ok = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await sendInquiry(VALID, env, ok as unknown as typeof fetch)).toEqual({ status: "accepted" });
    const [, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).to).toEqual(["sale@hotelvillahuber.com"]);
    const bad = vi.fn(async () => new Response("{}", { status: 500 }));
    expect(await sendInquiry(VALID, env, bad as unknown as typeof fetch)).toEqual({ status: "failed" });
    const boom = vi.fn(async () => {
      throw new Error("network");
    });
    expect(await sendInquiry(VALID, env, boom as unknown as typeof fetch)).toEqual({ status: "failed" });
    expect(await sendInquiry(VALID, {}, ok as unknown as typeof fetch)).toEqual({ status: "not_configured" });
  });

  it("spamvédelem: honeypot és túl gyors kitöltés", () => {
    const now = 1_000_000;
    expect(checkSpam({ website: "", startedAt: now - 10_000 }, now)).toBe(false);
    expect(checkSpam({ website: "http://spam", startedAt: now - 10_000 }, now)).toBe(true);
    expect(checkSpam({ website: "", startedAt: now - 500 }, now)).toBe(true);
    expect(checkSpam({ website: "", startedAt: "nem szám" }, now)).toBe(true);
    for (let i = 0; i < 5; i++) expect(rateLimited("10.0.0.1", now + i)).toBe(false);
    expect(rateLimited("10.0.0.1", now + 6)).toBe(true);
  });

  it("API: konfiguráció nélkül 503 not_configured, hibás adatnál 422, nem JSON-ra 415", async () => {
    const post = (body: unknown, type = "application/json") =>
      POST(new NextRequest("http://localhost/api/ajanlatkeres", { method: "POST", headers: { "content-type": type, "x-forwarded-for": `ip-${Math.random()}` }, body: typeof body === "string" ? body : JSON.stringify(body) }));
    const started = Date.now() - 10_000;
    const ok = await post({ ...VALID, website: "", startedAt: started });
    expect(ok.status).toBe(503);
    expect(await ok.json()).toEqual({ status: "not_configured" });
    const invalid = await post({ ...VALID, email: "rossz", website: "", startedAt: started });
    expect(invalid.status).toBe(422);
    expect((await invalid.json()).errors.email).toBeTruthy();
    expect((await post("x", "text/plain")).status).toBe(415);
    const tooBig = await post({ ...VALID, message: "x".repeat(20_000), website: "", startedAt: started });
    expect(tooBig.status).toBe(413);
  });
});
