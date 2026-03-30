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
