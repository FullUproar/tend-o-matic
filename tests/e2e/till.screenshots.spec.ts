// Visual-review captures. Runs against the till app and dumps PNGs
// into screenshots/till/ for human review. Not assertion-heavy; the
// goal is artifacts for UX critique, not regression detection.

import { test } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";
const PASSWORD = "demopass";

const SCREENSHOT_DIR = "screenshots/till";

async function shot(
  page: import("@playwright/test").Page,
  name: string,
): Promise<void> {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(CASHIER_EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/", { timeout: 20_000 });
}

test.describe("till — visual tour", () => {
  test("01: sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await shot(page, "01-signin");
  });

  test("02: sign-in with error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(CASHIER_EMAIL);
    await page.getByLabel("Password").fill("WRONG");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/sign-in/);
    await shot(page, "02-signin-error");
  });

  test("03: till empty after sign-in", async ({ page }) => {
    await signIn(page);
    await shot(page, "03-till-empty");
  });

  test("04: medical customer selected", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: /Medical patient/i }).click();
    await shot(page, "04-customer-medical");
  });

  test("05: ID verified + picker open", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await shot(page, "05-id-verified-picker");
  });

  test("06: product selected (form)", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();
    await shot(page, "06-product-selected");
  });

  test("07: cart with one line", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();
    await page.getByRole("button", { name: /Add to cart/i }).click();
    await shot(page, "07-cart-one-line");
  });

  test("08: cart with multiple lines", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();
    await page.getByRole("button", { name: /Add to cart/i }).click();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-northern-lights" })
      .first()
      .click();
    await page.getByRole("button", { name: /Add to cart/i }).click();
    await shot(page, "08-cart-multi-line");
  });

  test("09: refusal banner (over-cap)", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-northern-lights" })
      .first()
      .click();
    await page.getByLabel(/^Weight/i).fill("80");
    await page.getByRole("button", { name: /Add to cart/i }).click();
    await shot(page, "09-refusal-banner");
  });

  test("10: receipt preview after complete sale", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();
    await page.getByRole("button", { name: /Add to cart/i }).click();
    await page.getByRole("button", { name: /Complete sale/i }).click();
    await page.waitForSelector("h2:has-text('Sale recorded')", {
      timeout: 20_000,
    });
    await shot(page, "10-receipt-preview");
  });
});
