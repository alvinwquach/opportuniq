/**
 * Server-side PostHog analytics
 *
 * Use this for events captured in API routes, server actions, and background jobs.
 * For client-side events, use lib/analytics.ts instead.
 */

import { PostHog } from "posthog-node";

let _serverClient: PostHog | null = null;

function getServerClient(): PostHog {
  if (!_serverClient) {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (!apiKey) throw new Error("POSTHOG_API_KEY is not set");
    _serverClient = new PostHog(apiKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _serverClient;
}

// ============================================
// COST DATA CACHE EVENTS
// ============================================

export function trackCostDataCacheHit(props: {
  serviceType: string;
  region: string;
  ageMs: number;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Cost Data Cache Hit",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

export function trackCostDataCacheMiss(props: {
  serviceType: string;
  region: string;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Cost Data Cache Miss",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// CONTRACTOR SEARCH EVENTS
// ============================================

export function trackContractorSearchZeroResults(props: {
  category: string;
  zipCode: string;
  providersAttempted: string[];
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Contractor Search Zero Results",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// CALENDAR REMINDER EVENTS
// ============================================

export function trackCalendarReminderCreated(props: {
  conversationId?: string;
  issueCategory?: string;
  daysOut: number;
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId ?? "system",
      event: "Calendar Reminder Created",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// CONTRACTOR VERIFICATION EVENTS
// ============================================

export function trackContractorVerified(props: {
  contractorName: string;
  state: string;
  hasLicense: boolean;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Contractor Verified",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// EMAIL DELIVERY EVENTS (Resend webhooks)
// ============================================

export function trackEmailDelivered(props: {
  rfqEmailId: string;
  contractorName: string;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Email Delivered",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

export function trackEmailOpenedByRecipient(props: {
  rfqEmailId: string;
  contractorName: string;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Email Opened By Recipient",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// RAG RETRIEVAL EVENTS
// ============================================

export function trackRAGContextRetrieved(props: {
  conversationId: string;
  similarCasesFound: number;
  topSimilarity: number;
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "RAG Context Retrieved",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

export function trackRAGContextEmpty(props: {
  conversationId: string;
  reason: "no_embeddings" | "no_similar";
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "RAG Context Empty",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

export function trackDiagnosisEmbedded(props: {
  conversationId: string;
  serviceType: string;
  hasOutcome: boolean;
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "Diagnosis Embedded",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// EVAL PIPELINE EVENTS
// ============================================

export function trackEvalRunCompleted(props: {
  conversationsChecked: number;
  hallucinations: number;
  toolFailures: number;
  accuracyScore: number;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Eval Run Completed",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

export function trackHallucinationDetected(props: {
  conversationId: string;
  hallucinatedAmounts: string[];
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "Hallucination Detected",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

export function trackBudgetExceeded(props: {
  category: string;
  budgetAmount: number;
  actualAmount: number;
  overagePercent: number;
}) {
  try {
    getServerClient().capture({
      distinctId: "system",
      event: "Budget Exceeded",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// GUARDRAIL EVENTS
// ============================================

export function trackGuardrailViolation(props: {
  conversationId: string;
  violations: string[];
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "Guardrail Violation",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// LANGFUSE TRACING EVENTS
// ============================================

export function trackLangfuseTraceCreated(props: {
  conversationId: string;
  traceId: string;
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "Langfuse Trace Created",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}

// ============================================
// STRUCTURED EXTRACTION EVENTS
// ============================================

export function trackStructuredExtractionCompleted(props: {
  conversationId: string;
  severity: string;
  diyFeasibility: string;
}) {
  try {
    getServerClient().capture({
      distinctId: props.conversationId,
      event: "Structured Extraction Completed",
      properties: props,
    });
  } catch {
    // PostHog unreachable — don't fail the request
  }
}
