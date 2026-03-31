// This directive marks every exported function in this file as a Next.js
// Server Action. Server Actions execute exclusively on the server — they
// have direct access to the database and auth session, and are never
// shipped to or executed in the user's browser.
"use server";

// Import the Supabase server-side client factory. This creates a client
// that reads the logged-in user's session from secure HTTP-only cookies,
// which is only possible on the server.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client used to run all SQL queries
// against the PostgreSQL database.
import { db } from "@/app/db/client";

// Import the two table definitions this file operates on:
//   groupExpenseSettings   — one settings row per group (currency, split method, etc.)
//   groupExpenseCategories — individual expense categories that belong to a group
import { groupExpenseSettings, groupExpenseCategories } from "@/app/db/schema";

// Import two Drizzle ORM query helpers:
//   eq(column, value) — generates SQL: WHERE column = value
//   and(...conditions) — combines multiple WHERE conditions with SQL AND
import { eq, and } from "drizzle-orm";

// A private helper that every action in this file calls first.
// Its only job is to confirm that the caller has an active login session.
// It is NOT exported, so only code inside this file can use it.
async function getAuthUser() {
  // Create a Supabase client scoped to this server request.
  const supabase = await createClient();
  // Ask Supabase to verify the session cookie and return the logged-in user.
  const { data: { user } } = await supabase.auth.getUser();
  // If no valid session exists, stop immediately and return an Unauthorized
  // error. This prevents unauthenticated users from reading or changing data.
  if (!user) throw new Error("Unauthorized");
  // Hand back the user object so callers can access user.id when needed.
  return user;
}

// Exported server action: fetches the expense settings row for a given group.
// Parameters:
//   groupId — the UUID of the group whose settings should be retrieved
// Returns: the settings row if one exists, or null if none has been created yet
export async function getGroupExpenseSettings(groupId: string) {
  // Confirm the caller is authenticated before exposing any group data.
  await getAuthUser();
  // Run a SQL SELECT:
  //   SELECT * FROM groupExpenseSettings WHERE groupId = groupId LIMIT 1
  // Destructure the first element of the array result into `settings`.
  // If the array is empty (no row found), `settings` will be undefined.
  const [settings] = await db.select().from(groupExpenseSettings).where(eq(groupExpenseSettings.groupId, groupId)).limit(1);
  // Return the row if found, or null to signal "not configured yet".
  return settings ?? null;
}

// Exported server action: fetches all expense categories that belong to a group.
// Parameters:
//   groupId — the UUID of the group whose categories should be listed
// Returns: an array of groupExpenseCategories rows (empty array if none exist)
export async function getGroupExpenseCategories(groupId: string) {
  // Confirm the caller is authenticated before returning group data.
  await getAuthUser();
  // Run a SQL SELECT:
  //   SELECT * FROM groupExpenseCategories WHERE groupId = groupId
  // Returns all category rows for the group. Drizzle returns an array.
  return db.select().from(groupExpenseCategories).where(eq(groupExpenseCategories.groupId, groupId));
}

// Exported server action: creates or updates the expense settings for a group.
// This is an "upsert" pattern: if a settings row already exists it is updated;
// if not, a brand-new row is inserted.
// Parameters:
//   groupId — the UUID of the group to configure
//   input   — an object with optional fields describing the desired settings:
//               trackSharedExpenses — whether to track shared costs
//               requireReceipts     — whether receipts must be attached to expenses
//               approvalThreshold   — cost above which expenses need approval
//               defaultSplitMethod  — how costs are divided (e.g. "equal", "percentage")
//               currency            — the currency code to use (e.g. "USD")
// Returns: the saved (inserted or updated) settings row
export async function updateExpenseSettings(groupId: string, input: {
  trackSharedExpenses?: boolean; requireReceipts?: boolean; approvalThreshold?: string;
  defaultSplitMethod?: string; currency?: string;
}) {
  // Confirm the caller is authenticated before writing any settings.
  await getAuthUser();
  // Check whether a settings row for this group already exists so we can
  // decide whether to UPDATE or INSERT.
  //   SELECT * FROM groupExpenseSettings WHERE groupId = groupId LIMIT 1
  const [existing] = await db.select().from(groupExpenseSettings).where(eq(groupExpenseSettings.groupId, groupId)).limit(1);
  // If a row was found, update it with the new values and refresh updatedAt.
  if (existing) {
    // Run a SQL UPDATE:
    //   UPDATE groupExpenseSettings SET ...input, updatedAt = now()
    //   WHERE groupId = groupId
    // Spread `input` so only the fields provided by the caller are changed.
    const [updated] = await db.update(groupExpenseSettings).set({ ...input, updatedAt: new Date() }).where(eq(groupExpenseSettings.groupId, groupId)).returning();
    // Return the freshly updated row.
    return updated;
  }
  // No existing row — insert a new one combining the groupId with the caller's input.
  //   INSERT INTO groupExpenseSettings (groupId, ...input) VALUES (...)
  const [created] = await db.insert(groupExpenseSettings).values({ groupId, ...input }).returning();
  // Return the newly created row.
  return created;
}

// Exported server action: adds a new expense category to a group.
// Parameters:
//   groupId — the UUID of the group this category belongs to
//   input   — an object describing the new category:
//               name        — display name of the category (e.g. "Plumbing")
//               color       — optional hex/CSS color for UI display
//               icon        — optional icon identifier
//               budgetLimit — optional monthly spending cap for this category
// Returns: the newly created groupExpenseCategories row
export async function createExpenseCategory(groupId: string, input: { name: string; color?: string; icon?: string; budgetLimit?: string }) {
  // We need the authenticated user's ID to record who created this category.
  const user = await getAuthUser();
  // Run a SQL INSERT:
  //   INSERT INTO groupExpenseCategories (groupId, name, color, icon, budgetLimit, createdBy)
  //   VALUES (...)
  // createdBy is set to the current user's ID for audit / attribution purposes.
  const [category] = await db.insert(groupExpenseCategories).values({ groupId, ...input, createdBy: user.id }).returning();
  // Return the newly saved category row.
  return category;
}

// Exported server action: updates an existing expense category's details.
// Parameters:
//   id    — the UUID of the specific category row to update
//   input — an object with any subset of fields to change:
//             name, color, icon, budgetLimit
// Returns: the updated groupExpenseCategories row
export async function updateExpenseCategory(id: string, input: { name?: string; color?: string; icon?: string; budgetLimit?: string }) {
  // Confirm the caller is logged in before allowing changes.
  await getAuthUser();
  // Run a SQL UPDATE:
  //   UPDATE groupExpenseCategories SET ...input, updatedAt = now()
  //   WHERE id = id
  const [updated] = await db.update(groupExpenseCategories).set({ ...input, updatedAt: new Date() }).where(eq(groupExpenseCategories.id, id)).returning();
  // Return the updated row so the caller can immediately reflect the change.
  return updated;
}

// Exported server action: permanently deletes an expense category.
// Parameters:
//   id — the UUID of the category row to delete
// Returns: true to signal the deletion succeeded
export async function deleteExpenseCategory(id: string) {
  // Confirm the caller is authenticated. Only logged-in users may delete categories.
  await getAuthUser();
  // Run a SQL DELETE:
  //   DELETE FROM groupExpenseCategories WHERE id = id
  await db.delete(groupExpenseCategories).where(eq(groupExpenseCategories.id, id));
  // Return true as a simple success signal to the caller (TanStack Query hook).
  return true;
}
