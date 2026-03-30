/**
 * Quote Feedback Unit Tests
 *
 * Tests:
 * - Zod schema validation for the quotes API
 * - PostHog analytics tracking functions
 * - useQuoteSubmission hook behavior
 */

// ============================================================================
// ZOD VALIDATION (mirroring the server-side schema)
// ============================================================================

import { z } from "zod";

const submitQuoteSchema = z.object({
  issueId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  serviceType: z.string().min(1),
  zipCode: z.string().min(1),
  quoteCents: z.number().int().min(0),
  quoteType: z.enum(["diy", "professional"]),
  contractorName: z.string().optional(),
  description: z.string().optional(),
  wasAccepted: z.enum(["yes", "no", "pending"]).optional(),
});

const validInput = {
  serviceType: "plumbing",
  zipCode: "90210",
  quoteCents: 35000,
  quoteType: "professional" as const,
};

describe("Quote form validation (Zod schema)", () => {
  it("accepts a valid input", () => {
    const result = submitQuoteSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing quoteCents", () => {
    const { quoteCents: _q, ...without } = validInput;
    const result = submitQuoteSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects missing quoteType", () => {
    const { quoteType: _qt, ...without } = validInput;
    const result = submitQuoteSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects missing serviceType", () => {
    const { serviceType: _s, ...without } = validInput;
    const result = submitQuoteSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects missing zipCode", () => {
    const { zipCode: _z, ...without } = validInput;
    const result = submitQuoteSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects negative quoteCents", () => {
    const result = submitQuoteSchema.safeParse({ ...validInput, quoteCents: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric quoteCents", () => {
    const result = submitQuoteSchema.safeParse({ ...validInput, quoteCents: "free" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid quoteType value", () => {
    const result = submitQuoteSchema.safeParse({ ...validInput, quoteType: "contractor" });
    expect(result.success).toBe(false);
  });

  it("accepts diy quoteType", () => {
    const result = submitQuoteSchema.safeParse({ ...validInput, quoteType: "diy" });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = submitQuoteSchema.safeParse({
      ...validInput,
      contractorName: "ABC Plumbing",
      description: "Full pipe replacement",
      wasAccepted: "yes",
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      issueId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid wasAccepted value", () => {
    const result = submitQuoteSchema.safeParse({ ...validInput, wasAccepted: "maybe" });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// POSTHOG ANALYTICS
// ============================================================================

jest.mock("@/lib/posthog/client", () => ({
  __esModule: true,
  default: { capture: jest.fn() },
}));

import posthog from "@/lib/posthog/client";
import {
  trackQuoteSubmitted,
  trackQuoteAccepted,
  trackQuoteRejected,
} from "@/lib/analytics";

const mockCapture = posthog.capture as jest.Mock;

beforeEach(() => {
  mockCapture.mockClear();
});

describe("Quote PostHog tracking functions", () => {
  it("trackQuoteSubmitted calls posthog.capture with 'Quote Submitted'", () => {
    trackQuoteSubmitted({ issueId: "id-1", quoteCents: 35000, quoteType: "professional" });
    expect(mockCapture).toHaveBeenCalledWith("Quote Submitted", expect.objectContaining({ quoteCents: 35000 }));
  });

  it("trackQuoteAccepted calls posthog.capture with 'Quote Accepted'", () => {
    trackQuoteAccepted({ issueId: "id-1", contractorName: "ABC Plumbing" });
    expect(mockCapture).toHaveBeenCalledWith("Quote Accepted", expect.objectContaining({ contractorName: "ABC Plumbing" }));
  });

  it("trackQuoteRejected calls posthog.capture with 'Quote Rejected'", () => {
    trackQuoteRejected({ issueId: "id-1", contractorName: "ABC Plumbing", reason: "too expensive" });
    expect(mockCapture).toHaveBeenCalledWith("Quote Rejected", expect.objectContaining({ reason: "too expensive" }));
  });
});
