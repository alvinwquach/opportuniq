/**
 * Group DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import {
  groups,
  groupMembers,
  groupInvitations,
  type Group,
  type GroupMember,
  type GroupInvitation,
} from "@/app/db/schema";

export function createGroupLoaders() {
  return {
    groupById: new DataLoader<string, Group | null>(async (ids) => {
      const results = await db
        .select()
        .from(groups)
        .where(inArray(groups.id, [...ids]));

      const map = new Map(results.map((g) => [g.id, g]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    membersByGroupId: new DataLoader<string, GroupMember[]>(async (groupIds) => {
      const results = await db
        .select()
        .from(groupMembers)
        .where(inArray(groupMembers.groupId, [...groupIds]));

      const map = new Map<string, GroupMember[]>();
      for (const member of results) {
        const existing = map.get(member.groupId) ?? [];
        existing.push(member);
        map.set(member.groupId, existing);
      }
      return groupIds.map((id) => map.get(id) ?? []);
    }),

    memberById: new DataLoader<string, GroupMember | null>(async (ids) => {
      const results = await db
        .select()
        .from(groupMembers)
        .where(inArray(groupMembers.id, [...ids]));

      const map = new Map(results.map((m) => [m.id, m]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    // Pending invitations by group
    pendingMembersByGroupId: new DataLoader<string, GroupMember[]>(async (groupIds) => {
      const results = await db
        .select()
        .from(groupMembers)
        .where(inArray(groupMembers.groupId, [...groupIds]));

      const map = new Map<string, GroupMember[]>();
      for (const member of results) {
        if (member.status === "pending") {
          const existing = map.get(member.groupId) ?? [];
          existing.push(member);
          map.set(member.groupId, existing);
        }
      }
      return groupIds.map((id) => map.get(id) ?? []);
    }),

    // Group invitations by group ID
    invitationsByGroupId: new DataLoader<string, GroupInvitation[]>(async (groupIds) => {
      const results = await db
        .select()
        .from(groupInvitations)
        .where(inArray(groupInvitations.groupId, [...groupIds]));

      const map = new Map<string, GroupInvitation[]>();
      for (const invitation of results) {
        const existing = map.get(invitation.groupId) ?? [];
        existing.push(invitation);
        map.set(invitation.groupId, existing);
      }
      return groupIds.map((id) => map.get(id) ?? []);
    }),

    // Single invitation by ID
    invitationById: new DataLoader<string, GroupInvitation | null>(async (ids) => {
      const results = await db
        .select()
        .from(groupInvitations)
        .where(inArray(groupInvitations.id, [...ids]));

      const map = new Map(results.map((i) => [i.id, i]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
