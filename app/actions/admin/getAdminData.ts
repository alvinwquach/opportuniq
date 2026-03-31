// "use server" tells Next.js that every function in this file runs only on the
// server (Node.js), never in the browser. This is required for code that
// touches a database, reads secrets, or must not be exposed to the client.
"use server";

// createClient() builds a Supabase auth client scoped to the current HTTP
// request so we can read the caller's session cookie and identify who they are.
import { createClient } from "@/lib/supabase/server";
// db is the Drizzle ORM instance connected to the PostgreSQL database. All
// SELECT queries in this file are executed through this object.
import { db } from "@/app/db/client";
// Import the database table definitions we need for this file:
// - users:         the table that stores all registered user accounts
// - waitlist:      the table that stores people who signed up to be notified
// - invites:       the table that stores invitation records
// - referrals:     the table that stores referral tracking records
// - adminAuditLog: the table that records every admin action for accountability
import { users, waitlist, invites, referrals, adminAuditLog } from "@/app/db/schema";
// Import Drizzle ORM helper functions used to build SQL WHERE clauses and queries:
// - eq(col, val)        → SQL: col = val
// - and(...)            → SQL: condition1 AND condition2 AND ...
// - gte(col, val)       → SQL: col >= val  (greater than or equal to)
// - lte(col, val)       → SQL: col <= val  (less than or equal to)
// - desc(col)           → SQL: ORDER BY col DESC (newest / largest first)
// - sql`...`            → raw SQL template literal for complex expressions Drizzle
//                         cannot express with its helper functions
// - isNull(col)         → SQL: col IS NULL (the column has no value)
// - isNotNull(col)      → SQL: col IS NOT NULL (the column has a value)
// - like(col, pattern)  → SQL: col LIKE pattern (partial text match, % = wildcard)
// - or(...)             → SQL: condition1 OR condition2 (match either condition)
// - count()             → SQL: COUNT(*) (count the number of matching rows)
import { eq, and, gte, lte, desc, sql, isNull, isNotNull, like, or, count } from "drizzle-orm";

// ─── Shared filter interfaces ─────────────────────────────────────────────────
// AdminFilters defines the optional search and filtering parameters that can be
// passed to the admin data-fetching functions. All fields are optional — only
// the ones provided will be applied as WHERE conditions.
interface AdminFilters {
  // Free-text search term to match against email addresses or names.
  search?: string;
  // Filter by exact role value, e.g. "admin", "user", "banned".
  role?: string;
  // Filter by the user's access tier, e.g. "beta", "public".
  accessTier?: string;
  // Filter invites by tier value, e.g. "alpha", "beta".
  tier?: string;
  // Filter by status value, e.g. "pending", "accepted", "expired".
  status?: string;
  // Filter waitlist entries by how they signed up (traffic source).
  source?: string;
  // Return only records created on or after this date (ISO string, e.g. "2024-01-01").
  dateFrom?: string;
  // Return only records created on or before this date (ISO string).
  dateTo?: string;
}

// AdminPagination defines the optional paging parameters for list queries.
// Without these, the queries fall back to default values (limit 50, offset 0).
interface AdminPagination {
  // Maximum number of rows to return in one request (page size).
  limit?: number;
  // Number of rows to skip before starting to return results (for page 2+).
  offset?: number;
}

// ─── Private helper: enforce admin-only access ────────────────────────────────
// This function is NOT exported — it is only used internally by the exported
// functions below to confirm the caller is both authenticated AND an admin.
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
  // other than "admin", reject the request.
  if (!dbUser || dbUser.role !== "admin") throw new Error("Admin access required");
  // Return the Supabase user object so callers can use the user ID if needed.
  return user;
}

// ─── Private helper: build WHERE conditions for user queries ─────────────────
// Translates the AdminFilters object into an array of Drizzle SQL conditions
// that can be passed to a WHERE clause when querying the users table.
// Returns a combined AND condition, or undefined if no filters were provided
// (which Drizzle treats as "no WHERE clause" = return all rows).
function buildUserFilters(filters: AdminFilters | undefined) {
  // Start with an empty list of conditions; we'll add to it as filters are found.
  const conditions = [];
  // If a search string was provided, match it against both the email AND the name
  // columns using LIKE with % wildcards on both sides, meaning the search term
  // can appear anywhere in the value. or() means a row matches if EITHER column
  // contains the term.
  if (filters?.search) conditions.push(or(like(users.email, `%${filters.search}%`), like(users.name, `%${filters.search}%`)));
  // If a specific role was requested, add an exact match condition.
  // The cast to the union type satisfies TypeScript's type checker — it tells the
  // compiler that the plain string is a valid role value.
  if (filters?.role) conditions.push(eq(users.role, filters.role as "admin" | "moderator" | "user" | "banned"));
  // If a specific access tier was requested, add an exact match condition.
  // Cast is needed for the same reason as the role cast above.
  if (filters?.accessTier) conditions.push(eq(users.accessTier, filters.accessTier as "johatsu" | "alpha" | "beta" | "public"));
  // If a start date was provided, only include records created on or after that date.
  // gte(users.createdAt, date) → WHERE createdAt >= <dateFrom>
  // The string is converted to a Date object so the database comparison works correctly.
  if (filters?.dateFrom) conditions.push(gte(users.createdAt, new Date(filters.dateFrom)));
  // If an end date was provided, only include records created on or before that date.
  // lte(users.createdAt, date) → WHERE createdAt <= <dateTo>
  if (filters?.dateTo) conditions.push(lte(users.createdAt, new Date(filters.dateTo)));
  // If we collected any conditions, combine them all with AND so every condition
  // must be true for a row to be included. If there are no conditions, return
  // undefined so the caller's query has no WHERE clause (returns all rows).
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ─── Private helper: build WHERE conditions for waitlist queries ──────────────
// Same idea as buildUserFilters but targets the waitlist table's columns.
function buildWaitlistFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  // Match the search term against the email column using a wildcard LIKE.
  if (filters?.search) conditions.push(like(waitlist.email, `%${filters.search}%`));
  // Filter by the traffic source (how the person found the waitlist sign-up form).
  // eq(waitlist.source, ...) → WHERE source = <provided source>
  if (filters?.source) conditions.push(eq(waitlist.source, filters.source));
  // Filter by creation date range using gte / lte as explained in buildUserFilters.
  if (filters?.dateFrom) conditions.push(gte(waitlist.createdAt, new Date(filters.dateFrom)));
  if (filters?.dateTo) conditions.push(lte(waitlist.createdAt, new Date(filters.dateTo)));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ─── Private helper: build WHERE conditions for invite queries ────────────────
// Translates AdminFilters into SQL conditions for the invites table. Invite
// status is a derived concept (not a stored column) — it is computed from
// the acceptedAt and expiresAt timestamps.
function buildInviteFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  // Partial match on email address.
  if (filters?.search) conditions.push(like(invites.email, `%${filters.search}%`));
  // Filter by the invite tier (e.g. "beta").
  // Cast required because the column type is a strict enum.
  if (filters?.tier) conditions.push(eq(invites.tier, filters.tier as "johatsu" | "alpha" | "beta" | "public"));
  // Invite status is not stored directly; instead we derive it from timestamps:
  // - "accepted": acceptedAt column is NOT NULL (the invite was used).
  // - "pending":  acceptedAt IS NULL (not used yet) AND expiresAt > now() (still valid).
  // - "expired":  acceptedAt IS NULL (not used) AND expiresAt <= now() (time ran out).
  if (filters?.status === "accepted") conditions.push(isNotNull(invites.acceptedAt));
  else if (filters?.status === "pending") conditions.push(and(isNull(invites.acceptedAt), gte(invites.expiresAt, new Date())));
  else if (filters?.status === "expired") conditions.push(and(isNull(invites.acceptedAt), lte(invites.expiresAt, new Date())));
  if (filters?.dateFrom) conditions.push(gte(invites.createdAt, new Date(filters.dateFrom)));
  if (filters?.dateTo) conditions.push(lte(invites.createdAt, new Date(filters.dateTo)));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ─── Private helper: build WHERE conditions for referral queries ──────────────
// Translates AdminFilters into SQL conditions for the referrals table.
function buildReferralFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  // Match the search term against the referee's email address.
  if (filters?.search) conditions.push(like(referrals.refereeEmail, `%${filters.search}%`));
  // Filter by referral status — "pending", "clicked", or "converted".
  // Cast required to match the column's enum type.
  if (filters?.status) conditions.push(eq(referrals.status, filters.status as "pending" | "clicked" | "converted"));
  if (filters?.dateFrom) conditions.push(gte(referrals.createdAt, new Date(filters.dateFrom)));
  if (filters?.dateTo) conditions.push(lte(referrals.createdAt, new Date(filters.dateTo)));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminStats
// Computes a high-level dashboard summary across all four main tables:
// users, waitlist, invites, and referrals. Includes growth percentages and
// conversion rates calculated from raw counts.
// Parameters:
//   dateRange — optional object with `from` and `to` date strings (currently
//               accepted as a parameter but the filter logic uses the SQL
//               interval syntax in the raw sql`` expressions instead)
// Returns: a flat object with all the dashboard metric values
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminStats(dateRange?: { from: string; to: string }) {
  // Verify the caller is an admin before exposing any aggregate statistics.
  await requireAdmin();

  // Run all four aggregate queries in parallel using Promise.all so we don't
  // wait for one to finish before starting the next. This makes the function
  // faster because all four database round-trips happen simultaneously.
  // Each query returns an array; we destructure the first (and only) row with [x].
  const [[userStats], [waitlistStats], [inviteStats], [referralStats]] = await Promise.all([
    // Query 1: aggregate stats about the users table.
    db.select({
      // COUNT(*) — total number of user rows in the table.
      total: count(),
      // COUNT filtered to rows where createdAt is within the last 7 days.
      // sql<number>`...` lets us write raw PostgreSQL that Drizzle cannot express
      // with its helpers. The <number> type hint tells TypeScript what to expect.
      thisWeek: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '7 days')`,
      // COUNT for the week before last (7–14 days ago), used to calculate growth.
      lastWeek: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '14 days' and ${users.createdAt} < now() - interval '7 days')`,
      // Counts broken down by access tier — useful for the tier distribution chart.
      johatsu: sql<number>`count(*) filter (where ${users.accessTier} = 'johatsu')`,
      alpha: sql<number>`count(*) filter (where ${users.accessTier} = 'alpha')`,
      beta: sql<number>`count(*) filter (where ${users.accessTier} = 'beta')`,
      // Counts broken down by role — useful for the role distribution chart.
      admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
      moderators: sql<number>`count(*) filter (where ${users.role} = 'moderator')`,
      activeUsers: sql<number>`count(*) filter (where ${users.role} = 'user')`,
      banned: sql<number>`count(*) filter (where ${users.role} = 'banned')`,
    }).from(users),
    // Query 2: aggregate stats about the waitlist table.
    db.select({
      // Total number of waitlist signups ever.
      total: count(),
      // Signups that happened since the start of today (midnight UTC).
      // date_trunc('day', now()) truncates the current timestamp to midnight.
      today: sql<number>`count(*) filter (where ${waitlist.createdAt} >= date_trunc('day', now()))`,
      // Signups in the last 7 days.
      thisWeek: sql<number>`count(*) filter (where ${waitlist.createdAt} >= now() - interval '7 days')`,
    }).from(waitlist),
    // Query 3: aggregate stats about the invites table.
    db.select({
      // Total number of invites ever created.
      total: count(),
      // Invites that have been accepted (acceptedAt is not null).
      accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} is not null)`,
      // Invites that are still valid: not accepted and not yet expired.
      pending: sql<number>`count(*) filter (where ${invites.acceptedAt} is null and ${invites.expiresAt} > now())`,
      // Invites that expired without being used.
      expired: sql<number>`count(*) filter (where ${invites.acceptedAt} is null and ${invites.expiresAt} <= now())`,
    }).from(invites),
    // Query 4: aggregate stats about the referrals table.
    db.select({
      // Total number of referrals ever created.
      total: count(),
      // Referrals where the referee actually signed up (status = 'converted').
      converted: sql<number>`count(*) filter (where ${referrals.status} = 'converted')`,
      // Referrals that were sent but have not converted yet.
      pending: sql<number>`count(*) filter (where ${referrals.status} = 'pending')`,
    }).from(referrals),
  ]);

  // The database returns count values as strings (because SQL BigInt can exceed
  // JavaScript's safe integer range). Convert them to regular JS numbers so we
  // can do arithmetic below.
  const totalUsers = Number(userStats.total);
  const usersThisWeek = Number(userStats.thisWeek);
  const usersLastWeek = Number(userStats.lastWeek);
  // Calculate week-over-week user growth as a percentage:
  // - If there were users last week, growth% = (thisWeek - lastWeek) / lastWeek * 100
  // - If there were no users last week but some this week, growth is 100% (new start)
  // - If there are no users in either week, growth is 0%
  const growthPercent = usersLastWeek > 0 ? ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100 : usersThisWeek > 0 ? 100 : 0;
  const totalInvites = Number(inviteStats.total);
  const invitesAccepted = Number(inviteStats.accepted);
  // Calculate what percentage of sent invites were actually accepted and used.
  // Guard against division by zero when no invites exist yet.
  const inviteAcceptanceRate = totalInvites > 0 ? (invitesAccepted / totalInvites) * 100 : 0;
  const totalReferrals = Number(referralStats.total);
  const referralsConverted = Number(referralStats.converted);
  // Calculate what percentage of referrals resulted in a new user signing up.
  // Guard against division by zero when no referrals exist yet.
  const referralConversionRate = totalReferrals > 0 ? (referralsConverted / totalReferrals) * 100 : 0;

  // Return a single flat object with all the computed metrics so the admin
  // dashboard UI can display them without doing any further calculations.
  return {
    totalUsers, usersThisWeek, usersLastWeek, growthPercent,
    // Waitlist stats: total signups ever, today's count, and this week's count.
    totalWaitlist: Number(waitlistStats.total), waitlistToday: Number(waitlistStats.today), waitlistThisWeek: Number(waitlistStats.thisWeek),
    // Invite stats: totals, individual bucket counts, and the acceptance rate.
    totalInvites, invitesAccepted, invitesPending: Number(inviteStats.pending), invitesExpired: Number(inviteStats.expired), inviteAcceptanceRate,
    // Referral stats: totals and conversion rate.
    totalReferrals, referralsConverted, referralsPending: Number(referralStats.pending), referralConversionRate,
    // Tier distribution: count per tier. "public" is calculated by subtracting all
    // named tiers and banned users from the total (it's not stored separately).
    tierDistribution: { johatsu: Number(userStats.johatsu), alpha: Number(userStats.alpha), beta: Number(userStats.beta), public: totalUsers - Number(userStats.johatsu) - Number(userStats.alpha) - Number(userStats.beta) - Number(userStats.banned) },
    // Role distribution: count per role.
    roleDistribution: { admin: Number(userStats.admins), moderator: Number(userStats.moderators), user: Number(userStats.activeUsers), banned: Number(userStats.banned) },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminUsers
// Returns a paginated, filterable list of user accounts for the admin panel.
// Parameters:
//   filters    — optional AdminFilters to narrow the results
//   pagination — optional limit/offset for paging through results
// Returns: an object containing:
//   nodes      — the array of user rows for the current page
//   totalCount — total matching rows (ignoring pagination) for displaying "X of Y"
//   pageInfo   — helper flags and cursor values for the UI's next/previous buttons
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminUsers(filters?: AdminFilters, pagination?: AdminPagination) {
  // Verify the caller is an admin before exposing user data.
  await requireAdmin();
  // Use the provided limit or fall back to 50 rows per page.
  const limit = pagination?.limit || 50;
  // Use the provided offset or start from the beginning (page 1).
  const offset = pagination?.offset || 0;
  // Build the WHERE clause from the provided filters (or get undefined = no filter).
  const where = buildUserFilters(filters);
  // Run the data query and the count query in parallel to avoid waiting for one
  // before starting the other. This halves the effective round-trip time.
  const [userRows, [countResult]] = await Promise.all([
    // Data query: select specific safe columns (never passwords or raw secrets),
    // apply filters, sort newest first, and apply page size / offset.
    db.select({ id: users.id, email: users.email, name: users.name, avatarUrl: users.avatarUrl, role: users.role, accessTier: users.accessTier, referralCode: users.referralCode, referralCount: users.referralCount, createdAt: users.createdAt, updatedAt: users.updatedAt })
      .from(users).where(where).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    // Count query: count ALL matching rows (no limit) so the UI knows the total.
    db.select({ count: count() }).from(users).where(where),
  ]);
  // Convert the count from a string (as returned by the DB) to a plain number.
  const totalCount = Number(countResult.count);
  // Return the page of data plus pagination metadata so the UI can render
  // "Showing 1–50 of 247" and enable/disable next/previous buttons.
  return { nodes: userRows, totalCount, pageInfo: { hasNextPage: offset + limit < totalCount, hasPreviousPage: offset > 0, startCursor: userRows[0]?.id, endCursor: userRows[userRows.length - 1]?.id } };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminUser
// Fetches the complete record for a single user by their UUID.
// Parameters:
//   id — the UUID of the user to look up
// Returns: the full user row, or null if no user with that ID exists
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminUser(id: string) {
  // Verify the caller is an admin before returning any user data.
  await requireAdmin();
  // Query the users table for the row whose primary key matches `id`.
  // eq(users.id, id) → WHERE id = <provided id>
  // LIMIT 1 stops scanning after the first match since id is a primary key.
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  // Return the found row, or null if the array was empty (no user with that ID).
  return user || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminWaitlist
// Returns a paginated, filterable list of waitlist signups for the admin panel.
// Parameters / Returns: same shape as getAdminUsers (nodes + totalCount + pageInfo)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminWaitlist(filters?: AdminFilters, pagination?: AdminPagination) {
  // Verify the caller is an admin before exposing waitlist data.
  await requireAdmin();
  // Apply pagination defaults: 50 rows per page, starting at offset 0.
  const limit = pagination?.limit || 50;
  const offset = pagination?.offset || 0;
  // Build the WHERE clause from the provided waitlist filters.
  const where = buildWaitlistFilters(filters);
  // Run data and count queries in parallel for efficiency.
  const [rows, [countResult]] = await Promise.all([
    // Data query: select all columns, apply filters, sort newest first, paginate.
    db.select().from(waitlist).where(where).orderBy(desc(waitlist.createdAt)).limit(limit).offset(offset),
    // Count query: total matching rows without pagination.
    db.select({ count: count() }).from(waitlist).where(where),
  ]);
  const totalCount = Number(countResult.count);
  // Return the same paginated shape as getAdminUsers for consistency across
  // all admin list queries.
  return { nodes: rows, totalCount, pageInfo: { hasNextPage: offset + limit < totalCount, hasPreviousPage: offset > 0, startCursor: rows[0]?.id, endCursor: rows[rows.length - 1]?.id } };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminInvites
// Returns a paginated, filterable list of invites. Each invite row is joined
// with the users table to include the inviter's name for display in the UI.
// Parameters / Returns: same shape as getAdminUsers (nodes + totalCount + pageInfo)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminInvites(filters?: AdminFilters, pagination?: AdminPagination) {
  // Verify the caller is an admin before exposing invite data.
  await requireAdmin();
  const limit = pagination?.limit || 50;
  const offset = pagination?.offset || 0;
  // Build the WHERE clause from the provided invite filters (handles status logic).
  const where = buildInviteFilters(filters);
  const [rows, [countResult]] = await Promise.all([
    // Data query: select specific invite columns plus the inviter's name from
    // the users table. leftJoin(users, ...) performs a LEFT JOIN so invites that
    // were created by a now-deleted admin still appear (with null inviterName).
    // eq(invites.invitedBy, users.id) → JOIN ON invites.invitedBy = users.id
    db.select({ id: invites.id, email: invites.email, token: invites.token, tier: invites.tier, acceptedAt: invites.acceptedAt, expiresAt: invites.expiresAt, createdAt: invites.createdAt, inviterId: invites.invitedBy, emailSent: invites.emailSent, inviterName: users.name })
      .from(invites).leftJoin(users, eq(invites.invitedBy, users.id)).where(where).orderBy(desc(invites.createdAt)).limit(limit).offset(offset),
    // Count query: only count rows from invites (no join needed for counting).
    db.select({ count: count() }).from(invites).where(where),
  ]);
  const totalCount = Number(countResult.count);
  return { nodes: rows, totalCount, pageInfo: { hasNextPage: offset + limit < totalCount, hasPreviousPage: offset > 0, startCursor: rows[0]?.id, endCursor: rows[rows.length - 1]?.id } };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminReferrals
// Returns a paginated, filterable list of referral records. Each referral row
// is joined with the users table to include the referrer's email and name.
// Parameters / Returns: same shape as getAdminUsers (nodes + totalCount + pageInfo)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminReferrals(filters?: AdminFilters, pagination?: AdminPagination) {
  // Verify the caller is an admin before exposing referral data.
  await requireAdmin();
  const limit = pagination?.limit || 50;
  const offset = pagination?.offset || 0;
  // Build the WHERE clause from the provided referral filters.
  const where = buildReferralFilters(filters);
  const [rows, [countResult]] = await Promise.all([
    // Data query: select specific referral columns plus the referrer's email and
    // name from the users table via a LEFT JOIN. This lets the admin see who sent
    // each referral without doing a separate lookup per row.
    // eq(referrals.referrerId, users.id) → JOIN ON referrals.referrerId = users.id
    db.select({ id: referrals.id, referrerId: referrals.referrerId, refereeEmail: referrals.refereeEmail, status: referrals.status, createdAt: referrals.createdAt, convertedAt: referrals.convertedAt, referrerEmail: users.email, referrerName: users.name })
      .from(referrals).leftJoin(users, eq(referrals.referrerId, users.id)).where(where).orderBy(desc(referrals.createdAt)).limit(limit).offset(offset),
    // Count query: count matching referral rows for pagination metadata.
    db.select({ count: count() }).from(referrals).where(where),
  ]);
  const totalCount = Number(countResult.count);
  return { nodes: rows, totalCount, pageInfo: { hasNextPage: offset + limit < totalCount, hasPreviousPage: offset > 0, startCursor: rows[0]?.id, endCursor: rows[rows.length - 1]?.id } };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getAdminAuditLog
// Returns a paginated list of admin audit log entries, optionally filtered by
// the type of entity that was acted upon. Each entry is joined with the users
// table so the admin's email address is included alongside their ID.
// Parameters:
//   pagination  — optional limit/offset for paging
//   targetType  — optional filter to only show entries for a specific entity type
//                 (e.g. "user", "invite", "waitlist")
// Returns: same paginated shape as other admin list queries
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminAuditLog(pagination?: AdminPagination, targetType?: string) {
  // Verify the caller is an admin before exposing audit log data.
  await requireAdmin();
  const limit = pagination?.limit || 50;
  const offset = pagination?.offset || 0;
  // If a targetType was provided, build a WHERE condition to filter by it.
  // If not, `where` is undefined, meaning return entries for all entity types.
  // eq(adminAuditLog.targetType, targetType) → WHERE targetType = <provided type>
  const where = targetType ? eq(adminAuditLog.targetType, targetType) : undefined;
  const [rows, [countResult]] = await Promise.all([
    // Data query: select audit log columns and join the admin's email from users.
    // LEFT JOIN ensures entries are still shown even if the admin user was deleted.
    // eq(adminAuditLog.adminId, users.id) → JOIN ON adminAuditLog.adminId = users.id
    db.select({ id: adminAuditLog.id, adminId: adminAuditLog.adminId, adminEmail: users.email, action: adminAuditLog.action, targetType: adminAuditLog.targetType, targetId: adminAuditLog.targetId, details: adminAuditLog.details, createdAt: adminAuditLog.createdAt })
      .from(adminAuditLog).leftJoin(users, eq(adminAuditLog.adminId, users.id)).where(where).orderBy(desc(adminAuditLog.createdAt)).limit(limit).offset(offset),
    // Count query: total number of matching audit log entries.
    db.select({ count: count() }).from(adminAuditLog).where(where),
  ]);
  const totalCount = Number(countResult.count);
  return { nodes: rows, totalCount, pageInfo: { hasNextPage: offset + limit < totalCount, hasPreviousPage: offset > 0, startCursor: rows[0]?.id, endCursor: rows[rows.length - 1]?.id } };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: exportUsersData
// Generates a downloadable CSV file containing user data. Used by the admin
// panel's "Export" button. Returns a base64-encoded data URL so the browser
// can trigger a file download without needing a separate file-storage URL.
// Parameters:
//   filters — optional AdminFilters to limit which users are exported
// Returns:
//   success  — true if the export succeeded
//   url      — a data: URI with the CSV content base64-encoded inside it
//   filename — the suggested filename for the download (e.g. "users-export-2024-01-15.csv")
//   rowCount — how many rows were included in the export
// ─────────────────────────────────────────────────────────────────────────────
export async function exportUsersData(filters?: AdminFilters) {
  // Verify the caller is an admin before allowing any data export.
  await requireAdmin();
  // Build the WHERE clause from any provided filters.
  const where = buildUserFilters(filters);
  // Fetch all matching user rows (no pagination limit — we want every row for
  // the export). We select only the columns that are safe and useful to export.
  const rows = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, accessTier: users.accessTier, referralCode: users.referralCode, referralCount: users.referralCount, createdAt: users.createdAt })
    .from(users).where(where).orderBy(desc(users.createdAt));
  // Define the column headers that will appear in the first row of the CSV file.
  const headers = ["ID", "Email", "Name", "Role", "Access Tier", "Referral Code", "Referral Count", "Created At"];
  // Convert each database row into a comma-separated string. Use empty string
  // for nullable fields (name, accessTier, referralCode) to avoid "undefined"
  // appearing in the CSV output. Dates are converted to ISO strings for
  // consistent, sortable formatting.
  const csvRows = rows.map((row) => [row.id, row.email, row.name || "", row.role, row.accessTier || "", row.referralCode || "", row.referralCount, row.createdAt.toISOString()].join(","));
  // Assemble the full CSV: put the header row first, then join all data rows
  // with newlines so each row appears on its own line in the file.
  const csv = [headers.join(","), ...csvRows].join("\n");
  // Build a filename with today's date so downloads are easy to distinguish.
  // .toISOString() produces "2024-01-15T10:30:00.000Z"; .split("T")[0] takes
  // just the "2024-01-15" date portion.
  const filename = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
  // Convert the CSV string to a base64-encoded data URL so the browser can
  // treat it as a downloadable file without needing server-side file storage.
  // Buffer.from(csv).toString("base64") encodes the text as a base64 string.
  return { success: true, url: `data:text/csv;base64,${Buffer.from(csv).toString("base64")}`, filename, rowCount: rows.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: exportWaitlistData
// Generates a downloadable CSV file containing waitlist signup data.
// Parameters / Returns: same shape as exportUsersData
// ─────────────────────────────────────────────────────────────────────────────
export async function exportWaitlistData(filters?: AdminFilters) {
  // Verify the caller is an admin before allowing any data export.
  await requireAdmin();
  const where = buildWaitlistFilters(filters);
  // Fetch all matching waitlist rows — no pagination limit for an export.
  const rows = await db.select().from(waitlist).where(where).orderBy(desc(waitlist.createdAt));
  // Define the CSV column headers.
  const headers = ["ID", "Email", "Source", "Created At"];
  // Convert each row into a CSV line. Use empty string for nullable `source`.
  const csvRows = rows.map((row) => [row.id, row.email, row.source || "", row.createdAt.toISOString()].join(","));
  // Join header and data rows into the final CSV string.
  const csv = [headers.join(","), ...csvRows].join("\n");
  // Build a date-stamped filename for the download.
  const filename = `waitlist-export-${new Date().toISOString().split("T")[0]}.csv`;
  // Encode the CSV as a base64 data URL and return it with metadata.
  return { success: true, url: `data:text/csv;base64,${Buffer.from(csv).toString("base64")}`, filename, rowCount: rows.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: exportReferralsData
// Generates a downloadable CSV file containing referral data. Each row includes
// both the referee's email and the referrer's name/email (joined from users).
// Parameters / Returns: same shape as exportUsersData
// ─────────────────────────────────────────────────────────────────────────────
export async function exportReferralsData(filters?: AdminFilters) {
  // Verify the caller is an admin before allowing any data export.
  await requireAdmin();
  const where = buildReferralFilters(filters);
  // Fetch all matching referral rows joined with the referrer's user data.
  // leftJoin(users, eq(referrals.referrerId, users.id)) attaches the referrer's
  // email and name to each referral row so they appear in the export without
  // requiring a separate lookup per row.
  const rows = await db.select({ id: referrals.id, refereeEmail: referrals.refereeEmail, status: referrals.status, createdAt: referrals.createdAt, convertedAt: referrals.convertedAt, referrerEmail: users.email, referrerName: users.name })
    .from(referrals).leftJoin(users, eq(referrals.referrerId, users.id)).where(where).orderBy(desc(referrals.createdAt));
  // Define the CSV column headers for the export file.
  const headers = ["ID", "Referee Email", "Referrer Email", "Referrer Name", "Status", "Created At", "Converted At"];
  // Convert each row into a CSV line. Use empty string for nullable fields.
  // convertedAt is optional (only set when the referral became a conversion),
  // so we use optional chaining (?.) to call .toISOString() only if it exists.
  const csvRows = rows.map((row) => [row.id, row.refereeEmail, row.referrerEmail || "", row.referrerName || "", row.status, row.createdAt.toISOString(), row.convertedAt?.toISOString() || ""].join(","));
  // Join header and data rows into the final CSV string.
  const csv = [headers.join(","), ...csvRows].join("\n");
  // Build a date-stamped filename for the download.
  const filename = `referrals-export-${new Date().toISOString().split("T")[0]}.csv`;
  // Encode the CSV as a base64 data URL and return it with metadata.
  return { success: true, url: `data:text/csv;base64,${Buffer.from(csv).toString("base64")}`, filename, rowCount: rows.length };
}
