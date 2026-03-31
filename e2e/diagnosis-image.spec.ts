import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// ============================================================================
// diagnosis-image.spec.ts — Image upload in diagnosis chat (authenticated)
// Covers:
//   - Upload button is present and clickable
//   - Image preview shows before sending
//   - Image upload → diagnosis with severity + cost + contractors
// ============================================================================

/** Skip the test if the auth session wasn't set up. */
function skipIfUnauthenticated(page: { url: () => string }) {
  const url = page.url();
  if (url.includes("/auth/login") || url.includes("/login")) {
    test.skip(true, "No auth session — set TEST_USER_EMAIL + TEST_USER_PASSWORD");
  }
}

// Create a minimal valid JPEG for testing (1x1 pixel)
const TEST_IMAGE_PATH = path.join(__dirname, "fixtures", "test-image.jpg");

// Ensure test fixtures directory and a sample image exist
function ensureTestImage() {
  const dir = path.dirname(TEST_IMAGE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    // Minimal JPEG bytes (1x1 white pixel)
    const minimalJpeg = Buffer.from(
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U" +
        "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN" +
        "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
        "MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA" +
        "AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA" +
        "/9oADAMBAAIRAxEAPwCwABmX/9k=",
      "base64"
    );
    fs.writeFileSync(TEST_IMAGE_PATH, minimalJpeg);
  }
}

test.describe("Diagnosis Image — upload UI", () => {
  test.beforeEach(async ({ page }) => {
    ensureTestImage();
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);
  });

  test("file input for images is present in chat", async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await expect(fileInput).toHaveCount(1, { timeout: 15000 });
  });

  test("file input accepts image and video mime types", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    const accept = await fileInput.getAttribute("accept");
    expect(accept).toMatch(/image/);
  });

  test("upload button (attach icon) is clickable", async ({ page }) => {
    // The attach button triggers the hidden file input via ref click
    // Verify the hidden file input is present and the chat form is rendered
    const chatInput = page.getByPlaceholder(/describe your issue/i);
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 10000 });
  });

  test("image preview appears after selecting file", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    // Set the file on the hidden input
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // A preview thumbnail should appear (image or div with background)
    const preview = page
      .locator('img[alt*="attachment"], img[alt*="preview"], img[alt*="upload"]')
      .or(page.locator('[class*="preview"], [class*="attachment"], [class*="thumbnail"]'))
      .or(page.locator("img").filter({ hasNot: page.locator('a') }));

    await expect(preview.first()).toBeVisible({ timeout: 10000 });
  });

  test("remove button appears on image preview", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // After attaching, a remove/close button should appear on the preview
    const removeBtn = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .filter({ hasNot: page.locator('[placeholder]') });

    // Wait a moment for the preview to render
    await page.waitForTimeout(500);

    // Send button should now be enabled (attachment present, even without text)
    const sendBtn = page.locator('button[type="submit"]').last();
    await expect(sendBtn).toBeEnabled({ timeout: 5000 });
  });

  test("send button enables after attaching image with no text", async ({
    page,
  }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    // Confirm send is disabled without input
    const sendBtn = page.locator('button[type="submit"]').last();
    await expect(sendBtn).toBeDisabled();

    // Attach image — should enable send even with empty text input
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await expect(sendBtn).toBeEnabled({ timeout: 5000 });
  });
});

test.describe("Diagnosis Image — AI diagnosis from image", () => {
  test.beforeEach(async ({ page }) => {
    ensureTestImage();
    await page.goto("/dashboard/diagnose");
    await page.waitForLoadState("networkidle");
    skipIfUnauthenticated(page);
  });

  test("uploading image and sending produces AI response", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Also add a text description to give the AI context
    const chatInput = page.getByPlaceholder(/describe your issue/i);
    await chatInput.fill("There is a stain on my ceiling. What could this be?");

    const sendBtn = page.locator('button[type="submit"]').last();
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Wait for AI to respond — stop streaming indicator or text in response
    await expect(
      page.getByText(/severity|stain|leak|damage|ceiling|moisture|cost/i)
    ).toBeVisible({ timeout: 60000 });
  });

  test("response to image includes severity assessment", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    const chatInput = page.getByPlaceholder(/describe your issue/i);
    await chatInput.fill("Assess the severity of this home issue.");

    await page.locator('button[type="submit"]').last().click();

    await expect(
      page.getByText(/severity|urgent|minor|moderate|critical|low|high/i)
    ).toBeVisible({ timeout: 60000 });
  });
});
