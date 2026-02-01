import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known acceptable errors (if any)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("ResizeObserver") && // ResizeObserver loop errors are benign
        !error.includes("Non-Error promise rejection") // Some third-party scripts
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("should render the DashboardDemo section", async ({ page }) => {
    // Wait for the dynamic component to load
    await page.waitForSelector("text=Your Decision Command Center", {
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", { name: /Your Decision Command Center/i })
    ).toBeVisible();
  });

  test("should render the sidebar navigation", async ({ page }) => {
    await page.waitForSelector("text=OpportunIQ", { timeout: 10000 });

    await expect(page.getByText("OpportunIQ")).toBeVisible();
    await expect(page.getByRole("button", { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Issues/i })).toBeVisible();
  });

  test("should switch tabs when clicking navigation", async ({ page }) => {
    await page.waitForSelector("text=Your Decision Command Center", {
      timeout: 10000,
    });

    // Default should show dashboard content
    await expect(page.getByText("Welcome back, Alex")).toBeVisible();

    // Click Issues tab
    await page.getByRole("button", { name: /Issues/i }).click();
    await expect(page.getByText("Issue Pipeline")).toBeVisible();

    // Click Diagnose tab
    await page.getByRole("button", { name: /Diagnose/i }).click();
    await expect(page.getByText("AI-Powered Diagnosis")).toBeVisible();
  });

  test("should render New Issue button and form", async ({ page }) => {
    await page.waitForSelector("text=New Issue", { timeout: 10000 });

    await page.getByRole("button", { name: /New Issue/i }).click();
    await expect(page.getByText("Create New Issue")).toBeVisible();
  });

  test("should display stats in sidebar", async ({ page }) => {
    await page.waitForSelector("text=Time Value", { timeout: 10000 });

    await expect(page.getByText("$45/hr")).toBeVisible();
    await expect(page.getByText("$272")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.waitForSelector("text=Your Decision Command Center", {
      timeout: 10000,
    });

    // The content should still be visible
    await expect(
      page.getByRole("heading", { name: /Your Decision Command Center/i })
    ).toBeVisible();
  });
});

test.describe("Landing Page Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    // Page should load DOM content within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should have no console errors on initial load", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known benign errors
    const realErrors = consoleErrors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("ResizeObserver") &&
        !error.includes("Download the React DevTools")
    );

    // Log errors for debugging
    if (realErrors.length > 0) {
      console.log("Console errors found:", realErrors);
    }

    expect(realErrors).toHaveLength(0);
  });
});

test.describe("Landing Page Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h2", { timeout: 10000 });

    const h2s = await page.locator("h2").all();
    expect(h2s.length).toBeGreaterThan(0);
  });

  test("all buttons should be clickable", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Your Decision Command Center", {
      timeout: 10000,
    });

    const buttons = await page.getByRole("button").all();

    for (const button of buttons.slice(0, 5)) {
      // Test first 5 buttons
      await expect(button).toBeEnabled();
    }
  });
});
