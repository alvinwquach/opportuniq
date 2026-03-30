/**
 * useQuoteSubmission hook tests
 *
 * Verifies:
 * - mutationFn calls POST /api/quotes with the correct body
 * - throws on non-ok response
 * - invalidates the "quotes" query on success
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock analytics (avoids posthog-js browser globals)
jest.mock("@/lib/analytics", () => ({
  trackQuoteSubmitted: jest.fn(),
  trackQuoteAccepted: jest.fn(),
  trackQuoteRejected: jest.fn(),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { Wrapper, queryClient };
}

const validInput = {
  serviceType: "plumbing",
  zipCode: "90210",
  quoteCents: 35000,
  quoteType: "professional" as const,
};

describe("useQuoteSubmission", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("calls POST /api/quotes with the correct body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quote: { id: "q1" } }),
    });

    const { Wrapper } = makeWrapper();
    const { useQuoteSubmission } = await import("@/hooks/useQuoteSubmission");
    const { result } = renderHook(() => useQuoteSubmission(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(validInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/quotes",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(validInput),
      })
    );
  });

  it("throws when the API returns a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });

    const { Wrapper } = makeWrapper();
    const { useQuoteSubmission } = await import("@/hooks/useQuoteSubmission");
    const { result } = renderHook(() => useQuoteSubmission(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(validInput);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it("invalidates quotes queries on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quote: { id: "q1" } }),
    });

    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { useQuoteSubmission } = await import("@/hooks/useQuoteSubmission");
    const { result } = renderHook(() => useQuoteSubmission(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(validInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["quotes"] })
    );
  });
});
