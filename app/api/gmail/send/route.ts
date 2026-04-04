/**
 * Gmail Send API
 *
 * Sends an email via the user's connected Gmail account.
 */

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { gmailTokens } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { sendGmailMessage, refreshAccessToken } from "@/lib/gmail";

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export async function POST(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: SendEmailRequest = await req.json();

    if (!body.to || !body.subject || !body.body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    // Get user's Gmail tokens
    const [tokenRecord] = await db
      .select()
      .from(gmailTokens)
      .where(eq(gmailTokens.userId, user.id))
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Gmail not connected", code: "GMAIL_NOT_CONNECTED" },
        { status: 400 }
      );
    }

    if (!tokenRecord.isActive) {
      return NextResponse.json(
        { error: "Gmail connection is inactive", code: "GMAIL_INACTIVE" },
        { status: 400 }
      );
    }

    let accessToken = tokenRecord.accessToken;

    // Check if token is expired and refresh if needed
    if (new Date() >= tokenRecord.expiresAt) {

      try {
        const newCredentials = await refreshAccessToken(tokenRecord.refreshToken);

        if (!newCredentials.access_token) {
          throw new Error("Failed to refresh token - no access token returned");
        }

        accessToken = newCredentials.access_token;

        // Update stored tokens
        await db
          .update(gmailTokens)
          .set({
            accessToken: newCredentials.access_token,
            expiresAt: new Date(newCredentials.expiry_date || Date.now() + 3600 * 1000),
            lastRefreshedAt: new Date(),
          })
          .where(eq(gmailTokens.userId, user.id));

      } catch (refreshError) {
        Sentry.captureException(refreshError, {
          extra: { context: "gmail_token_refresh", userId: user.id, code: "GMAIL_TOKEN_EXPIRED" },
        });
        return NextResponse.json(
          {
            error: "Gmail connection expired. Please reconnect your Gmail account.",
            code: "GMAIL_TOKEN_EXPIRED",
          },
          { status: 401 }
        );
      }
    }

    // Send the email
    const result = await sendGmailMessage({
      accessToken,
      to: body.to,
      subject: body.subject,
      body: body.body,
      replyTo: body.replyTo,
    });


    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      threadId: result.threadId,
      sentFrom: tokenRecord.gmailAddress,
    });
  } catch (error) {

    // Check for specific Gmail API errors
    if (error instanceof Error) {
      if (error.message.includes("invalid_grant")) {
        return NextResponse.json(
          {
            error: "Gmail access revoked. Please reconnect your Gmail account.",
            code: "GMAIL_ACCESS_REVOKED",
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
