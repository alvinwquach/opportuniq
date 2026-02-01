"use server";

import { db } from "@/app/db/client";
import { waitlist, users } from "@/app/db/schema";
import { desc, count, sql, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";

async function fetchWaitlistData() {
  const [waitlistEntries, [stats], sourceBreakdown, [userCount]] =
    await Promise.all([
      // Limit entries for faster load
      db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).limit(100),

      // Get all counts in one query - use SQL intervals instead of JS dates
      db
        .select({
          total: count(),
          todayCount: sql<number>`count(*) filter (where ${waitlist.createdAt} >= date_trunc('day', now()))`,
          weekCount: sql<number>`count(*) filter (where ${waitlist.createdAt} >= now() - interval '7 days')`,
        })
        .from(waitlist),

      db
        .select({
          source: waitlist.source,
          count: count(),
        })
        .from(waitlist)
        .groupBy(waitlist.source),

      // Count users who converted from waitlist (users whose email is in waitlist)
      db
        .select({
          converted: sql<number>`count(distinct ${users.email})`,
        })
        .from(users)
        .where(sql`${users.email} in (select email from ${waitlist})`),
    ]);

  const totalWaitlist = Number(stats.total) || 0;
  const convertedCount = Number(userCount?.converted) || 0;
  const conversionRate = totalWaitlist > 0 ? Math.round((convertedCount / totalWaitlist) * 100) : 0;

  return {
    waitlistEntries,
    todaySignups: { count: Number(stats.todayCount) || 0 },
    weekSignups: { count: Number(stats.weekCount) || 0 },
    sourceBreakdown,
    conversionStats: {
      total: totalWaitlist,
      converted: convertedCount,
      pending: totalWaitlist - convertedCount,
      conversionRate,
    },
  };
}

// Cache for 30 seconds
export const getWaitlistData = unstable_cache(
  fetchWaitlistData,
  ["admin-waitlist-data"],
  { revalidate: 30, tags: ["admin-waitlist"] }
);
