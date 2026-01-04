"use server";

import { db } from "@/app/db/client";
import {
  users,
  waitlist,
  groups,
  issues,
  decisions,
  decisionOptions,
} from "@/app/db/schema";
import { count, sql, gte, eq } from "drizzle-orm";

export async function getAnalyticsData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    userGrowthData,
    waitlistGrowthData,
    countryData,
    [userTotal],
    [waitlistTotal],
    [groupsTotal],
    [issuesTotal],
    [decisionsTotal],
    issueStatusData,
    decisionTypeData,
  ] = await Promise.all([
    db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`),

    db
      .select({
        date: sql<string>`DATE(${waitlist.createdAt})`,
        count: count(),
      })
      .from(waitlist)
      .where(gte(waitlist.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${waitlist.createdAt})`)
      .orderBy(sql`DATE(${waitlist.createdAt})`),

    db
      .select({
        country: users.country,
        count: count(),
      })
      .from(users)
      .groupBy(users.country),

    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(waitlist),
    db.select({ count: count() }).from(groups),
    db.select({ count: count() }).from(issues),
    db.select({ count: count() }).from(decisions),

    db
      .select({
        status: issues.status,
        count: count(),
      })
      .from(issues)
      .groupBy(issues.status),

    db
      .select({
        decisionType: decisionOptions.type,
        count: count(),
      })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .groupBy(decisionOptions.type),
  ]);

  return {
    userGrowthData,
    waitlistGrowthData,
    countryData,
    userTotal,
    waitlistTotal,
    groupsTotal,
    issuesTotal,
    decisionsTotal,
    issueStatusData,
    decisionTypeData,
  };
}
