/**
 * Outcome DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import {
  decisionOutcomes,
  preferenceHistory,
  type DecisionOutcome,
  type PreferenceHistory,
} from "@/app/db/schema";

export function createOutcomeLoaders() {
  return {
    outcomeByDecisionId: new DataLoader<string, DecisionOutcome | null>(async (decisionIds) => {
      const results = await db
        .select()
        .from(decisionOutcomes)
        .where(inArray(decisionOutcomes.decisionId, [...decisionIds]));

      const map = new Map(results.map((o) => [o.decisionId, o]));
      return decisionIds.map((id) => map.get(id) ?? null);
    }),

    preferenceHistoryByGroupId: new DataLoader<string, PreferenceHistory[]>(async (groupIds) => {
      const results = await db
        .select()
        .from(preferenceHistory)
        .where(inArray(preferenceHistory.groupId, [...groupIds]));

      const map = new Map<string, PreferenceHistory[]>();
      for (const history of results) {
        const existing = map.get(history.groupId) ?? [];
        existing.push(history);
        map.set(history.groupId, existing);
      }
      return groupIds.map((id) => map.get(id) ?? []);
    }),
  };
}
