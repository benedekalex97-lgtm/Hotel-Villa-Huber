import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Belső eszközök (/munka/*) csak fejlesztői szerveren vagy explicit
 * belső buildben (HVH_INTERNAL_TOOLS=1) kerülnek a route-fába.
 * A publikus buildben a `page.internal.tsx` fájlokat a Next.js nem
 * ismeri fel oldalként, így se a route, se a hozzá tartozó kód nem épül be.
 */
export default function config(phase: string): NextConfig {
  const internalTools =
    phase === PHASE_DEVELOPMENT_SERVER || process.env.HVH_INTERNAL_TOOLS === "1";

  return {
    // Külön kimeneti mappa párhuzamos (publikus / belső) ellenőrző buildekhez.
    distDir: process.env.HVH_DIST_DIR || ".next",
    pageExtensions: internalTools ? ["internal.tsx", "tsx", "ts"] : ["tsx", "ts"],
    reactStrictMode: true,
    devIndicators: false,
    poweredByHeader: false,
    images: {
      formats: ["image/avif", "image/webp"],
      // A forrásképek ≤ 1024 px szélesek: nagyobb változatot nem generálunk.
      deviceSizes: [390, 640, 768, 1024],
      imageSizes: [160, 240, 320, 480],
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
            { key: "Referrer-Policy", value: "same-origin" },
          ],
        },
      ];
    },
  };
}
