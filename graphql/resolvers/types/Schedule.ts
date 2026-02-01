/**
 * Schedule Type Resolvers
 */

import type { Context } from "../../utils/context";
import type { DiySchedule as DiyScheduleType } from "@/app/db/schema";

export const DiySchedule = {
  /**
   * Resolve the issue this schedule belongs to
   */
  issue: async (parent: DiyScheduleType, _: unknown, ctx: Context) => {
    return ctx.loaders.issueById.load(parent.issueId);
  },

  /**
   * Resolve the member who created this schedule
   */
  createdBy: async (parent: DiyScheduleType, _: unknown, ctx: Context) => {
    return ctx.loaders.memberById.load(parent.createdBy);
  },

  /**
   * Resolve participant members from participant IDs
   */
  participantMembers: async (parent: DiyScheduleType, _: unknown, ctx: Context) => {
    const participantIds = (parent.participants as string[]) ?? [];
    if (participantIds.length === 0) return [];

    const members = await Promise.all(
      participantIds.map((id) => ctx.loaders.memberById.load(id))
    );
    return members.filter(Boolean);
  },
};

export const ScheduleWithDetails = {
  /**
   * Resolve the member who created this schedule
   */
  createdBy: async (parent: DiyScheduleType, _: unknown, ctx: Context) => {
    return ctx.loaders.memberById.load(parent.createdBy);
  },

  /**
   * Resolve participant members from participant IDs
   */
  participantMembers: async (parent: DiyScheduleType, _: unknown, ctx: Context) => {
    const participantIds = (parent.participants as string[]) ?? [];
    if (participantIds.length === 0) return [];

    const members = await Promise.all(
      participantIds.map((id) => ctx.loaders.memberById.load(id))
    );
    return members.filter(Boolean);
  },
};
