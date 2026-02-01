"use server";

import { getCurrentUser } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { rfqEmails, users } from "@/app/db/schema";
import { sendRfqEmail } from "@/lib/resend";
import { eq } from "drizzle-orm";

interface Pro {
  name: string;
  email: string;
  phone?: string | null;
  rating?: number;
  reviews?: number;
  distance?: string;
  price?: number;
  available?: string | null;
  source?: string;
}

interface SendRfqEmailsInput {
  issueId: string;
  issueTitle: string;
  issueDiagnosis: string;
  pros: Pro[];
}

interface SendRfqEmailsResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  results: Array<{
    recipientEmail: string;
    recipientName: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}

/**
 * Send RFQ emails to selected professionals
 *
 * This server action:
 * 1. Validates the user is authenticated
 * 2. Gets user profile info for the email
 * 3. Sends emails via Resend
 * 4. Stores sent emails in database for tracking
 */
export async function sendRfqEmails(input: SendRfqEmailsInput): Promise<SendRfqEmailsResult> {
  try {
    // 1. Validate authentication
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return {
        success: false,
        sentCount: 0,
        failedCount: input.pros.length,
        results: [],
        error: "You must be logged in to send quote requests",
      };
    }

    // 2. Get user profile from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);

    if (!user) {
      return {
        success: false,
        sentCount: 0,
        failedCount: input.pros.length,
        results: [],
        error: "User profile not found",
      };
    }

    const senderName = user.name ?? "OpportunIQ User";
    const senderEmail = user.email ?? undefined;
    // Note: Add phone to user profile if needed
    const senderPhone = undefined;
    // Note: Add city to user profile if needed
    const senderCity = undefined;

    // 3. Send emails and track results
    const results: SendRfqEmailsResult["results"] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const pro of input.pros) {
      try {
        // Send email via Resend
        const emailResult = await sendRfqEmail({
          recipientName: pro.name,
          recipientEmail: pro.email,
          issueTitle: input.issueTitle,
          issueDiagnosis: input.issueDiagnosis,
          senderName,
          senderEmail,
          senderPhone,
          senderCity,
          issueId: input.issueId,
        });

        if (emailResult) {
          // Store in database for tracking
          await db.insert(rfqEmails).values({
            issueId: input.issueId,
            sentBy: currentUser.id,
            recipientName: pro.name,
            recipientEmail: pro.email,
            recipientPhone: pro.phone,
            source: pro.source,
            subject: emailResult.subject,
            bodyText: emailResult.bodyText,
            issueTitle: input.issueTitle,
            issueDiagnosis: input.issueDiagnosis,
            status: "sent",
            resendId: emailResult.id,
            sentAt: new Date(),
            metadata: {
              proRating: pro.rating,
              proReviews: pro.reviews,
              proDistance: pro.distance,
              proEstimatedPrice: pro.price,
              proAvailability: pro.available,
            },
          });

          results.push({
            recipientEmail: pro.email,
            recipientName: pro.name,
            success: true,
          });
          sentCount++;
        } else {
          // Store failed attempt
          await db.insert(rfqEmails).values({
            issueId: input.issueId,
            sentBy: currentUser.id,
            recipientName: pro.name,
            recipientEmail: pro.email,
            recipientPhone: pro.phone,
            source: pro.source,
            subject: `Quote Request - ${input.issueTitle}`,
            bodyText: "",
            issueTitle: input.issueTitle,
            issueDiagnosis: input.issueDiagnosis,
            status: "failed",
            errorMessage: "Failed to send via Resend",
          });

          results.push({
            recipientEmail: pro.email,
            recipientName: pro.name,
            success: false,
            error: "Failed to send email",
          });
          failedCount++;
        }
      } catch (error) {
        console.error(`Error sending RFQ to ${pro.email}:`, error);

        results.push({
          recipientEmail: pro.email,
          recipientName: pro.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failedCount++;
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
      results,
    };
  } catch (error) {
    console.error("Error in sendRfqEmails:", error);
    return {
      success: false,
      sentCount: 0,
      failedCount: input.pros.length,
      results: [],
      error: error instanceof Error ? error.message : "Failed to send quote requests",
    };
  }
}
