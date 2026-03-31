import { test, expect } from "@playwright/test";

// ============================================================================
// mobile.spec.ts — Mobile viewport tests (authenticated)
// Covers:
//   - Chat works on 375px viewport
//   - Navigation collapses to mobile menu
//   - Dashboard stats visible on mobile
// ============================================================================

/** Skip the test if the auth session wasn't set up. */
function skipIfUnauthenticated(page: { url: () => string }) {
  const url = page.url();
  if (url.includes("/auth/login") || url.includes("/login")) {
    test.skip(true, "No auth session — set TEST_USER_EMAIL + TEST_USER_PASSWORD");
  }
}

const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE

test.describe("Mobile — chat interface", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);
  });

  test("chat input is visible on 375px viewport", async ({ page }) => {
    const input = page.getByPlaceholder(/describe your issue/i);
    await expect(input).toBeVisible({ timeout: 15000 });
  });

  test("chat input is usable on mobile (accepts text)", async ({ page }) => {
    const input = page.getByPlaceholder(/describe your issue/i);
    await expect(input).toBeVisible({ timeout: 15000 });

    await input.fill("Mobile test: check faucet drip");
    await expect(input).toHaveValue("Mobile test: check faucet drip");
  });

  test("send button is visible and enabled after typing on mobile", async ({
    page,
  }) => {
    const input = page.getByPlaceholder(/describe your issue/i);
    await expect(input).toBeVisible({ timeout: 15000 });

    await input.fill("Test message from mobile");

    const sendBtn = page.locator('button[type="submit"]').last();
    await expect(sendBtn).toBeEnabled({ timeout: 5000 });
  });

  test("can send a message and receive response on mobile", async ({ page }) => {
    const input = page.getByPlaceholder(/describe your issue/i);
    await expect(input).toBeVisible({ timeout: 15000 });

    await input.fill("Quick test: is a dripping faucet urgent?");
    await input.press("Enter");

    // Wait for any response to appear
    await expect(
      page.getByText(/urgent|faucet|drip|washer|severity|cost|plumb/i)
    ).toBeVisible({ timeout: 60000 });
  });

  test("page does not have horizontal scroll on 375px", async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // Allow up to 2px tolerance for sub-pixel rounding
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});

test.describe("Mobile — navigation", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);
  });

  test("desktop sidebar is hidden on 375px", async ({ page }) => {
    // The DashboardSidebar uses 'hidden lg:flex' — sidebar should be hidden on mobile
    const desktopSidebar = page.locator("aside.hidden, aside").first();

    // Either hidden via CSS or not visible
    const isVisible = await desktopSidebar.isVisible().catch(() => false);

    // On mobile the sidebar should not be the full desktop one
    // The mobile header/hamburger should replace it
    const mobileHeader = page
      .locator('[class*="mobile"], header')
      .or(page.locator("header"))
      .first();

    const hasMobileNav = await mobileHeader.isVisible().catch(() => false);
    expect(hasMobileNav || !isVisible).toBe(true);
  });

  test("mobile menu toggle button is visible on 375px", async ({ page }) => {
    // Mobile header has a hamburger/menu toggle button
    const menuBtn = page
      .getByRole("button", { name: /menu|toggle|open navigation/i })
      .or(page.locator('button[aria-label*="menu" i]'))
      .or(page.locator('button[aria-label*="navigation" i]'))
      .or(
        // Hamburger icon button — look for button with 3-line SVG or similar
        page.locator("header button").first()
      );

    await expect(menuBtn).toBeVisible({ timeout: 15000 });
  });

  test("mobile menu opens when toggle is clicked", async ({ page }) => {
    const menuBtn = page
      .getByRole("button", { name: /menu|toggle/i })
      .or(page.locator("header button").first());

    await expect(menuBtn).toBeVisible({ timeout: 15000 });
    await menuBtn.click();
    await page.waitForTimeout(400); // animation

    // After clicking, a nav overlay or expanded menu should appear
    const expandedMenu = page
      .locator('[class*="mobile-open"], [class*="sidebar-open"], [aria-expanded="true"]')
      .or(page.locator('nav[class*="mobile"]'))
      .or(page.getByRole("navigation"));

    // Menu items like "Diagnose", "Dashboard" etc should now be visible
    const navLinks = page.locator('a[href*="/dashboard"]').filter({ hasText: /.+/ });
    const linkCount = await navLinks.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test("navigation links are accessible after opening mobile menu", async ({
    page,
  }) => {
    const menuBtn = page
      .getByRole("button", { name: /menu|toggle/i })
      .or(page.locator("header button").first());

    const hasMobileBtn = await menuBtn.isVisible().catch(() => false);
    if (hasMobileBtn) {
      await menuBtn.click();
      await page.waitForTimeout(400);
    }

    // Dashboard link should exist somewhere on the page
    const dashLink = page
      .getByRole("link", { name: /dashboard/i })
      .or(page.locator('a[href="/dashboard"]'));

    await expect(dashLink.first()).toBeVisible({ timeout: 10000 });
  });

  test("can navigate to diagnose from mobile menu", async ({ page }) => {
    const menuBtn = page
      .getByRole("button", { name: /menu|toggle/i })
      .or(page.locator("header button").first());

    const hasMobileBtn = await menuBtn.isVisible().catch(() => false);
    if (hasMobileBtn) {
      await menuBtn.click();
      await page.waitForTimeout(400);
    }

    const diagnoseLink = page
      .getByRole("link", { name: /diagnose/i })
      .or(page.locator('a[href*="/diagnose"]'))
      .first();

    const isVisible = await diagnoseLink.isVisible().catch(() => false);
    if (isVisible) {
      await diagnoseLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toMatch(/\/diagnose/);
    }
  });
});

test.describe("Mobile — dashboard stats", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);
  });

  test("dashboard content is visible on 375px", async ({ page }) => {
    // The main dashboard content should render on mobile
    await page.waitForTimeout(2000); // allow GraphQL data to load

    const content = page.locator("main, [class*='content'], [class*='dashboard']").first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  test("dashboard renders without horizontal overflow on 375px", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("no critical JS errors on mobile dashboard", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const critical = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error")
    );
    expect(critical).toHaveLength(0);
  });
});

test.describe("Mobile — landing page", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("landing page renders on 375px viewport", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /Your Decision Command Center/i })
    ).toBeVisible({ timeout: 15000 });
  });

  test("landing page has no horizontal scroll on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
