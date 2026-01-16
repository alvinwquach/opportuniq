"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { diySchedules, issues, groups, groupMembers, users, userIncomeStreams, userExpenses, groupExpenses } from "@/app/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logIssueActivity } from "@/app/issues/actions";

export interface ScheduleEvent {
  id: string;
  issueId: string;
  issueTitle: string;
  groupId: string;
  groupName: string;
  scheduledTime: Date;
  estimatedDuration: number | null;
  participants: string[];
  participantDetails: {
    id: string;
    userId: string;
    name: string | null;
    avatarUrl: string | null;
  }[];
  createdBy: string;
  createdAt: Date;
}

export async function getUserSchedules(startDate?: Date, endDate?: Date) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get all groups the user is a member of
    const userGroupMemberships = await db
      .select({
        groupId: groupMembers.groupId,
        memberId: groupMembers.id,
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (userGroupMemberships.length === 0) {
      return { success: true, schedules: [] };
    }

    const groupIds = userGroupMemberships.map((m) => m.groupId);

    // Fetch all schedules for user's groups
    let scheduleQuery = db
      .select({
        schedule: {
          id: diySchedules.id,
          issueId: diySchedules.issueId,
          scheduledTime: diySchedules.scheduledTime,
          estimatedDuration: diySchedules.estimatedDuration,
          participants: diySchedules.participants,
          createdBy: diySchedules.createdBy,
          createdAt: diySchedules.createdAt,
        },
        issue: {
          id: issues.id,
          title: issues.title,
          groupId: issues.groupId,
        },
        group: {
          id: groups.id,
          name: groups.name,
        },
      })
      .from(diySchedules)
      .innerJoin(issues, eq(diySchedules.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(inArray(issues.groupId, groupIds))
      .$dynamic();

    // Apply date filters if provided
    if (startDate) {
      scheduleQuery = scheduleQuery.where(gte(diySchedules.scheduledTime, startDate));
    }
    if (endDate) {
      scheduleQuery = scheduleQuery.where(lte(diySchedules.scheduledTime, endDate));
    }

    const rawSchedules = await scheduleQuery;

    // Fetch participant details for all schedules
    const allParticipantIds = new Set<string>();
    for (const s of rawSchedules) {
      const participants = (s.schedule.participants as string[]) || [];
      participants.forEach((id) => allParticipantIds.add(id));
    }

    let participantDetailsMap: Record<string, { id: string; userId: string; name: string | null; avatarUrl: string | null }> = {};

    if (allParticipantIds.size > 0) {
      const participantMembers = await db
        .select({
          memberId: groupMembers.id,
          userId: groupMembers.userId,
          name: users.name,
          avatarUrl: users.avatarUrl,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(inArray(groupMembers.id, Array.from(allParticipantIds)));

      for (const p of participantMembers) {
        participantDetailsMap[p.memberId] = {
          id: p.memberId,
          userId: p.userId,
          name: p.name,
          avatarUrl: p.avatarUrl,
        };
      }
    }

    // Transform to ScheduleEvent format
    const schedules: ScheduleEvent[] = rawSchedules.map((s) => {
      const participantIds = (s.schedule.participants as string[]) || [];
      return {
        id: s.schedule.id,
        issueId: s.schedule.issueId,
        issueTitle: s.issue.title,
        groupId: s.group.id,
        groupName: s.group.name,
        scheduledTime: s.schedule.scheduledTime,
        estimatedDuration: s.schedule.estimatedDuration,
        participants: participantIds,
        participantDetails: participantIds
          .map((id) => participantDetailsMap[id])
          .filter(Boolean),
        createdBy: s.schedule.createdBy,
        createdAt: s.schedule.createdAt,
      };
    });

    return { success: true, schedules };
  } catch (error) {
    console.error("[Calendar] getUserSchedules error:", error);
    return { success: false, error: "Failed to fetch schedules" };
  }
}

export async function createSchedule(data: {
  issueId: string;
  scheduledTime: Date;
  estimatedDuration?: number;
  participants?: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify user has access to the issue's group
    const [issue] = await db
      .select({
        id: issues.id,
        groupId: issues.groupId,
      })
      .from(issues)
      .where(eq(issues.id, data.issueId));

    if (!issue) {
      return { success: false, error: "Issue not found" };
    }

    const [membership] = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    // Create the schedule
    const [newSchedule] = await db
      .insert(diySchedules)
      .values({
        issueId: data.issueId,
        scheduledTime: data.scheduledTime,
        estimatedDuration: data.estimatedDuration ?? null,
        participants: data.participants ?? [membership.id],
        createdBy: membership.id,
      })
      .returning();

    // Log the activity
    await logIssueActivity({
      issueId: data.issueId,
      activityType: "schedule_created",
      performedBy: membership.id,
      title: "Scheduled DIY work",
      description: `Scheduled for ${data.scheduledTime.toLocaleDateString()} at ${data.scheduledTime.toLocaleTimeString()}`,
      metadata: {
        scheduleId: newSchedule.id,
        scheduledTime: data.scheduledTime.toISOString(),
        participants: data.participants ?? [membership.id],
      },
      relatedEntityType: "schedule",
      relatedEntityId: newSchedule.id,
    });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard");

    return { success: true, schedule: newSchedule };
  } catch (error) {
    console.error("[Calendar] createSchedule error:", error);
    return { success: false, error: "Failed to create schedule" };
  }
}

export async function updateSchedule(
  scheduleId: string,
  data: {
    scheduledTime?: Date;
    estimatedDuration?: number;
    participants?: string[];
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Fetch the schedule and verify access
    const [schedule] = await db
      .select({
        id: diySchedules.id,
        issueId: diySchedules.issueId,
        scheduledTime: diySchedules.scheduledTime,
      })
      .from(diySchedules)
      .where(eq(diySchedules.id, scheduleId));

    if (!schedule) {
      return { success: false, error: "Schedule not found" };
    }

    // Get the issue to find the group
    const [issue] = await db
      .select({ groupId: issues.groupId })
      .from(issues)
      .where(eq(issues.id, schedule.issueId));

    if (!issue) {
      return { success: false, error: "Issue not found" };
    }

    // Verify membership
    const [membership] = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    // Update the schedule
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (data.scheduledTime !== undefined) {
      updateData.scheduledTime = data.scheduledTime;
    }
    if (data.estimatedDuration !== undefined) {
      updateData.estimatedDuration = data.estimatedDuration;
    }
    if (data.participants !== undefined) {
      updateData.participants = data.participants;
    }

    const [updatedSchedule] = await db
      .update(diySchedules)
      .set(updateData)
      .where(eq(diySchedules.id, scheduleId))
      .returning();

    // Log the activity
    const oldTime = schedule.scheduledTime;
    const newTime = data.scheduledTime;
    await logIssueActivity({
      issueId: schedule.issueId,
      activityType: "schedule_updated",
      performedBy: membership.id,
      title: "Updated scheduled DIY work",
      description: newTime
        ? `Rescheduled from ${oldTime.toLocaleDateString()} to ${newTime.toLocaleDateString()}`
        : "Updated schedule details",
      oldValue: oldTime.toISOString(),
      newValue: newTime?.toISOString(),
      metadata: {
        scheduleId,
        scheduledTime: newTime?.toISOString() ?? oldTime.toISOString(),
        participants: data.participants,
      },
      relatedEntityType: "schedule",
      relatedEntityId: scheduleId,
    });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard");

    return { success: true, schedule: updatedSchedule };
  } catch (error) {
    console.error("[Calendar] updateSchedule error:", error);
    return { success: false, error: "Failed to update schedule" };
  }
}

export async function deleteSchedule(scheduleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Fetch the schedule and verify access
    const [schedule] = await db
      .select({
        id: diySchedules.id,
        issueId: diySchedules.issueId,
        scheduledTime: diySchedules.scheduledTime,
        createdBy: diySchedules.createdBy,
      })
      .from(diySchedules)
      .where(eq(diySchedules.id, scheduleId));

    if (!schedule) {
      return { success: false, error: "Schedule not found" };
    }

    // Get the issue to find the group
    const [issue] = await db
      .select({ groupId: issues.groupId })
      .from(issues)
      .where(eq(issues.id, schedule.issueId));

    if (!issue) {
      return { success: false, error: "Issue not found" };
    }

    // Verify membership (coordinators/collaborators or creator can delete)
    const [membership] = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, issue.groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    const isCreator = schedule.createdBy === membership.id;
    const canManage = membership.role === "coordinator" || membership.role === "collaborator";

    if (!isCreator && !canManage) {
      return { success: false, error: "Only the creator or coordinators can delete schedules" };
    }

    // Log the activity before deleting
    await logIssueActivity({
      issueId: schedule.issueId,
      activityType: "schedule_deleted",
      performedBy: membership.id,
      title: "Cancelled scheduled DIY work",
      description: `Cancelled work scheduled for ${schedule.scheduledTime.toLocaleDateString()}`,
      metadata: {
        scheduleId,
        scheduledTime: schedule.scheduledTime.toISOString(),
      },
      relatedEntityType: "schedule",
      relatedEntityId: scheduleId,
    });

    // Delete the schedule
    await db.delete(diySchedules).where(eq(diySchedules.id, scheduleId));

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[Calendar] deleteSchedule error:", error);
    return { success: false, error: "Failed to delete schedule" };
  }
}

export async function getGroupMembersForScheduling(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify user is a member of this group
    const [membership] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    // Fetch all active members of the group
    const members = await db
      .select({
        memberId: groupMembers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.status, "active")
        )
      );

    return {
      success: true,
      members,
      currentUserMemberId: membership.id,
    };
  } catch (error) {
    console.error("[Calendar] getGroupMembersForScheduling error:", error);
    return { success: false, error: "Failed to fetch group members" };
  }
}

export async function getUserIssuesForScheduling() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get all groups the user is a member of
    const userGroupMemberships = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (userGroupMemberships.length === 0) {
      return { success: true, issues: [] };
    }

    const groupIds = userGroupMemberships.map((m) => m.groupId);

    // Fetch open/in-progress issues from user's groups
    const userIssues = await db
      .select({
        id: issues.id,
        title: issues.title,
        status: issues.status,
        priority: issues.priority,
        groupId: issues.groupId,
        groupName: groups.name,
      })
      .from(issues)
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(
        and(
          inArray(issues.groupId, groupIds),
          inArray(issues.status, ["open", "investigating", "options_generated", "decided", "in_progress"])
        )
      );

    return { success: true, issues: userIssues };
  } catch (error) {
    console.error("[Calendar] getUserIssuesForScheduling error:", error);
    return { success: false, error: "Failed to fetch issues" };
  }
}

// ============================================
// INCOME & EXPENSE CALENDAR EVENTS
// ============================================

export interface IncomeEvent {
  id: string;
  type: "income";
  source: string;
  amount: string;
  frequency: string;
  description: string | null;
  isActive: boolean;
  startDate: Date | null;
}

export interface ExpenseEvent {
  id: string;
  type: "user_expense" | "group_expense";
  category: string;
  amount: string;
  date: Date;
  description: string | null;
  isRecurring: boolean;
  recurringFrequency: string | null;
  nextDueDate: Date | null;
  groupName?: string;
  groupId?: string;
}

/**
 * Get user's income streams for calendar display
 * Shows recurring income on their frequency dates
 */
export async function getUserIncomeForCalendar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const incomeStreams = await db
      .select({
        id: userIncomeStreams.id,
        source: userIncomeStreams.source,
        amount: userIncomeStreams.amount,
        frequency: userIncomeStreams.frequency,
        description: userIncomeStreams.description,
        isActive: userIncomeStreams.isActive,
        startDate: userIncomeStreams.startDate,
      })
      .from(userIncomeStreams)
      .where(
        and(
          eq(userIncomeStreams.userId, user.id),
          eq(userIncomeStreams.isActive, true)
        )
      );

    const incomeEvents: IncomeEvent[] = incomeStreams
      .filter((income) => income.source && income.amount)
      .map((income) => ({
        id: income.id,
        type: "income" as const,
        source: income.source!,
        amount: income.amount!,
        frequency: income.frequency,
        description: income.description,
        isActive: income.isActive,
        startDate: income.startDate,
      }));

    return { success: true, incomeEvents };
  } catch (error) {
    console.error("[Calendar] getUserIncomeForCalendar error:", error);
    return { success: false, error: "Failed to fetch income" };
  }
}

/**
 * Get user's personal expenses for calendar display
 */
export async function getUserExpensesForCalendar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const expenses = await db
      .select({
        id: userExpenses.id,
        category: userExpenses.category,
        amount: userExpenses.amount,
        date: userExpenses.date,
        description: userExpenses.description,
        isRecurring: userExpenses.isRecurring,
        recurringFrequency: userExpenses.recurringFrequency,
        nextDueDate: userExpenses.nextDueDate,
      })
      .from(userExpenses)
      .where(eq(userExpenses.userId, user.id));

    const expenseEvents: ExpenseEvent[] = expenses
      .filter((expense) => expense.category && expense.amount)
      .map((expense) => ({
        id: expense.id,
        type: "user_expense" as const,
        category: expense.category!,
        amount: expense.amount!,
        date: expense.date,
        description: expense.description,
        isRecurring: expense.isRecurring ?? false,
        recurringFrequency: expense.recurringFrequency,
        nextDueDate: expense.nextDueDate,
      }));

    return { success: true, expenseEvents };
  } catch (error) {
    console.error("[Calendar] getUserExpensesForCalendar error:", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}

/**
 * Get group expenses for calendar display (from user's groups)
 */
export async function getGroupExpensesForCalendar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get all groups the user is a member of
    const userGroupMemberships = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (userGroupMemberships.length === 0) {
      return { success: true, expenseEvents: [] };
    }

    const groupIds = userGroupMemberships.map((m) => m.groupId);

    const expenses = await db
      .select({
        id: groupExpenses.id,
        category: groupExpenses.category,
        amount: groupExpenses.amount,
        date: groupExpenses.date,
        description: groupExpenses.description,
        isRecurring: groupExpenses.isRecurring,
        recurringFrequency: groupExpenses.recurringFrequency,
        nextDueDate: groupExpenses.nextDueDate,
        groupId: groups.id,
        groupName: groups.name,
      })
      .from(groupExpenses)
      .innerJoin(groups, eq(groupExpenses.groupId, groups.id))
      .where(inArray(groupExpenses.groupId, groupIds));

    const expenseEvents: ExpenseEvent[] = expenses.map((expense) => ({
      id: expense.id,
      type: "group_expense" as const,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      isRecurring: expense.isRecurring ?? false,
      recurringFrequency: expense.recurringFrequency,
      nextDueDate: expense.nextDueDate,
      groupId: expense.groupId,
      groupName: expense.groupName,
    }));

    return { success: true, expenseEvents };
  } catch (error) {
    console.error("[Calendar] getGroupExpensesForCalendar error:", error);
    return { success: false, error: "Failed to fetch group expenses" };
  }
}
