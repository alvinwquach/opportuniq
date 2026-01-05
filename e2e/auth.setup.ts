import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../.playwright/.auth/user.json");

/**
 * Authentication Setup for E2E Tests
 *
 * This runs ONCE before all tests to establish an authenticated session.
 * The session is saved to a file and reused by all tests.
 *
 * To use:
 * 1. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local
 * 2. Run: npx playwright test --project=setup
 * 3. Then run other tests which will use the saved session
 *
 * Or run all at once with the configured projects in playwright.config.ts
 */

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.log(
      "⚠️  TEST_USER_EMAIL and TEST_USER_PASSWORD not set in environment."
    );
    console.log("   Skipping authentication setup.");
    console.log("   E2E tests requiring auth will be skipped.");
    return;
  }

  // Navigate to login page
  await page.goto("/login");

  // Wait for the login form to be visible
  await page.waitForSelector('input[type="email"], input[name="email"]', {
    timeout: 10000,
  });

  // Fill in credentials
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (successful login)
  await page.waitForURL("**/dashboard**", { timeout: 30000 });

  // Verify we're logged in
  await expect(page).toHaveURL(/dashboard/);

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log("✅ Authentication successful, session saved.");
});
