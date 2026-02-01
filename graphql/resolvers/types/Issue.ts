/**
 * Issue Type Resolvers
 *
 * Field resolvers for Issue and related types (Evidence, Hypothesis, Comment).
 */

import type {
  Issue as IssueType,
  IssueEvidence as IssueEvidenceType,
  IssueHypothesis as IssueHypothesisType,
  IssueComment as IssueCommentType,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";

export const Issue = {
  /**
   * The group this issue belongs to
   */
  group: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.groupById.load(issue.groupId);
  },

  /**
   * Member who created this issue
   */
  createdBy: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.memberById.load(issue.createdBy);
  },

  /**
   * Member who resolved this issue (if resolved)
   */
  resolvedBy: async (issue: IssueType, _: unknown, ctx: Context) => {
    if (!issue.resolvedBy) return null;
    return ctx.loaders.memberById.load(issue.resolvedBy);
  },

  /**
   * All evidence attached to this issue
   */
  evidence: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.evidenceByIssueId.load(issue.id);
  },

  /**
   * AI-generated hypotheses for this issue
   */
  hypotheses: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.hypothesesByIssueId.load(issue.id);
  },

  /**
   * Comments on this issue
   */
  comments: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.commentsByIssueId.load(issue.id);
  },

  /**
   * Decision options for this issue
   */
  options: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.optionsByIssueId.load(issue.id);
  },

  /**
   * Final decision (if made)
   */
  decision: async (issue: IssueType, _: unknown, ctx: Context) => {
    return ctx.loaders.decisionByIssueId.load(issue.id);
  },

  /**
   * Count of evidence items
   */
  evidenceCount: async (issue: IssueType, _: unknown, ctx: Context) => {
    const evidence = await ctx.loaders.evidenceByIssueId.load(issue.id);
    return evidence.length;
  },

  /**
   * Count of comments
   */
  commentCount: async (issue: IssueType, _: unknown, ctx: Context) => {
    const comments = await ctx.loaders.commentsByIssueId.load(issue.id);
    return comments.length;
  },

  /**
   * Warning signs as array (from JSONB)
   */
  warningSignsToWatch: (issue: IssueType) => {
    return issue.warningSignsToWatch ?? null;
  },
};

export const IssueEvidence = {
  /**
   * Member who uploaded this evidence
   */
  uploadedBy: async (evidence: IssueEvidenceType, _: unknown, ctx: Context) => {
    return ctx.loaders.memberById.load(evidence.uploadedBy);
  },
};

export const IssueHypothesis = {
  // All fields are direct mappings, no custom resolvers needed
};

export const IssueComment = {
  /**
   * Member who wrote this comment
   */
  author: async (comment: IssueCommentType, _: unknown, ctx: Context) => {
    return ctx.loaders.memberById.load(comment.userId);
  },
};
