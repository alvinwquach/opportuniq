/**
 * Query Key Factories
 *
 * Consistent cache key management for TanStack Query.
 * Hierarchical structure enables targeted invalidation.
 *
 * @example
 * // Invalidate all user queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
 *
 * // Invalidate specific group
 * queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
 */

export const queryKeys = {
  // User
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
    meWithGroups: () => [...queryKeys.user.all, "me", "withGroups"] as const,
  },

  // Groups
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    myGroups: () => [...queryKeys.groups.lists(), "my"] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
    withMembers: (id: string) => [...queryKeys.groups.detail(id), "members"] as const,
    invitations: (id: string) => [...queryKeys.groups.detail(id), "invitations"] as const,
    resolutionStats: (id: string, timeRange?: string) =>
      [...queryKeys.groups.detail(id), "resolutionStats", timeRange] as const,
    pageData: () => [...queryKeys.groups.all, "pageData"] as const,
  },

  // Issues
  issues: {
    all: ["issues"] as const,
    lists: () => [...queryKeys.issues.all, "list"] as const,
    list: (groupId: string, filters?: object) =>
      [...queryKeys.issues.lists(), groupId, filters] as const,
    details: () => [...queryKeys.issues.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.issues.details(), id] as const,
    withOptions: (id: string) => [...queryKeys.issues.detail(id), "options"] as const,
    pageData: () => [...queryKeys.issues.all, "pageData"] as const,
  },

  // Decisions
  decisions: {
    all: ["decisions"] as const,
    option: (id: string) => [...queryKeys.decisions.all, "option", id] as const,
    outcome: (decisionId: string) => [...queryKeys.decisions.all, "outcome", decisionId] as const,
  },

  // Guides
  guides: {
    all: ["guides"] as const,
    my: (filters?: object) => [...queryKeys.guides.all, "my", filters] as const,
    pageData: () => [...queryKeys.guides.all, "pageData"] as const,
  },

  // Finance
  finance: {
    all: ["finance"] as const,
    income: () => [...queryKeys.finance.all, "income"] as const,
    expenses: (filters?: object) => [...queryKeys.finance.all, "expenses", filters] as const,
    budgets: () => [...queryKeys.finance.all, "budgets"] as const,
    summary: () => [...queryKeys.finance.all, "summary"] as const,
    pageData: () => [...queryKeys.finance.all, "pageData"] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    data: () => [...queryKeys.dashboard.all, "data"] as const,
  },

  // Calendar
  calendar: {
    all: ["calendar"] as const,
    pageData: (year?: number, month?: number) =>
      [...queryKeys.calendar.all, "pageData", year, month] as const,
  },

  // Invitations
  invitations: {
    all: ["invitations"] as const,
    pending: () => [...queryKeys.invitations.all, "pending"] as const,
  },

  // Preferences
  preferences: {
    history: (groupId: string) => ["preferences", "history", groupId] as const,
  },

  // Schedules
  schedules: {
    all: ["schedules"] as const,
    detail: (id: string) => [...queryKeys.schedules.all, "detail", id] as const,
    my: (filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.schedules.all, "my", filters] as const,
    group: (groupId: string, filters?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.schedules.all, "group", groupId, filters] as const,
    forScheduling: (groupId: string) =>
      [...queryKeys.schedules.all, "forScheduling", groupId] as const,
  },

  // Expense Settings
  expenseSettings: {
    all: ["expenseSettings"] as const,
    group: (groupId: string) => [...queryKeys.expenseSettings.all, "group", groupId] as const,
    categories: (groupId: string) =>
      [...queryKeys.expenseSettings.all, "categories", groupId] as const,
  },

  // Diagnose
  diagnose: {
    all: ["diagnose"] as const,
    pageData: (issueId?: string) => [...queryKeys.diagnose.all, "pageData", issueId] as const,
  },

  // Admin
  admin: {
    all: ["admin"] as const,
    stats: (dateRange?: { from: string; to: string }) =>
      [...queryKeys.admin.all, "stats", dateRange] as const,
    users: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "users", filters, pagination] as const,
    user: (id: string) => [...queryKeys.admin.all, "user", id] as const,
    waitlist: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "waitlist", filters, pagination] as const,
    invites: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "invites", filters, pagination] as const,
    referrals: (filters?: object, pagination?: object) =>
      [...queryKeys.admin.all, "referrals", filters, pagination] as const,
    auditLog: (pagination?: object, targetType?: string) =>
      [...queryKeys.admin.all, "auditLog", pagination, targetType] as const,
  },
};
