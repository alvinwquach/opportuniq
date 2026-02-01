/**
 * GraphQL Utilities
 *
 * Re-exports all utility functions for convenient imports.
 *
 * @example
 * import { requireAuth, notFound, isAuthenticated } from '@/graphql/utils';
 */

// Context types and guards
export {
  type Context,
  type AuthenticatedContext,
  type GroupContext,
  isAuthenticated,
  hasGroupAccess,
  hasRole,
  isGroupAdmin,
  canWriteToGroup,
} from "./context";

// Error utilities
export {
  type ErrorCode,
  createError,
  notAuthenticated,
  forbidden,
  notFound,
  badInput,
  internalError,
  requireAuth,
  requireGroupAccess,
} from "./errors";

// Auth utilities (functions that hit the database)
export {
  type AuthResult,
  authenticateRequest,
  getGroupMembership,
  isMemberOfGroup,
  isGroupOwner,
  // Note: isGroupAdmin is exported from context.ts (uses Context)
  // auth.ts has isGroupAdmin that hits the DB directly
  isGroupAdmin as isGroupAdminFromDb,
} from "./auth";
