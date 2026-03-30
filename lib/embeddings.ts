/**
 * Diagnosis Embeddings
 *
 * Generates and retrieves vector embeddings of completed diagnoses for RAG.
 *
 * FEATURE FLAG: rag-enabled (checked by the caller, not here)
 *
 * Embedding model: text-embedding-3-small (1536 dimensions, cost-efficient)
 * Similarity metric: cosine distance via pgvector <=> operator
 */

import OpenAI from "openai";
import { db } from "@/app/db/client";
import { diagnosisEmbeddings } from "@/app/db/schema/embeddings";
import { aiConversations } from "@/app/db/schema";
import { eq, or, isNull, sql } from "drizzle-orm";
import { trackDiagnosisEmbedded } from "@/lib/analytics-server";

const openai = new OpenAI();

// ============================================================================
// GENERATE EMBEDDING
// ============================================================================

/**
 * Generate a 1536-dimension embedding vector for the given text.
 * Uses OpenAI text-embedding-3-small.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// ============================================================================
// EMBED COMPLETED DIAGNOSIS
// ============================================================================

export interface OutcomeData {
  actualCostCents?: number;
  resolutionType: "diy" | "hired_pro" | "deferred" | "replaced";
  wasSuccessful: boolean;
  region?: string;
}

/**
 * Generate and store an embedding for a completed diagnosis that has an outcome.
 * Embeds: category + severity + resolution type + actual cost + success.
 *
 * Upserts by conversationId — safe to call multiple times.
 */
export async function embedCompletedDiagnosis(
  conversationId: string,
  outcomeData: OutcomeData
): Promise<void> {
  const [conversation] = await db
    .select({
      id: aiConversations.id,
      category: aiConversations.category,
      severity: aiConversations.severity,
    })
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId));

  if (!conversation) return;

  // Build a descriptive text capturing what was diagnosed and how it resolved
  const parts = [
    conversation.category ? `Service type: ${conversation.category}` : null,
    conversation.severity ? `Severity: ${conversation.severity}` : null,
    `Resolution: ${outcomeData.resolutionType}`,
    outcomeData.actualCostCents != null
      ? `Actual cost: $${Math.round(outcomeData.actualCostCents / 100)}`
      : null,
    `Outcome: ${outcomeData.wasSuccessful ? "successful" : "unsuccessful"}`,
  ]
    .filter(Boolean)
    .join(". ");

  const embedding = await generateEmbedding(parts);

  await db
    .insert(diagnosisEmbeddings)
    .values({
      conversationId,
      embedding,
      summaryText: parts,
      serviceType: conversation.category,
      region: outcomeData.region ?? null,
      actualCost: outcomeData.actualCostCents ?? null,
      resolutionType: outcomeData.resolutionType,
      severity: conversation.severity,
      wasSuccessful: outcomeData.wasSuccessful,
    })
    .onConflictDoUpdate({
      target: diagnosisEmbeddings.conversationId,
      set: {
        embedding,
        summaryText: parts,
        actualCost: outcomeData.actualCostCents ?? null,
        resolutionType: outcomeData.resolutionType,
        severity: conversation.severity,
        wasSuccessful: outcomeData.wasSuccessful,
      },
    });

  trackDiagnosisEmbedded({
    conversationId,
    serviceType: conversation.category ?? "unknown",
    hasOutcome: true,
  });
}

// ============================================================================
// FIND SIMILAR DIAGNOSES
// ============================================================================

export interface SimilarDiagnosis {
  id: string;
  conversationId: string | null;
  summaryText: string | null;
  serviceType: string | null;
  region: string | null;
  actualCost: number | null;
  resolutionType: string | null;
  severity: string | null;
  wasSuccessful: boolean | null;
  similarity: number;
}

/**
 * Find diagnoses similar to the query via cosine similarity.
 *
 * SELECT *, 1 - (embedding <=> $1) as similarity
 * FROM diagnosis_embeddings
 * WHERE region = $2 OR region IS NULL
 * ORDER BY similarity DESC
 * LIMIT 5
 */
export async function findSimilarDiagnoses(
  query: string,
  options: { region?: string; limit?: number } = {}
): Promise<SimilarDiagnosis[]> {
  const { region, limit = 5 } = options;

  const queryVector = await generateEmbedding(query);
  // Format as JSON array string — pgvector accepts '[0.1, 0.2, ...]'::vector
  const vecJson = JSON.stringify(queryVector);

  const whereClause = region
    ? or(eq(diagnosisEmbeddings.region, region), isNull(diagnosisEmbeddings.region))
    : undefined;

  const results = await db
    .select({
      id: diagnosisEmbeddings.id,
      conversationId: diagnosisEmbeddings.conversationId,
      summaryText: diagnosisEmbeddings.summaryText,
      serviceType: diagnosisEmbeddings.serviceType,
      region: diagnosisEmbeddings.region,
      actualCost: diagnosisEmbeddings.actualCost,
      resolutionType: diagnosisEmbeddings.resolutionType,
      severity: diagnosisEmbeddings.severity,
      wasSuccessful: diagnosisEmbeddings.wasSuccessful,
      similarity: sql<number>`1 - (embedding <=> ${vecJson}::vector)`,
    })
    .from(diagnosisEmbeddings)
    .where(whereClause)
    .orderBy(sql`embedding <=> ${vecJson}::vector`)
    .limit(limit);

  return results;
}
