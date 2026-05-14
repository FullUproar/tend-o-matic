// Playwright config — spawns till + backoffice dev servers and runs
// E2E specs against them. DATABASE_URL is read from packages/db/.env
// so the tests hit the same Neon DB the seed populated.

import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";

function readEnvFile(path: string): Record<string, string> {
  let raw = "";
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return {};
  }
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

const dbEnv = readEnvFile("packages/db/.env");
// Test-only NEXTAUTH_SECRET. Real one stays out of this file; this
// secret only exists in the dev server's memory during E2E.
const NEXTAUTH_SECRET =
  "playwright-test-secret-not-for-production-XXXXXXXXXXXXXXXXXXXXXX";

const sharedEnv = {
  DATABASE_URL: dbEnv.DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  NEXTAUTH_SECRET,
  // Required by NextAuth v5 when not on a recognized host.
  AUTH_TRUST_HOST: "true",
  // Don't pop the Next.js telemetry prompt during E2E.
  NEXT_TELEMETRY_DISABLED: "1",
};

const TILL_PORT = 3100;
const BACKOFFICE_PORT = 3101;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // Sales increment counters; serial keeps DB sane.
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: [
    {
      command: "pnpm --filter @tend-o-matic/till exec next dev",
      url: `http://localhost:${TILL_PORT}/sign-in`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...sharedEnv,
        NEXTAUTH_URL: `http://localhost:${TILL_PORT}`,
        PORT: String(TILL_PORT),
      },
    },
    {
      command: "pnpm --filter @tend-o-matic/backoffice exec next dev",
      url: `http://localhost:${BACKOFFICE_PORT}/sign-in`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...sharedEnv,
        NEXTAUTH_URL: `http://localhost:${BACKOFFICE_PORT}`,
        PORT: String(BACKOFFICE_PORT),
      },
    },
  ],
  projects: [
    {
      name: "till",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: `http://localhost:${TILL_PORT}`,
      },
      testMatch: /till\..*\.spec\.ts/,
    },
    {
      name: "backoffice",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: `http://localhost:${BACKOFFICE_PORT}`,
      },
      testMatch: /backoffice\..*\.spec\.ts/,
    },
  ],
});
