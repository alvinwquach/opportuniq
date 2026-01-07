"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import {
  groupMembers,
  groupExpenseSettings,
  groupExpenseCategories,
} from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  expenseSettingsSchema,
  categorySchema,
  type ExpenseSettingsFormValues,
  type CategoryFormValues,
  type ExpenseApprovalMode,
  type CategoryApprovalRule,
} from "./schemas";

// Helper to check if user has permission to manage expense settings
async function checkExpenseSettingsPermission(groupId: string, userId: string) {
  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership) {
    return { allowed: false, error: "Not a member of this group" };
  }

  // Only coordinator and collaborator can manage expense settings
  if (membership.role !== "coordinator" && membership.role !== "collaborator") {
    return { allowed: false, error: "Only coordinators and collaborators can manage expense settings" };
  }

  return { allowed: true, role: membership.role };
}

// Helper to check if user can manage categories (includes participant for add)
async function checkCategoryPermission(groupId: string, userId: string, action: "view" | "add" | "edit" | "delete") {
  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership) {
    return { allowed: false, error: "Not a member of this group" };
  }

  const role = membership.role;

  // View: coordinator, collaborator, participant can view
  if (action === "view") {
    if (role === "coordinator" || role === "collaborator" || role === "participant") {
      return { allowed: true, role };
    }
    return { allowed: false, error: "You don't have permission to view expense settings" };
  }

  // Add/Edit: coordinator, collaborator, participant can add/edit categories
  if (action === "add" || action === "edit") {
    if (role === "coordinator" || role === "collaborator" || role === "participant") {
      return { allowed: true, role };
    }
    return { allowed: false, error: "You don't have permission to manage categories" };
  }

  // Delete: only coordinator and collaborator
  if (action === "delete") {
    if (role === "coordinator" || role === "collaborator") {
      return { allowed: true, role };
    }
    return { allowed: false, error: "Only coordinators and collaborators can delete categories" };
  }

  return { allowed: false, error: "Invalid action" };
}

// Get expense settings for a group
export async function getExpenseSettings(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const permission = await checkCategoryPermission(groupId, user.id, "view");
  if (!permission.allowed) {
    return { success: false, error: permission.error };
  }

  try {
    const [settings] = await db
      .select()
      .from(groupExpenseSettings)
      .where(eq(groupExpenseSettings.groupId, groupId));

    return {
      success: true,
      settings: settings ?? null,
      userRole: permission.role,
    };
  } catch (error) {
    console.error("[ExpenseSettings] getExpenseSettings error:", error);
    return { success: false, error: "Failed to fetch expense settings" };
  }
}

// Update expense settings for a group
export async function updateExpenseSettings(groupId: string, data: ExpenseSettingsFormValues) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const permission = await checkExpenseSettingsPermission(groupId, user.id);
  if (!permission.allowed) {
    return { success: false, error: permission.error };
  }

  const parseResult = expenseSettingsSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { approvalMode, defaultThreshold, trustOwnerAdmin, moderatorThreshold, allowModeratorApprove } = parseResult.data;

  try {
    // Check if settings exist
    const [existing] = await db
      .select({ id: groupExpenseSettings.id })
      .from(groupExpenseSettings)
      .where(eq(groupExpenseSettings.groupId, groupId));

    let result;

    if (existing) {
      // Update existing settings
      [result] = await db
        .update(groupExpenseSettings)
        .set({
          approvalMode: approvalMode as ExpenseApprovalMode,
          defaultThreshold: defaultThreshold?.toString() ?? null,
          trustOwnerAdmin,
          moderatorThreshold: moderatorThreshold?.toString() ?? null,
          allowModeratorApprove,
          updatedAt: new Date(),
        })
        .where(eq(groupExpenseSettings.groupId, groupId))
        .returning();
    } else {
      // Create new settings
      [result] = await db
        .insert(groupExpenseSettings)
        .values({
          groupId,
          approvalMode: approvalMode as ExpenseApprovalMode,
          defaultThreshold: defaultThreshold?.toString() ?? null,
          trustOwnerAdmin,
          moderatorThreshold: moderatorThreshold?.toString() ?? null,
          allowModeratorApprove,
        })
        .returning();
    }

    revalidatePath(`/dashboard/groups/${groupId}/settings/expenses`);

    return { success: true, settings: result };
  } catch (error) {
    console.error("[ExpenseSettings] updateExpenseSettings error:", error);
    return { success: false, error: "Failed to update expense settings" };
  }
}

// Get expense categories for a group
export async function getExpenseCategories(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const permission = await checkCategoryPermission(groupId, user.id, "view");
  if (!permission.allowed) {
    return { success: false, error: permission.error };
  }

  try {
    const categories = await db
      .select()
      .from(groupExpenseCategories)
      .where(eq(groupExpenseCategories.groupId, groupId))
      .orderBy(groupExpenseCategories.sortOrder);

    return {
      success: true,
      categories,
      userRole: permission.role,
    };
  } catch (error) {
    console.error("[ExpenseSettings] getExpenseCategories error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Add a new expense category
export async function addExpenseCategory(groupId: string, data: CategoryFormValues) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const permission = await checkCategoryPermission(groupId, user.id, "add");
  if (!permission.allowed) {
    return { success: false, error: permission.error };
  }

  const parseResult = categorySchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, icon, approvalRule, customThreshold } = parseResult.data;

  try {
    // Get highest sort order
    const categories = await db
      .select({ sortOrder: groupExpenseCategories.sortOrder })
      .from(groupExpenseCategories)
      .where(eq(groupExpenseCategories.groupId, groupId))
      .orderBy(groupExpenseCategories.sortOrder);

    const maxSortOrder = categories.length > 0
      ? Math.max(...categories.map(c => c.sortOrder))
      : -1;

    const [newCategory] = await db
      .insert(groupExpenseCategories)
      .values({
        groupId,
        name,
        icon: icon ?? null,
        approvalRule: approvalRule as CategoryApprovalRule,
        customThreshold: customThreshold?.toString() ?? null,
        sortOrder: maxSortOrder + 1,
        createdBy: user.id,
      })
      .returning();

    revalidatePath(`/dashboard/groups/${groupId}/settings/expenses`);

    return { success: true, category: newCategory };
  } catch (error) {
    console.error("[ExpenseSettings] addExpenseCategory error:", error);
    return { success: false, error: "Failed to add category" };
  }
}

// Update an expense category
export async function updateExpenseCategory(groupId: string, categoryId: string, data: CategoryFormValues) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const permission = await checkCategoryPermission(groupId, user.id, "edit");
  if (!permission.allowed) {
    return { success: false, error: permission.error };
  }

  const parseResult = categorySchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, icon, approvalRule, customThreshold } = parseResult.data;

  try {
    // Verify category belongs to this group
    const [existingCategory] = await db
      .select({ id: groupExpenseCategories.id })
      .from(groupExpenseCategories)
      .where(
        and(
          eq(groupExpenseCategories.id, categoryId),
          eq(groupExpenseCategories.groupId, groupId)
        )
      );

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    const [updatedCategory] = await db
      .update(groupExpenseCategories)
      .set({
        name,
        icon: icon ?? null,
        approvalRule: approvalRule as CategoryApprovalRule,
        customThreshold: customThreshold?.toString() ?? null,
        updatedAt: new Date(),
      })
      .where(eq(groupExpenseCategories.id, categoryId))
      .returning();

    revalidatePath(`/dashboard/groups/${groupId}/settings/expenses`);

    return { success: true, category: updatedCategory };
  } catch (error) {
    console.error("[ExpenseSettings] updateExpenseCategory error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// Delete an expense category
export async function deleteExpenseCategory(groupId: string, categoryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const permission = await checkCategoryPermission(groupId, user.id, "delete");
  if (!permission.allowed) {
    return { success: false, error: permission.error };
  }

  try {
    // Verify category belongs to this group
    const [existingCategory] = await db
      .select({ id: groupExpenseCategories.id })
      .from(groupExpenseCategories)
      .where(
        and(
          eq(groupExpenseCategories.id, categoryId),
          eq(groupExpenseCategories.groupId, groupId)
        )
      );

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    await db
      .delete(groupExpenseCategories)
      .where(eq(groupExpenseCategories.id, categoryId));

    revalidatePath(`/dashboard/groups/${groupId}/settings/expenses`);

    return { success: true };
  } catch (error) {
    console.error("[ExpenseSettings] deleteExpenseCategory error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
