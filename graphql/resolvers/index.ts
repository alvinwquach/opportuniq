/**
 * GraphQL Resolvers Index
 *
 * Assembles all resolvers into the resolver map that GraphQL Yoga uses.
 * Import this in the Yoga server setup.
 *
 * Structure:
 * - Query: Root query resolvers (entry points for reads)
 * - Mutation: Root mutation resolvers (entry points for writes)
 * - Type resolvers: Field resolvers for specific types
 */

import { Query } from "./Query";
import { Mutation } from "./Mutation";
import { adminQueries } from "./queries/admin";
import { adminMutations } from "./mutations/admin";

// Type resolvers
import { User } from "./types/User";
import { Group, GroupMember, GroupConstraints } from "./types/Group";
import { Issue, IssueEvidence, IssueHypothesis, IssueComment } from "./types/Issue";
import {
  Decision,
  DecisionOption,
  DecisionVote,
  ProductRecommendation,
  VendorContact,
} from "./types/Decision";
import { DIYGuide } from "./types/Guide";
import { UserIncomeStream, UserExpense, UserBudget } from "./types/Finance";
import { DecisionOutcome, PreferenceHistory } from "./types/Outcome";
import { GroupInvitation } from "./types/Invitation";
import { DiySchedule, ScheduleWithDetails } from "./types/Schedule";
import { GroupExpenseCategory, GroupExpenseSettings } from "./types/ExpenseSettings";

/**
 * Complete resolver map
 *
 * Note: GraphQL Yoga/graphql-js will merge these with default resolvers.
 * Only define resolvers for fields that need custom logic.
 */
export const resolvers = {
  // Root resolvers (base + admin merged)
  Query: { ...Query, ...adminQueries },
  Mutation: { ...Mutation, ...adminMutations },

  // Custom scalars
  DateTime: {
    // Serialize Date to ISO string for JSON response
    serialize: (value: Date) => value.toISOString(),
    // Parse ISO string from client to Date
    parseValue: (value: string) => new Date(value),
    // Parse literal in query (rarely used)
    parseLiteral: (ast: { kind: string; value?: string }) => {
      if (ast.kind === "StringValue") {
        return new Date(ast.value!);
      }
      return null;
    },
  },

  JSON: {
    serialize: (value: unknown) => value,
    parseValue: (value: unknown) => value,
    parseLiteral: (ast: { kind: string; value?: string }) => {
      // Simple implementation - parse JSON literals
      if (ast.kind === "StringValue") {
        try {
          return JSON.parse(ast.value!);
        } catch {
          return ast.value;
        }
      }
      return null;
    },
  },

  // Type resolvers
  User,
  Group,
  GroupMember,
  GroupConstraints,
  Issue,
  IssueEvidence,
  IssueHypothesis,
  IssueComment,
  Decision,
  DecisionOption,
  DecisionVote,
  ProductRecommendation,
  VendorContact,
  DIYGuide,
  UserIncomeStream,
  UserExpense,
  UserBudget,
  DecisionOutcome,
  PreferenceHistory,
  GroupInvitation,
  DiySchedule,
  ScheduleWithDetails,
  GroupExpenseCategory,
  GroupExpenseSettings,
};
