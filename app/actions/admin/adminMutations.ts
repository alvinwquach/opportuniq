// "use server" tells Next.js that every function in this file runs only on the
// server (Node.js), never in the browser. This is required for code that
// touches a database, reads secrets, or must not be exposed to the client.
"use server";

// createClient() builds a Supabase auth client scoped to the current HTTP
// request so we can read the caller's session cookie and identify who they are.
import { createClient } from "@/lib/supabase/server";
// db is the Drizzle ORM instance connected to the PostgreSQL database. All
// SELECT / INSERT / UPDATE / DELETE queries are executed through this object.
import { db } from "@/app/db/client";
// Import the database table definitions we need for this file:
// - users:         the table that stores all registered user accounts
// - invites:       the table that stores invitation records for new users
// - waitlist:      the table that stores people who signed up to be notified
// - adminAuditLog: the table that records every admin action for accountability
import { users, invites, waitlist, adminAuditLog } from "@/app/db/schema";
// Import Drizzle ORM helper functions used to build SQL WHERE clauses:
// - eq(col, val)       → SQL: col = val
// - inArray(col, arr)  → SQL: col IN (val1, val2, ...) — match any value in a list
import { eq, inArray } from "drizzle-orm";
// uuidv4() generates a random, globally unique identifier (UUID v4).
// We use it to create secure, unguessable invite tokens.
import { v4 as uuidv4 } from "uuid";

// ─── Private helper: enforce admin-only access ────────────────────────────────
// This function is NOT exported — it is only used internally by the functions
// below to ensure the caller is both authenticated AND has the "admin" role.
// If either check fails, it throws an error which aborts the calling function.
async function requireAdmin() {
  // Create a Supabase client that can read the current request's session cookie.
  const supabase = await createClient();
  // Ask Supabase "who is logged in right now?" and destructure the user object
  // out of the nested response shape { data: { user } }.
  const { data: { user } } = await supabase.auth.getUser();
  // If there is no logged-in user (session expired or never existed), reject
  // immediately — no unauthenticated access to admin functions is allowed.
  if (!user) throw new Error("Unauthorized");
  // The Supabase auth user object only tells us the user exists; it does NOT
  // contain their application role. We must query our own users table to check
  // whether this person has been granted the "admin" role in our database.
  // We only SELECT the role column (not the entire row) for efficiency.
  // eq(users.id, user.id) → WHERE id = <current Supabase auth user ID>
  const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id)).limit(1);
  // If the user record doesn't exist in our database, or their role is anything
  // other than "admin", reject the request with a clear error message.
  if (!dbUser || dbUser.role !== "admin") throw new Error("Admin access required");
  // Return the Supabase user object so callers can use admin.id when writing
  // to the audit log.
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminUpdateUser
// Allows an admin to change a user's display name, role, or access tier.
// Parameters:
//   id           — the UUID of the user account to update
//   input.name   — new display name (optional)
//   input.role   — new role string, e.g. "admin", "user", "banned" (optional)
//   input.accessTier — new access tier string, e.g. "beta", "public" (optional)
// Returns: the updated user row as it now exists in the database
// ─────────────────────────────────────────────────────────────────────────────
export async function adminUpdateUser(id: string, input: { name?: string; role?: string; accessTier?: string }) {
  // Verify the caller is logged in AND has the admin role. Store the admin user
  // object so we can record their ID in the audit log.
  const admin = await requireAdmin();
  // Spread all provided input fields into the SET clause and also stamp
  // updatedAt with the current time so the record shows when it was last changed.
  // The cast `as Record<string, unknown>` satisfies TypeScript because Drizzle's
  // .set() expects a specific type, but we are passing a dynamically built object.
  // eq(users.id, id) → WHERE id = <provided user ID>
  // .returning() gives back the full updated row.
  const [updated] = await db.update(users).set({ ...input, updatedAt: new Date() } as Record<string, unknown>).where(eq(users.id, id)).returning();
  // Write a record to the audit log so there is a permanent trail of who made
  // this change, what they changed, and when. This is important for compliance
  // and for investigating any unexpected changes later.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "update_user", targetType: "user", targetId: id, details: input });
  // Return the updated user row so the admin UI can reflect the new values.
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminBanUser
// Sets a user's role to "banned", preventing them from accessing the application.
// Parameters:
//   id     — the UUID of the user to ban
//   reason — optional text explaining why the user is being banned (for audit trail)
// Returns: the updated user row with role set to "banned"
// ─────────────────────────────────────────────────────────────────────────────
export async function adminBanUser(id: string, reason?: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Update the user's role to "banned" and stamp the modification time.
  // eq(users.id, id) → WHERE id = <provided user ID>
  const [updated] = await db.update(users).set({ role: "banned", updatedAt: new Date() } as Record<string, unknown>).where(eq(users.id, id)).returning();
  // Log the ban action, including the optional reason, so there is a record of
  // why this user was banned and which admin did it.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "ban_user", targetType: "user", targetId: id, details: { reason } });
  // Return the updated user row showing the "banned" role.
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminUnbanUser
// Reverses a ban by restoring the user's role to the standard "user" role,
// allowing them to access the application again.
// Parameters:
//   id — the UUID of the user to unban
// Returns: the updated user row with role set back to "user"
// ─────────────────────────────────────────────────────────────────────────────
export async function adminUnbanUser(id: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Reset the user's role from "banned" back to "user" (the standard role) and
  // update the modification timestamp.
  // eq(users.id, id) → WHERE id = <provided user ID>
  const [updated] = await db.update(users).set({ role: "user", updatedAt: new Date() } as Record<string, unknown>).where(eq(users.id, id)).returning();
  // Log the unban action so there is a record that access was restored and
  // which admin performed the action.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "unban_user", targetType: "user", targetId: id, details: {} });
  // Return the updated user row showing the restored "user" role.
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminDeleteUser
// Permanently deletes a user account from the database. This cannot be undone.
// Parameters:
//   id — the UUID of the user to delete
// Returns: true to signal the deletion succeeded
// ─────────────────────────────────────────────────────────────────────────────
export async function adminDeleteUser(id: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Permanently delete the user row from the users table.
  // eq(users.id, id) → WHERE id = <provided user ID>
  await db.delete(users).where(eq(users.id, id));
  // Log the deletion in the audit log. Even though the user is gone, this
  // record gives admins a history of what was deleted and by whom.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "delete_user", targetType: "user", targetId: id, details: {} });
  // Return true to confirm the deletion completed without error.
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminBulkDeleteUsers
// Permanently deletes multiple user accounts in a single database operation.
// More efficient than calling adminDeleteUser() in a loop.
// Parameters:
//   ids — an array of user UUIDs to delete
// Returns: an object with a deletedCount field showing how many were removed
// ─────────────────────────────────────────────────────────────────────────────
export async function adminBulkDeleteUsers(ids: string[]) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Delete all user rows whose ID is in the provided array in a single query.
  // inArray(users.id, ids) → WHERE id IN (id1, id2, id3, ...)
  // This is more efficient than issuing one DELETE per user.
  await db.delete(users).where(inArray(users.id, ids));
  // Log the bulk deletion with the full comma-separated list of deleted IDs and
  // the total count, so the audit trail captures what was removed.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "bulk_delete_users", targetType: "user", targetId: ids.join(","), details: { count: ids.length } });
  // Return the count of deleted users so the admin UI can show a confirmation
  // message like "5 users deleted".
  return { deletedCount: ids.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminCreateInvite
// Creates a single invitation record that can be sent to someone by email,
// granting them access to a specific tier of the application.
// Parameters:
//   input.email — the email address of the person being invited
//   input.tier  — the access tier to grant (e.g. "beta", "public", "alpha")
// Returns: the newly created invite row including its unique token
// ─────────────────────────────────────────────────────────────────────────────
export async function adminCreateInvite(input: { email: string; tier: string }) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Calculate when this invite will expire: 30 days from right now.
  // Date.now() returns the current time in milliseconds.
  // 30 * 24 * 60 * 60 * 1000 converts 30 days into milliseconds.
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  // Insert a new invite row into the invites table.
  const [invite] = await db.insert(invites)
    .values({
      // Store the email address this invite is intended for.
      email: input.email,
      // Cast the tier string to the explicit union type the database column expects.
      // The union type "johatsu" | "alpha" | "beta" | "public" lists all valid tier
      // values. Without this cast, TypeScript would reject a plain string.
      tier: input.tier as "johatsu" | "alpha" | "beta" | "public",
      // Generate a random UUID to use as the invite token. The recipient will
      // include this token in their sign-up link to prove they were invited.
      token: uuidv4(),
      // Record which admin created this invite.
      invitedBy: admin.id,
      // Set the 30-day expiry calculated above.
      expiresAt,
    })
    // .returning() retrieves the saved row so we can return its generated ID, token, etc.
    .returning();
  // Log the invite creation so there is a record of who was invited by whom
  // and at what tier.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "create_invite", targetType: "invite", targetId: invite.id, details: input });
  // Return the newly created invite row.
  return invite;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminRevokeInvite
// Permanently deletes an invite so it can no longer be used to sign up.
// Parameters:
//   id — the UUID of the invite to revoke
// Returns: true to signal the deletion succeeded
// ─────────────────────────────────────────────────────────────────────────────
export async function adminRevokeInvite(id: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Permanently delete the invite row from the invites table.
  // eq(invites.id, id) → WHERE id = <provided invite ID>
  await db.delete(invites).where(eq(invites.id, id));
  // Log the revocation so there is a record that this invite was intentionally
  // withdrawn and which admin did it.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "revoke_invite", targetType: "invite", targetId: id, details: {} });
  // Return true to confirm the revocation completed without error.
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminResendInvite
// Extends an existing invite's expiry date by another 30 days, effectively
// "resending" it so the recipient has more time to use the invite link.
// Parameters:
//   id — the UUID of the invite to extend
// Returns: the updated invite row with the new expiry date
// ─────────────────────────────────────────────────────────────────────────────
export async function adminResendInvite(id: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Fetch the invite to make sure it actually exists before trying to update it.
  // eq(invites.id, id) → WHERE id = <provided invite ID>
  const [invite] = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
  // If no invite with this ID exists, there is nothing to resend; throw an error.
  if (!invite) throw new Error("Invite not found");
  // Calculate the new expiry: 30 days from now, replacing the old expiry.
  // This gives the recipient a fresh 30-day window starting today.
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  // Update the invite row with the extended expiry date.
  // eq(invites.id, id) → WHERE id = <provided invite ID>
  const [updated] = await db.update(invites).set({ expiresAt: newExpiresAt }).where(eq(invites.id, id)).returning();
  // Log that this invite was resent so there is a record of the extension.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "resend_invite", targetType: "invite", targetId: id, details: {} });
  // Return the updated invite row with the new expiry date.
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminBulkCreateInvites
// Creates invite records for multiple email addresses at once in a single
// database operation. Useful when onboarding a batch of new users.
// Parameters:
//   emails — an array of email addresses to invite
//   tier   — optional access tier for all invites; defaults to "public"
// Returns: an array of all newly created invite rows
// ─────────────────────────────────────────────────────────────────────────────
export async function adminBulkCreateInvites(emails: string[], tier?: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Calculate the shared expiry for all invites in this batch: 30 days from now.
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  // Insert one row per email address. .map() transforms the emails array into
  // an array of value objects that the INSERT statement accepts.
  const created = await db.insert(invites)
    .values(emails.map((email) => ({
      // Each invite is tied to one email address.
      email,
      // Use the provided tier or fall back to "public" if none was specified.
      // Cast to the explicit union type the database column expects.
      tier: (tier ?? "public") as "johatsu" | "alpha" | "beta" | "public",
      // Each invite gets its own unique random token so invites are not
      // interchangeable — each recipient has their own link.
      token: uuidv4(),
      // Record which admin created this batch of invites.
      invitedBy: admin.id,
      // All invites in this batch share the same expiry date.
      expiresAt,
    })))
    // .returning() retrieves all inserted rows (one per email) so we can return them.
    .returning();
  // Log the bulk creation with the full email list and the total count for the
  // audit trail.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "bulk_create_invites", targetType: "invite", targetId: emails.join(","), details: { count: emails.length, tier } });
  // Return the array of all newly created invite rows.
  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminDeleteWaitlistEntry
// Permanently removes a single entry from the waitlist table.
// Parameters:
//   id — the UUID of the waitlist entry to delete
// Returns: true to signal the deletion succeeded
// ─────────────────────────────────────────────────────────────────────────────
export async function adminDeleteWaitlistEntry(id: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Delete the waitlist row whose primary key matches the provided ID.
  // eq(waitlist.id, id) → WHERE id = <provided entry ID>
  await db.delete(waitlist).where(eq(waitlist.id, id));
  // Log the deletion so there is a record that this waitlist entry was manually
  // removed by an admin.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "delete_waitlist_entry", targetType: "waitlist", targetId: id, details: {} });
  // Return true to confirm the deletion completed without error.
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminBulkDeleteWaitlist
// Permanently removes multiple waitlist entries in a single database operation.
// Parameters:
//   ids — an array of waitlist entry UUIDs to delete
// Returns: an object with a deletedCount field showing how many were removed
// ─────────────────────────────────────────────────────────────────────────────
export async function adminBulkDeleteWaitlist(ids: string[]) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Delete all waitlist rows whose IDs appear in the provided array, using a
  // single SQL statement.
  // inArray(waitlist.id, ids) → WHERE id IN (id1, id2, id3, ...)
  await db.delete(waitlist).where(inArray(waitlist.id, ids));
  // Log the bulk deletion with the full list of IDs and the total count.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "bulk_delete_waitlist", targetType: "waitlist", targetId: ids.join(","), details: { count: ids.length } });
  // Return the count of deleted entries so the admin UI can display a
  // confirmation like "10 waitlist entries deleted".
  return { deletedCount: ids.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: adminConvertWaitlistToInvite
// Takes a person from the waitlist and creates a formal invite for them,
// promoting them from "waiting" to "invited". The waitlist entry is NOT
// deleted here — only the invite is created.
// Parameters:
//   id   — the UUID of the waitlist entry to convert
//   tier — optional access tier to grant; defaults to "public"
// Returns: the newly created invite row
// ─────────────────────────────────────────────────────────────────────────────
export async function adminConvertWaitlistToInvite(id: string, tier?: string) {
  // Verify the caller is an admin and capture their identity for the audit log.
  const admin = await requireAdmin();
  // Fetch the waitlist entry to get the person's email address and to confirm
  // the entry actually exists before we try to create an invite for it.
  // eq(waitlist.id, id) → WHERE id = <provided waitlist entry ID>
  const [entry] = await db.select().from(waitlist).where(eq(waitlist.id, id)).limit(1);
  // If no waitlist entry with this ID exists, there is nothing to convert.
  if (!entry) throw new Error("Waitlist entry not found");
  // Calculate when this invite will expire: 30 days from right now.
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  // Create the invite record using the email address from the waitlist entry.
  const [invite] = await db.insert(invites)
    .values({
      // Use the email address that was stored when this person joined the waitlist.
      email: entry.email,
      // Use the provided tier or fall back to "public" if none was given.
      // Cast to the union type that the database column expects.
      tier: (tier ?? "public") as "johatsu" | "alpha" | "beta" | "public",
      // Generate a unique random token for this person's invite link.
      token: uuidv4(),
      // Record which admin converted this waitlist entry into an invite.
      invitedBy: admin.id,
      // Set the 30-day expiry window.
      expiresAt,
    })
    // .returning() retrieves the saved invite row so we can return it.
    .returning();
  // Log the conversion, storing both the source waitlist ID and the resulting
  // invite ID so the action can be traced end-to-end in the audit trail.
  await db.insert(adminAuditLog).values({ adminId: admin.id, action: "convert_waitlist_to_invite", targetType: "invite", targetId: invite.id, details: { waitlistId: id, tier } });
  // Return the newly created invite row.
  return invite;
}
