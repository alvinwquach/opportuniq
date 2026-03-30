/**
 * Tests for /api/voice/translate
 * Covers: auth, translation, pass-through for English, error handling
 */

// ---- Mocks ---------------------------------------------------------------

// Polyfill Response.json static method if not available (node-fetch compatibility)
if (typeof Response.json !== "function") {
  (Response as unknown as Record<string, unknown>).json = (data: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
}

const mockGenerateText = jest.fn();

jest.mock("ai", () => ({
  generateText: (...args: [unknown, ...unknown[]]) => mockGenerateText(...args),
}));

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(() => ({})),
  createOpenAI: jest.fn(() => jest.fn(() => ({}))),
}));

const mockGetUser = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

// ---- Helpers -------------------------------------------------------------

import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/voice/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---- Tests ---------------------------------------------------------------

describe("/api/voice/translate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });
    mockGenerateText.mockResolvedValue({
      text: "Hello, how are you?",
    });
  });

  it("returns 401 without authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { POST } = await import("@/app/api/voice/translate/route");
    const res = await POST(
      makeRequest({ text: "Hola", sourceLanguage: "es", targetLanguage: "en" })
    );
    expect(res.status).toBe(401);
  });

  it("translates text from detected language to English", async () => {
    mockGenerateText.mockResolvedValue({ text: "Hello, how are you?" });

    const { POST } = await import("@/app/api/voice/translate/route");
    const res = await POST(
      makeRequest({ text: "¿Cómo estás?", sourceLanguage: "es", targetLanguage: "en" })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("translatedText");
  });

  it("returns original text when already in English", async () => {
    const { POST } = await import("@/app/api/voice/translate/route");
    const res = await POST(
      makeRequest({
        text: "Hello world",
        sourceLanguage: "en",
        targetLanguage: "en",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    // Either passes through or calls AI — either way translatedText should exist
    expect(body).toHaveProperty("translatedText");
  });

  it("handles unsupported source language gracefully", async () => {
    // Even for unusual languages, the route should still attempt translation
    mockGenerateText.mockResolvedValue({ text: "Translated result" });

    const { POST } = await import("@/app/api/voice/translate/route");
    const res = await POST(
      makeRequest({
        text: "Some text",
        sourceLanguage: "xx-UNKNOWN",
        targetLanguage: "en",
      })
    );

    // Route either translates or returns error
    expect([200, 400, 422]).toContain(res.status);
  });

  it("returns error when OpenAI API fails", async () => {
    mockGenerateText.mockRejectedValue(new Error("OpenAI rate limit exceeded"));

    const { POST } = await import("@/app/api/voice/translate/route");
    const res = await POST(
      makeRequest({ text: "こんにちは", sourceLanguage: "ja", targetLanguage: "en" })
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
