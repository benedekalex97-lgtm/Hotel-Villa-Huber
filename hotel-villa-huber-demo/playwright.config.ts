import { existsSync } from "node:fs";
import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

/**
 * E2E futtatási módok
 * - alap: a publikus és a belső Node-buildet saját szerveren indítja
 *   (előfeltétel: `npm run build:public && npm run build:internal`);
 * - E2E_BASE_URL megadva: csak a nyilvános tesztek, a megadott (pl. GitHub Pages / production) címen,
 *   szerverindítás nélkül. Statikus hosztnál E2E_STATIC=1.
 *
 * A tesztek relatív („./…”) útvonalakat használnak, így basePath alatt is futnak; a baseURL végén legyen „/”.
 */
// Helyi (felhős) környezetben az előre telepített Chromium; CI-ben a Playwright saját böngészője.
const localChromium = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
const executablePath = existsSync(localChromium) ? localChromium : undefined;
const external = process.env.E2E_BASE_URL;

const publicProjects = (baseURL: string): PlaywrightTestConfig["projects"] => [
  {
    name: "public-release",
    testMatch: /public\.(gate|flow|booking|sale)\.spec\.ts/,
    use: { ...devices["Desktop Chrome"], baseURL },
  },
  {
    name: "public-release-mobile",
    testMatch: /public\.mobile\.spec\.ts/,
    use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, baseURL },
  },
];

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    launchOptions: executablePath ? { executablePath } : {},
    trace: "off",
  },
  ...(external
    ? { projects: publicProjects(external.endsWith("/") ? external : `${external}/`) }
    : {
        webServer: [
          { command: "npm run start:public", url: "http://localhost:3100", reuseExistingServer: false, timeout: 60_000 },
          { command: "npm run start:internal", url: "http://localhost:3101", reuseExistingServer: false, timeout: 60_000 },
        ],
        projects: [
          ...(publicProjects("http://localhost:3100/") ?? []),
          {
            name: "internal",
            testMatch: /internal\..*spec\.ts/,
            use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3101/" },
          },
        ],
      }),
});
