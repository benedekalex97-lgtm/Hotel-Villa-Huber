import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Kiadási módok
 * - fejlesztés (`next dev`): minden útvonal, a belső /munka/* is;
 * - belső build (HVH_INTERNAL_TOOLS=1): Node-szerver, /munka/* is;
 * - publikus Node-build (alap): /, /foglalas, /elado-hotel + /api/ajanlatkeres + proxy;
 * - statikus production export (HVH_STATIC_EXPORT=1, GitHub Pages): csak a három
 *   nyilvános oldal; API és proxy nélkül (az ajánlatkérő mailto-módban fut).
 *
 * A belső oldalak `*.internal.tsx`, a szerveres fájlok (`proxy`, API route) `*.server.ts`
 * kiterjesztésűek: ahol a mód nem engedi, a Next.js nem ismeri fel őket, így nem épülnek be.
 */
export default function config(phase: string): NextConfig {
  const internalTools = phase === PHASE_DEVELOPMENT_SERVER || process.env.HVH_INTERNAL_TOOLS === "1";
  const staticExport = process.env.HVH_STATIC_EXPORT === "1" && !internalTools;
  const basePath = staticExport ? (process.env.HVH_BASE_PATH ?? "") : "";

  const pageExtensions = [
    ...(internalTools ? ["internal.tsx"] : []),
    ...(staticExport ? [] : ["server.ts"]),
    "tsx",
    "ts",
  ];

  return {
    // Külön kimeneti mappa párhuzamos (publikus / belső) ellenőrző buildekhez.
    distDir: process.env.HVH_DIST_DIR || ".next",
    pageExtensions,
    reactStrictMode: true,
    poweredByHeader: false,
    devIndicators: false,
    ...(staticExport ? { output: "export" as const, trailingSlash: true, basePath } : {}),
    env: { NEXT_PUBLIC_BASE_PATH: basePath },
    images: staticExport
      ? // Statikus hoszton nincs képoptimalizáló: a forrásképeket (≤ 1024 px) basePath-szal adjuk ki.
        { loader: "custom", loaderFile: "./src/lib/static-image-loader.ts" }
      : {
          formats: ["image/avif", "image/webp"],
          // A forrásképek ≤ 1024 px szélesek: nagyobb változatot nem generálunk.
          deviceSizes: [390, 640, 768, 1024],
          imageSizes: [160, 240, 320, 480],
        },
    ...(staticExport
      ? {}
      : {
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
        }),
  };
}
