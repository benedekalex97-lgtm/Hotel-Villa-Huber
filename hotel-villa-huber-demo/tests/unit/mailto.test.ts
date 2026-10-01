import { describe, expect, it } from "vitest";
import { buildInquiryMailto, inquiryPlainText, validateInquiry, type InquiryInput } from "@/features/sale/mailto";

const valid: InquiryInput = {
  name: "Kovács Árpád",
  email: "arpad@pelda.hu",
  company: "Példa Hotelek Kft.",
  interest: "szakmai-partner",
  message: "Kérem a részletes bemutatót, és egy rövid egyeztetést.",
};

function parse(href: string) {
  const [head, query = ""] = href.split("?");
  const params = Object.fromEntries(query.split("&").map((pair) => pair.split("=") as [string, string]));
  return { head, subject: decodeURIComponent(params.subject ?? ""), body: decodeURIComponent(params.body ?? ""), raw: params };
}

describe("buildInquiryMailto", () => {
  it("a címzett mindig az értékesítési cím", () => {
    const mail = buildInquiryMailto({ ...valid, email: "masvalaki@pelda.hu" });
    expect(mail.to).toBe("sale@hotelvillahuber.com");
    expect(mail.href.startsWith("mailto:sale@hotelvillahuber.com?subject=")).toBe(true);
  });

  it("a tárgy és a törzs encodeURIComponent-tel kódolt, és visszafejthető", () => {
    const message = "Ár? Mennyi & mikor #1 — 100% biztos: 1+1=2\nMásodik sor: ő, ű, á.";
    const mail = buildInquiryMailto({ ...valid, name: "Őri Ágnes & társa #2", message });
    const parsed = parse(mail.href);

    expect(parsed.head).toBe("mailto:sale@hotelvillahuber.com");
    expect(parsed.subject).toBe(mail.subject);
    expect(parsed.body).toBe(mail.body);
    expect(parsed.body).toContain("Őri Ágnes & társa #2");
    expect(parsed.body).toContain("Ár? Mennyi & mikor #1 — 100% biztos: 1+1=2\r\nMásodik sor: ő, ű, á.");
    // nyers hivatkozásban nincs szóköz-'+' és nincs nyers elválasztó a törzsben
    expect(mail.href).not.toMatch(/[ #]/);
    expect(parsed.raw.body).not.toContain("+1=2");
    expect(parsed.raw.body).toContain("%2B");
    expect(parsed.raw.body).toContain("%0D%0A");
    expect(parsed.raw.subject).toContain("%20");
  });

  it("a CR/LF-et eltávolítja a név, email és cég mezőből", () => {
    const mail = buildInquiryMailto({
      ...valid,
      name: "Kovács\r\nBcc: rossz@pelda.hu",
      email: "a@b.hu\nCc: x@y.hu",
      company: "Cég\rKft.",
    });
    const header = mail.subject + mail.body.split("\r\n").slice(0, 4).join("|");
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.href).not.toMatch(/%0D%0ABcc|%0ACc/i);
    expect(header).not.toContain("\n");
    expect(mail.body.split("\r\n")[0]).toBe("Név: Kovács Bcc: rossz@pelda.hu");
    expect(mail.body.split("\r\n")[2]).toBe("Cég: Cég Kft.");
  });

  it("a cég sort kihagyja, ha üres", () => {
    const mail = buildInquiryMailto({ ...valid, company: "   " });
    expect(mail.body).not.toContain("Cég:");
    expect(mail.body.split("\r\n")).toEqual([
      "Név: Kovács Árpád",
      "Email: arpad@pelda.hu",
      "Érdeklődési irány: Vásárlás szakmai partner bevonásával",
      "",
      "Üzenet:",
      valid.message,
    ]);
  });

  it("a másolható szöveg tárgyat és törzset tartalmaz", () => {
    const text = inquiryPlainText(buildInquiryMailto(valid));
    expect(text).toContain("Hotel Villa Huber – részletes bemutató kérése – Kovács Árpád");
    expect(text).not.toContain("\r");
  });
});

describe("validateInquiry", () => {
  it("érvényes adatnál üres objektumot ad", () => {
    expect(validateInquiry(valid)).toEqual({});
    expect(validateInquiry({ ...valid, company: "" })).toEqual({});
  });

  it("hibát jelez hiányzó névre, hibás emailre, hiányzó irányra és rövid üzenetre", () => {
    const errors = validateInquiry({ name: "  ", email: "nem-email", company: "", interest: "", message: "rövid" });
    expect(Object.keys(errors).sort()).toEqual(["email", "interest", "message", "name"]);
    expect(errors.name).toMatch(/nevét/);
    expect(errors.email).toMatch(/email/i);
    expect(errors.interest).toMatch(/irány/);
    expect(errors.message).toMatch(/10/);
  });

  it("elutasítja az ismeretlen érdeklődési irányt és a túl hosszú üzenetet", () => {
    expect(validateInquiry({ ...valid, interest: "valami-mas" }).interest).toBeDefined();
    expect(validateInquiry({ ...valid, message: "x".repeat(1501) }).message).toBeDefined();
    expect(validateInquiry({ ...valid, message: "x".repeat(1500) })).toEqual({});
  });
});
