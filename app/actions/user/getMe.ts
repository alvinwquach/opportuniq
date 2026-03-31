// This directive marks every exported function in this file as a Next.js
// Server Action. The code runs only on the server — it can safely access
// the database and the user's auth session without exposing secrets
// to the browser.
"use server";

// Import the Supabase server-side client factory. On the server it reads
// the logged-in user's session from HTTP-only cookies (not accessible in
// the browser), which is how we securely identify who is making the request.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client used to query the PostgreSQL database.
import { db } from "@/app/db/client";

// Import the three database table definitions used in this file:
//   users        — stores each user's profile data (name, location, preferences, etc.)
//   groups       — stores group records (a group is a household or team)
//   groupMembers — the join table that records which users belong to which groups
//                  and what role they hold
import { users, groups, groupMembers } from "@/app/db/schema";

// Import the `eq` Drizzle ORM helper. eq(column, value) generates SQL:
//   WHERE column = value
import { eq } from "drizzle-orm";

// Exported server action: returns the profile row for the currently logged-in user.
// Parameters: none — the user is identified from the active session cookie.
// Returns: the users row matching the logged-in user's ID.
// Throws: "Unauthorized" if no session exists; "User not found" if the profile
//         row is missing from the database.
export async function getMe() {
  // Create a Supabase server client so we can read the session.
  const supabase = await createClient();
  // Ask Supabase to validate the session and return the logged-in user object.
  const { data: { user } } = await supabase.auth.getUser();
  // Guard: if there is no valid session, reject the request immediately.
  if (!user) throw new Error("Unauthorized");

  // Fetch the user's profile row from the `users` table in Postgres.
  // SQL equivalent: SELECT * FROM users WHERE id = user.id LIMIT 1
  // Destructure the first (and only) result into `profile`.
  const [profile] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  // If the profile doesn't exist yet (edge case: auth record exists but no
  // profile row was created), throw a descriptive error.
  if (!profile) throw new Error("User not found");
  // Return the profile row. The calling hook can use this to render the UI.
  return profile;
}

// Exported server action: returns the logged-in user's profile PLUS a list
// of all groups they are a member of, each enriched with the user's role in
// that group.
// Parameters: none — the user is identified from the session.
// Returns: the users row spread together with a `groups` array. Each element
//          in `groups` is the full group record plus a `role` field.
// Throws: "Unauthorized" if no session; "User not found" if profile is missing.
export async function getMeWithGroups() {
  // Create the Supabase server client for this request.
  const supabase = await createClient();
  // Validate the session and extract the logged-in user object.
  const { data: { user } } = await supabase.auth.getUser();
  // Reject unauthenticated requests before touching the database.
  if (!user) throw new Error("Unauthorized");

  // Fetch the user's own profile row.
  // SQL: SELECT * FROM users WHERE id = user.id LIMIT 1
  const [profile] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  // If the profile is missing, surface a clear error rather than returning null.
  if (!profile) throw new Error("User not found");

  // Fetch all groups the user is a member of by joining groupMembers with groups.
  // SQL equivalent:
  //   SELECT groups.*, groupMembers.*
  //   FROM groupMembers
  //   INNER JOIN groups ON groupMembers.groupId = groups.id
  //   WHERE groupMembers.userId = user.id
  // We select specific aliases (`group` and `membership`) so the result
  // is easy to destructure below.
  const userGroupsResult = await db
    .select({ group: groups, membership: groupMembers })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, user.id));

  // Combine the profile with the groups array. Each group object is spread
  // from the raw groups row and enriched with `role` taken from the
  // membership record. This gives callers a single object with everything
  // they need about the current user in one shot.
  return { ...profile, groups: userGroupsResult.map(({ group, membership }) => ({ ...group, role: membership.role })) };
}

// Exported server action: updates fields on the logged-in user's profile.
// Parameters:
//   input — an object with any combination of the following optional fields:
//     name          — the user's display name
//     postalCode    — the user's postal / ZIP code
//     city          — the user's city name
//     stateProvince — the user's state or province
//     latitude      — geographic latitude for location-based features
//     longitude     — geographic longitude for location-based features
//     avatarUrl     — URL pointing to the user's profile photo
// Returns: the updated users row after the change is persisted.
export async function updateProfile(input: {
  name?: string;
  postalCode?: string;
  city?: string;
  stateProvince?: string;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
}) {
  // Create the Supabase server client to read the session.
  const supabase = await createClient();
  // Confirm the user is logged in before allowing any profile changes.
  const { data: { user } } = await supabase.auth.getUser();
  // Reject the request if there is no valid session.
  if (!user) throw new Error("Unauthorized");

  // Run a SQL UPDATE on the users table:
  //   UPDATE users SET <input fields>, updatedAt = now()
  //   WHERE id = user.id
  // Spreading `input` ensures only the fields supplied by the caller are
  // changed; unrelated profile fields stay untouched.
  // updatedAt is always refreshed so we have an accurate last-modified timestamp.
  const [updated] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();
  // Return the saved row so the UI can update immediately.
  return updated;
}

// Exported server action: updates the logged-in user's app preferences
// (theme, language, notifications).
// Parameters:
//   input — an object with any combination of:
//     theme         — UI theme name (e.g. "dark", "light")
//     language      — preferred language code (e.g. "en", "fr")
//     notifications — whether push/email notifications are enabled
// Returns: the updated users row.
export async function updatePreferences(input: {
  theme?: string;
  language?: string;
  notifications?: boolean;
}) {
  // Create the Supabase server client to access the session.
  const supabase = await createClient();
  // Verify the session is valid before making any changes.
  const { data: { user } } = await supabase.auth.getUser();
  // Reject unauthenticated callers.
  if (!user) throw new Error("Unauthorized");

  // Run a SQL UPDATE on the users table to save preferences as a JSON object.
  // The `preferences` column stores the entire input object in one JSON field.
  // `updatedAt` is refreshed to record when the preferences were last changed.
  // The `as Record<string, unknown>` cast satisfies TypeScript's type checker
  // because Drizzle's .set() expects column-keyed values, and `preferences`
  // holds a JSON blob.
  const [updated] = await db
    .update(users)
    .set({ preferences: input, updatedAt: new Date() } as Record<string, unknown>)
    .where(eq(users.id, user.id))
    .returning();
  // Return the updated row so the caller can confirm the change succeeded.
  return updated;
}
