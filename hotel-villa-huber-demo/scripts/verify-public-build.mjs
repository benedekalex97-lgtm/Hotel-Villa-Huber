// A publikus kiadási build ellenőrzése: a belső útvonal és tartalom nem kerülhet bele.
// Használat: node scripts/verify-public-build.mjs [distDir=.next-public]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = process.argv[2] ?? ".next-public";
if (!existsSync(dist)) {
  console.error(`Nincs build a(z) ${dist} mappában. Előbb: npm run build:public`);
  process.exit(2);
}

// Belső tartalomra utaló jelek: emailsablon-szöveg, UI-feliratok, belső díjak, nem publikálható ár- és közvetítői adatok.
const FORBIDDEN = [
  "korábbi megkeresésem",
  "Ajánló neve / korábbi beszélgetésünk",
  "Alapsablon visszaállítása",
  "Szöveg másolása",
  "/munka/email",
  "/munka/brand",
  "250 000",
  "250000",
  "150 000",
  "150000",
  "sikerdíj",
  "1,2 millió",
  "1 200 000",
  "1.200.000",
  "1,25 millió",
  "1 250 000",
  "990 000",
  "990,000",
  "Gasthof Borok",
  "2,000 m²",
  "5 000 m²",
  "Klara Deak",
  "Deák Klára",
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// Statikus export (out/): minden kiszolgált fájl. Next-build: a .next/cache nem kerül kiszolgálásra,
// csak a szerver- és kliens-kimenetet vizsgáljuk.
const staticExport = !existsSync(join(dist, "server"));
const files = (staticExport ? [dist] : ["server", "static"].map((d) => join(dist, d)))
  .filter(existsSync)
  .flatMap(walk)
  .filter((f) => /\.(js|html|rsc|json|txt|body|meta|css)$/.test(f) && !f.endsWith(".map"));

const problems = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const needle of FORBIDDEN) {
    if (text.includes(needle)) problems.push(`${file}: „${needle}”`);
  }
}

const manifestPath = join(dist, "app-path-routes-manifest.json");
if (staticExport) {
  const pages = files.filter((f) => f.endsWith(".html")).map((f) => f.slice(dist.length));
  for (const page of pages) if (page.includes("/munka") || page.includes("/api/")) problems.push(`statikus oldal: ${page}`);
  for (const required of ["/index.html", "/foglalas/index.html", "/elado-hotel/index.html", "/404.html"]) {
    if (!pages.includes(required)) problems.push(`hiányzó oldal: ${required}`);
  }
  console.log(`Statikus oldalak: ${pages.join(", ")}`);
} else if (existsSync(manifestPath)) {
  const routes = Object.values(JSON.parse(readFileSync(manifestPath, "utf8")));
  for (const route of routes) {
    if (String(route).startsWith("/munka")) problems.push(`route-manifest: ${route}`);
  }
  console.log(`Útvonalak: ${routes.join(", ")}`);
} else {
  problems.push("hiányzik az app-path-routes-manifest.json");
}

if (problems.length) {
  console.error(`HIBA — belső tartalom a publikus buildben (${problems.length}):\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(`OK — ${files.length} fájl átvizsgálva, belső útvonal és tartalom nincs a publikus buildben.`);
