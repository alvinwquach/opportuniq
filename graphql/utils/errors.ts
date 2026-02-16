/**
 * GraphQL Error Utilities
 *
 * Custom error classes and helpers for consistent error handling.
 * Follows Apollo error code conventions for client compatibility.
 *
 * Error Codes:
 * - UNAUTHENTICATED: Not logged in (401 equivalent)
 * - FORBIDDEN: Logged in but no permission (403 equivalent)
 * - NOT_FOUND: Resource doesn't exist (404 equivalent)
 * - BAD_USER_INPUT: Invalid input data (400 equivalent)
 * - INTERNAL_SERVER_ERROR: Unexpected error (500 equivalent)
 */

// Note: Using full path to avoid conflict with local graphql/ folder
import { GraphQLError } from "graphql/error";

/**
 * Supported error codes
 */
export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_USER_INPUT"
  | "INTERNAL_SERVER_ERROR";

/**
 * Create a GraphQL error with standard formatting
 *
 * @param message - User-facing error message
 * @param code - Error code for client handling
 * @param details - Optional additional context (not exposed to client in production)
 *
 * @example
 * throw createError('Issue not found', 'NOT_FOUND');
 * throw createError('Invalid email format', 'BAD_USER_INPUT', { field: 'email' });
 */
export function createError(
  message: string,
  code: ErrorCode,
  details?: Record<string, unknown>
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code,
      ...(process.env.NODE_ENV === "development" && details ? { details } : {}),
    },
  });
}

/**
 * User is not authenticated
 *
 * @example
 * if (!ctx.user) throw notAuthenticated();
 */
export function notAuthenticated(message = "You must be logged in"): GraphQLError {
  return createError(message, "UNAUTHENTICATED");
}

/**
 * User doesn't have permission for this action
 *
 * @example
 * if (!isGroupAdmin(ctx)) throw forbidden('Only group admins can do this');
 */
export function forbidden(message = "You don't have permission to do this"): GraphQLError {
  return createError(message, "FORBIDDEN");
}

/**
 * Requested resource doesn't exist
 *
 * @example
 * const issue = await ctx.loaders.issueById.load(id);
 * if (!issue) throw notFound('Issue');
 */
export function notFound(resourceName: string): GraphQLError {
  return createError(`${resourceName} not found`, "NOT_FOUND");
}

/**
 * Invalid input provided by user
 *
 * @example
 * if (!isValidEmail(input.email)) throw badInput('Invalid email format', 'email');
 */
export function badInput(message: string, field?: string): GraphQLError {
  return createError(message, "BAD_USER_INPUT", field ? { field } : undefined);
}

/**
 * Unexpected server error
 * Always log the actual error, return generic message to client
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   console.error('Operation failed:', err);
 *   throw internalError();
 * }
 */
export function internalError(message = "An unexpected error occurred"): GraphQLError {
  return createError(message, "INTERNAL_SERVER_ERROR");
}

/**
 * Assert user is authenticated, throw if not
 *
 * @returns The authenticated user
 * @throws GraphQLError with UNAUTHENTICATED code
 *
 * @example
 * const user = requireAuth(ctx);
 * // user is guaranteed to be non-null
 */
export function requireAuth(ctx: { user: unknown; userId: unknown }): asserts ctx is {
  user: NonNullable<typeof ctx.user>;
  userId: string;
} {
  if (!ctx.user || !ctx.userId) {
    throw notAuthenticated();
  }
}

/**
 * Assert user has group access, throw if not
 *
 * @throws GraphQLError with FORBIDDEN code
 *
 * @example
 * requireGroupAccess(ctx);
 * // ctx.groupMembership is guaranteed to be non-null
 */
export function requireGroupAccess(ctx: {
  user: unknown;
  groupId: unknown;
  groupMembership: unknown;
}): asserts ctx is {
  user: NonNullable<typeof ctx.user>;
  groupId: string;
  groupMembership: NonNullable<typeof ctx.groupMembership>;
} {
  if (!ctx.user) {
    throw notAuthenticated();
  }
  if (!ctx.groupId || !ctx.groupMembership) {
    throw forbidden("You must be a member of this group");
  }
}
