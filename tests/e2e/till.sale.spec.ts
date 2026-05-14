import { expect, test } from "@playwright/test";

const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";
const PASSWORD = "demopass";

async function signInAsCashier(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(CASHIER_EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/");
}

test.describe("till — sign-in", () => {
  test("redirects to /sign-in when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("rejects bad credentials with a visible error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(CASHIER_EMAIL);
    await page.getByLabel("Password").fill("WRONG-PASSWORD");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/sign-in/);
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("signs the demo cashier in and lands on the till", async ({ page }) => {
    await signInAsCashier(page);
    await expect(page.getByText("TEND-O-MATIC")).toBeVisible();
    await expect(page.getByText(/Demo MI/)).toBeVisible();
    await expect(page.getByText(/cashier|budtender/i)).toBeVisible();
  });
});

test.describe("till — happy-path sale", () => {
  test("flower sale: pick product → tender cash → receipt", async ({ page }) => {
    await signInAsCashier(page);

    // ID-verify the customer first — adult-use refuses otherwise.
    await page.getByLabel(/ID verified/i).check();

    // Pick the first FLOWER product from the picker. It defaults to
    // 3.5g / 1 qty / 5000c. Use the visible product list.
    // Pick a FLOWER product via its SKU (unambiguous).
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();

    // The picker now shows the weight/qty/price form. Default values
    // are fine; click "Add to cart".
    await page.getByRole("button", { name: /Add to cart/i }).click();

    // Cart should show one line + tax breakdown.
    await expect(page.getByRole("heading", { name: /Cart/i })).toBeVisible();
    await expect(page.getByText("Subtotal", { exact: true })).toBeVisible();
    await expect(page.getByText("TOTAL", { exact: true })).toBeVisible();

    // Tender form auto-fills to total; click complete.
    const completeBtn = page.getByRole("button", { name: /Complete sale/i });
    await expect(completeBtn).toBeEnabled();
    await completeBtn.click();

    // Receipt preview should show. Sale-recorded indicator visible.
    await expect(page.getByRole("heading", { name: /Sale recorded/i })).toBeVisible({
      timeout: 15_000,
    });
    // Receipt content rendered as a <pre>.
    await expect(page.locator("pre")).toContainText("TOTAL");
    await expect(page.locator("pre")).toContainText("$");
    // Start-new-sale button reappears.
    await expect(
      page.getByRole("button", { name: /Start new sale/i }),
    ).toBeVisible();
  });

  test("over-cap refusal banner: 80g of flower trips LIMIT_EXCEEDED", async ({
    page,
  }) => {
    await signInAsCashier(page);
    await page.getByLabel(/ID verified/i).check();
    // Pick a FLOWER product via its SKU (unambiguous).
    await page
      .getByRole("button")
      .filter({ hasText: "demo-flower-blue-dream" })
      .first()
      .click();
    // Bump weight past 2.5oz (~71g).
    await page.getByLabel(/^Weight/i).fill("80");
    await page.getByRole("button", { name: /Add to cart/i }).click();

    // Refusal banner should appear (role=alert). Next.js also injects a
    // hidden #__next-route-announcer__ with role=alert; scope to the
    // visible one inside the till shell.
    const refusalBanner = page
      .getByRole("alert")
      .filter({ hasText: /LIMIT_EXCEEDED|Refused/i });
    await expect(refusalBanner).toBeVisible();
    await expect(refusalBanner).toContainText(/LIMIT_EXCEEDED|refused/i);
  });

  test("sign out returns to /sign-in", async ({ page }) => {
    await signInAsCashier(page);
    await page.getByRole("button", { name: /Sign out/i }).click();
    await page.waitForURL(/\/sign-in/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });
});
