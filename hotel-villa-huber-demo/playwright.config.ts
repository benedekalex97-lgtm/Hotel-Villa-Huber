import { defineConfig, devices } from "@playwright/test";

/**
 * E2E: a két kiadási módot külön szerveren futtatjuk.
 * Előfeltétel: `npm run build:public && npm run build:internal`.
 */
const executablePath = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    launchOptions: { executablePath },
    trace: "off",
  },
  webServer: [
    {
      command: "npm run start:public",
      url: "http://localhost:3100",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "npm run start:internal",
      url: "http://localhost:3101",
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: "public-release",
      testMatch: /public\.(gate|flow)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3100" },
    },
    {
      name: "public-release-mobile",
      testMatch: /public\.mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, baseURL: "http://localhost:3100" },
    },
    {
      name: "internal",
      testMatch: /internal\..*spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3101" },
    },
  ],
});
