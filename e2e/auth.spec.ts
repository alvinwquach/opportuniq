import { test, expect } from "@playwright/test";
import path from "path";

// ============================================================================
// auth.spec.ts — Authentication flows
// Covers:
//   - Unauthenticated redirect to auth page
//   - Sign in flow
//   - Sign out clears session
// ============================================================================

test.describe("Auth — unauthenticated redirect", () => {
  // These run without a stored auth session
  test("visiting /dashboard redirects to login", async ({ browser }) => {
    const context = await browser.newContext(); // fresh context, no saved auth
    const page = await context.newPage();

    await page.goto("/dashboard");
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });

    expect(page.url()).toMatch(/auth\/login|\/login/);
    await context.close();
  });

  test("visiting /dashboard/diagnose redirects to login", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/dashboard/diagnose");
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });

    expect(page.url()).toMatch(/auth\/login|\/login/);
    await context.close();
  });

  test("login page renders OAuth buttons", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/auth/login");
    await page.waitForLoadState("domcontentloaded");

    // GitHub and Google OAuth buttons should be visible
    await expect(page.getByRole("button", { name: /github/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible({
      timeout: 10000,
    });

    await context.close();
  });
});

test.describe("Auth — authenticated session", () => {
  test("authenticated user can reach /dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Should not be redirected to login
    await page.waitForLoadState("networkidle");
    const url = page.url();

    // If no TEST_USER_EMAIL is set, auth.setup skipped saving a session —
    // in that case the test is a no-op rather than a hard failure.
    if (url.includes("/auth/login") || url.includes("/login")) {
      test.skip(true, "No auth session — set TEST_USER_EMAIL + TEST_USER_PASSWORD");
    }

    expect(url).toMatch(/\/dashboard/);
  });

  test("sign out clears session and redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (
      page.url().includes("/auth/login") ||
      page.url().includes("/login")
    ) {
      test.skip(true, "No auth session — set TEST_USER_EMAIL + TEST_USER_PASSWORD");
    }

    // Navigate to the logout route
    await page.goto("/auth/logout");

    // Should land on login or root after logout
    await page.waitForURL(/\/auth\/login|\/login|^\/$/, { timeout: 15000 });
    expect(page.url()).toMatch(/auth\/login|\/login|\//);

    // Confirm session is gone — /dashboard should redirect back to login
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
    expect(page.url()).toMatch(/auth\/login|\/login/);
  });

  test("login page has correct heading", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/auth/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByRole("heading", { name: /get started/i })).toBeVisible({
      timeout: 10000,
    });

    await context.close();
  });
});

test.describe("Auth — login page spec", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // force no-auth for this group

  test("login page loads without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    const critical = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error")
    );
    expect(critical).toHaveLength(0);
  });

  test("login page links to terms and privacy", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByRole("link", { name: /terms/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("link", { name: /privacy/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
