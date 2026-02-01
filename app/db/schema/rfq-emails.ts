/**
 * RFQ EMAILS SCHEMA - Request for Quote tracking
 *
 * Tracks emails sent to professionals/vendors for quotes on issues.
 * Enables follow-up reminders, response tracking, and analytics.
 *
 * RELATIONS:
 * - Issues (1) → (Many) RfqEmails - One issue can have multiple quote requests
 * - Users (1) → (Many) RfqEmails - One user sends multiple quote requests
 */

import { pgTable, uuid, text, timestamp, pgEnum, jsonb, boolean } from "drizzle-orm/pg-core";
import { issues } from "./issues";
import { users } from "./users";

// ============================================
// ENUMS
// ============================================

// Email status tracking
export const rfqEmailStatusEnum = pgEnum("rfq_email_status", [
  "pending",      // Queued to send
  "sent",         // Successfully sent via Resend
  "delivered",    // Confirmed delivered (webhook)
  "opened",       // Recipient opened email (webhook)
  "clicked",      // Recipient clicked a link (webhook)
  "replied",      // User marked as replied (manual)
  "bounced",      // Email bounced (webhook)
  "failed",       // Failed to send
]);

// ============================================
// TABLES
// ============================================

/**
 * RFQ_EMAILS TABLE
 *
 * Stores all quote request emails sent to professionals.
 * Enables tracking responses and follow-up reminders.
 */
export const rfqEmails = pgTable("rfq_emails", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to issues - which issue is this quote for?
  // Relation: Many rfqEmails → One issue
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),

  // Foreign key to users - who sent this quote request?
  // Relation: Many rfqEmails → One user
  sentBy: uuid("sent_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // ============================================
  // RECIPIENT INFORMATION
  // ============================================

  // Professional/vendor name
  recipientName: text("recipient_name").notNull(),

  // Email address sent to
  recipientEmail: text("recipient_email").notNull(),

  // Phone number (optional, for reference)
  recipientPhone: text("recipient_phone"),

  // Source where we found this pro (yelp, angi, thumbtack, etc.)
  source: text("source"),

  // ============================================
  // EMAIL CONTENT
  // ============================================

  // Email subject line
  subject: text("subject").notNull(),

  // Plain text body
  bodyText: text("body_text").notNull(),

  // HTML body (optional, for rich formatting)
  bodyHtml: text("body_html"),

  // Issue details included in email
  issueTitle: text("issue_title"),
  issueDiagnosis: text("issue_diagnosis"),

  // ============================================
  // DELIVERY TRACKING
  // ============================================

  // Current status - see rfqEmailStatusEnum
  status: rfqEmailStatusEnum("status").default("pending").notNull(),

  // Resend email ID for tracking
  resendId: text("resend_id"),

  // When the email was sent
  sentAt: timestamp("sent_at"),

  // When the email was delivered (from webhook)
  deliveredAt: timestamp("delivered_at"),

  // When the email was opened (from webhook)
  openedAt: timestamp("opened_at"),

  // When the recipient clicked a link (from webhook)
  clickedAt: timestamp("clicked_at"),

  // Error message if sending failed
  errorMessage: text("error_message"),

  // ============================================
  // RESPONSE TRACKING
  // ============================================

  // Has the professional responded?
  hasResponse: boolean("has_response").default(false).notNull(),

  // When we received a response (manual entry)
  respondedAt: timestamp("responded_at"),

  // User's notes about the response
  responseNotes: text("response_notes"),

  // Quoted price from the professional
  quotedPrice: text("quoted_price"),

  // ============================================
  // METADATA
  // ============================================

  // Additional data stored as JSON
  metadata: jsonb("metadata").$type<{
    // Pro details from the listing
    proRating?: number;
    proReviews?: number;
    proDistance?: string;
    proEstimatedPrice?: number;
    proAvailability?: string;
    // User's location for context
    userCity?: string;
    userState?: string;
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for type-safe queries
export type RfqEmail = typeof rfqEmails.$inferSelect;
export type NewRfqEmail = typeof rfqEmails.$inferInsert;
