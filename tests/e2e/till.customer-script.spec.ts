// Refusal banner E2E. Verifies the two-layer rendering:
//
//   - Budtender diagnostic (refusal code + plain-English reason)
//   - Customer-safe script (headline / body / suggestion)
//   - "Copy script" button populates the clipboard
//
// Trigger: adult-use customer with ID *not* verified, attempting to
// add a line item → ID_NOT_VERIFIED. Reliable to set up without any
// schema fiddling.

import { expect, test } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";
const PASSWORD = "demopass";
const SCREENSHOT_DIR = "screenshots/till";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(CASHIER_EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/");
}

async function shot(
  page: import("@playwright/test").Page,
  name: string,
): Promise<void> {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function triggerIdNotVerified(page: import("@playwright/test").Page) {
  // Default cart is MI_ADULT_USE with idVerified=false. Picking a
  // product and trying to add it routes through the kernel and
  // refuses with ID_NOT_VERIFIED.
  await page
    .getByRole("button", { name: /Blue Dream/i })
    .first()
    .click();
  await page.getByRole("button", { name: /add to cart/i }).click();
}

test.describe("till — customer-safe refusal scripts", () => {
  test("renders both budtender diagnostic and customer script", async ({
    page,
  }) => {
    await signIn(page);
    await triggerIdNotVerified(page);

    const banner = page.getByRole("alert").filter({ hasText: /Refused/i });
    await expect(banner).toBeVisible();

    // Layer 1: budtender diagnostic with the refusal code.
    await expect(banner.getByText(/ID_NOT_VERIFIED/i)).toBeVisible();
    await expect(
      banner.getByText(/ID has not been verified/i),
    ).toBeVisible();

    // Layer 2: customer-safe script with second-person framing.
    const script = banner.getByLabel("Customer script", { exact: true });
    await expect(script).toBeVisible();
    await expect(script).toContainText(/I need to verify your ID/i);
    await expect(script).toContainText(/Michigan requires/i);
    await expect(script).toContainText(/state-issued ID/i);

    await shot(page, "customer-script-id-not-verified");
  });

  test("Copy script button shows confirmation state", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await signIn(page);
    await triggerIdNotVerified(page);

    const banner = page.getByRole("alert").filter({ hasText: /Refused/i });
    const copyBtn = banner.getByRole("button", { name: /copy customer script/i });
    await expect(copyBtn).toHaveText(/copy script/i);
    await copyBtn.click();
    await expect(copyBtn).toHaveText(/copied/i);

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/I need to verify your ID/i);
    expect(clipboard).toMatch(/Michigan requires/i);
  });

  test("LIMIT_EXCEEDED script names the cap and offers a path forward", async ({
    page,
  }) => {
    await signIn(page);
    // Verify ID first so we can add items.
    await page.getByLabel(/ID verified/i).check();

    // Add a flower line that will push past the 2.5 oz / 70.87 g
    // Michigan transaction cap.
    await page
      .getByRole("button", { name: /Blue Dream/i })
      .first()
      .click();
    // Default form values are 3.5g qty 1; bump the qty up so we
    // cross 70+ grams.
    const qty = page.getByLabel(/Qty/);
    await qty.fill("21");
    await page.getByRole("button", { name: /add to cart/i }).click();

    const banner = page.getByRole("alert").filter({ hasText: /Refused/i });
    await expect(banner).toBeVisible();
    await expect(banner.getByText(/LIMIT_EXCEEDED/i)).toBeVisible();

    const script = banner.getByLabel("Customer script", { exact: true });
    // Customer-facing wording, not kernel jargon.
    await expect(script).toContainText(/Michigan/i);
    await expect(script).toContainText(/over/i);
    // Suggestion always offers an option to recover.
    await expect(script).toContainText(/drop|swap|split/i);

    await shot(page, "customer-script-limit-exceeded");
  });
});
