/**
 * GraphQL Schema Definition Language (SDL)
 *
 * Combines all modular type definitions into a single schema.
 * Types are organized in /graphql/schema/types/ by domain.
 *
 * @see /app/db/schema for corresponding Drizzle definitions
 */

import { scalarTypes } from "./types/scalars";
import { enumTypes } from "./types/enums";
import { userTypes, userQueries, userMutations } from "./types/user";
import {
  groupTypes,
  groupInputs,
  groupQueries,
  groupMutations,
} from "./types/group";
import {
  issueTypes,
  issueInputs,
  issueQueries,
  issueMutations,
} from "./types/issue";
import {
  decisionTypes,
  decisionInputs,
  decisionQueries,
  decisionMutations,
} from "./types/decision";
import { guideTypes, guideInputs, guideQueries, guideMutations } from "./types/guide";
import { financeTypes, financeQueries, financeMutations } from "./types/finance";
import { outcomeTypes, outcomeQueries, outcomeMutations } from "./types/outcome";
import { dashboardTypes, dashboardQueries } from "./types/dashboard";
import {
  calendarTypes,
  calendarQueries,
  calendarMutations,
} from "./types/calendar";
import {
  scheduleTypes,
  scheduleInputs,
  scheduleQueries,
  scheduleMutations,
} from "./types/schedule";
import {
  expenseSettingsTypes,
  expenseSettingsEnums,
  expenseSettingsInputs,
  expenseSettingsQueries,
  expenseSettingsMutations,
} from "./types/expense-settings";
import {
  adminTypes,
  adminInputs,
  adminQueries,
  adminMutations,
} from "./types/admin";
import { diagnoseTypes, diagnoseQueries } from "./types/diagnose";

/**
 * Base Query and Mutation types (required for extend)
 */
const baseTypes = /* GraphQL */ `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

/**
 * Combined type definitions
 */
export const typeDefs = [
  // Base types
  scalarTypes,
  enumTypes,
  expenseSettingsEnums,
  baseTypes,

  // Domain types
  userTypes,
  groupTypes,
  issueTypes,
  decisionTypes,
  guideTypes,
  financeTypes,
  outcomeTypes,
  dashboardTypes,
  calendarTypes,
  scheduleTypes,
  expenseSettingsTypes,
  adminTypes,
  diagnoseTypes,

  // Inputs
  groupInputs,
  issueInputs,
  decisionInputs,
  guideInputs,
  scheduleInputs,
  expenseSettingsInputs,
  adminInputs,

  // Queries
  userQueries,
  groupQueries,
  issueQueries,
  decisionQueries,
  guideQueries,
  financeQueries,
  outcomeQueries,
  dashboardQueries,
  calendarQueries,
  scheduleQueries,
  expenseSettingsQueries,
  adminQueries,
  diagnoseQueries,

  // Mutations
  userMutations,
  groupMutations,
  issueMutations,
  decisionMutations,
  guideMutations,
  financeMutations,
  outcomeMutations,
  scheduleMutations,
  calendarMutations,
  expenseSettingsMutations,
  adminMutations,
];
