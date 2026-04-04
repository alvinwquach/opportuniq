"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { groups, groupMembers, groupConstraints, users } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createGroupFormSchema,
  updateGroupFormSchema,
  type CreateGroupFormValues,
  type UpdateGroupFormValues,
} from "@/lib/schemas/group";
import { revalidatePath } from "next/cache";
import {
  sendGroupUpdatedEmail,
  sendGroupDeletedEmail,
} from "@/lib/resend";

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
    // Fetch current group to detect changes
    const [currentGroup] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

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

    // Build list of changes for email
    const changes: string[] = [];
    if (currentGroup.name !== name) {
      changes.push(`Group name changed to "${name}"`);
    }
    if (currentGroup.postalCode !== (postalCode ?? null)) {
      changes.push(postalCode ? `Postal code updated to ${postalCode}` : "Postal code removed");
    }
    if (currentGroup.defaultSearchRadius !== defaultSearchRadius) {
      changes.push(`Search radius changed to ${defaultSearchRadius} miles`);
    }

    // Send email notifications to all group members (except the updater)
    if (changes.length > 0) {
      const members = await db
        .select({
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
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

      // Get updater's name
      const [updater] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, user.id));

      const updaterName = updater?.name || "A coordinator";
      const groupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard/groups/${groupId}`;

      // Send emails in background (don't await)
      for (const member of members) {
        if (member.user.id !== user.id) {
          sendGroupUpdatedEmail({
            email: member.user.email,
            memberName: member.user.name || "there",
            groupName: updatedGroup.name,
            updatedBy: updaterName,
            changes,
            groupUrl,
          }).catch(() => {});
        }
      }
    }

    revalidatePath(`/dashboard/groups/${groupId}`);
    revalidatePath("/dashboard/groups");

    return {
      success: true,
      group: updatedGroup,
      changes,
    };
  } catch (error) {
    return { success: false, error: "Failed to update group" };
  }
}

export async function deleteGroup(groupId: string) {
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
    return { success: false, error: "Only coordinators can delete groups" };
  }

  try {
    // Fetch group info and members before deletion
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId));

    const members = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
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

    // Get deleter's name
    const [deleter] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id));

    const deleterName = deleter?.name || "A coordinator";
    const groupName = group?.name || "Unknown Group";
    const memberCount = members.length;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`;

    // Delete the group - cascade will handle related records
    await db.delete(groups).where(eq(groups.id, groupId));

    // Send email notifications to all group members (except the deleter)
    for (const member of members) {
      if (member.user.id !== user.id) {
        sendGroupDeletedEmail({
          email: member.user.email,
          memberName: member.user.name || "there",
          groupName,
          deletedBy: deleterName,
          dashboardUrl,
        }).catch(() => {});
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/groups");

    return { success: true, memberCount };
  } catch (error) {
    return { success: false, error: "Failed to delete group" };
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

    // Fetch pending invitations (only for coordinators and collaborators)
    let pendingInvitations: {
      id: string;
      email: string;
      role: string;
      token: string;
      expiresAt: Date;
      createdAt: Date;
    }[] = [];

    if (isCollaborator) {
      const { groupInvitations } = await import("@/app/db/schema");
      const invitations = await db
        .select({
          id: groupInvitations.id,
          email: groupInvitations.inviteeEmail,
          role: groupInvitations.role,
          token: groupInvitations.token,
          expiresAt: groupInvitations.expiresAt,
          acceptedAt: groupInvitations.acceptedAt,
          createdAt: groupInvitations.createdAt,
        })
        .from(groupInvitations)
        .where(eq(groupInvitations.groupId, groupId));

      // Filter out expired and accepted invitations
      pendingInvitations = invitations
        .filter((inv) => inv.expiresAt > new Date() && !inv.acceptedAt)
        .map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          token: inv.token,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        }));
    }

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
      pendingInvitations,
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch group details" };
  }
}
