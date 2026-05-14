// Service-mode toggle E2E. Verifies:
//  - default is GUIDED (the standing copy is visible)
//  - clicking EXPRESS hides the guided copy and collapses the headroom bar
//  - clicking MEDICAL surfaces the responsible-guidance banner
//  - mode persists across line-item adds (cart state, not UI ephemera)

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

test.describe("till — service mode", () => {
  test("defaults to GUIDED and shows guided copy", async ({ page }) => {
    await signIn(page);
    const guidedBtn = page.getByRole("radio", { name: "Guided" });
    await expect(guidedBtn).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText(/Lead with effect and format/i)).toBeVisible();
    await shot(page, "service-mode-guided");
  });

  test("EXPRESS collapses headroom to a single-line pill + hides guidance", async ({
    page,
  }) => {
    await signIn(page);
    await page.getByRole("radio", { name: "Express" }).click();
    await expect(
      page.getByRole("radio", { name: "Express" }),
    ).toHaveAttribute("aria-checked", "true");
    // Guidance disappears
    await expect(page.getByText(/Lead with effect and format/i)).toHaveCount(0);
    // Compact summary visible
    await expect(
      page.getByLabel(/Limit headroom summary/i),
    ).toBeVisible();
    await shot(page, "service-mode-express");
  });

  test("MEDICAL_SENSITIVE surfaces the responsible-guidance banner", async ({
    page,
  }) => {
    await signIn(page);
    await page.getByRole("radio", { name: "Medical-sensitive" }).click();
    await expect(
      page.getByRole("note", { name: /Medical-sensitive guidance/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Do not diagnose, treat, or recommend cannabis as medication/i),
    ).toBeVisible();
    await shot(page, "service-mode-medical");
  });

  test("FIRST_TIME surfaces start-low/go-slow + ID emphasis", async ({ page }) => {
    await signIn(page);
    await page.getByRole("radio", { name: "First-time" }).click();
    await expect(
      page.getByText(/Verify ID even if they look 30/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Start low and go slow|low-dose options/i),
    ).toBeVisible();
    await shot(page, "service-mode-first-time");
  });

  test("mode persists after adding a line item", async ({ page }) => {
    await signIn(page);
    await page.getByLabel(/ID verified/i).check();
    await page.getByRole("radio", { name: "Express" }).click();
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();
    // After add, EXPRESS should still be selected and compact bar still shown
    await expect(
      page.getByRole("radio", { name: "Express" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByLabel(/Limit headroom summary/i),
    ).toBeVisible();
  });
});
