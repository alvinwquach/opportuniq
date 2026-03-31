// This directive marks every exported function in this file as a Next.js
// Server Action. All code in Server Action files runs exclusively on the
// server — the browser never sees or executes these functions. When a
// React component or TanStack Query hook calls one of these functions,
// Next.js automatically handles the secure network round-trip.
"use server";

// Import the Supabase server-side client factory. The server variant reads
// the logged-in user's session from HTTP-only cookies, which are inaccessible
// to browser JavaScript, making this the secure method for identifying callers.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client used for all SQL queries.
import { db } from "@/app/db/client";

// Import the database table definitions and enum types used throughout this file:
//   groups             — top-level group records (a group is a household or shared team)
//   groupMembers       — join table: which users belong to which groups, with role/status
//   groupConstraints   — per-group settings (budget limits, risk tolerance, DIY preference)
//   groupInvitations   — pending email invitations to join a group
//   users              — user profile rows (needed to return member profile data)
//   groupRoleEnum      — allowed role values: "coordinator", "member", etc.
//   riskToleranceEnum  — allowed risk tolerance values: "low", "medium", "high"
//   diyPreferenceEnum  — allowed DIY preference values: "prefer_diy", "prefer_pro", etc.
import { groups, groupMembers, groupConstraints, groupInvitations, users, groupRoleEnum, riskToleranceEnum, diyPreferenceEnum } from "@/app/db/schema";

// Import Drizzle ORM query helpers:
//   eq(col, val)       — SQL: WHERE col = val
//   and(...conditions) — SQL: AND (combines multiple WHERE clauses)
//   inArray(col, arr)  — SQL: WHERE col IN (arr) (not used directly here but available)
//   isNull(col)        — SQL: WHERE col IS NULL (used to find un-accepted invitations)
//   gte(col, val)      — SQL: WHERE col >= val  (used to filter out expired invitations)
import { eq, and, inArray, isNull, gte } from "drizzle-orm";

// Private helper: confirms an active login session exists before any action proceeds.
// Not exported — only callable from within this file.
async function getAuthUser() {
  // Create a Supabase server client for this request.
  const supabase = await createClient();
  // Validate the session cookie and retrieve the logged-in user object.
  const { data: { user } } = await supabase.auth.getUser();
  // If no valid session exists, throw an Unauthorized error immediately.
  // This prevents any unauthenticated access to group data.
  if (!user) throw new Error("Unauthorized");
  // Return the user object so callers can access user.id and user.email.
  return user;
}

// Exported server action: returns a list of all groups the logged-in user
// is an active member of, including the user's role in each group.
// Parameters: none — the user is inferred from the session.
// Returns: an array of plain objects with group details and the user's role/status
export async function getMyGroups() {
  // Authenticate and retrieve the user so we can filter by their membership.
  const user = await getAuthUser();
  // Join groupMembers with groups to get both the membership record and group details.
  // SQL:
  //   SELECT groups.*, groupMembers.*
  //   FROM groupMembers
  //   INNER JOIN groups ON groupMembers.groupId = groups.id
  //   WHERE groupMembers.userId = user.id AND groupMembers.status = 'active'
  const result = await db
    .select({ group: groups, membership: groupMembers })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groupMembers.userId, user.id), eq(groupMembers.status, "active")));
  // Reshape each row from { group, membership } into a flat object with only
  // the fields the UI needs. This keeps the response small and predictable.
  return result.map(({ group, membership }) => ({
    id: group.id, name: group.name, postalCode: group.postalCode,
    createdAt: group.createdAt, role: membership.role, status: membership.status,
  }));
}

// Exported server action: fetches a single group record by its ID.
// The current user's membership row is left-joined so the query succeeds even
// if the user is not a member (they can still see the group exists, but the
// membership field will be null).
// Parameters:
//   id — the UUID of the group to fetch
// Returns: the groups row or null if not found
export async function getGroup(id: string) {
  // Confirm the caller is authenticated.
  const user = await getAuthUser();
  // SQL:
  //   SELECT groups.*, groupMembers.*
  //   FROM groups
  //   LEFT JOIN groupMembers ON groupMembers.groupId = groups.id AND groupMembers.userId = user.id
  //   WHERE groups.id = id
  //   LIMIT 1
  // LEFT JOIN (instead of INNER JOIN) means the query returns the group row
  // even when the current user is not a member (membership will be null in that case).
  const [result] = await db.select({ group: groups, membership: groupMembers })
    .from(groups)
    .leftJoin(groupMembers, and(eq(groupMembers.groupId, groups.id), eq(groupMembers.userId, user.id)))
    .where(eq(groups.id, id)).limit(1);
  // Return just the group object, or null if the group doesn't exist.
  return result?.group ?? null;
}

// Exported server action: fetches a group record together with a full list
// of its members (each member enriched with their user profile data).
// Parameters:
//   id — the UUID of the group to fetch
// Returns: the groups row spread together with a `members` array, or null if
//          the group does not exist
export async function getGroupWithMembers(id: string) {
  // Confirm the caller is authenticated.
  const user = await getAuthUser();
  // Fetch the group row first to confirm it exists.
  // SQL: SELECT * FROM groups WHERE id = id LIMIT 1
  const [group] = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  // If the group doesn't exist, return null rather than throwing an error.
  if (!group) return null;
  // Fetch all members of this group, joining each membership row with the
  // corresponding user profile row so we get name, avatar, etc.
  // SQL:
  //   SELECT groupMembers.*, users.*
  //   FROM groupMembers
  //   INNER JOIN users ON groupMembers.userId = users.id
  //   WHERE groupMembers.groupId = id
  const members = await db
    .select({ member: groupMembers, user: users })
    .from(groupMembers).innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, id));
  // Combine the group row with the members array. Each element in `members`
  // merges the membership record with the user profile, so the caller gets
  // both role/status and name/avatar in one object.
  return { ...group, members: members.map(({ member, user: u }) => ({ ...member, user: u })) };
}

// Exported server action: returns all pending (un-accepted, non-expired)
// invitations for a group. Used on the group settings page to show which
// email invites are still waiting on a response.
// Parameters:
//   groupId — the UUID of the group whose pending invitations to list
// Returns: an array of groupInvitations rows
export async function getGroupInvitations(groupId: string) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // Capture the current timestamp to use as the expiry boundary.
  const now = new Date();
  // SQL:
  //   SELECT * FROM groupInvitations
  //   WHERE groupId = groupId
  //     AND acceptedAt IS NULL        (invitation has not been accepted yet)
  //     AND expiresAt >= now          (invitation has not expired)
  return db.select().from(groupInvitations)
    .where(and(eq(groupInvitations.groupId, groupId), isNull(groupInvitations.acceptedAt), gte(groupInvitations.expiresAt, now)));
}

// Exported server action: returns all pending invitations addressed to the
// logged-in user's email address. Used on the user's dashboard to show
// invitations they haven't acted on yet.
// Parameters: none — the user's email is read from the active session.
// Returns: an array of { invitation, group } objects
export async function getMyPendingInvitations() {
  // Authenticate and get the user's email address.
  const user = await getAuthUser();
  // Capture the current timestamp to filter out expired invitations.
  const now = new Date();
  // Join invitations with groups so the UI can display the group name.
  // SQL:
  //   SELECT groupInvitations.*, groups.*
  //   FROM groupInvitations
  //   INNER JOIN groups ON groupInvitations.groupId = groups.id
  //   WHERE groupInvitations.inviteeEmail = user.email
  //     AND acceptedAt IS NULL    (not yet accepted)
  //     AND expiresAt >= now      (not yet expired)
  // The non-null assertion user.email! tells TypeScript that email is defined
  // on the Supabase user object for authenticated sessions.
  return db.select({ invitation: groupInvitations, group: groups })
    .from(groupInvitations).innerJoin(groups, eq(groupInvitations.groupId, groups.id))
    .where(and(eq(groupInvitations.inviteeEmail, user.email!), isNull(groupInvitations.acceptedAt), gte(groupInvitations.expiresAt, now)));
}

// Exported server action: creates a new group and automatically makes the
// creator its first member with the "coordinator" (admin) role.
// Parameters:
//   input.name               — the name of the group (e.g. "Smith Family Home")
//   input.postalCode         — optional postal/ZIP code for the group's location
//   input.defaultSearchRadius — optional radius (in miles/km) for local contractor searches
// Returns: the newly created groups row
export async function createGroup(input: { name: string; postalCode?: string; defaultSearchRadius?: number }) {
  // Authenticate and get the user ID so we can add them as the first member.
  const user = await getAuthUser();
  // SQL: INSERT INTO groups (name, postalCode, defaultSearchRadius) VALUES (...) RETURNING *
  const [group] = await db.insert(groups).values({ ...input }).returning();
  // Immediately add the creating user as an active "coordinator" of the new group.
  // SQL: INSERT INTO groupMembers (groupId, userId, role, status) VALUES (...)
  // "coordinator" is the highest role — think of it as group admin/owner.
  await db.insert(groupMembers).values({ groupId: group.id, userId: user.id, role: "coordinator", status: "active" });
  // Return the newly created group row.
  return group;
}

// Exported server action: updates basic details of an existing group.
// Parameters:
//   id    — the UUID of the group to update
//   input — an object with any of: name, postalCode, defaultSearchRadius
// Returns: the updated groups row
export async function updateGroup(id: string, input: { name?: string; postalCode?: string; defaultSearchRadius?: number }) {
  // Confirm the caller is authenticated.
  const user = await getAuthUser();
  // SQL:
  //   UPDATE groups SET ...input, updatedAt = now()
  //   WHERE id = id
  const [updated] = await db.update(groups).set({ ...input, updatedAt: new Date() }).where(eq(groups.id, id)).returning();
  // Return the updated group row.
  return updated;
}

// Exported server action: removes the logged-in user from a group.
// This deletes the user's groupMembers row, effectively unregistering them
// from the group.
// Parameters:
//   groupId — the UUID of the group to leave
// Returns: true to signal success
export async function leaveGroup(groupId: string) {
  // Authenticate so we know which user's membership to delete.
  const user = await getAuthUser();
  // SQL:
  //   DELETE FROM groupMembers
  //   WHERE groupId = groupId AND userId = user.id
  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));
  // Return true as a success signal.
  return true;
}

// Exported server action: sends an email invitation to join a group.
// The invitation record includes a random token (used in the invite link),
// the invited person's email, and an expiry date 7 days from now.
// Parameters:
//   groupId — the UUID of the group the person is being invited to
//   email   — the email address of the person being invited
//   role    — the role the invitee will receive when they accept (must match groupRoleEnum)
// Returns: the newly created groupInvitations row
export async function inviteMember(groupId: string, email: string, role: string) {
  // Authenticate so we can record who sent the invitation.
  const user = await getAuthUser();
  // Compute an expiry timestamp 7 days (in milliseconds) from now.
  // 7 days = 7 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  // SQL:
  //   INSERT INTO groupInvitations
  //     (groupId, invitedBy, inviteeEmail, role, token, expiresAt)
  //   VALUES (...)
  // crypto.randomUUID() generates a globally-unique token that goes into the
  // invite link URL. Only someone with this token can accept the invitation.
  const [invitation] = await db.insert(groupInvitations)
    .values({ groupId, invitedBy: user.id, inviteeEmail: email, role: role as typeof groupRoleEnum.enumValues[number], token: crypto.randomUUID(), expiresAt })
    .returning();
  // Return the invitation row (including the token so the caller can build the link).
  return invitation;
}

// Exported server action: removes a specific member from a group by deleting
// their groupMembers row. This is typically performed by a coordinator (admin).
// Parameters:
//   groupId  — the UUID of the group to remove from
//   memberId — the UUID of the groupMembers row (NOT the user's ID) to delete
// Returns: true to signal success
export async function removeMember(groupId: string, memberId: string) {
  // Confirm the caller is authenticated before allowing member removal.
  await getAuthUser();
  // SQL:
  //   DELETE FROM groupMembers
  //   WHERE groupId = groupId AND id = memberId
  // Note: `groupMembers.id` is the primary key of the membership row,
  // which is different from `groupMembers.userId`.
  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.id, memberId)));
  // Return true as a success signal.
  return true;
}

// Exported server action: changes the role of an existing group member.
// For example, promoting a "member" to "coordinator" or demoting a coordinator.
// Parameters:
//   groupId  — the UUID of the group
//   memberId — the UUID of the groupMembers row to update
//   role     — the new role value (must match groupRoleEnum allowed values)
// Returns: the updated groupMembers row
export async function updateMemberRole(groupId: string, memberId: string, role: string) {
  // Confirm the caller is authenticated before allowing role changes.
  await getAuthUser();
  // SQL:
  //   UPDATE groupMembers
  //   SET role = role
  //   WHERE groupId = groupId AND id = memberId
  const [updated] = await db.update(groupMembers)
    .set({ role: role as typeof groupRoleEnum.enumValues[number] })
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.id, memberId)))
    .returning();
  // Return the updated membership row.
  return updated;
}

// Exported server action: creates or updates the constraint/preference settings
// for a group. Constraints define things like the group's monthly repair budget,
// how much risk they're willing to accept, and whether they prefer DIY or
// professional help. This is an upsert — update if a row exists, insert if not.
// Parameters:
//   groupId — the UUID of the group to configure
//   input   — an object with any of the following optional fields:
//               monthlyBudget   — monthly spending cap for repairs (as a string)
//               emergencyBuffer — funds reserved for emergencies (as a string)
//               riskTolerance   — must match riskToleranceEnum ("low", "medium", "high")
//               diyPreference   — must match diyPreferenceEnum
//               neverDIY        — array of issue/category types that should never be DIY
// Returns: the inserted or updated groupConstraints row
export async function updateGroupConstraints(groupId: string, input: {
  monthlyBudget?: string; emergencyBuffer?: string; riskTolerance?: string;
  diyPreference?: string; neverDIY?: string[];
}) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // Separate the two enum fields from the rest of the input because they need
  // to be cast to their TypeScript enum types before being saved.
  const { riskTolerance, diyPreference, ...rest } = input;
  // Build the final payload. Spread the simple fields first, then conditionally
  // add riskTolerance and diyPreference with their proper enum casts if provided.
  const payload = {
    ...rest,
    ...(riskTolerance ? { riskTolerance: riskTolerance as typeof riskToleranceEnum.enumValues[number] } : {}),
    ...(diyPreference ? { diyPreference: diyPreference as typeof diyPreferenceEnum.enumValues[number] } : {}),
  };
  // Check whether a constraints row already exists for this group so we can
  // decide whether to UPDATE or INSERT.
  // SQL: SELECT * FROM groupConstraints WHERE groupId = groupId LIMIT 1
  const [existing] = await db.select().from(groupConstraints).where(eq(groupConstraints.groupId, groupId)).limit(1);
  // If a row already exists, update it with the new values.
  if (existing) {
    // SQL:
    //   UPDATE groupConstraints SET ...payload, updatedAt = now()
    //   WHERE groupId = groupId
    const [updated] = await db.update(groupConstraints).set({ ...payload, updatedAt: new Date() }).where(eq(groupConstraints.groupId, groupId)).returning();
    // Return the updated row.
    return updated;
  } else {
    // No existing row — insert a brand-new constraints record for this group.
    // SQL: INSERT INTO groupConstraints (groupId, ...payload) VALUES (...) RETURNING *
    const [created] = await db.insert(groupConstraints).values({ groupId, ...payload }).returning();
    // Return the newly created row.
    return created;
  }
}

// Exported server action: accepts a group invitation on behalf of the logged-in user.
// This marks the invitation as accepted and inserts a new groupMembers row,
// officially making the user a member of the group.
// Parameters:
//   invitationId — the UUID of the groupInvitations row to accept
// Returns: the newly created groupMembers row
export async function acceptInvitation(invitationId: string) {
  // Authenticate so we know which user is accepting the invitation.
  const user = await getAuthUser();
  // Fetch the invitation row to confirm it exists and to read the groupId and role.
  // SQL: SELECT * FROM groupInvitations WHERE id = invitationId LIMIT 1
  const [inv] = await db.select().from(groupInvitations).where(eq(groupInvitations.id, invitationId)).limit(1);
  // If the invitation doesn't exist (already used, deleted, or wrong ID), reject.
  if (!inv) throw new Error("Invitation not found");
  // Mark the invitation as accepted by recording the current timestamp.
  // SQL: UPDATE groupInvitations SET acceptedAt = now() WHERE id = invitationId
  await db.update(groupInvitations).set({ acceptedAt: new Date() }).where(eq(groupInvitations.id, invitationId));
  // Insert the new membership row using the role specified in the invitation.
  // SQL:
  //   INSERT INTO groupMembers (groupId, userId, role, status) VALUES (...)
  //   RETURNING *
  const [member] = await db.insert(groupMembers)
    .values({ groupId: inv.groupId, userId: user.id, role: inv.role, status: "active" })
    .returning();
  // Return the new membership row so the caller can redirect to the group page.
  return member;
}

// Exported server action: declines (deletes) a group invitation.
// The invitation row is permanently removed — no record of the decline is kept.
// Parameters:
//   invitationId — the UUID of the groupInvitations row to delete
// Returns: true to signal the invitation was successfully declined/removed
export async function declineInvitation(invitationId: string) {
  // Confirm the caller is authenticated before deleting an invitation.
  await getAuthUser();
  // SQL: DELETE FROM groupInvitations WHERE id = invitationId
  await db.delete(groupInvitations).where(eq(groupInvitations.id, invitationId));
  // Return true as a success signal.
  return true;
}
