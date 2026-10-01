import "server-only";

/** Minimális kitöltési idő (ms) — ennél gyorsabb beküldés robotgyanús. */
export const MIN_FILL_MS = 3_000;
/** Maximális űrlap-életkor (ms). */
export const MAX_FILL_MS = 24 * 60 * 60 * 1000;

/** Igaz, ha a kérés spamgyanús: kitöltött honeypot mező vagy irreális kitöltési idő. */
export function checkSpam(meta: { website: unknown; startedAt: unknown }, now = Date.now()): boolean {
  if (typeof meta.website === "string" && meta.website.trim() !== "") return true;
  const started = Number(meta.startedAt);
  if (!Number.isFinite(started)) return true;
  const elapsed = now - started;
  return elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Egyszerű, memóriabeli IP-korlát (példányonként; serverless környezetben best-effort).
 * Az IP-t csak a korláthoz tartjuk memóriában, nem naplózzuk.
 */
export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}
