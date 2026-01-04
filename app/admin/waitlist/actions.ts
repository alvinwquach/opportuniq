"use server";

import { db } from "@/app/db/client";
import { waitlist } from "@/app/db/schema";
import { desc, count, gte } from "drizzle-orm";

export async function getWaitlistData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [waitlistEntries, [todaySignups], [weekSignups], sourceBreakdown] =
    await Promise.all([
      db.select().from(waitlist).orderBy(desc(waitlist.createdAt)),

      db
        .select({ count: count() })
        .from(waitlist)
        .where(gte(waitlist.createdAt, today)),

      db
        .select({ count: count() })
        .from(waitlist)
        .where(gte(waitlist.createdAt, oneWeekAgo)),

      db
        .select({
          source: waitlist.source,
          count: count(),
        })
        .from(waitlist)
        .groupBy(waitlist.source),
    ]);

  return {
    waitlistEntries,
    todaySignups,
    weekSignups,
    sourceBreakdown,
  };
}
