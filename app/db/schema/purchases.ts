import { pgTable, uuid, text, timestamp, pgEnum, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { groups, groupMembers } from "./groups";
import { decisions, vendorContacts } from "./decisions";

// Enums
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending", // User initiated, awaiting payment
  "processing", // Payment being processed
  "confirmed", // Payment successful, awaiting service
  "in_progress", // Service in progress
  "completed", // Service completed
  "cancelled", // User cancelled
  "refunded", // Payment refunded
  "failed", // Payment failed
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "credit_card",
  "debit_card",
  "bank_transfer",
  "apple_pay",
  "google_pay",
  "other",
]);

// Tables

// Purchases - In-app service purchases (like ChatGPT purchases)
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // What's being purchased
  decisionId: uuid("decision_id")
    .references(() => decisions.id, { onDelete: "set null" }), // Links to decision if applicable
  vendorContactId: uuid("vendor_contact_id")
    .references(() => vendorContacts.id, { onDelete: "set null" }), // Which vendor

  // Purchase details
  serviceName: text("service_name").notNull(), // "Transmission repair", "Roof leak repair"
  serviceDescription: text("service_description"),

  // Pricing
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),

  // Payment tracking
  status: purchaseStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),

  // Stripe integration
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),

  // Metadata
  purchasedBy: uuid("purchased_by")
    .notNull()
    .references(() => groupMembers.id),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),

  // Service scheduling
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),

  // Additional details
  notes: text("notes"),
  metadata: jsonb("metadata"), // Flexible field for vendor-specific data

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchase Approvals - Multi-member approval before purchase (optional governance)
export const purchaseApprovals = pgTable("purchase_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: uuid("purchase_id")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id, { onDelete: "cascade" }),

  approved: boolean("approved"), // true = approved, false = rejected, null = pending
  comment: text("comment"),
  respondedAt: timestamp("responded_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Transactions - Track individual payment attempts
export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: uuid("purchase_id")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),

  // Transaction details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "succeeded", "failed", "pending", "refunded"

  // Stripe details
  stripeTransactionId: text("stripe_transaction_id").unique(),
  stripePaymentMethodId: text("stripe_payment_method_id"),

  // Error tracking
  failureReason: text("failure_reason"),
  failureCode: text("failure_code"),

  // Metadata
  transactionMetadata: jsonb("transaction_metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Refunds - Track refund requests and status
export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: uuid("purchase_id")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),

  // Refund details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(), // "pending", "approved", "rejected", "completed"

  // Stripe
  stripeRefundId: text("stripe_refund_id").unique(),

  // Tracking
  requestedBy: uuid("requested_by")
    .notNull()
    .references(() => groupMembers.id),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;

export type PurchaseApproval = typeof purchaseApprovals.$inferSelect;
export type NewPurchaseApproval = typeof purchaseApprovals.$inferInsert;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;

export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;
