/**
 * RAG Context Builder
 *
 * Retrieves similar past diagnoses and formats them as a context section
 * for the diagnosis system prompt.
 *
 * Only active when the "rag-enabled" feature flag is ON.
 * Returns null when no similar cases exist or the vector store is empty.
 */

import { findSimilarDiagnoses, type SimilarDiagnosis } from "@/lib/embeddings";
import {
  trackRAGContextRetrieved,
  trackRAGContextEmpty,
} from "@/lib/analytics-server";

// ============================================================================
// BUILD RAG CONTEXT
// ============================================================================

/**
 * Build a context string from similar past diagnoses.
 *
 * @param query   - The user's issue description (used for similarity search)
 * @param zipCode - User's ZIP code (first 3 digits used for regional filtering)
 * @param conversationId - For PostHog event tracking
 * @returns A formatted context string to prepend to the system prompt, or null
 */
export async function buildRAGContext(
  query: string,
  zipCode: string | undefined,
  conversationId?: string
): Promise<string | null> {
  const region = zipCode ? zipCode.slice(0, 3) : undefined;

  let similar: SimilarDiagnosis[];
  try {
    similar = await findSimilarDiagnoses(query, { region, limit: 5 });
  } catch {
    // Embedding API error — diagnosis still works without RAG
    return null;
  }

  if (similar.length === 0) {
    trackRAGContextEmpty({
      conversationId: conversationId ?? "unknown",
      reason: "no_similar",
    });
    return null;
  }

  const topSimilarity = similar[0].similarity;

  trackRAGContextRetrieved({
    conversationId: conversationId ?? "unknown",
    similarCasesFound: similar.length,
    topSimilarity,
  });

  return formatRAGContext(similar);
}

// ============================================================================
// FORMAT
// ============================================================================

function formatRAGContext(cases: SimilarDiagnosis[]): string {
  const lines: string[] = [];

  // Group by resolution type for a cleaner summary
  const byResolution = new Map<string, SimilarDiagnosis[]>();
  for (const c of cases) {
    const key = c.resolutionType ?? "unknown";
    const existing = byResolution.get(key) ?? [];
    existing.push(c);
    byResolution.set(key, existing);
  }

  for (const [resolutionType, group] of byResolution) {
    const label = resolutionLabel(resolutionType);
    const costs = group
      .map((c) => c.actualCost)
      .filter((c): c is number => c != null);

    if (costs.length > 0) {
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);
      const costRange =
        minCost === maxCost
          ? `$${formatCents(minCost)}`
          : `$${formatCents(minCost)}-$${formatCents(maxCost)}`;

      lines.push(
        `- ${group.length} user${group.length > 1 ? "s" : ""} ${label} (${costRange})`
      );
    } else {
      lines.push(
        `- ${group.length} user${group.length > 1 ? "s" : ""} ${label}`
      );
    }
  }

  const successCount = cases.filter((c) => c.wasSuccessful === true).length;
  lines.push(`- ${successCount} of ${cases.length} reported successful resolution`);

  return `## PAST SIMILAR CASES (Real Outcomes)

Based on ${cases.length} similar past case${cases.length > 1 ? "s" : ""} in your area:
${lines.map((l) => l).join("\n")}

Use this data to calibrate cost estimates and set realistic expectations.`;
}

function resolutionLabel(type: string): string {
  switch (type) {
    case "diy":
      return "did it themselves (DIY)";
    case "hired_pro":
      return "hired a professional";
    case "deferred":
      return "deferred the repair";
    case "replaced":
      return "replaced the item";
    default:
      return "resolved the issue";
  }
}

function formatCents(cents: number): string {
  const dollars = Math.round(cents / 100);
  return dollars.toLocaleString("en-US");
}
