"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { groups, groupMembers, groupConstraints, users } from "@/app/db/schema";
import { eq, and, count } from "drizzle-orm";
import {
  createGroupFormSchema,
  updateGroupFormSchema,
  type CreateGroupFormValues,
  type UpdateGroupFormValues,
} from "@/lib/schemas/group";
import { revalidatePath } from "next/cache";

export async function getUserGroups() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const userGroups = await db
      .select({
        group: {
          id: groups.id,
          name: groups.name,
          postalCode: groups.postalCode,
          defaultSearchRadius: groups.defaultSearchRadius,
          createdAt: groups.createdAt,
        },
        membership: {
          role: groupMembers.role,
          status: groupMembers.status,
          joinedAt: groupMembers.joinedAt,
        },
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    return { success: true, groups: userGroups };
  } catch (error) {
    console.error("[Groups] getUserGroups error:", error);
    return { success: false, error: "Failed to fetch groups" };
  }
}

export async function createGroup(data: CreateGroupFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const parseResult = createGroupFormSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, postalCode, defaultSearchRadius } = parseResult.data as {
    name: string;
    postalCode?: string;
    defaultSearchRadius: number;
  };

  try {
    const result = await db.transaction(async (tx) => {
      const [newGroup] = await tx
        .insert(groups)
        .values({
          name,
          postalCode: postalCode ?? null,
          defaultSearchRadius,
        })
        .returning();

      const [membership] = await tx
        .insert(groupMembers)
        .values({
          groupId: newGroup.id,
          userId: user.id,
          role: "coordinator",
          status: "active",
          joinedAt: new Date(),
        })
        .returning();

      await tx.insert(groupConstraints).values({
        groupId: newGroup.id,
        riskTolerance: "moderate",
        diyPreference: "neutral",
      });

      return { group: newGroup, membership };
    });

    revalidatePath("/dashboard");
    revalidatePath("/groups");

    return {
      success: true,
      group: result.group,
      membership: result.membership,
    };
  } catch (error) {
    console.error("[Groups] createGroup error:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function updateGroup(groupId: string, data: UpdateGroupFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is coordinator of this group
  const [membership] = await db
    .select({
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership || membership.role !== "coordinator") {
    return { success: false, error: "Only coordinators can update group settings" };
  }

  const parseResult = updateGroupFormSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, postalCode, defaultSearchRadius } = parseResult.data;

  try {
    const [updatedGroup] = await db
      .update(groups)
      .set({
        name,
        postalCode: postalCode ?? null,
        defaultSearchRadius,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, groupId))
      .returning();

    revalidatePath(`/dashboard/groups/${groupId}`);
    revalidatePath("/dashboard/groups");

    return {
      success: true,
      group: updatedGroup,
    };
  } catch (error) {
    console.error("[Groups] updateGroup error:", error);
    return { success: false, error: "Failed to update group" };
  }
}

export async function getGroupDetails(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify user has access to this group
    const [membership] = await db
      .select({
        role: groupMembers.role,
        status: groupMembers.status,
        joinedAt: groupMembers.joinedAt,
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Not a member of this group" };
    }

    // Fetch group details
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

    if (!group) {
      return { success: false, error: "Group not found" };
    }

    // Fetch all members with user details, sorted by role (coordinator first)
    const members = await db
      .select({
        id: groupMembers.id,
        role: groupMembers.role,
        status: groupMembers.status,
        joinedAt: groupMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.status, "active")
        )
      );

    // Sort members: coordinator first, then by join date
    const sortedMembers = [...members].sort((a, b) => {
      if (a.role === "coordinator") return -1;
      if (b.role === "coordinator") return 1;
      return 0;
    });

    // Fetch group constraints/budget
    const [constraints] = await db
      .select()
      .from(groupConstraints)
      .where(eq(groupConstraints.groupId, groupId));

    // Compute derived values
    const isCoordinator = membership.role === "coordinator";
    const isCollaborator = membership.role === "collaborator" || isCoordinator;
    const sharedBalance = constraints?.sharedBalance
      ? parseFloat(constraints.sharedBalance)
      : 0;

    return {
      success: true,
      group,
      membership,
      members: sortedMembers,
      constraints,
      currentUserId: user.id,
      isCoordinator,
      isCollaborator,
      sharedBalance,
    };
  } catch (error) {
    console.error("[Groups] getGroupDetails error:", error);
    return { success: false, error: "Failed to fetch group details" };
  }
}
