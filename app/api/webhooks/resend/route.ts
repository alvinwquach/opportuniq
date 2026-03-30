/**
 * Resend Webhook Handler
 *
 * Receives email delivery events from Resend and updates the rfq_emails table.
 * Uses Svix-style HMAC-SHA256 signature verification (Resend is built on Svix).
 *
 * Supported events: email.delivered, email.opened, email.clicked,
 *                   email.bounced, email.complained
 *
 * Configure in the Resend dashboard under Webhooks.
 * Webhook URL: https://opportuniq.app/api/webhooks/resend
 * Required env: RESEND_WEBHOOK_SECRET (from Resend webhook settings)
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/app/db/client";
import { rfqEmails } from "@/app/db/schema";
import {
  trackEmailDelivered,
  trackEmailOpenedByRecipient,
} from "@/lib/analytics-server";

// ── Signature verification ─────────────────────────────────────────────────────

/**
 * Verify Resend webhook signature using the Svix HMAC-SHA256 algorithm.
 * Signed content: "{svix-id}.{svix-timestamp}.{rawBody}"
 * Secret: base64-decoded (strip "whsec_" prefix if present).
 */
function verifyResendSignature(
  rawBody: string,
  headers: Headers,
  secret: string
): boolean {
  const msgId = headers.get("svix-id");
  const msgTimestamp = headers.get("svix-timestamp");
  const msgSignature = headers.get("svix-signature");

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Replay protection: reject messages older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) return false;

  const toSign = `${msgId}.${msgTimestamp}.${rawBody}`;
  const secretBytes = Buffer.from(
    secret.replace(/^whsec_/, ""),
    "base64"
  );
  const computed = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  // svix-signature can contain multiple space-separated "v1,<sig>" entries
  const provided = msgSignature.split(" ").map((s) => s.replace(/^v1,/, ""));
  return provided.some((sig) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(computed),
        Buffer.from(sig)
      );
    } catch {
      return false;
    }
  });
}

// ── Payload types ──────────────────────────────────────────────────────────────

interface ResendEmailData {
  email_id?: string;
  reason?: string;
}

interface ResendWebhookEvent {
  type: string;
  data: ResendEmailData;
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Resend Webhook] RESEND_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  if (!verifyResendSignature(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { type, data } = event;
  const resendId = data?.email_id;

  if (!resendId) {
    return NextResponse.json(
      { error: "Missing email_id in payload" },
      { status: 400 }
    );
  }

  Sentry.addBreadcrumb({
    category: "resend-webhook",
    message: `Received ${type} for ${resendId}`,
    level: "info",
    data: { type, resendId },
  });

  // Look up the RFQ email record
  const records = await db
    .select()
    .from(rfqEmails)
    .where(eq(rfqEmails.resendId, resendId))
    .limit(1);

  const record = records[0];
  if (!record) {
    // Not an RFQ email (could be auth, invite, etc.) — return 200 to stop retries
    return NextResponse.json({ ok: true, skipped: "email not found in rfq_emails" });
  }

  switch (type) {
    case "email.delivered": {
      // Idempotent: skip if already marked delivered
      if (record.deliveredAt) {
        return NextResponse.json({ ok: true, skipped: "already delivered" });
      }
      await db
        .update(rfqEmails)
        .set({ status: "delivered", deliveredAt: new Date(), updatedAt: new Date() })
        .where(eq(rfqEmails.resendId, resendId));
      trackEmailDelivered({
        rfqEmailId: record.id,
        contractorName: record.recipientName,
      });
      break;
    }

    case "email.opened": {
      if (record.openedAt) {
        return NextResponse.json({ ok: true, skipped: "already opened" });
      }
      await db
        .update(rfqEmails)
        .set({ status: "opened", openedAt: new Date(), updatedAt: new Date() })
        .where(eq(rfqEmails.resendId, resendId));
      trackEmailOpenedByRecipient({
        rfqEmailId: record.id,
        contractorName: record.recipientName,
      });
      break;
    }

    case "email.clicked": {
      if (record.clickedAt) {
        return NextResponse.json({ ok: true, skipped: "already clicked" });
      }
      await db
        .update(rfqEmails)
        .set({ status: "clicked", clickedAt: new Date(), updatedAt: new Date() })
        .where(eq(rfqEmails.resendId, resendId));
      break;
    }

    case "email.bounced": {
      await db
        .update(rfqEmails)
        .set({
          status: "bounced",
          errorMessage: data.reason ?? "Email bounced",
          updatedAt: new Date(),
        })
        .where(eq(rfqEmails.resendId, resendId));
      break;
    }

    case "email.complained": {
      await db
        .update(rfqEmails)
        .set({
          status: "bounced",
          errorMessage: "Recipient marked as spam",
          updatedAt: new Date(),
        })
        .where(eq(rfqEmails.resendId, resendId));
      break;
    }

    default: {
      // Unknown event type — log and return 200 so Resend doesn't retry
      console.log(`[Resend Webhook] Unknown event type: ${type}`);
    }
  }

  return NextResponse.json({ ok: true });
}
