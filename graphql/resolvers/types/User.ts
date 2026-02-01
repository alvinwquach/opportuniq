/**
 * User Type Resolvers
 *
 * Field resolvers for the User GraphQL type.
 * These resolve fields that aren't directly mapped from the database.
 */

import { eq, and } from "drizzle-orm";
import { groupMembers } from "@/app/db/schema";
import type { User as UserType } from "@/app/db/schema";
import type { Context } from "../../utils/context";

export const User = {
  /**
   * User's preferences object
   */
  preferences: (user: UserType) => {
    return user.preferences ?? null;
  },

  /**
   * Monthly budget as string (preserve decimal precision)
   */
  monthlyBudget: (user: UserType) => {
    return user.monthlyBudget?.toString() ?? null;
  },

  /**
   * Emergency buffer as string
   */
  emergencyBuffer: (user: UserType) => {
    return user.emergencyBuffer?.toString() ?? null;
  },

  /**
   * All groups user belongs to (active memberships only)
   */
  groups: async (user: UserType, _: unknown, ctx: Context) => {
    const memberships = await ctx.db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (memberships.length === 0) {
      return [];
    }

    // Use loader for batching
    const groupPromises = memberships.map((m) =>
      ctx.loaders.groupById.load(m.groupId)
    );
    const groups = await Promise.all(groupPromises);

    return groups.filter(Boolean);
  },

  /**
   * User's saved DIY guides
   */
  guides: async (user: UserType, _: unknown, ctx: Context) => {
    return ctx.loaders.guidesByUserId.load(user.id);
  },

  /**
   * Count of groups user belongs to
   */
  groupCount: async (user: UserType, _: unknown, ctx: Context) => {
    const memberships = await ctx.db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    return memberships.length;
  },
};
