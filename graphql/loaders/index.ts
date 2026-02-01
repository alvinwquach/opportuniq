/**
 * DataLoader Factory
 *
 * DataLoaders solve the N+1 query problem by batching and caching database queries.
 * Each GraphQL request gets fresh loader instances to prevent data leaking between users.
 *
 * Loaders are organized by domain in /graphql/loaders/domains/.
 *
 * @see https://github.com/graphql/dataloader
 */

import { createUserLoaders } from "./domains/user";
import { createGroupLoaders } from "./domains/group";
import { createIssueLoaders } from "./domains/issue";
import { createDecisionLoaders } from "./domains/decision";
import { createGuideLoaders } from "./domains/guide";
import { createFinanceLoaders } from "./domains/finance";
import { createOutcomeLoaders } from "./domains/outcome";
import { createScheduleLoaders } from "./domains/schedule";

/**
 * Create fresh DataLoader instances for a request
 *
 * IMPORTANT: Always call this once per request, never reuse loaders across requests.
 * Reusing loaders would cache data between different users.
 *
 * @example
 * // In context creation
 * const loaders = createLoaders();
 *
 * // In resolver
 * const user = await ctx.loaders.userById.load(userId);
 */
export function createLoaders() {
  return {
    ...createUserLoaders(),
    ...createGroupLoaders(),
    ...createIssueLoaders(),
    ...createDecisionLoaders(),
    ...createGuideLoaders(),
    ...createFinanceLoaders(),
    ...createOutcomeLoaders(),
    ...createScheduleLoaders(),
  };
}

/**
 * Type for the loaders object returned by createLoaders
 */
export type Loaders = ReturnType<typeof createLoaders>;
