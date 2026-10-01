import { HOME_SECTIONS, ROUTES, SALE_SECTIONS } from "./site";

/**
 * A production alapcím közös, validált konfigurációja.
 * Domaincsere: `NEXT_PUBLIC_SITE_URL` környezeti változó (egyetlen helyen), a linkeket
 * ebből építjük — kézi átírás nem kell. Érvénytelen érték esetén az alapérték marad,
 * és a `warning` jelzi a hibát (a belső felület ki is írja).
 */
export const DEFAULT_SITE_URL = "https://hotel-villa-huber-hotel-villa-huber.vercel.app";

export type SiteUrlResult = { ok: true; url: string } | { ok: false; reason: string };

/** Csak https, nyilvános (pont tartalmazó, nem IP és nem helyi) hosztnév, útvonal/lekérdezés/hash nélkül. */
export function parseSiteUrl(raw: string | null | undefined): SiteUrlResult {
  const text = (raw ?? "").trim();
  if (!text) return { ok: false, reason: "üres érték" };
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, reason: "nem érvényes URL" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "csak https:// cím engedélyezett" };
  if (url.username || url.password) return { ok: false, reason: "az URL nem tartalmazhat hitelesítő adatot" };
  if (url.search || url.hash) return { ok: false, reason: "az URL nem tartalmazhat paramétert vagy horgonyt" };
  if (url.pathname !== "/" && url.pathname !== "") return { ok: false, reason: "csak a gyökércím adható meg (útvonal nélkül)" };
  const host = url.hostname;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
  if (!host.includes(".") || isIp || /(^|\.)(localhost|local|internal|test|invalid)$/.test(host)) {
    return { ok: false, reason: "nyilvános domain szükséges (nem localhost, nem IP, nem belső név)" };
  }
  return { ok: true, url: url.origin };
}

export interface SiteUrlConfig {
  url: string;
  source: "env" | "default";
  /** Érvénytelen környezeti érték esetén a hiba oka; egyébként `null`. */
  warning: string | null;
}

export function resolveSiteUrl(raw: string | null | undefined): SiteUrlConfig {
  if (!raw?.trim()) return { url: DEFAULT_SITE_URL, source: "default", warning: null };
  const parsed = parseSiteUrl(raw);
  if (parsed.ok) return { url: parsed.url, source: "env", warning: null };
  return { url: DEFAULT_SITE_URL, source: "default", warning: `A NEXT_PUBLIC_SITE_URL értéke érvénytelen (${parsed.reason}); az alapérték van használatban.` };
}

export const SITE_URL_CONFIG: SiteUrlConfig = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** Abszolút nyilvános cím egy gyökér-relatív útvonalból. */
export function absoluteUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** A levélben használt landing- és médiacímek; a horgonyokat a `site.ts` azonosítói adják. */
export function siteLinks(baseUrl: string) {
  return {
    sale: absoluteUrl(baseUrl, ROUTES.sale),
    inquiry: `${absoluteUrl(baseUrl, ROUTES.sale)}#${SALE_SECTIONS.inquiry}`,
    gallery: `${absoluteUrl(baseUrl, ROUTES.home)}#${HOME_SECTIONS.gallery}`,
    media: (src: string) => absoluteUrl(baseUrl, src),
  };
}
