/**
 * Tool Failure Tracker
 *
 * Aggregates tool call success/failure rates from the aiMessages table.
 * A tool call is considered failed when its result contains an error field.
 */

import { db } from "@/app/db/client";
import { aiMessages } from "@/app/db/schema";
import { sql } from "drizzle-orm";

export interface ToolFailureRate {
  toolName: string;
  total: number;
  failed: number;
  rate: number;
}

interface RawToolCall {
  name: string;
  args?: unknown;
  result?: unknown;
}

function isFailedResult(result: unknown): boolean {
  if (result === null || result === undefined) return false;
  if (typeof result === "object" && result !== null) {
    const r = result as Record<string, unknown>;
    // Treat as failed if the result has an explicit error field
    if ("error" in r && r.error) return true;
    // Or if success is explicitly false
    if ("success" in r && r.success === false) return true;
  }
  return false;
}

/**
 * Calculate per-tool success/failure rates over the last N days.
 *
 * @param days - Look-back window in days (e.g. 7)
 * @returns Array sorted by failure rate descending
 */
export async function getToolFailureRates(
  days: number
): Promise<ToolFailureRate[]> {
  const rows = await db
    .select({ toolCalls: aiMessages.toolCalls })
    .from(aiMessages)
    .where(
      sql`${aiMessages.toolCalls} IS NOT NULL
        AND ${aiMessages.createdAt} >= NOW() - (${days} || ' days')::interval`
    );

  // Aggregate across all messages
  const counts = new Map<string, { total: number; failed: number }>();

  for (const row of rows) {
    const calls = row.toolCalls as RawToolCall[] | null;
    if (!Array.isArray(calls)) continue;
    for (const call of calls) {
      const name = call.name;
      const existing = counts.get(name) ?? { total: 0, failed: 0 };
      existing.total += 1;
      if (isFailedResult(call.result)) {
        existing.failed += 1;
      }
      counts.set(name, existing);
    }
  }

  return Array.from(counts.entries())
    .map(([toolName, { total, failed }]) => ({
      toolName,
      total,
      failed,
      rate: total === 0 ? 0 : failed / total,
    }))
    .sort((a, b) => b.rate - a.rate);
}
