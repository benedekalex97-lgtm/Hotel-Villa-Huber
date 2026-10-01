/**
 * Belső eszközök (/munka/*) engedélyezése.
 *
 * Három réteg védi a belső útvonalakat:
 * 1. build: publikus buildben a `page.internal.tsx` fájlok nem válnak oldallá (next.config.ts);
 * 2. proxy: a /munka/* kérések 404-et kapnak, ha a gate zárva (src/proxy.ts);
 * 3. oldal: a belső oldal szerveroldalon `notFound()`-ot hív, ha a gate zárva.
 *
 * Nyitva: `next dev` alatt, vagy ha HVH_INTERNAL_TOOLS=1 (belső build és futtatás).
 */
export type GateEnv = Partial<Record<"NODE_ENV" | "HVH_INTERNAL_TOOLS", string | undefined>>;

export function internalToolsEnabled(env: GateEnv = process.env): boolean {
  if (env.HVH_INTERNAL_TOOLS === "1") return true;
  return env.NODE_ENV === "development";
}

export const INTERNAL_PATH_PREFIX = "/munka";

export function isInternalPath(pathname: string): boolean {
  return pathname === INTERNAL_PATH_PREFIX || pathname.startsWith(`${INTERNAL_PATH_PREFIX}/`);
}
