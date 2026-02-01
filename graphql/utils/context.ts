/**
 * GraphQL Context Types
 *
 * The context object is available in every resolver and contains
 * authentication info, database client, and DataLoaders.
 *
 * Context is created fresh for each request in the Yoga server setup.
 */

import type { User, GroupMember } from "@/app/db/schema";
import type { db } from "@/app/db/client";
import type { Loaders } from "../loaders";

/**
 * Base context available in all resolvers
 */
export interface Context {
  /**
   * Drizzle database client
   */
  db: typeof db;

  /**
   * Authenticated user (null if not logged in)
   * Populated from Supabase JWT
   */
  user: User | null;

  /**
   * User's UUID for convenience (null if not authenticated)
   */
  userId: string | null;

  /**
   * Current group context (set via X-Group-Id header)
   * Used to scope queries to a specific group
   */
  groupId: string | null;

  /**
   * User's membership record in the current group
   * Null if no group context or user isn't a member
   */
  groupMembership: GroupMember | null;

  /**
   * DataLoader instances for batching database queries
   * Fresh instances per request to prevent data leaking
   */
  loaders: Loaders;

  /**
   * Unique request ID for logging/tracing
   */
  requestId: string;
}

/**
 * Context with guaranteed authenticated user
 */
export interface AuthenticatedContext extends Context {
  user: User;
  userId: string;
}

/**
 * Context with guaranteed group access
 */
export interface GroupContext extends AuthenticatedContext {
  groupId: string;
  groupMembership: GroupMember;
}

/**
 * Type guard: Check if user is authenticated
 *
 * @example
 * if (!isAuthenticated(ctx)) {
 *   throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
 * }
 * // ctx is now AuthenticatedContext
 */
export function isAuthenticated(ctx: Context): ctx is AuthenticatedContext {
  return ctx.user !== null && ctx.userId !== null;
}

/**
 * Type guard: Check if user has group access
 *
 * @example
 * if (!hasGroupAccess(ctx)) {
 *   throw new GraphQLError('No group access', { extensions: { code: 'FORBIDDEN' } });
 * }
 * // ctx is now GroupContext
 */
export function hasGroupAccess(ctx: Context): ctx is GroupContext {
  return isAuthenticated(ctx) && ctx.groupId !== null && ctx.groupMembership !== null;
}

/**
 * Check if user has specific role in current group
 */
export function hasRole(ctx: Context, roles: GroupMember["role"][]): boolean {
  if (!hasGroupAccess(ctx)) return false;
  return roles.includes(ctx.groupMembership.role);
}

/**
 * Check if user is group admin (coordinator or collaborator)
 */
export function isGroupAdmin(ctx: Context): boolean {
  return hasRole(ctx, ["coordinator", "collaborator"]);
}

/**
 * Check if user can write to group (not observer)
 */
export function canWriteToGroup(ctx: Context): boolean {
  return hasRole(ctx, ["coordinator", "collaborator", "participant", "contributor"]);
}
