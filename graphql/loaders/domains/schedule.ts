/**
 * Schedule DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import { diySchedules, type DiySchedule } from "@/app/db/schema";

export function createScheduleLoaders() {
  return {
    scheduleById: new DataLoader<string, DiySchedule | null>(async (ids) => {
      const results = await db
        .select()
        .from(diySchedules)
        .where(inArray(diySchedules.id, [...ids]));

      const map = new Map(results.map((s) => [s.id, s]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    schedulesByIssueId: new DataLoader<string, DiySchedule[]>(async (issueIds) => {
      const results = await db
        .select()
        .from(diySchedules)
        .where(inArray(diySchedules.issueId, [...issueIds]));

      const map = new Map<string, DiySchedule[]>();
      for (const schedule of results) {
        const existing = map.get(schedule.issueId) ?? [];
        existing.push(schedule);
        map.set(schedule.issueId, existing);
      }
      return issueIds.map((id) => map.get(id) ?? []);
    }),
  };
}
