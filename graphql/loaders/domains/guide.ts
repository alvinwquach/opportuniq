/**
 * Guide DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import { diyGuides, type DIYGuide } from "@/app/db/schema";

export function createGuideLoaders() {
  return {
    guidesByUserId: new DataLoader<string, DIYGuide[]>(async (userIds) => {
      const results = await db
        .select()
        .from(diyGuides)
        .where(inArray(diyGuides.userId, [...userIds]));

      const map = new Map<string, DIYGuide[]>();
      for (const guide of results) {
        const existing = map.get(guide.userId) ?? [];
        existing.push(guide);
        map.set(guide.userId, existing);
      }
      return userIds.map((id) => map.get(id) ?? []);
    }),

    guideById: new DataLoader<string, DIYGuide | null>(async (ids) => {
      const results = await db
        .select()
        .from(diyGuides)
        .where(inArray(diyGuides.id, [...ids]));

      const map = new Map(results.map((g) => [g.id, g]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
