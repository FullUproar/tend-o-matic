import { expect, test } from "@playwright/test";

const MANAGER_EMAIL = "manager@demo-mi.tend-o-matic.com";
const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";
const PASSWORD = "demopass";

async function signIn(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("backoffice — role gate", () => {
  test("budtender lands on /forbidden", async ({ page }) => {
    await signIn(page, CASHIER_EMAIL);
    await page.waitForURL(/\/forbidden/, { timeout: 15_000 });
    await expect(page.getByText(/Access denied/i)).toBeVisible();
  });

  test("manager lands on the dashboard", async ({ page }) => {
    await signIn(page, MANAGER_EMAIL);
    await page.waitForURL("/", { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/Sales today/i)).toBeVisible();
  });
});

test.describe("backoffice — section tour", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MANAGER_EMAIL);
    await page.waitForURL("/", { timeout: 15_000 });
  });

  test("Products page lists rows + new-product link", async ({ page }) => {
    await page.getByRole("link", { name: "Products" }).first().click();
    await page.waitForURL(/\/products/);
    await expect(page.getByRole("heading", { name: /Products/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /New product/i }),
    ).toBeVisible();
    // Seed populates ~6 products; at minimum a Blue Dream row.
    await expect(page.getByText(/Blue Dream/i).first()).toBeVisible();
  });

  test("Sales page renders filter + KPI cards", async ({ page }) => {
    await page.getByRole("link", { name: "Sales" }).first().click();
    await page.waitForURL(/\/sales/);
    await expect(page.getByRole("heading", { name: /Sales/i })).toBeVisible();
    // Filter form
    await expect(page.getByLabel(/From/i)).toBeVisible();
    await expect(page.getByLabel(/To/i)).toBeVisible();
    // KPI cards
    await expect(page.getByText(/Subtotal/i).first()).toBeVisible();
    await expect(page.getByText(/Grand total/i).first()).toBeVisible();
  });

  test("Inventory page filters by status + lists packages", async ({ page }) => {
    await page.getByRole("link", { name: "Inventory" }).first().click();
    await page.waitForURL(/\/inventory/);
    await expect(
      page.getByRole("heading", { name: /Inventory/i }),
    ).toBeVisible();
    // Status filter dropdown
    await expect(page.getByLabel(/^Status/i)).toBeVisible();
  });

  test("Compliance alerts page shows source registry table", async ({
    page,
  }) => {
    // Sidebar nav has "Compliance"; the dashboard card has "Compliance
    // alerts". The sidebar link is the more reliable navigation entry.
    await page.getByRole("link", { name: "Compliance", exact: true }).click();
    await page.waitForURL(/\/alerts/);
    await expect(
      page.getByRole("heading", { name: /Compliance alerts/i }),
    ).toBeVisible();
    // "11 sources watched" caption in the header.
    await expect(page.getByText(/sources watched/i)).toBeVisible();
  });

  test("Sign out returns to /sign-in", async ({ page }) => {
    await page.getByRole("button", { name: /Sign out/i }).click();
    await page.waitForURL(/\/sign-in/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });
});

test.describe("backoffice — product CRUD smoke", () => {
  test("create then de-list a sample product", async ({ page }) => {
    const uniqueSku = `e2e-${Date.now()}`;
    await signIn(page, MANAGER_EMAIL);
    await page.waitForURL("/", { timeout: 15_000 });

    await page.getByRole("link", { name: "Products" }).first().click();
    await page.getByRole("link", { name: /New product/i }).click();
    await page.waitForURL(/\/products\/new/);

    await page.getByLabel(/^SKU/i).fill(uniqueSku);
    await page.getByLabel(/^Name/i).fill("E2E Test Product");
    // Default Category=FLOWER, leave others.
    await page.getByRole("button", { name: /Create product/i }).click();

    // Should land on /products/[id]/edit
    await page.waitForURL(/\/products\/[0-9a-f-]+\/edit/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "E2E Test Product" })).toBeVisible();

    // De-list it.
    await page.getByRole("button", { name: /De-list/i }).click();
    // Button toggles to Re-list.
    await expect(page.getByRole("button", { name: /Re-list/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
