import { defineConfig, devices } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".playwright/.auth/user.json");

/**
 * Playwright Configuration for E2E Tests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // Setup project - runs authentication first
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // Main tests - use authenticated session
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use saved authentication state
        storageState: authFile,
      },
      dependencies: ["setup"],
    },

    // Tests without auth (for testing unauthenticated flows)
    {
      name: "chromium-no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
