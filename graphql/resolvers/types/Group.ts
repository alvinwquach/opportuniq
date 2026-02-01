/**
 * Group Type Resolvers
 *
 * Field resolvers for Group, GroupMember, and GroupConstraints types.
 */

import { eq } from "drizzle-orm";
import { groupConstraints } from "@/app/db/schema";
import type {
  Group as GroupType,
  GroupMember as GroupMemberType,
  GroupConstraints as GroupConstraintsType,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";

export const Group = {
  /**
   * All members of the group
   */
  members: async (group: GroupType, _: unknown, ctx: Context) => {
    return ctx.loaders.membersByGroupId.load(group.id);
  },

  /**
   * Only active members
   */
  activeMembers: async (group: GroupType, _: unknown, ctx: Context) => {
    const members = await ctx.loaders.membersByGroupId.load(group.id);
    return members.filter((m) => m.status === "active");
  },

  /**
   * Group budget constraints (one-to-one)
   */
  constraints: async (group: GroupType, _: unknown, ctx: Context) => {
    const [result] = await ctx.db
      .select()
      .from(groupConstraints)
      .where(eq(groupConstraints.groupId, group.id))
      .limit(1);

    return result ?? null;
  },

  /**
   * Issues in the group with optional status filter
   */
  issues: async (
    group: GroupType,
    args: { status?: string; limit?: number },
    ctx: Context
  ) => {
    let issues = await ctx.loaders.issuesByGroupId.load(group.id);

    if (args.status) {
      issues = issues.filter((i) => i.status === args.status);
    }

    const limit = args.limit ?? 20;
    return issues.slice(0, limit);
  },

  /**
   * Count of active members
   */
  memberCount: async (group: GroupType, _: unknown, ctx: Context) => {
    const members = await ctx.loaders.membersByGroupId.load(group.id);
    return members.filter((m) => m.status === "active").length;
  },

  /**
   * Total issue count
   */
  issueCount: async (group: GroupType, _: unknown, ctx: Context) => {
    const issues = await ctx.loaders.issuesByGroupId.load(group.id);
    return issues.length;
  },

  /**
   * Count of non-completed issues
   */
  activeIssueCount: async (group: GroupType, _: unknown, ctx: Context) => {
    const issues = await ctx.loaders.issuesByGroupId.load(group.id);
    return issues.filter(
      (i) => i.status !== "completed" && i.status !== "deferred"
    ).length;
  },
};

export const GroupMember = {
  /**
   * The user this membership belongs to
   */
  user: async (member: GroupMemberType, _: unknown, ctx: Context) => {
    return ctx.loaders.userById.load(member.userId);
  },

  /**
   * The group this membership belongs to
   */
  group: async (member: GroupMemberType, _: unknown, ctx: Context) => {
    return ctx.loaders.groupById.load(member.groupId);
  },
};

export const GroupConstraints = {
  /**
   * Monthly budget as string
   */
  monthlyBudget: (constraints: GroupConstraintsType) => {
    return constraints.monthlyBudget?.toString() ?? null;
  },

  /**
   * Emergency buffer as string
   */
  emergencyBuffer: (constraints: GroupConstraintsType) => {
    return constraints.emergencyBuffer?.toString() ?? null;
  },

  /**
   * Shared balance as string
   */
  sharedBalance: (constraints: GroupConstraintsType) => {
    return constraints.sharedBalance.toString();
  },
};
