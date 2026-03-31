// ============================================================
// lib/hooks/admin.ts — TanStack Query hooks for the admin panel
//
// Every function exported from this file is either:
//   - a query hook  (useQuery)    — reads data from the server and caches it
//   - a mutation hook (useMutation) — sends a change to the server
// Only admin users should ever call these hooks.
// ============================================================

// Import the three core TanStack Query utilities we need:
//   useQuery       — hook for fetching and caching read-only data
//   useMutation    — hook for sending changes (create / update / delete)
//   useQueryClient — gives access to the global query cache so we can
//                    invalidate (mark stale) entries after a mutation succeeds
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import the shared queryKeys helper from the sibling "keys" file.
// queryKeys is a plain object whose methods return stable arrays used as
// cache identifiers for non-admin queries (e.g. the current user's own profile).
// NOTE: queryKeys is not actively called anywhere in this file right now —
// the TypeScript compiler will report it as unused (TS6133).
// It is kept here as a pre-existing import that signals intent: if a future
// admin mutation needs to also bust a non-admin cache entry (e.g. invalidating
// a user's own profile after an admin edits it), queryKeys is already available
// without needing an extra import change.
import { queryKeys } from "./keys";

// ---- Server actions for READ operations ----
// These functions run on the Next.js server (not in the browser).
// They query the database and return plain data objects.
// We pass them as the "queryFn" inside useQuery calls below.
import {
  // Fetches aggregated platform statistics (user counts, invite rates, etc.)
  getAdminStats,
  // Fetches a paginated, filterable list of ALL users in the system
  getAdminUsers,
  // Fetches the full profile of a single user given their ID
  getAdminUser,
  // Fetches a paginated, filterable list of waitlist sign-ups
  getAdminWaitlist,
  // Fetches a paginated, filterable list of sent invitations
  getAdminInvites,
  // Fetches a paginated, filterable list of referral records
  getAdminReferrals,
  // Triggers server-side generation of a CSV file for the users list and returns a download URL
  exportUsersData,
  // Triggers server-side generation of a CSV file for the waitlist and returns a download URL
  exportWaitlistData,
  // Triggers server-side generation of a CSV file for referrals and returns a download URL
  exportReferralsData,
} from "@/app/actions/admin/getAdminData";

// ---- Server actions for WRITE operations ----
// These functions also run on the Next.js server.
// They perform database mutations (inserts, updates, deletes).
// We pass them as the "mutationFn" inside useMutation calls below.
import {
  // Updates a user's profile fields (name, role, notes, etc.) from the admin panel
  adminUpdateUser,
  // Bans a user, optionally recording a reason; prevents them from logging in
  adminBanUser,
  // Lifts a ban on a user, restoring their ability to log in
  adminUnbanUser,
  // Permanently deletes a single user account and all their data
  adminDeleteUser,
  // Permanently deletes multiple user accounts in one server call
  adminBulkDeleteUsers,
  // Creates and sends a single invitation email to a new user
  adminCreateInvite,
  // Re-sends an invitation email that was previously sent but expired or lost
  adminResendInvite,
  // Cancels an outstanding invitation before the recipient has accepted it
  adminRevokeInvite,
  // Creates and sends invitation emails to a list of email addresses all at once
  adminBulkCreateInvites,
  // Removes a single entry from the waitlist
  adminDeleteWaitlistEntry,
  // Removes multiple entries from the waitlist in one server call
  adminBulkDeleteWaitlist,
  // Promotes a waitlist entry into a real invitation, moving the person off the waitlist
  adminConvertWaitlistToInvite,
} from "@/app/actions/admin/adminMutations";

// ============================================================
// adminQueryKeys — Cache key factory for all admin queries
//
// TanStack Query identifies cached data by a "query key", which is
// an array of values.  Keeping all key definitions in one place
// means every hook uses exactly the same key format, so cache hits
// and invalidations work correctly.
//
// Rule of thumb: if two hooks use the same key, they share the same
// cache slot.  If you want to invalidate a whole category of cache
// entries at once you can pass just the prefix (e.g. adminQueryKeys.all).
// ============================================================
export const adminQueryKeys = {
  // The root key for every admin query.
  // Passing this to invalidateQueries wipes ALL admin-related cache entries at once.
  all: ["admin"] as const,

  // Cache key for admin statistics.
  // If dateRange is provided the key includes it, so different date ranges
  // are stored as separate cache entries and do not overwrite each other.
  stats: (dateRange?: { from: string; to: string }) =>
    [...adminQueryKeys.all, "stats", dateRange] as const,

  // Cache key for the users list.
  // Includes both filters and pagination so different filter/page combinations
  // are each stored independently in the cache.
  users: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "users", filters, pagination] as const,

  // Cache key for a single user's profile.
  // Each user ID gets its own cache slot.
  user: (id: string) => [...adminQueryKeys.all, "user", id] as const,

  // Cache key for the waitlist.
  // Same pattern as "users" — filters and pagination each produce unique keys.
  waitlist: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "waitlist", filters, pagination] as const,

  // Cache key for the invites list.
  // Different filter/pagination combinations are cached separately.
  invites: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "invites", filters, pagination] as const,

  // Cache key for the referrals list.
  // Different filter/pagination combinations are cached separately.
  referrals: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "referrals", filters, pagination] as const,

  // Cache key for the audit log.
  // Pagination and an optional target-type filter are included so each
  // page of results is cached independently.
  auditLog: (pagination?: Record<string, unknown>, targetType?: string) =>
    [...adminQueryKeys.all, "auditLog", pagination, targetType] as const,
};

// ============================================================
// TypeScript interfaces — data shape definitions
//
// These describe exactly what shape of data the server returns.
// TypeScript uses them at compile time to catch bugs like
// accessing a field that doesn't exist on an object.
// They produce no JavaScript code at runtime.
// ============================================================

// Shape of the platform-wide statistics object returned by getAdminStats.
export interface AdminStats {
  // Total number of registered user accounts ever created
  totalUsers: number;
  // Number of new users who signed up in the current calendar week
  usersThisWeek: number;
  // Number of new users who signed up in the previous calendar week (for comparison)
  usersLastWeek: number;
  // Percentage change in signups week-over-week (positive = growth, negative = decline)
  growthPercent: number;
  // Total number of email addresses currently on the waitlist
  totalWaitlist: number;
  // Number of new waitlist sign-ups that happened today
  waitlistToday: number;
  // Number of new waitlist sign-ups that happened this calendar week
  waitlistThisWeek: number;
  // Total number of invitations that have ever been created
  totalInvites: number;
  // Number of invitations that have been accepted (the user signed up)
  invitesAccepted: number;
  // Number of invitations that were sent but have not yet been accepted
  invitesPending: number;
  // Number of invitations that passed their expiry date without being accepted
  invitesExpired: number;
  // Percentage of invitations that were accepted (invitesAccepted / totalInvites * 100)
  inviteAcceptanceRate: number;
  // Total number of referral links or codes that have been created
  totalReferrals: number;
  // Number of referrals where the referred person actually signed up
  referralsConverted: number;
  // Number of referrals where the referred person has not yet signed up
  referralsPending: number;
  // Percentage of referrals that led to a signup (referralsConverted / totalReferrals * 100)
  referralConversionRate: number;
  // Breakdown of how many users are in each access tier
  // johatsu = highest/earliest access; alpha, beta, public = progressively broader access
  tierDistribution: { johatsu: number; alpha: number; beta: number; public: number };
  // Breakdown of how many users have each permission role
  // admin = full control; moderator = limited moderation; user = normal; banned = blocked
  roleDistribution: { admin: number; moderator: number; user: number; banned: number };
}

// Shape of a single user record as returned by the admin panel queries.
export interface AdminUser {
  // The user's unique identifier string in the database
  id: string;
  // The user's email address
  email: string;
  // The user's display name, or null if they have not set one yet
  name: string | null;
  // URL pointing to the user's profile picture, or null if they have not uploaded one
  avatarUrl: string | null;
  // The user's permission role (e.g. "admin", "moderator", "user", "banned")
  role: string;
  // The access tier this user has been granted (e.g. "johatsu", "alpha", "beta", "public"), or null
  accessTier: string | null;
  // The unique referral code this user can share with others to earn referral credit, or null
  referralCode: string | null;
  // How many other users have signed up using this user's referral code
  referralCount: number;
  // ISO 8601 date-time string for when this user account was created
  createdAt: string;
  // ISO 8601 date-time string for when this user account was last modified, or null
  updatedAt: string | null;
  // ISO 8601 date-time string for the user's most recent login, or null if never logged in
  lastLoginAt: string | null;
  // Free-text internal notes written by admins about this user, or null
  notes: string | null;
}

// Shape of a single entry in the waitlist (someone who asked to be notified when they can join).
export interface WaitlistEntry {
  // The waitlist entry's unique identifier string in the database
  id: string;
  // The email address the person submitted when joining the waitlist
  email: string;
  // Where the sign-up came from (e.g. "landing-page", "referral"), or null if unknown
  source: string | null;
  // ISO 8601 date-time string for when this person joined the waitlist
  createdAt: string;
}

// Shape of a single invitation record.
export interface AdminInvite {
  // The invitation's unique identifier string in the database
  id: string;
  // The email address the invitation was sent to
  email: string;
  // The unique secret token embedded in the invitation link (used to verify the invite)
  token: string;
  // The access tier being offered to the invited person, or null if not specified
  tier: string | null;
  // ISO 8601 date-time string for when the invite was accepted, or null if not yet accepted
  acceptedAt: string | null;
  // ISO 8601 date-time string after which the invitation link becomes invalid
  expiresAt: string;
  // ISO 8601 date-time string for when this invitation record was created
  createdAt: string;
  // The user ID of the admin or user who created this invitation, or null if system-generated
  inviterId: string | null;
  // The display name of the person who created this invitation, or null
  inviterName: string | null;
  // Whether the invitation email has actually been sent to the recipient (true = sent, false = not yet)
  emailSent: boolean;
}

// Shape of a single referral record — tracks when one user refers another.
export interface AdminReferral {
  // The referral record's unique identifier string in the database
  id: string;
  // The user ID of the person who shared their referral code (the one who gets credit)
  referrerId: string;
  // The email address of the referrer, or null if it cannot be retrieved
  referrerEmail: string | null;
  // The display name of the referrer, or null
  referrerName: string | null;
  // The email address of the person who was referred (the one who received the invite)
  refereeEmail: string;
  // Current state of the referral: "pending" = referred person hasn't signed up yet;
  // "converted" = they signed up successfully
  status: string;
  // ISO 8601 date-time string for when the referral was first recorded
  createdAt: string;
  // ISO 8601 date-time string for when the referred person completed sign-up, or null if pending
  convertedAt: string | null;
}

// Shape of cursor-based pagination metadata returned alongside a list of results.
// Cursor pagination uses opaque string "cursors" instead of page numbers so that
// results stay consistent even when new rows are inserted between requests.
export interface PageInfo {
  // True if there are more results after the current page; false if this is the last page
  hasNextPage: boolean;
  // True if there are more results before the current page; false if this is the first page
  hasPreviousPage: boolean;
  // Opaque cursor pointing to the first item on the current page; use this to go to the previous page
  startCursor: string | null;
  // Opaque cursor pointing to the last item on the current page; use this to go to the next page
  endCursor: string | null;
}

// Generic wrapper that pairs a typed list of results with pagination info.
// T is a placeholder — it gets replaced with the actual type when used, e.g. Connection<AdminUser>.
export interface Connection<T> {
  // The actual array of result items for this page
  nodes: T[];
  // The total number of items that match the query across ALL pages (not just this page)
  totalCount: number;
  // Pagination metadata — whether there are more pages and what cursors to use to navigate them
  pageInfo: PageInfo;
}

// Shape of the object returned when a CSV export is triggered.
export interface ExportResult {
  // Whether the export was generated successfully on the server (true = worked, false = failed)
  success: boolean;
  // A temporary signed URL where the browser can download the generated CSV file, or null if failed
  url: string | null;
  // The suggested filename for the downloaded file (e.g. "users-export.csv"), or null if failed
  filename: string | null;
  // How many data rows are in the exported CSV (useful for confirming the export is complete)
  rowCount: number;
}

// ============================================================
// Query Hooks — read data from the server and cache it
// ============================================================

// useAdminStats — fetch platform-wide statistics for the admin dashboard.
// Accepts an optional dateRange to scope the stats to a specific time window.
export function useAdminStats(dateRange?: { from: string; to: string }) {
  return useQuery({
    // queryKey: the unique cache identifier for this query.
    // adminQueryKeys.stats(dateRange) returns something like ["admin", "stats", { from, to }].
    // If dateRange changes, this key changes, so a fresh fetch is made for the new range.
    queryKey: adminQueryKeys.stats(dateRange),

    // queryFn: the async function that actually fetches the data.
    // TanStack Query calls this when the cache is empty or stale.
    // getAdminStats runs on the server and queries the database.
    queryFn: () => getAdminStats(dateRange),

    // refetchInterval: automatically re-fetch this query every 30 seconds (30,000 ms)
    // while the component that uses this hook is on screen.
    // This keeps the stats live without the admin having to manually refresh the page.
    refetchInterval: 30000,
  });
}

// useAdminUsers — fetch a filtered and paginated list of all user accounts.
// filters: optional key/value pairs to narrow results (e.g. { role: "banned" })
// pagination: optional { limit, offset } to control how many results to return and where to start
export function useAdminUsers(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    // queryKey: includes both filters and pagination so each unique combination
    // of filter values and page position is cached independently.
    queryKey: adminQueryKeys.users(filters, pagination),

    // queryFn: call the server action with the provided filters and pagination options.
    // The type cast tells TypeScript the shape of filters matches what getAdminUsers expects.
    queryFn: () => getAdminUsers(filters as Parameters<typeof getAdminUsers>[0], pagination),
  });
}

// useAdminUser — fetch the full profile of a single user by their database ID.
// id: the unique string ID of the user to fetch (e.g. "user_abc123")
export function useAdminUser(id: string) {
  return useQuery({
    // queryKey: each user ID gets its own cache slot, e.g. ["admin", "user", "user_abc123"].
    queryKey: adminQueryKeys.user(id),

    // queryFn: call the server action that looks up one user by ID.
    queryFn: () => getAdminUser(id),

    // enabled: only run this query when id is a non-empty string.
    // !!id converts id to a boolean: empty string → false, any real string → true.
    // This prevents the hook from firing with an empty/undefined ID (which would cause a server error).
    enabled: !!id,
  });
}

// useAdminWaitlist — fetch a filtered and paginated list of waitlist sign-ups.
// filters: optional key/value pairs to narrow results (e.g. { source: "referral" })
// pagination: optional { limit, offset } for page control
export function useAdminWaitlist(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    // queryKey: unique per filter+pagination combination so each view is cached separately.
    queryKey: adminQueryKeys.waitlist(filters, pagination),

    // queryFn: call the server action with filters and pagination to load this page of waitlist data.
    queryFn: () => getAdminWaitlist(filters as Parameters<typeof getAdminWaitlist>[0], pagination),
  });
}

// useAdminInvites — fetch a filtered and paginated list of invitation records.
// filters: optional key/value pairs (e.g. { status: "pending" })
// pagination: optional { limit, offset } for page control
export function useAdminInvites(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    // queryKey: unique per filter+pagination combination.
    queryKey: adminQueryKeys.invites(filters, pagination),

    // queryFn: call the server action with filters and pagination to load this page of invite data.
    queryFn: () => getAdminInvites(filters as Parameters<typeof getAdminInvites>[0], pagination),
  });
}

// useAdminReferrals — fetch a filtered and paginated list of referral records.
// filters: optional key/value pairs (e.g. { status: "converted" })
// pagination: optional { limit, offset } for page control
export function useAdminReferrals(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    // queryKey: unique per filter+pagination combination.
    queryKey: adminQueryKeys.referrals(filters, pagination),

    // queryFn: call the server action with filters and pagination to load this page of referral data.
    queryFn: () => getAdminReferrals(filters as Parameters<typeof getAdminReferrals>[0], pagination),
  });
}

// ============================================================
// Export Hooks — trigger CSV file generation and auto-download
// These use useMutation (not useQuery) because they cause a
// side effect on the server (generating a file), and the admin
// must explicitly click a button to trigger them.
// ============================================================

// useExportUsers — trigger a server-side CSV export of the users list and download it.
export function useExportUsers() {
  return useMutation({
    // mutationFn: the async function that runs when the admin triggers the export.
    // Accepts optional filters so the admin can export only a subset of users.
    // The server generates the CSV and returns an ExportResult with a download URL.
    mutationFn: (filters?: Record<string, unknown>) =>
      exportUsersData(filters as Parameters<typeof exportUsersData>[0]),

    // onSuccess: runs automatically after mutationFn resolves successfully.
    // data is the ExportResult returned by the server.
    onSuccess: (data) => {
      // Only attempt the download if the server returned a valid URL.
      if (data?.url) {
        // Create a hidden <a> element in the DOM — this is the standard browser trick
        // for programmatically triggering a file download without navigating the page.
        const link = document.createElement("a");

        // Set the href to the signed download URL the server provided.
        link.href = data.url;

        // Set the "download" attribute to the suggested filename (e.g. "users-export.csv").
        // Falls back to a generic name if the server didn't provide one.
        link.download = data.filename || "users-export.csv";

        // The link must be in the DOM for the click to work in some browsers.
        document.body.appendChild(link);

        // Programmatically click the link, which tells the browser to start downloading the file.
        link.click();

        // Clean up — remove the invisible link element from the DOM now that it has been clicked.
        document.body.removeChild(link);
      }
    },
  });
}

// useExportWaitlist — trigger a server-side CSV export of the waitlist and download it.
// Follows exactly the same pattern as useExportUsers above.
export function useExportWaitlist() {
  return useMutation({
    // mutationFn: calls the server action that generates the waitlist CSV.
    // Optional filters let the admin export only a filtered subset of the waitlist.
    mutationFn: (filters?: Record<string, unknown>) =>
      exportWaitlistData(filters as Parameters<typeof exportWaitlistData>[0]),

    // onSuccess: auto-downloads the file using the URL returned by the server.
    onSuccess: (data) => {
      // Only proceed if the server returned a valid download URL.
      if (data?.url) {
        // Create a hidden anchor element to trigger the browser download.
        const link = document.createElement("a");

        // Point the anchor at the server-generated download URL.
        link.href = data.url;

        // Use the server-suggested filename, or fall back to a generic one.
        link.download = data.filename || "waitlist-export.csv";

        // Attach to the DOM so the programmatic click works across all browsers.
        document.body.appendChild(link);

        // Simulate a click to start the download.
        link.click();

        // Remove the temporary element from the DOM.
        document.body.removeChild(link);
      }
    },
  });
}

// useExportReferrals — trigger a server-side CSV export of the referrals list and download it.
// Follows exactly the same pattern as useExportUsers and useExportWaitlist above.
export function useExportReferrals() {
  return useMutation({
    // mutationFn: calls the server action that generates the referrals CSV.
    // Optional filters let the admin export only a filtered subset of the referrals.
    mutationFn: (filters?: Record<string, unknown>) =>
      exportReferralsData(filters as Parameters<typeof exportReferralsData>[0]),

    // onSuccess: auto-downloads the file using the URL returned by the server.
    onSuccess: (data) => {
      // Only proceed if the server returned a valid download URL.
      if (data?.url) {
        // Create a hidden anchor element to trigger the browser download.
        const link = document.createElement("a");

        // Point the anchor at the server-generated download URL.
        link.href = data.url;

        // Use the server-suggested filename, or fall back to a generic one.
        link.download = data.filename || "referrals-export.csv";

        // Attach to the DOM so the programmatic click works across all browsers.
        document.body.appendChild(link);

        // Simulate a click to start the download.
        link.click();

        // Remove the temporary element from the DOM.
        document.body.removeChild(link);
      }
    },
  });
}

// ============================================================
// Mutation Hooks — send changes to the server
// Each hook follows the same pattern:
//   1. Get the global query cache client (so we can invalidate stale data)
//   2. Define a useMutation with a mutationFn that calls the server
//   3. In onSuccess, invalidate the relevant cache keys so components
//      automatically re-fetch fresh data from the server
// ============================================================

// useUpdateUser — allow an admin to edit any user's profile or role.
export function useUpdateUser() {
  // useQueryClient returns the shared cache object for this app.
  // We need it so we can mark cached data as stale after the update succeeds.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives an object with the user's ID and the fields to change.
    // id — the unique ID of the user being edited
    // input — a key/value map of the fields to update (e.g. { role: "moderator", notes: "..." })
    // Calls the server action adminUpdateUser, which writes the changes to the database.
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      adminUpdateUser(id, input as Parameters<typeof adminUpdateUser>[1]),

    // onSuccess: runs after the server confirms the update was saved.
    // Invalidate every cache entry that starts with adminQueryKeys.all (["admin"]).
    // This wipes cached stats, user lists, and the individual user profile so
    // every component that shows admin data will re-fetch fresh results.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

// useBanUser — allow an admin to ban a user from the platform.
export function useBanUser() {
  // Get access to the query cache so we can invalidate stale data after the ban.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives the user's ID and an optional reason for the ban.
    // id — the unique ID of the user to ban
    // reason — a human-readable explanation of why the user was banned (optional)
    // Calls the server action adminBanUser which sets the user's role to "banned" in the database.
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminBanUser(id, reason),

    // onSuccess: invalidate ALL admin cache entries so the user list, stats, and
    // individual user profile all show the updated "banned" status immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

// useUnbanUser — allow an admin to lift a ban and restore a user's access.
export function useUnbanUser() {
  // Get access to the query cache so we can invalidate stale data after the unban.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives just the user's ID (no reason needed for lifting a ban).
    // Calls the server action adminUnbanUser which restores the user's role to "user".
    mutationFn: (id: string) => adminUnbanUser(id),

    // onSuccess: invalidate ALL admin cache entries so the updated role shows everywhere.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

// useDeleteUser — allow an admin to permanently delete a single user account.
export function useDeleteUser() {
  // Get access to the query cache so we can invalidate stale data after the deletion.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives just the user's ID.
    // Calls the server action adminDeleteUser which removes the account and all related data.
    // WARNING: this action is permanent and cannot be undone.
    mutationFn: (id: string) => adminDeleteUser(id),

    // onSuccess: invalidate ALL admin cache entries so the deleted user disappears
    // from lists and the total-user count in stats updates immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

// useBulkDeleteUsers — allow an admin to permanently delete multiple user accounts at once.
export function useBulkDeleteUsers() {
  // Get access to the query cache so we can invalidate stale data after the deletion.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives an array of user ID strings to delete.
    // Calls the server action adminBulkDeleteUsers which deletes all of them in one database call.
    // WARNING: this action is permanent and cannot be undone.
    mutationFn: (ids: string[]) => adminBulkDeleteUsers(ids),

    // onSuccess: invalidate ALL admin cache entries so all deleted users disappear from
    // every list and counts in stats update immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

// useCreateInvite — allow an admin to send a single invitation to a new user.
export function useCreateInvite() {
  // Get access to the query cache so we can refresh the invites list and stats after creation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives an object with the recipient's email and an optional access tier.
    // email — the email address to send the invitation to
    // tier  — the access tier to grant when the person accepts (defaults to "public" if not given)
    // Calls the server action adminCreateInvite which creates the invite record and sends the email.
    mutationFn: (input: { email: string; tier?: string }) =>
      adminCreateInvite({ email: input.email, tier: input.tier ?? "public" }),

    // onSuccess: invalidate the invites list cache so the new invite appears immediately,
    // AND invalidate the stats cache so the invite counts (totalInvites, invitesPending) update.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// useResendInvite — allow an admin to re-send an invitation email that was lost or expired.
export function useResendInvite() {
  // Get access to the query cache so we can refresh the invites list after re-sending.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives the invite's ID.
    // Calls the server action adminResendInvite which generates a new expiry and re-sends the email.
    mutationFn: (id: string) => adminResendInvite(id),

    // onSuccess: invalidate the invites list so the updated expiry timestamp shows immediately.
    // Stats are not invalidated here because the total invite count does not change.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
    },
  });
}

// useRevokeInvite — allow an admin to cancel an outstanding invitation.
export function useRevokeInvite() {
  // Get access to the query cache so we can refresh the invites list and stats after revocation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives the invite's ID.
    // Calls the server action adminRevokeInvite which marks the invite as revoked in the database,
    // preventing the recipient from using the link even if they still have it.
    mutationFn: (id: string) => adminRevokeInvite(id),

    // onSuccess: invalidate the invites list so the revoked invite shows the updated status,
    // AND invalidate the stats cache so counts (invitesPending, invitesExpired) update.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// useBulkCreateInvites — allow an admin to send invitations to many email addresses at once.
export function useBulkCreateInvites() {
  // Get access to the query cache so we can refresh the invites list and stats after creation.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives an array of email addresses and an optional tier for all of them.
    // emails — the list of email addresses to invite
    // tier   — the access tier to grant to each recipient (optional; the server may apply a default)
    // Calls the server action adminBulkCreateInvites which creates all invite records and sends emails.
    mutationFn: ({ emails, tier }: { emails: string[]; tier?: string }) =>
      adminBulkCreateInvites(emails, tier),

    // onSuccess: invalidate the invites list so all new invites appear immediately,
    // AND invalidate the stats cache so counts (totalInvites, invitesPending) update.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// useDeleteWaitlistEntry — allow an admin to remove a single person from the waitlist.
export function useDeleteWaitlistEntry() {
  // Get access to the query cache so we can refresh the waitlist and stats after deletion.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives the waitlist entry's ID.
    // Calls the server action adminDeleteWaitlistEntry which removes the row from the database.
    mutationFn: (id: string) => adminDeleteWaitlistEntry(id),

    // onSuccess: invalidate the waitlist cache so the deleted entry disappears immediately,
    // AND invalidate the stats cache so counts (totalWaitlist, waitlistThisWeek, etc.) update.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.waitlist() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// useBulkDeleteWaitlist — allow an admin to remove multiple people from the waitlist at once.
export function useBulkDeleteWaitlist() {
  // Get access to the query cache so we can refresh the waitlist and stats after deletion.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives an array of waitlist entry IDs.
    // Calls the server action adminBulkDeleteWaitlist which removes all matching rows in one call.
    mutationFn: (ids: string[]) => adminBulkDeleteWaitlist(ids),

    // onSuccess: invalidate the waitlist cache so all deleted entries disappear immediately,
    // AND invalidate the stats cache so counts update.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.waitlist() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

// useConvertWaitlistToInvite — promote a waitlist entry into a real invitation.
// This moves a person from the passive "notify me" waitlist into an active invite
// that lets them create an account.
export function useConvertWaitlistToInvite() {
  // Get access to the query cache so we can refresh the waitlist, invites, and stats after conversion.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: receives the waitlist entry's ID and an optional access tier for the invitation.
    // id   — the ID of the waitlist entry to convert
    // tier — the access tier to grant in the resulting invitation (optional)
    // Calls the server action adminConvertWaitlistToInvite which:
    //   1. Removes the waitlist entry
    //   2. Creates a new invitation record with the same email
    //   3. Sends the invitation email to the person
    mutationFn: ({ id, tier }: { id: string; tier?: string }) =>
      adminConvertWaitlistToInvite(id, tier),

    // onSuccess: invalidate three separate cache keys because the operation touches
    // all three data sets at once:
    //   - waitlist cache: the entry was removed, so the waitlist count goes down
    //   - invites cache:  a new invite was created, so it should appear in the invites list
    //   - stats cache:    both waitlist and invite counts have changed
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.waitlist() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}
