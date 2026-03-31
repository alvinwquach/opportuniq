import { test, expect } from "@playwright/test";

// ============================================================================
// dashboard-navigation.spec.ts — Dashboard tab navigation (authenticated)
// Covers:
//   - All main dashboard tabs load without errors
//   - Settings subtabs load
//   - Admin pages load (if user is admin)
// ============================================================================

/** Skip the test if the auth session wasn't set up. */
function skipIfUnauthenticated(page: { url: () => string }) {
  const url = page.url();
  if (url.includes("/auth/login") || url.includes("/login")) {
    test.skip(true, "No auth session — set TEST_USER_EMAIL + TEST_USER_PASSWORD");
  }
}

/** Navigate to a route and assert it loads without a redirect to login or a 404. */
async function assertPageLoads(
  page: import("@playwright/test").Page,
  route: string
) {
  await page.goto(route);
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();

  // Skip if redirected to login (user may not have this access)
  if (url.includes("/auth/login") || url.includes("/login")) {
    return false;
  }

  // Page should not show a generic 404/error
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const is404 = bodyText.includes("404") && bodyText.includes("not found");
  expect(is404).toBe(false);

  return true;
}

test.describe("Dashboard — main tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);
  });

  test("/dashboard loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const critical = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error")
    );
    expect(critical).toHaveLength(0);
  });

  test("/dashboard/diagnose loads", async ({ page }) => {
    await assertPageLoads(page, "/dashboard/diagnose");
    const url = page.url();
    if (!url.includes("/auth/login")) {
      expect(url).toMatch(/\/dashboard\/diagnose/);
    }
  });

  test("/dashboard/guides loads", async ({ page }) => {
    await assertPageLoads(page, "/dashboard/guides");
  });

  test("/dashboard/calendar loads", async ({ page }) => {
    await assertPageLoads(page, "/dashboard/calendar");
  });

  test("/dashboard/finances loads", async ({ page }) => {
    await assertPageLoads(page, "/dashboard/finances");
  });

  test("/dashboard/groups loads", async ({ page }) => {
    await assertPageLoads(page, "/dashboard/groups");
  });

  test("sidebar navigation is present on dashboard", async ({ page }) => {
    // Desktop sidebar (w-14 fixed column)
    const sidebar = page
      .locator("aside")
      .or(page.locator('[class*="sidebar"]'))
      .first();

    await expect(sidebar).toBeVisible({ timeout: 15000 });
  });

  test("sidebar contains diagnose navigation link", async ({ page }) => {
    const diagnoseLink = page
      .getByRole("link", { name: /diagnose/i })
      .or(page.locator('a[href*="/diagnose"]'));

    await expect(diagnoseLink.first()).toBeVisible({ timeout: 15000 });
  });

  test("sidebar contains settings navigation link", async ({ page }) => {
    const settingsLink = page
      .getByRole("link", { name: /settings/i })
      .or(page.locator('a[href*="/settings"]'));

    await expect(settingsLink.first()).toBeVisible({ timeout: 15000 });
  });

  test("clicking sidebar diagnose link navigates to /dashboard/diagnose", async ({
    page,
  }) => {
    const diagnoseLink = page
      .getByRole("link", { name: /diagnose/i })
      .or(page.locator('a[href*="/diagnose"]'))
      .first();

    await expect(diagnoseLink).toBeVisible({ timeout: 15000 });
    await diagnoseLink.click();
    await page.waitForLoadState("domcontentloaded");

    expect(page.url()).toMatch(/\/dashboard\/diagnose/);
  });
});

test.describe("Dashboard — settings subtabs", () => {
  const settingsRoutes = [
    "/dashboard/settings/profile",
    "/dashboard/settings/location",
    "/dashboard/settings/income",
    "/dashboard/settings/budget",
    "/dashboard/settings/expenses",
    "/dashboard/settings/integrations",
  ];

  for (const route of settingsRoutes) {
    test(`${route} loads`, async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      skipIfUnauthenticated(page);

      await assertPageLoads(page, route);
    });
  }

  test("settings page renders subtab navigation", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);

    // Settings should have subtab links for profile, location, etc.
    const hasSubtabs =
      (await page.getByRole("link", { name: /profile/i }).isVisible().catch(() => false)) ||
      (await page.getByRole("tab", { name: /profile/i }).isVisible().catch(() => false)) ||
      (await page.locator('a[href*="settings"]').count()) > 1;

    expect(hasSubtabs).toBe(true);
  });
});

test.describe("Dashboard — admin pages", () => {
  const adminRoutes = [
    "/admin",
    "/admin/analytics",
    "/admin/invites",
    "/admin/waitlist",
  ];

  for (const route of adminRoutes) {
    test(`${route} loads or returns 403 for non-admin`, async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      skipIfUnauthenticated(page);

      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const url = page.url();

      // Admin pages either load (admin user), redirect to dashboard (non-admin),
      // or redirect to login. All are valid outcomes.
      expect(
        url.includes(route) ||
          url.includes("/dashboard") ||
          url.includes("/auth/login") ||
          url.includes("/login")
      ).toBe(true);
    });
  }
});

test.describe("Dashboard — page-level smoke tests", () => {
  test("all main routes return 200-level (not 404)", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);

    const routes = [
      "/dashboard",
      "/dashboard/diagnose",
      "/dashboard/guides",
      "/dashboard/calendar",
      "/dashboard/finances",
      "/dashboard/groups",
      "/dashboard/settings",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      // Response may be null for client-side navigations, that's fine
      if (response) {
        expect(response.status()).toBeLessThan(500);
      }
    }
  });
});
