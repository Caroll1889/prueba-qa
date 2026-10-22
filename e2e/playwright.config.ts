
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Cargar las variables locales si existe el archivo .env
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["api-meters.spec.ts"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["api-meters.spec.ts"],
    },
    {
      name: "api",
      testMatch: ["api-meters.spec.ts"],
    },
  ],
});
