export type MeasurementEvent = "sale_cta_click" | "form_start" | "inquiry_mailto_open" | "inquiry_copy" | "generate_lead";
export type Consent = { analytics: boolean; marketing: boolean };
export const CONSENT_KEY = "hvh-measurement-consent-v1";
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export function parseConsent(raw: string | null, now = Date.now()): Consent | null {
  try {
    const c = JSON.parse(raw ?? "null");
    return c?.version === 1 && typeof c.analytics === "boolean" && typeof c.marketing === "boolean" && typeof c.savedAt === "number" && c.savedAt <= now && now - c.savedAt < MAX_AGE
      ? { analytics: c.analytics, marketing: c.marketing } : null;
  } catch { return null; }
}
export function validGaId(id: string) { return /^G-[A-Z0-9]{5,20}$/.test(id); }
export function validPixelId(id: string) { return /^\d{5,25}$/.test(id); }
type Runtime = { consent: Consent; gaId: string; pixelId: string; gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void };
let runtime: Runtime | null = null;
export function configureMeasurement(next: Runtime | null) { runtime = next; }
/** No event parameters: form values and personal data cannot enter this interface. */
export function trackMeasurement(event: MeasurementEvent) {
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/$/, "") !== "/elado-hotel") return;
  if (runtime?.consent.analytics && validGaId(runtime.gaId)) runtime.gtag?.("event", event, { send_to: runtime.gaId, ...(typeof window !== "undefined" ? { page_location: window.location.origin + window.location.pathname, page_referrer: "" } : {}) });
  if (runtime?.consent.marketing && validPixelId(runtime.pixelId)) {
    if (event === "generate_lead") runtime.fbq?.("track", "Lead");
    else runtime.fbq?.("trackCustom", event);
  }
}
