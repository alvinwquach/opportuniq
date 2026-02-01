/**
 * Invitation Type Resolvers
 *
 * Resolvers for GroupInvitation type.
 */

import type { Context } from "../../utils/context";
import type { GroupInvitation as InvitationDB } from "@/app/db/schema";

// =============================================================================
// GROUP INVITATION RESOLVER
// =============================================================================

export const GroupInvitation = {
  /**
   * Map database field to GraphQL field
   */
  email: (parent: InvitationDB) => parent.inviteeEmail,

  /**
   * Map database field to GraphQL field
   */
  invitedAt: (parent: InvitationDB) => parent.createdAt,

  /**
   * Resolve the group this invitation is for
   */
  group: async (parent: InvitationDB, _: unknown, ctx: Context) => {
    return ctx.loaders.groupById.load(parent.groupId);
  },

  /**
   * Resolve the member who sent the invitation
   */
  invitedBy: async (parent: InvitationDB, _: unknown, ctx: Context) => {
    // Find the membership for the user who invited
    const members = await ctx.loaders.membersByGroupId.load(parent.groupId);
    return members.find((m) => m.userId === parent.invitedBy) ?? null;
  },
};
