import { test } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

const MANAGER_EMAIL = "manager@demo-mi.tend-o-matic.com";
const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";
const PASSWORD = "demopass";

const DIR = "screenshots/backoffice";

async function shot(
  page: import("@playwright/test").Page,
  name: string,
): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  // Wait for network to settle so server-rendered pages have content.
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.screenshot({
    path: path.join(DIR, `${name}.png`),
    fullPage: true,
  });
}

async function signInAs(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait until the redirect lands (manager → "/", cashier → "/forbidden")
  // before yielding to the caller — otherwise subsequent goto() races
  // the in-flight signIn server action and the session cookie is lost.
  await page.waitForURL(/\/(forbidden)?$/, { timeout: 20_000 });
}

test.describe("backoffice — visual tour", () => {
  test("01: sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await shot(page, "01-signin");
  });

  test("02: budtender → forbidden", async ({ page }) => {
    await signInAs(page, CASHIER_EMAIL);
    await page.waitForURL(/\/forbidden/, { timeout: 20_000 });
    await shot(page, "02-forbidden-budtender");
  });

  test("03: manager dashboard", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.waitForURL("/", { timeout: 20_000 });
    await shot(page, "03-dashboard");
  });

  test("04: products list", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/products");
    await shot(page, "04-products-list");
  });

  test("05: new product form", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/products/new");
    await shot(page, "05-product-new");
  });

  test("06: product edit", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/products");
    const firstProduct = page.getByRole("link", { name: /Blue Dream$/i }).first();
    if ((await firstProduct.count()) > 0) {
      await firstProduct.click();
      await page.waitForURL(/\/products\/[0-9a-f-]+\/edit/);
      await shot(page, "06-product-edit");
    }
  });

  test("07: sales list", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/sales");
    await shot(page, "07-sales-list");
  });

  test("08: inventory list", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/inventory");
    await shot(page, "08-inventory-list");
  });

  test("09: inventory detail", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/inventory");
    const adjustLink = page.getByRole("link", { name: /adjust/i }).first();
    if ((await adjustLink.count()) > 0) {
      await adjustLink.click();
      await page.waitForURL(/\/inventory\/[0-9a-f-]+/);
      await shot(page, "09-inventory-detail");
    }
  });

  test("10: compliance alerts", async ({ page }) => {
    await signInAs(page, MANAGER_EMAIL);
    await page.goto("/alerts");
    await shot(page, "10-alerts-list");
  });
});
