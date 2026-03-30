/**
 * Accuracy Tracker
 *
 * Compares AI cost estimates (predicted midpoint from decisionOptions)
 * to actual user-reported costs (from decisionOutcomes).
 */

import { db } from "@/app/db/client";
import { decisionOutcomes } from "@/app/db/schema/outcomes";
import { decisions, decisionOptions } from "@/app/db/schema/decisions";
import { issues } from "@/app/db/schema/issues";
import { eq, isNotNull } from "drizzle-orm";

export interface AccuracyMetric {
  total: number;
  avgDelta: number;
  medianDelta: number;
  withinThirtyPercent: number;
}

export interface AccuracyMetrics {
  overall: AccuracyMetric;
  byServiceType: Record<string, AccuracyMetric>;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function buildMetric(
  rows: Array<{ delta: number; predicted: number }>
): AccuracyMetric {
  if (rows.length === 0) {
    return { total: 0, avgDelta: 0, medianDelta: 0, withinThirtyPercent: 0 };
  }

  const deltas = rows.map((r) => r.delta);
  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  const medianDelta = median(deltas);

  const withinCount = rows.filter((r) => {
    if (r.predicted === 0) return false;
    return Math.abs(r.delta) / r.predicted < 0.3;
  }).length;

  return {
    total: rows.length,
    avgDelta,
    medianDelta,
    withinThirtyPercent: rows.length === 0 ? 0 : withinCount / rows.length,
  };
}

/**
 * Calculate cost accuracy metrics across all recorded outcomes.
 * Predicted cost = midpoint of (costMin + costMax) from the selected decisionOption.
 */
export async function getAccuracyMetrics(): Promise<AccuracyMetrics> {
  const outcomeRows = await db
    .select({
      costDelta: decisionOutcomes.costDelta,
      costMin: decisionOptions.costMin,
      costMax: decisionOptions.costMax,
      category: issues.category,
    })
    .from(decisionOutcomes)
    .innerJoin(decisions, eq(decisionOutcomes.decisionId, decisions.id))
    .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
    .innerJoin(issues, eq(decisions.issueId, issues.id))
    .where(isNotNull(decisionOutcomes.costDelta));

  type Row = { delta: number; predicted: number };

  const allRows: Row[] = [];
  const byCategory = new Map<string, Row[]>();

  for (const row of outcomeRows) {
    const delta = parseFloat(String(row.costDelta ?? "0"));
    const costMin = parseFloat(String(row.costMin ?? "0"));
    const costMax = parseFloat(String(row.costMax ?? "0"));
    // Predicted = midpoint; fall back to costMin if costMax missing
    const predicted = costMax > 0 ? (costMin + costMax) / 2 : costMin;

    const entry: Row = { delta, predicted };
    allRows.push(entry);

    const cat = row.category ?? "unknown";
    const list = byCategory.get(cat) ?? [];
    list.push(entry);
    byCategory.set(cat, list);
  }

  const byServiceType: Record<string, AccuracyMetric> = {};
  for (const [cat, rows] of byCategory.entries()) {
    byServiceType[cat] = buildMetric(rows);
  }

  return {
    overall: buildMetric(allRows),
    byServiceType,
  };
}
