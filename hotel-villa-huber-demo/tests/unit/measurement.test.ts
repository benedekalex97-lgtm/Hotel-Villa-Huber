import { afterEach, describe, expect, it, vi } from "vitest";
import { configureMeasurement, parseConsent, trackMeasurement, validGaId, validPixelId } from "@/features/measurement/events";
afterEach(() => { configureMeasurement(null); vi.unstubAllGlobals(); });
describe("consent and truthful inquiry measurement", () => {
  it("rejects missing, corrupt, expired and future consent", () => {
    expect(parseConsent(null)).toBeNull(); expect(parseConsent("bad")).toBeNull();
    for (const savedAt of [0, Date.now()+10000]) expect(parseConsent(JSON.stringify({version:1,analytics:true,marketing:true,savedAt}))).toBeNull();
    expect(parseConsent(JSON.stringify({version:1,analytics:true,marketing:false,savedAt:Date.now()}))).toEqual({analytics:true,marketing:false});
  });
  it("requires valid independent provider IDs", () => {
    expect(validGaId("G-ABCDE12345")).toBe(true); expect(validGaId("G-<script>")).toBe(false);
    expect(validPixelId("1234567890")).toBe(true); expect(validPixelId("placeholder")).toBe(false);
  });
  it("does not send any event before consent or on the booking demo", () => {
    const gtag=vi.fn(), fbq=vi.fn();
    configureMeasurement({consent:{analytics:false,marketing:false},gaId:"G-ABCDE12345",pixelId:"1234567890",gtag,fbq});
    trackMeasurement("generate_lead"); expect(gtag).not.toHaveBeenCalled(); expect(fbq).not.toHaveBeenCalled();
    configureMeasurement({consent:{analytics:true,marketing:true},gaId:"G-ABCDE12345",pixelId:"1234567890",gtag,fbq});
    vi.stubGlobal("window", {location:{pathname:"/foglalas"}});
    trackMeasurement("form_start"); expect(gtag).not.toHaveBeenCalled(); expect(fbq).not.toHaveBeenCalled();
  });
  it("mailto opening stays distinct from actual provider-accepted lead", () => {
    const gtag=vi.fn(),fbq=vi.fn();
    configureMeasurement({consent:{analytics:true,marketing:true},gaId:"G-ABCDE12345",pixelId:"1234567890",gtag,fbq});
    trackMeasurement("inquiry_mailto_open"); expect(fbq).toHaveBeenLastCalledWith("trackCustom","inquiry_mailto_open");
    expect(gtag).toHaveBeenLastCalledWith("event","inquiry_mailto_open",{send_to:"G-ABCDE12345"});
    trackMeasurement("generate_lead"); expect(fbq).toHaveBeenLastCalledWith("track","Lead");
  });
  it("revoking the runtime stops events", () => {
    const gtag=vi.fn(); configureMeasurement({consent:{analytics:true,marketing:false},gaId:"G-ABCDE12345",pixelId:"",gtag});
    configureMeasurement(null); trackMeasurement("form_start"); expect(gtag).not.toHaveBeenCalled();
  });
});
