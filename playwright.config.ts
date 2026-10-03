import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// pnpm test:e2e:full → solo el recorrido completo de los 30 retos (@full).
const FULL = !!process.env.E2E_FULL;

export default defineConfig({
  testDir: "./e2e",
  // Pyodide descarga ~15 MB del CDN la primera vez: tiempos generosos.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome", // usa el Chrome instalado en el sistema
    locale: "es-ES",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } },
      ...(FULL ? { grep: /@full/ } : { grepInvert: /@full|@mobile-only/ }),
    },
    {
      name: "mobile",
      use: {
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
      grep: /@mobile/,
      grepInvert: /@full/,
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
