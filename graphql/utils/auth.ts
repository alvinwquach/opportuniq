/**
 * Authentication Utilities
 *
 * Helpers for authenticating GraphQL requests using Supabase JWT tokens.
 * Used in the GraphQL context creation to populate user info.
 */

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { users, groupMembers } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import type { User, GroupMember } from "@/app/db/schema";

/**
 * Authentication result
 */
export interface AuthResult {
  user: User | null;
  userId: string | null;
}

/**
 * Authenticate request using Supabase JWT
 *
 * Extracts user from Supabase auth, then fetches full user record from our DB.
 * Returns null user if not authenticated (don't throw - some queries allow anonymous).
 *
 * @example
 * const { user, userId } = await authenticateRequest();
 */
export async function authenticateRequest(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { user: null, userId: null };
    }

    // Fetch full user record from our database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!user) {
      // User exists in Supabase auth but not in our DB
      // This shouldn't happen if triggers are set up correctly
      console.warn(`[Auth] User ${authUser.id} exists in auth but not in users table`);
      return { user: null, userId: null };
    }

    return { user, userId: user.id };
  } catch (error) {
    console.error("[Auth] Authentication failed:", error);
    return { user: null, userId: null };
  }
}

/**
 * Get user's membership in a specific group
 *
 * @param userId - User's UUID
 * @param groupId - Group's UUID
 * @returns GroupMember record or null if not a member
 *
 * @example
 * const membership = await getGroupMembership(userId, groupId);
 * if (membership?.role === 'coordinator') { ... }
 */
export async function getGroupMembership(
  userId: string,
  groupId: string
): Promise<GroupMember | null> {
  try {
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.status, "active")
        )
      )
      .limit(1);

    return membership ?? null;
  } catch (error) {
    console.error("[Auth] Failed to get group membership:", error);
    return null;
  }
}

/**
 * Check if user is member of a group
 *
 * @param userId - User's UUID
 * @param groupId - Group's UUID
 * @returns true if user is an active member
 *
 * @example
 * if (!(await isMemberOfGroup(userId, groupId))) {
 *   throw forbidden('Not a member of this group');
 * }
 */
export async function isMemberOfGroup(userId: string, groupId: string): Promise<boolean> {
  const membership = await getGroupMembership(userId, groupId);
  return membership !== null;
}

/**
 * Check if user has admin role in group
 *
 * @param userId - User's UUID
 * @param groupId - Group's UUID
 * @returns true if user is coordinator or collaborator
 */
export async function isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
  const membership = await getGroupMembership(userId, groupId);
  if (!membership) return false;
  return membership.role === "coordinator" || membership.role === "collaborator";
}

/**
 * Check if user owns the group (is coordinator)
 *
 * @param userId - User's UUID
 * @param groupId - Group's UUID
 * @returns true if user is coordinator
 */
export async function isGroupOwner(userId: string, groupId: string): Promise<boolean> {
  const membership = await getGroupMembership(userId, groupId);
  if (!membership) return false;
  return membership.role === "coordinator";
}
