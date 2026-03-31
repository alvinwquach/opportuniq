// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
//
// This file is the single source of truth for every cache key used by
// TanStack Query throughout the application.
//
// WHY THIS EXISTS
// ───────────────
// TanStack Query identifies cached data by an array called a "queryKey".
// If two hooks use different arrays for the same data (even with the same
// content, but written differently), they get separate cache slots and the
// data is fetched twice. By centralising all keys here, we guarantee every
// hook uses the exact same array for the same piece of data.
//
// HOW THE HIERARCHY WORKS
// ────────────────────────
// Keys are nested from broad → specific:
//   namespace → sub-namespace → specific key
//
// Example for a single issue:
//   ["issues"]                           ← everything under "issues"
//   ["issues", "detail"]                 ← all issue detail records
//   ["issues", "detail", "abc-123"]      ← the specific issue with ID "abc-123"
//
// When we call `invalidateQueries({ queryKey: ["issues"] })`, TanStack Query
// automatically expires ALL entries whose key starts with ["issues"] —
// this is called "partial matching" and it's the main reason we use a
// hierarchical structure.
//
// AS CONST EXPLAINED
// ──────────────────
// `as const` tells TypeScript to treat the array as a fixed literal tuple
// (e.g. readonly ["issues", "detail", "abc-123"]) instead of a generic
// string array (string[]). This gives us precise type inference and prevents
// accidentally mutating a key at runtime.
// ─────────────────────────────────────────────────────────────────────────────

// Export the factory object so any hook file can import and use it.
export const queryKeys = {

  // ── USER ────────────────────────────────────────────────────────────────────
  // Keys for the current user's own profile data.
  user: {
    // Broad key that covers everything user-related.
    // Invalidating this expires all user data at once.
    all: ["user"] as const,

    // Key for the logged-in user's own profile (the "me" endpoint).
    // Spreads the parent `all` array and appends "me".
    me: () => [...queryKeys.user.all, "me"] as const,

    // Key for the logged-in user's profile AND the groups they belong to.
    // Used when a component needs both pieces of information in one fetch.
    meWithGroups: () => [...queryKeys.user.all, "me", "withGroups"] as const,
  },

  // ── GROUPS ──────────────────────────────────────────────────────────────────
  // Keys for group records (a group is a collection of users working together).
  groups: {
    // Broadest key — invalidating this expires ALL group data.
    all: ["groups"] as const,

    // Key for any kind of list of groups (parent of more specific list keys).
    lists: () => [...queryKeys.groups.all, "list"] as const,

    // Key for the list of groups that belong to the logged-in user.
    myGroups: () => [...queryKeys.groups.lists(), "my"] as const,

    // Key that acts as a parent for all individual group detail records.
    details: () => [...queryKeys.groups.all, "detail"] as const,

    // Key for one specific group's detail, identified by its unique `id`.
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,

    // Key for a group's detail record plus its member list included.
    // Used when a component needs group info AND the roster in one fetch.
    withMembers: (id: string) => [...queryKeys.groups.detail(id), "members"] as const,

    // Key for the pending (not yet accepted) invitations for a group.
    invitations: (id: string) => [...queryKeys.groups.detail(id), "invitations"] as const,

    // Key for resolution statistics (how many issues were resolved, etc.)
    // for a group, optionally scoped to a time range (e.g. "last30days").
    resolutionStats: (id: string, timeRange?: string) =>
      [...queryKeys.groups.detail(id), "resolutionStats", timeRange] as const,

    // Key for the pre-assembled "groups page" data bundle — a single fetch
    // that returns everything the groups list page needs at once.
    pageData: () => [...queryKeys.groups.all, "pageData"] as const,
  },

  // ── ISSUES ──────────────────────────────────────────────────────────────────
  // Keys for issue records (an "issue" is a problem or task being tracked).
  issues: {
    // Broadest key — invalidating this expires ALL issue data.
    all: ["issues"] as const,

    // Parent key for all issue list queries.
    lists: () => [...queryKeys.issues.all, "list"] as const,

    // Key for a specific list of issues filtered by group and optional
    // status/priority/category filters. Different filter combinations each
    // get their own cache slot because the filters object is part of the key.
    list: (groupId: string, filters?: object) =>
      [...queryKeys.issues.lists(), groupId, filters] as const,

    // Parent key for all individual issue detail records.
    details: () => [...queryKeys.issues.all, "detail"] as const,

    // Key for one specific issue's full detail record, identified by `id`.
    detail: (id: string) => [...queryKeys.issues.details(), id] as const,

    // Key for an issue's detail record plus its decision options.
    // Used when a page needs both the issue body and its associated options.
    withOptions: (id: string) => [...queryKeys.issues.detail(id), "options"] as const,

    // Key for the pre-assembled "issues page" data bundle.
    pageData: () => [...queryKeys.issues.all, "pageData"] as const,
  },

  // ── DECISIONS ───────────────────────────────────────────────────────────────
  // Keys for decision records (a decision is a choice made for an issue).
  decisions: {
    // Broadest key — invalidating this expires ALL decision data.
    all: ["decisions"] as const,

    // Key for a specific decision option (one of the possible choices
    // attached to a decision), identified by the option's `id`.
    option: (id: string) => [...queryKeys.decisions.all, "option", id] as const,

    // Key for the outcome of a decision (the result after a choice was made),
    // identified by the parent decision's `decisionId`.
    outcome: (decisionId: string) =>
      [...queryKeys.decisions.all, "outcome", decisionId] as const,
  },

  // ── GUIDES ──────────────────────────────────────────────────────────────────
  // Keys for guide records (instructional content inside the app).
  guides: {
    // Broadest key — invalidating this expires ALL guide data.
    all: ["guides"] as const,

    // Key for the list of guides that belong to the current user,
    // with optional filtering. Filters are embedded in the key so
    // different filter combinations don't share a cache slot.
    my: (filters?: object) => [...queryKeys.guides.all, "my", filters] as const,

    // Key for the pre-assembled "guides page" data bundle.
    pageData: () => [...queryKeys.guides.all, "pageData"] as const,
  },

  // ── FINANCE ─────────────────────────────────────────────────────────────────
  // Keys for financial data: income streams, expenses, budgets, and summaries.
  finance: {
    // Broadest key — invalidating this expires ALL finance data.
    // Most finance mutations use this so every finance query refetches at once.
    all: ["finance"] as const,

    // Key for the current user's income streams (salary, freelance, etc.).
    income: () => [...queryKeys.finance.all, "income"] as const,

    // Key for the current user's expense records.
    // The `filters` object (date range, category, etc.) is embedded in the key
    // so each unique filter combination gets its own cache entry.
    expenses: (filters?: object) => [...queryKeys.finance.all, "expenses", filters] as const,

    // Key for the current user's budget targets per category.
    budgets: () => [...queryKeys.finance.all, "budgets"] as const,

    // Key for the aggregated financial summary (totals, net income, etc.).
    summary: () => [...queryKeys.finance.all, "summary"] as const,

    // Key for the pre-assembled "finances page" data bundle.
    pageData: () => [...queryKeys.finance.all, "pageData"] as const,
  },

  // ── DASHBOARD ───────────────────────────────────────────────────────────────
  // Keys for dashboard-level aggregated data shown on the home screen.
  dashboard: {
    // Broadest key — invalidating this expires ALL dashboard data.
    all: ["dashboard"] as const,

    // Key for the dashboard statistics (counts, completion rates, etc.).
    // Multiple mutation hooks invalidate this so the dashboard numbers
    // stay up to date after any significant change.
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,

    // Key for the full dashboard data bundle (layout + widgets + stats).
    data: () => [...queryKeys.dashboard.all, "data"] as const,
  },

  // ── CALENDAR ────────────────────────────────────────────────────────────────
  // Keys for calendar view data.
  calendar: {
    // Broadest key — invalidating this expires ALL calendar data.
    all: ["calendar"] as const,

    // Key for the calendar page data for a specific year and month.
    // Different month/year combinations each get their own cache slot
    // so navigating between months doesn't discard previously loaded data.
    pageData: (year?: number, month?: number) =>
      [...queryKeys.calendar.all, "pageData", year, month] as const,
  },

  // ── INVITATIONS ─────────────────────────────────────────────────────────────
  // Keys for group invitation records.
  invitations: {
    // Broadest key — invalidating this expires ALL invitation data.
    all: ["invitations"] as const,

    // Key for the list of invitations that are still waiting for a response
    // from the current user.
    pending: () => [...queryKeys.invitations.all, "pending"] as const,
  },

  // ── PREFERENCES ─────────────────────────────────────────────────────────────
  // Keys for user preference / history data (e.g. what decisions a user
  // has made in the past for a given group).
  preferences: {
    // Key for the preference history for a specific group.
    // Note: this namespace doesn't have an `all` key — it is always queried
    // at the group level, so no broad invalidation is needed.
    history: (groupId: string) => ["preferences", "history", groupId] as const,
  },

  // ── SCHEDULES ───────────────────────────────────────────────────────────────
  // Keys for schedule records (time-slot bookings linked to issues).
  schedules: {
    // Broadest key — invalidating this expires ALL schedule data.
    all: ["schedules"] as const,

    // Key for a single schedule record identified by `id`.
    detail: (id: string) => [...queryKeys.schedules.all, "detail", id] as const,

    // Key for the list of schedules belonging to the current user,
    // optionally filtered by a date range. Different date ranges get
    // separate cache slots.
    my: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.schedules.all, "my", filters] as const,

    // Key for all schedules belonging to a specific group,
    // optionally filtered by date range. Both groupId and filters are
    // embedded so each combination is cached independently.
    group: (groupId: string, filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.schedules.all, "group", groupId, filters] as const,

    // Key for the list of issues inside a group that have not been
    // assigned a schedule yet — used to populate scheduling UI.
    forScheduling: (groupId: string) =>
      [...queryKeys.schedules.all, "forScheduling", groupId] as const,
  },

  // ── EXPENSE SETTINGS ────────────────────────────────────────────────────────
  // Keys for expense configuration and category data, scoped per group.
  expenseSettings: {
    // Broadest key — invalidating this expires ALL expense-settings data.
    all: ["expenseSettings"] as const,

    // Key for the top-level expense settings object for a specific group
    // (currency, receipt policy, approval threshold, etc.).
    group: (groupId: string) => [...queryKeys.expenseSettings.all, "group", groupId] as const,

    // Key for the list of expense categories defined for a specific group.
    // Stored separately from the settings object so they can be
    // invalidated independently.
    categories: (groupId: string) =>
      [...queryKeys.expenseSettings.all, "categories", groupId] as const,
  },

  // ── DIAGNOSE ────────────────────────────────────────────────────────────────
  // Keys for the AI diagnosis / analysis feature (examining an issue in depth).
  diagnose: {
    // Broadest key — invalidating this expires ALL diagnosis data.
    all: ["diagnose"] as const,

    // Key for the diagnosis page data, optionally scoped to a specific issue.
    // When `issueId` is undefined, it covers the general diagnosis page.
    pageData: (issueId?: string) =>
      [...queryKeys.diagnose.all, "pageData", issueId] as const,
  },

  // ── ADMIN ───────────────────────────────────────────────────────────────────
  // Keys for admin-panel data (only accessible to administrators).
  admin: {
    // Broadest key — invalidating this expires ALL admin data.
    all: ["admin"] as const,

    // Key for the admin statistics dashboard, optionally filtered by a
    // date range object containing `from` and `to` date strings.
    stats: (dateRange?: { from: string; to: string }) =>
      [...queryKeys.admin.all, "stats", dateRange] as const,

    // Key for the admin users list with optional filter and pagination objects.
    // Different filter/pagination combos get separate cache slots.
    users: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "users", filters, pagination] as const,

    // Key for a single user record in the admin panel, identified by `id`.
    user: (id: string) => [...queryKeys.admin.all, "user", id] as const,

    // Key for the waitlist entries list with optional filter and pagination.
    waitlist: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "waitlist", filters, pagination] as const,

    // Key for the admin invites list with optional filter and pagination.
    invites: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "invites", filters, pagination] as const,

    // Key for the referrals list with optional filter and pagination.
    referrals: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "referrals", filters, pagination] as const,

    // Key for the audit log (record of admin actions), optionally filtered
    // by pagination settings and the type of entity that was acted upon.
    auditLog: (pagination?: object, targetType?: string) =>
      [...queryKeys.admin.all, "auditLog", pagination, targetType] as const,
  },
};
