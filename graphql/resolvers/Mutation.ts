/**
 * Root Mutation Resolvers
 *
 * Entry points for all write operations in the GraphQL API.
 * All mutations require authentication and check appropriate permissions.
 *
 * Note: This is a starter implementation. Add more mutations as needed.
 */

/**
 * Root Mutation Resolvers
 *
 * Entry points for all write operations in the GraphQL API.
 * All mutations require authentication and check appropriate permissions.
 *
 * Admin mutations are in ./mutations/admin.ts and merged in index.ts
 */

import { eq, and, gte, lte, inArray } from "drizzle-orm";
import {
  groups,
  groupMembers,
  groupConstraints,
  groupInvitations,
  issues,
  issueComments,
  decisions,
  decisionVotes,
  decisionOutcomes,
  diyGuides,
  diySchedules,
  vendorContacts,
  groupExpenseSettings,
  groupExpenseCategories,
  users,
  userIncomeStreams,
  userExpenses,
  userBudgets,
} from "@/app/db/schema";
import type { Context } from "../utils/context";
import {
  requireAuth,
  notFound,
  forbidden,
  badInput,
} from "../utils/errors";
import {
  isMemberOfGroup,
  isGroupAdmin,
  getGroupMembership,
} from "../utils/auth";

// =============================================================================
// INPUT TYPES (for TypeScript)
// =============================================================================

interface CreateGroupInput {
  name: string;
  postalCode?: string;
  defaultSearchRadius?: number;
}

interface CreateIssueInput {
  groupId: string;
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  assetName?: string;
  assetDetails?: unknown;
}

interface AddCommentInput {
  issueId: string;
  content: string;
}

interface VoteOnDecisionInput {
  decisionId: string;
  vote: string;
  comment?: string;
}

interface AddIncomeStreamInput {
  source: string;
  amount: string;
  frequency: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateIncomeStreamInput {
  id: string;
  source?: string;
  amount?: string;
  frequency?: string;
  description?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

interface AddExpenseInput {
  category: string;
  amount: string;
  description?: string;
  date: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  issueId?: string;
}

interface UpdateExpenseInput {
  id: string;
  category?: string;
  amount?: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

interface ResolveIssueInput {
  resolutionType: string;
  resolutionNotes?: string;
}

interface CreateScheduleInput {
  issueId: string;
  scheduledTime: string;
  estimatedDuration?: number;
  participants?: string[];
}

interface UpdateScheduleInput {
  scheduledTime?: string;
  estimatedDuration?: number;
  participants?: string[];
}

interface UpdateExpenseSettingsInput {
  approvalMode?: string;
  defaultThreshold?: string;
  trustOwnerAdmin?: boolean;
  moderatorThreshold?: string;
  allowModeratorApprove?: boolean;
}

interface CreateExpenseCategoryInput {
  name: string;
  icon?: string;
  approvalRule?: string;
  customThreshold?: string;
  sortOrder?: number;
}

interface UpdateExpenseCategoryInput {
  name?: string;
  icon?: string;
  approvalRule?: string;
  customThreshold?: string;
  sortOrder?: number;
}

// =============================================================================
// MUTATIONS
// =============================================================================

export const Mutation = {
  // ===========================================================================
  // GROUP MUTATIONS
  // ===========================================================================

  /**
   * Create a new group
   * User becomes the coordinator (owner)
   */
  createGroup: async (
    _: unknown,
    { input }: { input: CreateGroupInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    if (!input.name?.trim()) {
      throw badInput("Group name is required", "name");
    }

    // Create group
    const [group] = await ctx.db
      .insert(groups)
      .values({
        name: input.name.trim(),
        postalCode: input.postalCode,
        defaultSearchRadius: input.defaultSearchRadius ?? 25,
      })
      .returning();

    // Add creator as coordinator
    await ctx.db.insert(groupMembers).values({
      groupId: group.id,
      userId: ctx.userId,
      role: "coordinator",
      status: "active",
      joinedAt: new Date(),
    });

    // Create default constraints
    await ctx.db.insert(groupConstraints).values({
      groupId: group.id,
    });

    return group;
  },

  /**
   * Update group settings (coordinator/collaborator only)
   */
  updateGroup: async (
    _: unknown,
    { id, input }: { id: string; input: { name?: string; postalCode?: string; defaultSearchRadius?: number } },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const group = await ctx.loaders.groupById.load(id);
    if (!group) {
      throw notFound("Group");
    }

    const membership = await getGroupMembership(ctx.userId, id);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only coordinators and collaborators can update
    if (membership.role !== "coordinator" && membership.role !== "collaborator") {
      throw forbidden("Only coordinators and collaborators can update group settings");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.postalCode !== undefined) updates.postalCode = input.postalCode;
    if (input.defaultSearchRadius !== undefined) updates.defaultSearchRadius = input.defaultSearchRadius;

    const [updated] = await ctx.db
      .update(groups)
      .set(updates)
      .where(eq(groups.id, id))
      .returning();

    return updated;
  },

  /**
   * Update group budget constraints (coordinator/collaborator only)
   */
  updateGroupConstraints: async (
    _: unknown,
    { groupId, input }: {
      groupId: string;
      input: {
        monthlyBudget?: string;
        emergencyBuffer?: string;
        riskTolerance?: string;
        diyPreference?: string;
        neverDIY?: string[];
      }
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const membership = await getGroupMembership(ctx.userId, groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only coordinators and collaborators can update
    if (membership.role !== "coordinator" && membership.role !== "collaborator") {
      throw forbidden("Only coordinators and collaborators can update constraints");
    }

    // Get existing constraints
    const [existing] = await ctx.db
      .select()
      .from(groupConstraints)
      .where(eq(groupConstraints.groupId, groupId))
      .limit(1);

    if (!existing) {
      // Create new constraints
      const [created] = await ctx.db
        .insert(groupConstraints)
        .values({
          groupId,
          monthlyBudget: input.monthlyBudget,
          emergencyBuffer: input.emergencyBuffer,
          riskTolerance: input.riskTolerance as any,
          diyPreference: input.diyPreference as any,
          neverDIY: input.neverDIY,
        })
        .returning();
      return created;
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.monthlyBudget !== undefined) updates.monthlyBudget = input.monthlyBudget;
    if (input.emergencyBuffer !== undefined) updates.emergencyBuffer = input.emergencyBuffer;
    if (input.riskTolerance !== undefined) updates.riskTolerance = input.riskTolerance;
    if (input.diyPreference !== undefined) updates.diyPreference = input.diyPreference;
    if (input.neverDIY !== undefined) updates.neverDIY = input.neverDIY;

    const [updated] = await ctx.db
      .update(groupConstraints)
      .set(updates)
      .where(eq(groupConstraints.id, existing.id))
      .returning();

    return updated;
  },

  /**
   * Invite a member to the group (coordinator/collaborator only)
   */
  inviteMember: async (
    _: unknown,
    { groupId, email, role }: { groupId: string; email: string; role: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const membership = await getGroupMembership(ctx.userId, groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only coordinators and collaborators can invite
    if (membership.role !== "coordinator" && membership.role !== "collaborator") {
      throw forbidden("Only coordinators and collaborators can invite members");
    }

    // Check if user already exists
    const [existingUser] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      // Check if already a member
      const [existingMember] = await ctx.db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, existingUser.id)
          )
        )
        .limit(1);

      if (existingMember) {
        if (existingMember.status === "active") {
          throw badInput("User is already a member of this group", "email");
        }
        // Reactivate inactive member
        const [reactivated] = await ctx.db
          .update(groupMembers)
          .set({
            status: "active",
            role: role as any,
            joinedAt: new Date(),
          })
          .where(eq(groupMembers.id, existingMember.id))
          .returning();
        return reactivated;
      }

      // Add existing user as member
      const [member] = await ctx.db
        .insert(groupMembers)
        .values({
          groupId,
          userId: existingUser.id,
          role: role as any,
          status: "active",
          joinedAt: new Date(),
          invitedBy: ctx.userId,
        })
        .returning();

      return member;
    }

    // Create invitation for non-existing user
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await ctx.db.insert(groupInvitations).values({
      groupId,
      inviteeEmail: email.toLowerCase(),
      token,
      role: role as any,
      invitedBy: ctx.userId,
      expiresAt,
    });

    // Return a placeholder member object for the invitation
    // In a real app, you'd want to return the invitation or handle this differently
    return {
      id: token,
      groupId,
      userId: null,
      role,
      status: "pending",
      invitedAt: new Date(),
      joinedAt: null,
      invitedBy: ctx.userId,
    };
  },

  /**
   * Remove a member from the group (coordinator only)
   */
  removeMember: async (
    _: unknown,
    { groupId, memberId }: { groupId: string; memberId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const membership = await getGroupMembership(ctx.userId, groupId);
    if (!membership || membership.role !== "coordinator") {
      throw forbidden("Only coordinators can remove members");
    }

    // Get target member
    const member = await ctx.loaders.memberById.load(memberId);
    if (!member || member.groupId !== groupId) {
      throw notFound("Member");
    }

    // Can't remove yourself
    if (member.userId === ctx.userId) {
      throw forbidden("You cannot remove yourself. Use leaveGroup instead.");
    }

    // Can't remove another coordinator if you're not the only one
    if (member.role === "coordinator") {
      const allMembers = await ctx.loaders.membersByGroupId.load(groupId);
      const coordinators = allMembers.filter(
        (m) => m.role === "coordinator" && m.status === "active"
      );
      if (coordinators.length <= 1) {
        throw forbidden("Cannot remove the only coordinator");
      }
    }

    // Set member to inactive
    await ctx.db
      .update(groupMembers)
      .set({ status: "inactive" })
      .where(eq(groupMembers.id, memberId));

    return true;
  },

  /**
   * Leave a group
   */
  leaveGroup: async (_: unknown, { groupId }: { groupId: string }, ctx: Context) => {
    requireAuth(ctx);

    const membership = await getGroupMembership(ctx.userId, groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Check if user is the only coordinator
    if (membership.role === "coordinator") {
      const members = await ctx.loaders.membersByGroupId.load(groupId);
      const coordinators = members.filter(
        (m) => m.role === "coordinator" && m.status === "active"
      );

      if (coordinators.length === 1) {
        throw forbidden(
          "You cannot leave as the only coordinator. Transfer ownership first."
        );
      }
    }

    // Update membership to inactive
    await ctx.db
      .update(groupMembers)
      .set({ status: "inactive" })
      .where(eq(groupMembers.id, membership.id));

    return true;
  },

  // ===========================================================================
  // ISSUE MUTATIONS
  // ===========================================================================

  /**
   * Create a new issue
   */
  createIssue: async (
    _: unknown,
    { input }: { input: CreateIssueInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    if (!input.title?.trim()) {
      throw badInput("Issue title is required", "title");
    }

    // Check membership
    const membership = await getGroupMembership(ctx.userId, input.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Check write permission (not observer)
    if (membership.role === "observer") {
      throw forbidden("Observers cannot create issues");
    }

    // Create issue
    const [issue] = await ctx.db
      .insert(issues)
      .values({
        groupId: input.groupId,
        title: input.title.trim(),
        description: input.description,
        category: input.category as any,
        subcategory: input.subcategory,
        priority: (input.priority as any) ?? "medium",
        assetName: input.assetName,
        assetDetails: input.assetDetails,
        createdBy: membership.id,
      })
      .returning();

    return issue;
  },

  /**
   * Update an existing issue
   */
  updateIssue: async (
    _: unknown,
    { id, input }: {
      id: string;
      input: {
        title?: string;
        description?: string;
        category?: string;
        subcategory?: string;
        priority?: string;
        status?: string;
        assetName?: string;
        assetDetails?: unknown;
      }
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const issue = await ctx.loaders.issueById.load(id);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't update issues
    if (membership.role === "observer") {
      throw forbidden("Observers cannot update issues");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.description !== undefined) updates.description = input.description;
    if (input.category !== undefined) updates.category = input.category;
    if (input.subcategory !== undefined) updates.subcategory = input.subcategory;
    if (input.priority !== undefined) updates.priority = input.priority;
    if (input.status !== undefined) updates.status = input.status;
    if (input.assetName !== undefined) updates.assetName = input.assetName;
    if (input.assetDetails !== undefined) updates.assetDetails = input.assetDetails;

    const [updated] = await ctx.db
      .update(issues)
      .set(updates)
      .where(eq(issues.id, id))
      .returning();

    return updated;
  },

  /**
   * Delete an issue
   */
  deleteIssue: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const issue = await ctx.loaders.issueById.load(id);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only admins or the creator can delete
    const isAdmin = membership.role === "coordinator" || membership.role === "collaborator";
    const isCreator = issue.createdBy === membership.id;

    if (!isAdmin && !isCreator) {
      throw forbidden("You can only delete your own issues");
    }

    await ctx.db.delete(issues).where(eq(issues.id, id));

    return true;
  },

  // ===========================================================================
  // COMMENT MUTATIONS
  // ===========================================================================

  /**
   * Add a comment to an issue
   */
  addComment: async (
    _: unknown,
    { input }: { input: AddCommentInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    if (!input.content?.trim()) {
      throw badInput("Comment content is required", "content");
    }

    const issue = await ctx.loaders.issueById.load(input.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't comment
    if (membership.role === "observer") {
      throw forbidden("Observers cannot add comments");
    }

    const [comment] = await ctx.db
      .insert(issueComments)
      .values({
        issueId: input.issueId,
        userId: membership.id,
        content: input.content.trim(),
      })
      .returning();

    return comment;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const [comment] = await ctx.db
      .select()
      .from(issueComments)
      .where(eq(issueComments.id, id))
      .limit(1);

    if (!comment) {
      throw notFound("Comment");
    }

    // Get membership to check permissions
    const issue = await ctx.loaders.issueById.load(comment.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only admins or author can delete
    const isAdmin = membership.role === "coordinator" || membership.role === "collaborator";
    const isAuthor = comment.userId === membership.id;

    if (!isAdmin && !isAuthor) {
      throw forbidden("You can only delete your own comments");
    }

    await ctx.db.delete(issueComments).where(eq(issueComments.id, id));

    return true;
  },

  /**
   * Edit a comment (author only)
   */
  editComment: async (
    _: unknown,
    { id, content }: { id: string; content: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    if (!content?.trim()) {
      throw badInput("Comment content is required", "content");
    }

    const [comment] = await ctx.db
      .select()
      .from(issueComments)
      .where(eq(issueComments.id, id))
      .limit(1);

    if (!comment) {
      throw notFound("Comment");
    }

    // Get membership to check permissions
    const issue = await ctx.loaders.issueById.load(comment.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only author can edit
    if (comment.userId !== membership.id) {
      throw forbidden("You can only edit your own comments");
    }

    const [updated] = await ctx.db
      .update(issueComments)
      .set({
        content: content.trim(),
        updatedAt: new Date(),
      })
      .where(eq(issueComments.id, id))
      .returning();

    return updated;
  },

  /**
   * Mark an issue as resolved
   */
  resolveIssue: async (
    _: unknown,
    { id, input }: { id: string; input: ResolveIssueInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const issue = await ctx.loaders.issueById.load(id);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't resolve issues
    if (membership.role === "observer") {
      throw forbidden("Observers cannot resolve issues");
    }

    const [updated] = await ctx.db
      .update(issues)
      .set({
        status: "completed",
        resolutionType: input.resolutionType as any,
        resolutionNotes: input.resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: membership.id,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    return updated;
  },

  /**
   * Reopen a completed/deferred issue
   */
  reopenIssue: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const issue = await ctx.loaders.issueById.load(id);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't reopen issues
    if (membership.role === "observer") {
      throw forbidden("Observers cannot reopen issues");
    }

    // Can only reopen completed or deferred issues
    if (issue.status !== "completed" && issue.status !== "deferred") {
      throw badInput("Only completed or deferred issues can be reopened", "id");
    }

    const [updated] = await ctx.db
      .update(issues)
      .set({
        status: "open",
        resolutionType: null,
        resolutionNotes: null,
        resolvedAt: null,
        resolvedBy: null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    return updated;
  },

  // ===========================================================================
  // DECISION MUTATIONS
  // ===========================================================================

  /**
   * Select an option and create a decision (coordinator/collaborator only)
   */
  selectDecisionOption: async (
    _: unknown,
    { optionId, assumptions }: { optionId: string; assumptions?: unknown },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get the option
    const option = await ctx.loaders.optionById.load(optionId);
    if (!option) {
      throw notFound("Decision option");
    }

    // Get the issue to check permissions
    const issue = await ctx.loaders.issueById.load(option.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only coordinators and collaborators can finalize decisions
    if (membership.role !== "coordinator" && membership.role !== "collaborator") {
      throw forbidden("Only coordinators and collaborators can finalize decisions");
    }

    // Check if decision already exists for this issue
    const existingDecision = await ctx.loaders.decisionByIssueId.load(issue.id);
    if (existingDecision) {
      // Update existing decision
      const [updated] = await ctx.db
        .update(decisions)
        .set({
          selectedOptionId: optionId,
          assumptions: assumptions as any,
          approvedAt: new Date(),
        })
        .where(eq(decisions.id, existingDecision.id))
        .returning();

      // Update issue status
      await ctx.db
        .update(issues)
        .set({ status: "decided", updatedAt: new Date() })
        .where(eq(issues.id, issue.id));

      return updated;
    }

    // Create new decision
    const [decision] = await ctx.db
      .insert(decisions)
      .values({
        issueId: issue.id,
        selectedOptionId: optionId,
        assumptions: assumptions as any,
        approvedAt: new Date(),
      })
      .returning();

    // Update issue status to decided
    await ctx.db
      .update(issues)
      .set({ status: "decided", updatedAt: new Date() })
      .where(eq(issues.id, issue.id));

    return decision;
  },

  /**
   * Vote on a decision
   */
  voteOnDecision: async (
    _: unknown,
    { input }: { input: VoteOnDecisionInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const decision = await ctx.loaders.decisionById.load(input.decisionId);
    if (!decision) {
      throw notFound("Decision");
    }

    const issue = await ctx.loaders.issueById.load(decision.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't vote
    if (membership.role === "observer") {
      throw forbidden("Observers cannot vote");
    }

    // Check if already voted
    const existingVotes = await ctx.loaders.votesByDecisionId.load(decision.id);
    const existingVote = existingVotes.find((v) => v.memberId === membership.id);

    if (existingVote) {
      // Update existing vote
      const [updated] = await ctx.db
        .update(decisionVotes)
        .set({
          vote: input.vote as any,
          comment: input.comment,
          votedAt: new Date(),
        })
        .where(eq(decisionVotes.id, existingVote.id))
        .returning();

      return updated;
    }

    // Create new vote
    const [vote] = await ctx.db
      .insert(decisionVotes)
      .values({
        decisionId: input.decisionId,
        memberId: membership.id,
        vote: input.vote as any,
        comment: input.comment,
      })
      .returning();

    return vote;
  },

  /**
   * Change an existing vote on a decision
   */
  changeVote: async (
    _: unknown,
    { voteId, vote, comment }: { voteId: string; vote: string; comment?: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get the existing vote
    const [existingVote] = await ctx.db
      .select()
      .from(decisionVotes)
      .where(eq(decisionVotes.id, voteId))
      .limit(1);

    if (!existingVote) {
      throw notFound("Vote");
    }

    // Get the decision to check permissions
    const decision = await ctx.loaders.decisionById.load(existingVote.decisionId);
    if (!decision) {
      throw notFound("Decision");
    }

    const issue = await ctx.loaders.issueById.load(decision.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only the vote owner can change their vote
    if (existingVote.memberId !== membership.id) {
      throw forbidden("You can only change your own votes");
    }

    const [updated] = await ctx.db
      .update(decisionVotes)
      .set({
        vote: vote as any,
        comment,
        votedAt: new Date(),
      })
      .where(eq(decisionVotes.id, voteId))
      .returning();

    return updated;
  },

  // ===========================================================================
  // VENDOR MUTATIONS
  // ===========================================================================

  /**
   * Mark a vendor as contacted
   */
  markVendorContacted: async (
    _: unknown,
    { vendorId }: { vendorId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get the vendor
    const [vendor] = await ctx.db
      .select()
      .from(vendorContacts)
      .where(eq(vendorContacts.id, vendorId))
      .limit(1);

    if (!vendor) {
      throw notFound("Vendor");
    }

    // Check permissions via the linked issue or option
    if (vendor.issueId) {
      const issue = await ctx.loaders.issueById.load(vendor.issueId);
      if (!issue) {
        throw notFound("Issue");
      }
      const membership = await getGroupMembership(ctx.userId, issue.groupId);
      if (!membership) {
        throw forbidden("You are not a member of this group");
      }
    } else if (vendor.optionId) {
      // Get option to find issue
      const [option] = await ctx.db
        .select()
        .from(decisions)
        .where(eq(decisions.selectedOptionId, vendor.optionId))
        .limit(1);

      if (option) {
        const issue = await ctx.loaders.issueById.load(option.issueId);
        if (issue) {
          const membership = await getGroupMembership(ctx.userId, issue.groupId);
          if (!membership) {
            throw forbidden("You are not a member of this group");
          }
        }
      }
    }

    const [updated] = await ctx.db
      .update(vendorContacts)
      .set({ contacted: true })
      .where(eq(vendorContacts.id, vendorId))
      .returning();

    return updated;
  },

  /**
   * Add or update a vendor quote
   */
  addVendorQuote: async (
    _: unknown,
    { vendorId, amount, details }: { vendorId: string; amount: string; details?: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get the vendor
    const [vendor] = await ctx.db
      .select()
      .from(vendorContacts)
      .where(eq(vendorContacts.id, vendorId))
      .limit(1);

    if (!vendor) {
      throw notFound("Vendor");
    }

    // Check permissions via the linked issue or option
    if (vendor.issueId) {
      const issue = await ctx.loaders.issueById.load(vendor.issueId);
      if (!issue) {
        throw notFound("Issue");
      }
      const membership = await getGroupMembership(ctx.userId, issue.groupId);
      if (!membership) {
        throw forbidden("You are not a member of this group");
      }
    }

    const [updated] = await ctx.db
      .update(vendorContacts)
      .set({
        quoteAmount: amount,
        quoteDetails: details,
      })
      .where(eq(vendorContacts.id, vendorId))
      .returning();

    return updated;
  },

  // ===========================================================================
  // GUIDE MUTATIONS
  // ===========================================================================

  /**
   * Toggle bookmark on a guide
   */
  bookmarkGuide: async (
    _: unknown,
    { input }: { input: { guideId: string; bookmarked: boolean } },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const guide = await ctx.loaders.guideById.load(input.guideId);
    if (!guide) {
      throw notFound("Guide");
    }

    // Only owner can bookmark their guides
    if (guide.userId !== ctx.userId) {
      throw forbidden("You can only bookmark your own guides");
    }

    const [updated] = await ctx.db
      .update(diyGuides)
      .set({ wasBookmarked: input.bookmarked })
      .where(eq(diyGuides.id, input.guideId))
      .returning();

    return updated;
  },

  /**
   * Mark guide as helpful/not helpful
   */
  rateGuide: async (
    _: unknown,
    { guideId, helpful }: { guideId: string; helpful: boolean },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const guide = await ctx.loaders.guideById.load(guideId);
    if (!guide) {
      throw notFound("Guide");
    }

    // Only owner can rate their guides
    if (guide.userId !== ctx.userId) {
      throw forbidden("You can only rate your own guides");
    }

    const [updated] = await ctx.db
      .update(diyGuides)
      .set({ wasHelpful: helpful })
      .where(eq(diyGuides.id, guideId))
      .returning();

    return updated;
  },

  /**
   * Track guide click for analytics
   */
  trackGuideClick: async (_: unknown, { guideId }: { guideId: string }, ctx: Context) => {
    requireAuth(ctx);

    const guide = await ctx.loaders.guideById.load(guideId);
    if (!guide) {
      throw notFound("Guide");
    }

    if (guide.userId !== ctx.userId) {
      throw forbidden("Not your guide");
    }

    const [updated] = await ctx.db
      .update(diyGuides)
      .set({
        wasClicked: true,
        clickedAt: new Date(),
      })
      .where(eq(diyGuides.id, guideId))
      .returning();

    return updated;
  },

  /**
   * Update guide progress
   */
  updateGuideProgress: async (
    _: unknown,
    { guideId, progress, completedSteps }: { guideId: string; progress: number; completedSteps?: number },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const guide = await ctx.loaders.guideById.load(guideId);
    if (!guide) {
      throw notFound("Guide");
    }

    if (guide.userId !== ctx.userId) {
      throw forbidden("Not your guide");
    }

    // Update the guide progress
    // Note: The diyGuides table may not have progress fields yet
    // This updates wasHelpful based on 100% progress
    const wasHelpful = progress === 100;

    await ctx.db
      .update(diyGuides)
      .set({
        wasHelpful,
      })
      .where(eq(diyGuides.id, guideId));

    return true;
  },

  // ===========================================================================
  // USER MUTATIONS
  // ===========================================================================

  /**
   * Update user profile
   */
  updateProfile: async (
    _: unknown,
    args: {
      name?: string;
      city?: string;
      stateProvince?: string;
      postalCode?: string;
      country?: string;
      monthlyBudget?: string;
      emergencyBuffer?: string;
      riskTolerance?: string;
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.city !== undefined) updates.city = args.city;
    if (args.stateProvince !== undefined) updates.stateProvince = args.stateProvince;
    if (args.postalCode !== undefined) updates.postalCode = args.postalCode;
    if (args.country !== undefined) updates.country = args.country;
    if (args.monthlyBudget !== undefined) updates.monthlyBudget = args.monthlyBudget;
    if (args.emergencyBuffer !== undefined) updates.emergencyBuffer = args.emergencyBuffer;
    if (args.riskTolerance !== undefined) updates.riskTolerance = args.riskTolerance as any;

    const [updated] = await ctx.db
      .update(users)
      .set(updates)
      .where(eq(users.id, ctx.userId))
      .returning();

    return updated;
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (
    _: unknown,
    args: {
      language?: string;
      theme?: string;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      weeklyDigest?: boolean;
      unitSystem?: string;
      currency?: string;
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get current user to merge preferences
    const currentUser = ctx.user;
    if (!currentUser) {
      throw forbidden("Not authenticated");
    }

    const currentPrefs = (currentUser.preferences as Record<string, unknown>) ?? {};
    const newPrefs: Record<string, unknown> = { ...currentPrefs };

    if (args.language !== undefined) newPrefs.language = args.language;
    if (args.theme !== undefined) newPrefs.theme = args.theme;
    if (args.emailNotifications !== undefined) newPrefs.emailNotifications = args.emailNotifications;
    if (args.smsNotifications !== undefined) newPrefs.smsNotifications = args.smsNotifications;
    if (args.weeklyDigest !== undefined) newPrefs.weeklyDigest = args.weeklyDigest;
    if (args.unitSystem !== undefined) newPrefs.unitSystem = args.unitSystem;
    if (args.currency !== undefined) newPrefs.currency = args.currency;

    const [updated] = await ctx.db
      .update(users)
      .set({
        preferences: newPrefs,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.userId))
      .returning();

    return updated;
  },

  // ===========================================================================
  // INCOME STREAM MUTATIONS
  // ===========================================================================

  /**
   * Add a new income stream
   */
  addIncomeStream: async (
    _: unknown,
    args: AddIncomeStreamInput,
    ctx: Context
  ) => {
    requireAuth(ctx);

    if (!args.source?.trim()) {
      throw badInput("Income source is required", "source");
    }
    if (!args.amount) {
      throw badInput("Amount is required", "amount");
    }

    const [stream] = await ctx.db
      .insert(userIncomeStreams)
      .values({
        userId: ctx.userId,
        source: args.source.trim(),
        amount: args.amount,
        frequency: args.frequency as any,
        description: args.description,
        startDate: args.startDate ? new Date(args.startDate) : null,
        endDate: args.endDate ? new Date(args.endDate) : null,
        isActive: true,
        isEncrypted: false, // TODO: Enable encryption
      })
      .returning();

    return stream;
  },

  /**
   * Update an income stream
   */
  updateIncomeStream: async (
    _: unknown,
    args: UpdateIncomeStreamInput,
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Verify ownership
    const existing = await ctx.loaders.incomeStreamById.load(args.id);
    if (!existing) {
      throw notFound("Income stream");
    }
    if (existing.userId !== ctx.userId) {
      throw forbidden("You can only modify your own income streams");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (args.source !== undefined) updates.source = args.source;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.frequency !== undefined) updates.frequency = args.frequency;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.startDate !== undefined) updates.startDate = args.startDate ? new Date(args.startDate) : null;
    if (args.endDate !== undefined) updates.endDate = args.endDate ? new Date(args.endDate) : null;

    const [updated] = await ctx.db
      .update(userIncomeStreams)
      .set(updates)
      .where(eq(userIncomeStreams.id, args.id))
      .returning();

    return updated;
  },

  /**
   * Delete an income stream
   */
  deleteIncomeStream: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    // Verify ownership
    const existing = await ctx.loaders.incomeStreamById.load(id);
    if (!existing) {
      throw notFound("Income stream");
    }
    if (existing.userId !== ctx.userId) {
      throw forbidden("You can only delete your own income streams");
    }

    await ctx.db.delete(userIncomeStreams).where(eq(userIncomeStreams.id, id));

    return true;
  },

  // ===========================================================================
  // EXPENSE MUTATIONS
  // ===========================================================================

  /**
   * Add an expense
   */
  addExpense: async (_: unknown, args: AddExpenseInput, ctx: Context) => {
    requireAuth(ctx);

    if (!args.category?.trim()) {
      throw badInput("Category is required", "category");
    }
    if (!args.amount) {
      throw badInput("Amount is required", "amount");
    }
    if (!args.date) {
      throw badInput("Date is required", "date");
    }

    // Verify issue ownership if linked
    if (args.issueId) {
      const issue = await ctx.loaders.issueById.load(args.issueId);
      if (!issue) {
        throw notFound("Issue");
      }
      // Check membership in issue's group
      const isMember = await isMemberOfGroup(ctx.userId, issue.groupId);
      if (!isMember) {
        throw forbidden("You are not a member of this group");
      }
    }

    const [expense] = await ctx.db
      .insert(userExpenses)
      .values({
        userId: ctx.userId,
        category: args.category.trim(),
        amount: args.amount,
        description: args.description,
        date: new Date(args.date),
        isRecurring: args.isRecurring ?? false,
        recurringFrequency: args.recurringFrequency as any,
        issueId: args.issueId,
        isEncrypted: false, // TODO: Enable encryption
      })
      .returning();

    return expense;
  },

  /**
   * Update an expense
   */
  updateExpense: async (_: unknown, args: UpdateExpenseInput, ctx: Context) => {
    requireAuth(ctx);

    // Verify ownership
    const existing = await ctx.loaders.expenseById.load(args.id);
    if (!existing) {
      throw notFound("Expense");
    }
    if (existing.userId !== ctx.userId) {
      throw forbidden("You can only modify your own expenses");
    }

    const updates: Record<string, unknown> = {};

    if (args.category !== undefined) updates.category = args.category;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = new Date(args.date);
    if (args.isRecurring !== undefined) updates.isRecurring = args.isRecurring;
    if (args.recurringFrequency !== undefined) updates.recurringFrequency = args.recurringFrequency;

    const [updated] = await ctx.db
      .update(userExpenses)
      .set(updates)
      .where(eq(userExpenses.id, args.id))
      .returning();

    return updated;
  },

  /**
   * Delete an expense
   */
  deleteExpense: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    // Verify ownership
    const existing = await ctx.loaders.expenseById.load(id);
    if (!existing) {
      throw notFound("Expense");
    }
    if (existing.userId !== ctx.userId) {
      throw forbidden("You can only delete your own expenses");
    }

    await ctx.db.delete(userExpenses).where(eq(userExpenses.id, id));

    return true;
  },

  // ===========================================================================
  // BUDGET MUTATIONS
  // ===========================================================================

  /**
   * Set or update a budget category
   */
  setBudget: async (
    _: unknown,
    args: { category: string; monthlyLimit: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    if (!args.category?.trim()) {
      throw badInput("Category is required", "category");
    }
    if (!args.monthlyLimit) {
      throw badInput("Monthly limit is required", "monthlyLimit");
    }

    // Check if budget for this category already exists
    const existing = await ctx.db
      .select()
      .from(userBudgets)
      .where(
        and(
          eq(userBudgets.userId, ctx.userId),
          eq(userBudgets.category, args.category.trim())
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing budget
      const [updated] = await ctx.db
        .update(userBudgets)
        .set({
          monthlyLimit: args.monthlyLimit,
          updatedAt: new Date(),
        })
        .where(eq(userBudgets.id, existing[0].id))
        .returning();

      return updated;
    }

    // Create new budget
    const [budget] = await ctx.db
      .insert(userBudgets)
      .values({
        userId: ctx.userId,
        category: args.category.trim(),
        monthlyLimit: args.monthlyLimit,
        currentSpend: "0",
        isEncrypted: false, // TODO: Enable encryption
      })
      .returning();

    return budget;
  },

  /**
   * Update budget spending
   */
  updateBudgetSpend: async (
    _: unknown,
    args: { id: string; currentSpend: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Verify ownership
    const existing = await ctx.loaders.budgetById.load(args.id);
    if (!existing) {
      throw notFound("Budget");
    }
    if (existing.userId !== ctx.userId) {
      throw forbidden("You can only modify your own budgets");
    }

    const [updated] = await ctx.db
      .update(userBudgets)
      .set({
        currentSpend: args.currentSpend,
        updatedAt: new Date(),
      })
      .where(eq(userBudgets.id, args.id))
      .returning();

    return updated;
  },

  /**
   * Delete a budget category
   */
  deleteBudget: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    // Verify ownership
    const existing = await ctx.loaders.budgetById.load(id);
    if (!existing) {
      throw notFound("Budget");
    }
    if (existing.userId !== ctx.userId) {
      throw forbidden("You can only delete your own budgets");
    }

    await ctx.db.delete(userBudgets).where(eq(userBudgets.id, id));

    return true;
  },

  // ===========================================================================
  // INVITATION MUTATIONS
  // ===========================================================================

  /**
   * Accept a group invitation
   */
  acceptInvitation: async (_: unknown, { invitationId }: { invitationId: string }, ctx: Context) => {
    requireAuth(ctx);

    const invitation = await ctx.loaders.invitationById.load(invitationId);
    if (!invitation) {
      throw notFound("Invitation");
    }

    // Check if invitation is for this user
    if (invitation.inviteeEmail !== ctx.user?.email) {
      throw forbidden("This invitation is not for you");
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      throw badInput("This invitation has already been accepted", "invitationId");
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      throw badInput("This invitation has expired", "invitationId");
    }

    // Create the membership
    const [member] = await ctx.db
      .insert(groupMembers)
      .values({
        groupId: invitation.groupId,
        userId: ctx.userId,
        role: invitation.role,
        status: "active",
        invitedAt: invitation.createdAt,
        joinedAt: new Date(),
      })
      .returning();

    // Mark invitation as accepted
    await ctx.db
      .update(groupInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(groupInvitations.id, invitationId));

    return member;
  },

  /**
   * Decline a group invitation
   */
  declineInvitation: async (_: unknown, { invitationId }: { invitationId: string }, ctx: Context) => {
    requireAuth(ctx);

    const invitation = await ctx.loaders.invitationById.load(invitationId);
    if (!invitation) {
      throw notFound("Invitation");
    }

    // Check if invitation is for this user
    if (invitation.inviteeEmail !== ctx.user?.email) {
      throw forbidden("This invitation is not for you");
    }

    // Delete the invitation
    await ctx.db.delete(groupInvitations).where(eq(groupInvitations.id, invitationId));

    return true;
  },

  /**
   * Update a member's role (coordinator only)
   */
  updateMemberRole: async (
    _: unknown,
    args: { groupId: string; memberId: string; role: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Check if requester is coordinator
    const requesterMembership = await getGroupMembership(ctx.userId, args.groupId);
    if (!requesterMembership || requesterMembership.role !== "coordinator") {
      throw forbidden("Only coordinators can change member roles");
    }

    // Get target member
    const member = await ctx.loaders.memberById.load(args.memberId);
    if (!member || member.groupId !== args.groupId) {
      throw notFound("Member");
    }

    // Can't demote yourself if you're the only coordinator
    if (member.userId === ctx.userId && args.role !== "coordinator") {
      const allMembers = await ctx.loaders.membersByGroupId.load(args.groupId);
      const coordinators = allMembers.filter(
        (m) => m.role === "coordinator" && m.status === "active"
      );
      if (coordinators.length === 1) {
        throw forbidden("Cannot demote yourself as the only coordinator");
      }
    }

    // Update role
    const [updated] = await ctx.db
      .update(groupMembers)
      .set({ role: args.role as any })
      .where(eq(groupMembers.id, args.memberId))
      .returning();

    return updated;
  },

  // ===========================================================================
  // OUTCOME MUTATIONS
  // ===========================================================================

  /**
   * Record the actual outcome of a decision
   */
  recordOutcome: async (
    _: unknown,
    args: {
      decisionId: string;
      actualCost?: string;
      actualTime?: string;
      success: boolean;
      whatWentWell?: string;
      whatWentWrong?: string;
      lessonsLearned?: string;
      wouldDoAgain?: boolean;
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get the decision
    const decision = await ctx.loaders.decisionById.load(args.decisionId);
    if (!decision) {
      throw notFound("Decision");
    }

    // Get the issue to check permissions
    const issue = await ctx.loaders.issueById.load(decision.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Check if outcome already exists
    const existing = await ctx.loaders.outcomeByDecisionId.load(args.decisionId);
    if (existing) {
      // Update existing outcome
      const [updated] = await ctx.db
        .update(decisionOutcomes)
        .set({
          actualCost: args.actualCost,
          actualTime: args.actualTime,
          success: args.success,
          whatWentWell: args.whatWentWell,
          whatWentWrong: args.whatWentWrong,
          lessonsLearned: args.lessonsLearned,
          wouldDoAgain: args.wouldDoAgain,
          updatedAt: new Date(),
        })
        .where(eq(decisionOutcomes.id, existing.id))
        .returning();

      return updated;
    }

    // Create new outcome
    const [outcome] = await ctx.db
      .insert(decisionOutcomes)
      .values({
        decisionId: args.decisionId,
        actualCost: args.actualCost,
        actualTime: args.actualTime,
        success: args.success,
        completedAt: new Date(),
        whatWentWell: args.whatWentWell,
        whatWentWrong: args.whatWentWrong,
        lessonsLearned: args.lessonsLearned,
        wouldDoAgain: args.wouldDoAgain,
      })
      .returning();

    return outcome;
  },

  // ===========================================================================
  // SCHEDULE MUTATIONS
  // ===========================================================================

  /**
   * Create a new schedule for an issue
   */
  createSchedule: async (
    _: unknown,
    { input }: { input: CreateScheduleInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const issue = await ctx.loaders.issueById.load(input.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't create schedules
    if (membership.role === "observer") {
      throw forbidden("Observers cannot create schedules");
    }

    const [schedule] = await ctx.db
      .insert(diySchedules)
      .values({
        issueId: input.issueId,
        scheduledTime: new Date(input.scheduledTime),
        estimatedDuration: input.estimatedDuration,
        participants: input.participants ?? [],
        createdBy: membership.id,
      })
      .returning();

    return schedule;
  },

  /**
   * Update an existing schedule
   */
  updateSchedule: async (
    _: unknown,
    { id, input }: { id: string; input: UpdateScheduleInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const schedule = await ctx.loaders.scheduleById.load(id);
    if (!schedule) {
      throw notFound("Schedule");
    }

    const issue = await ctx.loaders.issueById.load(schedule.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Observers can't update schedules
    if (membership.role === "observer") {
      throw forbidden("Observers cannot update schedules");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.scheduledTime !== undefined) {
      updates.scheduledTime = new Date(input.scheduledTime);
    }
    if (input.estimatedDuration !== undefined) {
      updates.estimatedDuration = input.estimatedDuration;
    }
    if (input.participants !== undefined) {
      updates.participants = input.participants;
    }

    const [updated] = await ctx.db
      .update(diySchedules)
      .set(updates)
      .where(eq(diySchedules.id, id))
      .returning();

    return updated;
  },

  /**
   * Delete a schedule
   */
  deleteSchedule: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const schedule = await ctx.loaders.scheduleById.load(id);
    if (!schedule) {
      throw notFound("Schedule");
    }

    const issue = await ctx.loaders.issueById.load(schedule.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const membership = await getGroupMembership(ctx.userId, issue.groupId);
    if (!membership) {
      throw forbidden("You are not a member of this group");
    }

    // Only creator or admin can delete
    const isAdmin = membership.role === "coordinator" || membership.role === "collaborator";
    const isCreator = schedule.createdBy === membership.id;

    if (!isAdmin && !isCreator) {
      throw forbidden("You can only delete your own schedules");
    }

    await ctx.db.delete(diySchedules).where(eq(diySchedules.id, id));

    return true;
  },

  // ===========================================================================
  // EXPENSE SETTINGS MUTATIONS
  // ===========================================================================

  /**
   * Update group expense settings (coordinator only)
   */
  updateExpenseSettings: async (
    _: unknown,
    { groupId, input }: { groupId: string; input: UpdateExpenseSettingsInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Check if requester is coordinator
    const membership = await getGroupMembership(ctx.userId, groupId);
    if (!membership || membership.role !== "coordinator") {
      throw forbidden("Only coordinators can update expense settings");
    }

    // Check if settings exist
    const [existing] = await ctx.db
      .select()
      .from(groupExpenseSettings)
      .where(eq(groupExpenseSettings.groupId, groupId))
      .limit(1);

    if (existing) {
      // Update existing settings
      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.approvalMode !== undefined) updates.approvalMode = input.approvalMode;
      if (input.defaultThreshold !== undefined) updates.defaultThreshold = input.defaultThreshold;
      if (input.trustOwnerAdmin !== undefined) updates.trustOwnerAdmin = input.trustOwnerAdmin;
      if (input.moderatorThreshold !== undefined) updates.moderatorThreshold = input.moderatorThreshold;
      if (input.allowModeratorApprove !== undefined) updates.allowModeratorApprove = input.allowModeratorApprove;

      const [updated] = await ctx.db
        .update(groupExpenseSettings)
        .set(updates)
        .where(eq(groupExpenseSettings.id, existing.id))
        .returning();

      return updated;
    }

    // Create new settings
    const [settings] = await ctx.db
      .insert(groupExpenseSettings)
      .values({
        groupId,
        approvalMode: (input.approvalMode as any) ?? "none",
        defaultThreshold: input.defaultThreshold,
        trustOwnerAdmin: input.trustOwnerAdmin ?? false,
        moderatorThreshold: input.moderatorThreshold,
        allowModeratorApprove: input.allowModeratorApprove ?? false,
      })
      .returning();

    return settings;
  },

  /**
   * Create an expense category for a group
   */
  createExpenseCategory: async (
    _: unknown,
    { groupId, input }: { groupId: string; input: CreateExpenseCategoryInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Check if requester is coordinator or collaborator
    const membership = await getGroupMembership(ctx.userId, groupId);
    if (!membership || (membership.role !== "coordinator" && membership.role !== "collaborator")) {
      throw forbidden("Only coordinators and collaborators can create expense categories");
    }

    if (!input.name?.trim()) {
      throw badInput("Category name is required", "name");
    }

    const [category] = await ctx.db
      .insert(groupExpenseCategories)
      .values({
        groupId,
        name: input.name.trim(),
        icon: input.icon,
        approvalRule: (input.approvalRule as any) ?? "use_default",
        customThreshold: input.customThreshold,
        sortOrder: input.sortOrder ?? 0,
        createdBy: ctx.userId,
      })
      .returning();

    return category;
  },

  /**
   * Update an expense category
   */
  updateExpenseCategory: async (
    _: unknown,
    { id, input }: { id: string; input: UpdateExpenseCategoryInput },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get category to find group
    const [category] = await ctx.db
      .select()
      .from(groupExpenseCategories)
      .where(eq(groupExpenseCategories.id, id))
      .limit(1);

    if (!category) {
      throw notFound("Expense category");
    }

    // Check permissions
    const membership = await getGroupMembership(ctx.userId, category.groupId);
    if (!membership || (membership.role !== "coordinator" && membership.role !== "collaborator")) {
      throw forbidden("Only coordinators and collaborators can update expense categories");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.icon !== undefined) updates.icon = input.icon;
    if (input.approvalRule !== undefined) updates.approvalRule = input.approvalRule;
    if (input.customThreshold !== undefined) updates.customThreshold = input.customThreshold;
    if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;

    const [updated] = await ctx.db
      .update(groupExpenseCategories)
      .set(updates)
      .where(eq(groupExpenseCategories.id, id))
      .returning();

    return updated;
  },

  /**
   * Delete an expense category
   */
  deleteExpenseCategory: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    // Get category to find group
    const [category] = await ctx.db
      .select()
      .from(groupExpenseCategories)
      .where(eq(groupExpenseCategories.id, id))
      .limit(1);

    if (!category) {
      throw notFound("Expense category");
    }

    // Check permissions
    const membership = await getGroupMembership(ctx.userId, category.groupId);
    if (!membership || (membership.role !== "coordinator" && membership.role !== "collaborator")) {
      throw forbidden("Only coordinators and collaborators can delete expense categories");
    }

    await ctx.db.delete(groupExpenseCategories).where(eq(groupExpenseCategories.id, id));

    return true;
  },
};
