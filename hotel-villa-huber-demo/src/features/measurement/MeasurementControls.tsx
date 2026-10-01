"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_KEY, configureMeasurement, parseConsent, validGaId, validPixelId, trackMeasurement, type Consent } from "./events";
import styles from "./MeasurementControls.module.css";

type TrackerWindow = Window & { dataLayer?: unknown[][]; gtag?: (...args: unknown[]) => void; fbq?: ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string; callMethod?: (...args: unknown[]) => void; push?: unknown }; _fbq?: unknown };
let memory: string | null = null;
function snapshot() { try { return window.localStorage.getItem(CONSENT_KEY) ?? memory; } catch { return memory; } }
function subscribe(callback: () => void) { window.addEventListener("hvh-consent", callback); window.addEventListener("storage", callback); return () => { window.removeEventListener("hvh-consent", callback); window.removeEventListener("storage", callback); }; }
function prepareTrackers(gaId: string, pixelId: string, consent: Consent) {
  const w = window as TrackerWindow;
  if (gaId && consent.analytics && !w.gtag) {
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = (...args: unknown[]) => { w.dataLayer!.push(args); };
    w.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    w.gtag("js", new Date());
    w.gtag("config", gaId, { send_page_view: false, page_location: window.location.origin + window.location.pathname, page_referrer: "", allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  if (pixelId && consent.marketing && !w.fbq) {
    const queue: unknown[][] = [];
    const fbq: NonNullable<TrackerWindow["fbq"]> = (...args: unknown[]) => { if (fbq.callMethod) fbq.callMethod(...args); else queue.push(args); };
    Object.assign(fbq, { queue, loaded: true, version: "2.0", push: fbq });
    w.fbq = fbq; w._fbq = fbq;
    w.fbq("consent", "grant");
    w.fbq("set", "autoConfig", false, pixelId);
    w.fbq("init", pixelId);
  }
  configureMeasurement({ consent, gaId, pixelId, gtag: w.gtag, fbq: w.fbq });
}
export function MeasurementControls({ gaId: rawGaId, pixelId: rawPixelId }: { gaId: string; pixelId: string }) {
  const gaId = validGaId(rawGaId) ? rawGaId : "";
  const pixelId = validPixelId(rawPixelId) ? rawPixelId : "";
  const path = usePathname();
  const eligible = path === "/" || path === "/elado-hotel";
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const consent = parseConsent(raw);
  const analytics = consent?.analytics ?? false;
  const marketing = consent?.marketing ?? false;
  const [settings, setSettings] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState(false);
  const [selectedMarketing, setSelectedMarketing] = useState(false);
  // Pixel reads its page URL internally. Do not load it on query-bearing URLs.
  const cleanUrl = useSyncExternalStore(subscribe, () => !window.location.search && !window.location.hash, () => false);
  const lastPageView = useRef("");
  useEffect(() => {
    if (!eligible) { configureMeasurement(null); return; }
    const c = { analytics, marketing: marketing && cleanUrl };
    prepareTrackers(gaId, pixelId, c);
    const viewKey = `${path}:${analytics}:${c.marketing}`;
    if (lastPageView.current !== viewKey) {
      lastPageView.current = viewKey;
      const w = window as TrackerWindow;
      if (analytics && gaId) w.gtag?.("event", "page_view", { send_to: gaId, page_location: window.location.origin + path, page_referrer: "", page_title: path === "/" ? "Hotel Villa Huber" : "Tulajdonos lennél?" });
      if (c.marketing && pixelId) w.fbq?.("track", "PageView");
    }
    return () => configureMeasurement(null);
  }, [gaId, pixelId, analytics, marketing, eligible, cleanUrl, path]);
  useEffect(() => {
    if (!eligible) return;
    const onClick = (e: MouseEvent) => { const a = e.target instanceof Element ? e.target.closest("a") : null; if (a?.getAttribute("href") === "#ajanlatkeres") trackMeasurement("sale_cta_click"); };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [eligible]);
  function save(next: Consent) {
    memory = JSON.stringify({ version: 1, savedAt: Date.now(), ...next });
    try { window.localStorage.setItem(CONSENT_KEY, memory); } catch { /* This tab retains the choice. */ }
    window.dispatchEvent(new Event("hvh-consent")); setSettings(false);
    if ((analytics && !next.analytics) || (marketing && !next.marketing)) {
      const w = window as TrackerWindow;
      w.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      w.fbq?.("consent", "revoke"); configureMeasurement(null);
      for (const cookie of document.cookie.split(";")) {
        const name = (cookie.split("=")[0] ?? "").trim();
        if (!/^(_ga|_gid|_gat|_fbp|_fbc)/.test(name)) continue;
        const parts = window.location.hostname.split(".");
        document.cookie = `${name}=; Max-Age=0; path=/`;
        for (let i=0; i<parts.length-1; i++) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join(".")}`;
      }
      window.location.reload();
    }
  }
  if ((!gaId && !pixelId) || !eligible) return null;
  return <>
    {analytics && gaId ? <Script id="hvh-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /> : null}
    {marketing && pixelId && cleanUrl ? <Script id="hvh-meta" src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" /> : null}
    {!consent || settings ? <section className={styles.panel} aria-label="Mérési beállítások">
      <h2>Mérési beállítások</h2>
      <p>A Google Analytics a weboldal használatát, a Meta Pixel a marketing eredményeit méri. Csak az Ön által engedélyezett mérés indul el. A választását bármikor módosíthatja.</p>
      {gaId ? <label><input type="checkbox" checked={selectedAnalytics} onChange={e => setSelectedAnalytics(e.target.checked)} /> Google Analytics</label> : null}
      {pixelId ? <label><input type="checkbox" checked={selectedMarketing} onChange={e => setSelectedMarketing(e.target.checked)} /> Meta Pixel</label> : null}
      <div className={styles.actions}>
        <button type="button" onClick={() => save({analytics: false, marketing: false})}>Elutasítás</button>
        <button type="button" onClick={() => save({analytics: !!gaId && selectedAnalytics, marketing: !!pixelId && selectedMarketing})}>Választás mentése</button>
        <button type="button" onClick={() => save({analytics: !!gaId, marketing: !!pixelId})}>Mindkettő engedélyezése</button>
      </div>
    </section> : <button type="button" className={styles.reopen} onClick={() => { setSelectedAnalytics(analytics); setSelectedMarketing(marketing); setSettings(true); }}>Mérési beállítások</button>}
  </>;
}
