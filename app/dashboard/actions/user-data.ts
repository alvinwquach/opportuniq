"use server";

import { db } from "@/app/db/client";
import { users, groupMembers, groups, userIncomeStreams, userBudgets, userExpenses, groupConstraints } from "@/app/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { FREQUENCY_TO_MONTHLY, ANNUAL_HOURS } from "./utils";

/**
 * Fetches user profile, groups, income streams, budgets, and this month's
 * personal expenses for the dashboard. Used by getDashboardData (dashboard
 * page) to decide new-user vs main dashboard and to pass pending invitations.
 *
 * Not cached: user-specific data; callers use force-dynamic / revalidate 0.
 * Revalidation: none (read-only); mutations elsewhere call revalidatePath("/dashboard").
 *
 * @param userId - Supabase auth user id
 * @returns User profile, active/pending groups, income, budgets, monthly expenses
 */
export async function getUserData(userId: string) {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    userGroups,
    [userProfile],
    incomeStreams,
    budgets,
    monthlyExpenses,
  ] = await Promise.all([
    // User's groups with membership info
    db
      .select({
        group: groups,
        membership: groupMembers,
        constraints: groupConstraints,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .leftJoin(groupConstraints, eq(groups.id, groupConstraints.groupId))
      .where(eq(groupMembers.userId, userId)),

    // User profile
    db.select().from(users).where(eq(users.id, userId)),

    // Income streams
    db
      .select()
      .from(userIncomeStreams)
      .where(
        and(
          eq(userIncomeStreams.userId, userId),
          eq(userIncomeStreams.isActive, true)
        )
      ),

    // User budgets
    db.select().from(userBudgets).where(eq(userBudgets.userId, userId)),

    // This month's personal expenses
    db
      .select({
        total: sql<number>`COALESCE(SUM(${userExpenses.amount}), 0)`,
      })
      .from(userExpenses)
      .where(
        and(
          eq(userExpenses.userId, userId),
          gte(userExpenses.date, startOfMonth)
        )
      ),
  ]);

  // Calculate monthly and hourly income
  let monthlyIncome = 0;
  for (const stream of incomeStreams) {
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  // Get active groups
  const activeGroups = userGroups.filter((g) => g.membership.status === "active");
  const pendingGroups = userGroups.filter((g) => g.membership.status === "pending");
  
  // Ensure groupIds is always an array (even if empty) and contains only valid UUIDs
  const groupIds: string[] = activeGroups
    .map((g) => g.group.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  // Debug: Log groupIds to ensure it's an array
  if (groupIds.length > 0) {
  }

  return {
    userProfile,
    userGroups,
    activeGroups,
    pendingGroups,
    groupIds,
    incomeStreams,
    budgets,
    monthlyExpenses,
    monthlyIncome,
    annualIncome,
    hourlyRate,
  };
}


