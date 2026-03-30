/**
 * DIAGNOSIS EMBEDDINGS SCHEMA
 *
 * Stores vector embeddings of completed diagnoses + outcomes for RAG retrieval.
 *
 * RELATIONS:
 * - DiagnosisEmbeddings (Many) → (1) AiConversations - Each embedding belongs to one conversation
 *
 * PURPOSE:
 * Enables similarity search over past diagnoses to surface relevant real-world
 * outcomes when generating new diagnoses (Retrieval-Augmented Generation).
 *
 * FEATURE FLAG: rag-enabled (default OFF — enable after 50+ embedded diagnoses with outcomes)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { aiConversations } from "./ai-conversations";

export const diagnosisEmbeddings = pgTable(
  "diagnosis_embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // The conversation this embedding was generated from
    conversationId: uuid("conversation_id").references(() => aiConversations.id, {
      onDelete: "cascade",
    }),

    // OpenAI text-embedding-3-small vector (1536 dimensions)
    embedding: vector("embedding", { dimensions: 1536 }),

    // The text that was embedded (for inspection / debugging)
    summaryText: text("summary_text"),

    // Issue category (plumbing, electrical, hvac, etc.)
    serviceType: text("service_type"),

    // First 3 digits of ZIP code for regional filtering
    region: text("region"),

    // Actual cost from outcome (in cents)
    actualCost: integer("actual_cost_cents"),

    // How it was resolved: diy | hired_pro | deferred | replaced
    resolutionType: text("resolution_type"),

    // Severity from conversation (minor, moderate, urgent, emergency)
    severity: text("severity"),

    // Whether the resolution was successful
    wasSuccessful: boolean("was_successful"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("diagnosis_embeddings_conversation_id_unique").on(table.conversationId),
    index("diagnosis_embeddings_service_type_idx").on(table.serviceType),
    index("diagnosis_embeddings_region_idx").on(table.region),
  ]
);

export type DiagnosisEmbedding = typeof diagnosisEmbeddings.$inferSelect;
export type NewDiagnosisEmbedding = typeof diagnosisEmbeddings.$inferInsert;
