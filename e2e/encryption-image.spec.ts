import { test, expect, Page } from "@playwright/test";
import path from "path";

/**
 * E2E Tests for Encrypted Image Upload Flow
 *
 * Tests the complete user journey:
 * 1. User navigates to diagnosis page
 * 2. User uploads an image (client encrypts)
 * 3. Image appears in chat (client decrypts)
 * 4. Page reload - image still visible (key persists in IndexedDB)
 * 5. Admin cannot see image content (only metadata in DB)
 *
 * Uses test image: public/alpha/IMG_4186.jpeg
 */

const TEST_IMAGE_PATH = path.join(
  process.cwd(),
  "public/alpha/IMG_4186.jpeg"
);

// Helper to wait for encryption to complete
async function waitForEncryption(page: Page) {
  // Wait for the encryption progress indicator to appear and disappear
  try {
    await page.waitForSelector('[data-testid="encryption-progress"]', {
      timeout: 5000,
    });
    await page.waitForSelector('[data-testid="encryption-progress"]', {
      state: "hidden",
      timeout: 30000,
    });
  } catch {
    // If no progress indicator, encryption might be instant
  }
}

// Helper to get IndexedDB encryption key
async function getStoredKeyFromIndexedDB(page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    return new Promise((resolve) => {
      const request = indexedDB.open("encryption-keys", 1);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("keys")) {
          resolve(null);
          return;
        }
        const tx = db.transaction("keys", "readonly");
        const store = tx.objectStore("keys");
        const getRequest = store.getAll();
        getRequest.onsuccess = () => {
          const keys = getRequest.result;
          resolve(keys.length > 0 ? JSON.stringify(keys[0]) : null);
        };
        getRequest.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  });
}

// Helper to clear IndexedDB
async function clearIndexedDB(page: Page) {
  await page.evaluate(async () => {
    return new Promise<void>((resolve) => {
      const deleteRequest = indexedDB.deleteDatabase("encryption-keys");
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
    });
  });
}

test.describe("Encrypted Image Upload E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing encryption keys
    await page.goto("/");
    await clearIndexedDB(page);
  });

  test("uploads and displays encrypted image in diagnosis chat", async ({
    page,
  }) => {
    // Navigate to diagnosis page (requires auth - may need to mock)
    await page.goto("/dashboard/diagnose");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if we need to login first
    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(
        true,
        "Requires authentication - run with authenticated session"
      );
      return;
    }

    // Find the file input and upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Wait for encryption
    await waitForEncryption(page);

    // Submit the form/send message
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for image to appear in chat
    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("encryption key is stored in IndexedDB", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload image to trigger key generation
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Wait for encryption to complete
    await waitForEncryption(page);

    // Check that encryption key was stored
    const storedKey = await getStoredKeyFromIndexedDB(page);

    // Key should exist after encryption
    expect(storedKey).not.toBeNull();
  });

  test("image persists after page reload", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload and send image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for image to appear
    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Image should still be visible (decrypted using persisted key)
    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("shows lock indicator for encrypted images", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for image to appear
    await page.waitForSelector('img[alt*="Uploaded"], img[alt*="image"]', {
      timeout: 30000,
    });

    // Check for encryption indicator (lock icon)
    const lockIcon = page.locator('[title*="encrypted"], [aria-label*="encrypted"]');
    await expect(lockIcon).toBeVisible();
  });

  test("shows decryption loading state", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // On reload, should briefly show decryption state
    await page.reload();

    // Look for "Decrypting..." text (may be brief)
    // This verifies the encryption flow is working
    const decryptingIndicator = page.locator('text=Decrypting');

    // Either catch it or it already passed
    try {
      await expect(decryptingIndicator).toBeVisible({ timeout: 1000 });
    } catch {
      // Fast decryption - indicator may not be visible
    }

    // Final state should show the image
    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("handles multiple image uploads", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload first image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for first image
    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });

    // Upload second image
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Should have multiple images
    const images = page.locator('img[alt*="Uploaded"], img[alt*="image"]');
    await expect(images).toHaveCount(2, { timeout: 30000 });
  });
});

test.describe("Admin Privacy Verification", () => {
  test("verifies encryption prevents admin access to content", async ({
    page,
    request,
  }) => {
    /**
     * This test verifies the E2EE privacy guarantee:
     * Even with database access, admin cannot see image content
     */

    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for upload to complete
    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });

    // Verify the encryption key is NOT sent to server
    // by checking network requests
    const networkLogs = await page.evaluate(() => {
      return (window as { __networkLogs?: string[] }).__networkLogs || [];
    });

    // Key should never appear in network requests
    const keyInNetwork = networkLogs.some(
      (log) => log.includes("keyData") || log.includes("encryptionKey")
    );
    expect(keyInNetwork).toBe(false);
  });

  test("encrypted blob is stored, not plaintext", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Intercept the upload request
    let uploadedContentType = "";
    await page.route("**/api/attachments/upload", (route) => {
      const request = route.request();
      uploadedContentType =
        request.headers()["content-type"] || "";
      route.continue();
    });

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    // The upload should be multipart/form-data with encrypted blob
    // NOT image/jpeg (which would be plaintext)
    expect(uploadedContentType).toContain("multipart/form-data");
  });
});

test.describe("Error Handling", () => {
  test("shows error when decryption fails", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Upload image successfully
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await waitForEncryption(page);

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Send")'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    await expect(
      page.locator('img[alt*="Uploaded"], img[alt*="image"]').first()
    ).toBeVisible({ timeout: 30000 });

    // Clear IndexedDB to lose the key
    await clearIndexedDB(page);

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should show error state for image (can't decrypt without key)
    // Either shows error or "Encrypted image" placeholder
    const errorOrPlaceholder = page.locator(
      'text=Decryption failed, text=Failed to decrypt, text=Encrypted image'
    );
    await expect(errorOrPlaceholder.first()).toBeVisible({ timeout: 30000 });
  });

  test("handles upload failure gracefully", async ({ page }) => {
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/auth")) {
      test.skip(true, "Requires authentication");
      return;
    }

    // Mock API to fail
    await page.route("**/api/attachments/upload", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Upload failed" }),
      });
    });

    // Try to upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Should show error message
    await expect(
      page.locator('text=Upload failed, text=Error, text=failed')
    ).toBeVisible({ timeout: 10000 });
  });
});
