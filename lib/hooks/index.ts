// ============================================================
// lib/hooks/index.ts — Barrel (re-export) file for all hooks
//
// This file does NOT contain any logic of its own.
// Its only job is to gather every hook from every module and
// re-export them through a single entry point so that the rest
// of the app can write:
//   import { useMe, useAdminStats } from "@/lib/hooks"
// instead of having to know which sub-file each hook lives in.
// ============================================================

// ---- User hooks ----
// Re-exports hooks from the "./user" module.
// These hooks deal with the currently signed-in user's own data:
//   useMe               — fetch the current user's profile
//   useMeWithGroups     — fetch the current user plus the groups they belong to
//   useUpdateProfile    — mutation to save changes to the user's profile (name, avatar, etc.)
//   useUpdatePreferences — mutation to save the user's app-wide preferences (notifications, theme, etc.)
export {
  useMe,
  useMeWithGroups,
  useUpdateProfile,
  useUpdatePreferences,
} from "./user";

// ---- Group hooks ----
// Re-exports hooks from the "./group" module.
// Groups are collections of users who collaborate together.
//   useMyGroups              — fetch all groups the current user is a member of
//   useGroup                 — fetch a single group by its ID
//   useGroupWithMembers      — fetch a group AND the full list of its members in one call
//   useGroupInvitations      — fetch pending invitations that have been sent out for a group
//   useMyPendingInvitations  — fetch invitations that are waiting for the current user to respond to
//   useCreateGroup           — mutation to create a brand-new group
//   useUpdateGroup           — mutation to edit a group's name, description, or settings
//   useUpdateGroupConstraints — mutation to change scheduling/budget constraints for a group
//   useLeaveGroup            — mutation for the current user to leave a group they are in
//   useAcceptInvitation      — mutation to accept a pending group invitation
//   useDeclineInvitation     — mutation to decline a pending group invitation
//   useUpdateMemberRole      — mutation to change another member's role (e.g. promote to admin)
//   useInviteMember          — mutation to send an invitation email to a new member
//   useRemoveMember          — mutation to kick a member out of a group
//   useGroupsPageData        — convenience hook that fetches everything the Groups page needs at once
export {
  useMyGroups,
  useGroup,
  useGroupWithMembers,
  useGroupInvitations,
  useMyPendingInvitations,
  useCreateGroup,
  useUpdateGroup,
  useUpdateGroupConstraints,
  useLeaveGroup,
  useAcceptInvitation,
  useDeclineInvitation,
  useUpdateMemberRole,
  useInviteMember,
  useRemoveMember,
  useGroupsPageData,
} from "./group";

// ---- Issue hooks ----
// Re-exports hooks from the "./issue" module.
// Issues are problems or tasks that a group needs to resolve together.
//   useIssues            — fetch a list of issues (can be filtered by group, status, etc.)
//   useIssue             — fetch a single issue by its ID
//   useIssueWithOptions  — fetch a single issue along with the voting options attached to it
//   useIssuesPageData    — convenience hook that fetches everything the Issues page needs at once
//   useCreateIssue       — mutation to open a new issue
//   useUpdateIssue       — mutation to edit an existing issue's title, description, or metadata
//   useDeleteIssue       — mutation to permanently remove an issue
//   useAddComment        — mutation to post a comment on an issue
//   useDeleteComment     — mutation to remove a comment from an issue
//   useEditComment       — mutation to edit the text of an existing comment
//   useResolveIssue      — mutation to mark an issue as resolved/closed
//   useReopenIssue       — mutation to reopen a previously resolved issue
export {
  useIssues,
  useIssue,
  useIssueWithOptions,
  useIssuesPageData,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  useAddComment,
  useDeleteComment,
  useEditComment,
  useResolveIssue,
  useReopenIssue,
} from "./issue";

// ---- Decision hooks ----
// Re-exports hooks from the "./decision" module.
// Decisions are the outcome of a group choosing between options on an issue.
//   useDecisionOption  — fetch a specific option (choice) that is part of a decision
//   useVoteOnDecision  — mutation to cast the current user's vote for an option
//   useApproveDecision — mutation for a group admin to officially approve/finalize a decision
//   useChangeVote      — mutation to switch the current user's existing vote to a different option
export {
  useDecisionOption,
  useVoteOnDecision,
  useApproveDecision,
  useChangeVote,
} from "./decision";

// ---- Guide hooks ----
// Re-exports hooks from the "./guide" module.
// Guides are how-to articles or tutorials available inside the app.
//   useMyGuides        — fetch the guides that are visible/assigned to the current user
//   useBookmarkGuide   — mutation to save a guide to the user's personal bookmark list
//   useTrackGuideClick — mutation to record that the user clicked/opened a guide (for analytics)
//   useRateGuide       — mutation to submit a star rating or thumbs-up/down on a guide
export {
  useMyGuides,
  useBookmarkGuide,
  useTrackGuideClick,
  useRateGuide,
} from "./guide";

// ---- Guides page hooks ----
// Re-exports hooks from the "./guides" module (note the plural — different file from "./guide").
// This module handles the full Guides browsing page rather than individual guide items.
//   useGuidesPageData      — convenience hook that fetches everything the Guides page needs at once
//   useUpdateGuideProgress — mutation to save how far through a guide the user has read
export {
  useGuidesPageData,
  useUpdateGuideProgress,
} from "./guides";

// ---- Finance hooks ----
// Re-exports hooks from the "./finance" module.
// These hooks manage an individual user's personal financial records.
//   useMyIncomeStreams    — fetch the current user's list of income sources (salary, freelance, etc.)
//   useAddIncomeStream   — mutation to create a new income source entry
//   useUpdateIncomeStream — mutation to edit an existing income source entry
//   useDeleteIncomeStream — mutation to remove an income source entry
//   useMyExpenses        — fetch the current user's list of recorded expenses
//   useAddExpense        — mutation to log a new expense
//   useUpdateExpense     — mutation to edit an existing expense entry
//   useDeleteExpense     — mutation to remove an expense entry
//   useMyBudgets         — fetch the current user's budget limits per category
//   useSetBudget         — mutation to create or replace a budget limit for a category
//   useUpdateBudgetSpend — mutation to record additional spending against a budget
//   useDeleteBudget      — mutation to remove a budget limit entirely
//   useMyFinancialSummary — fetch a rolled-up summary of the user's income, spending, and savings
export {
  useMyIncomeStreams,
  useAddIncomeStream,
  useUpdateIncomeStream,
  useDeleteIncomeStream,
  useMyExpenses,
  useAddExpense,
  useUpdateExpense,
  useDeleteExpense,
  useMyBudgets,
  useSetBudget,
  useUpdateBudgetSpend,
  useDeleteBudget,
  useMyFinancialSummary,
} from "./finance";

// ---- Finances page hooks ----
// Re-exports hooks from the "./finances" module (plural — full-page module vs. per-record module).
// These hooks are designed for the Finances page and offer pre-composed data fetching.
//   useFinancesPageData  — convenience hook that fetches everything the Finances page needs at once
//   useIncomeStreams      — fetch income streams (page-level version with filters/pagination)
//   useExpenses          — fetch expenses (page-level version with filters/pagination)
//   useBudgets           — fetch budgets (page-level version with category breakdown)
//   useFinancialSummary  — fetch a financial summary (page-level version with date-range support)
export {
  useFinancesPageData,
  useIncomeStreams,
  useExpenses,
  useBudgets,
  useFinancialSummary,
} from "./finances";

// ---- Dashboard hooks ----
// Re-exports hooks from the "./dashboard" module.
// The dashboard is the app's home/overview screen showing high-level stats and activity.
//   useDashboardStats        — fetch the headline numbers shown at the top of the dashboard
//   useDashboardData         — convenience hook that loads all widgets on the dashboard at once
//   useGroupResolutionStats  — fetch how many issues each group has resolved vs. left open
//   useDecisionOutcome       — fetch the recorded real-world outcome of a past decision
//   useRecordOutcome         — mutation to log what actually happened after a decision was made
//   usePreferenceHistory     — fetch a log of changes the user has made to their preferences over time
export {
  useDashboardStats,
  useDashboardData,
  useGroupResolutionStats,
  useDecisionOutcome,
  useRecordOutcome,
  usePreferenceHistory,
} from "./dashboard";

// ---- Calendar hooks ----
// Re-exports hooks from the "./calendar" module.
// The calendar shows scheduled events across the user's groups.
//   useCalendarPageData      — convenience hook that loads everything the Calendar page needs
//   useCreateCalendarEvent   — mutation to add a new event to the calendar
//   useUpdateCalendarEvent   — mutation to edit an existing calendar event
//   useDeleteCalendarEvent   — mutation to remove an event from the calendar
export {
  useCalendarPageData,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "./calendar";

// ---- Schedule hooks ----
// Re-exports hooks from the "./schedule" module.
// Schedules are recurring time slots or plans for a user or group to work on issues.
//   useSchedule              — fetch a single schedule by its ID
//   useMySchedules           — fetch all schedules that belong to the current user
//   useGroupSchedules        — fetch all schedules that belong to a specific group
//   useIssuesForScheduling   — fetch issues that are eligible to be placed on a schedule
//   useCreateSchedule        — mutation to create a new schedule entry
//   useUpdateSchedule        — mutation to edit an existing schedule
//   useDeleteSchedule        — mutation to remove a schedule
export {
  useSchedule,
  useMySchedules,
  useGroupSchedules,
  useIssuesForScheduling,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "./schedule";

// ---- Expense settings hooks ----
// Re-exports hooks from the "./expense-settings" module.
// These hooks manage how a group tracks and categorises shared expenses.
//   useGroupExpenseSettings    — fetch a group's expense-tracking settings (currency, split rules, etc.)
//   useGroupExpenseCategories  — fetch the custom expense categories a group has defined
//   useUpdateExpenseSettings   — mutation to change the group's expense-tracking settings
//   useCreateExpenseCategory   — mutation to add a new custom expense category to a group
//   useUpdateExpenseCategory   — mutation to rename or modify a custom category
//   useDeleteExpenseCategory   — mutation to remove a custom expense category
export {
  useGroupExpenseSettings,
  useGroupExpenseCategories,
  useUpdateExpenseSettings,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from "./expense-settings";

// ---- Vendor hooks ----
// Re-exports hooks from the "./vendor" module.
// Vendors are external suppliers or service providers that a group might hire.
//   useMarkVendorContacted — mutation to flag that a vendor has been contacted (for tracking progress)
//   useAddVendorQuote      — mutation to attach a price quote received from a vendor to a record
export {
  useMarkVendorContacted,
  useAddVendorQuote,
} from "./vendor";

// ---- Admin hooks (functions) ----
// Re-exports hooks and the query-key helper from the "./admin" module.
// These are only used by admin panel pages — regular users never call these.
//   adminQueryKeys              — an object of helper functions that build stable cache-key arrays
//                                 for every admin query; kept here so all admin hooks share the same keys
//   useAdminStats               — fetch aggregated platform-wide stats (user counts, growth, etc.)
//   useAdminUsers               — fetch a paginated, filterable list of all users in the system
//   useAdminUser                — fetch the full profile of a single user by their ID
//   useAdminWaitlist            — fetch a paginated, filterable list of waitlist sign-ups
//   useAdminInvites             — fetch a paginated, filterable list of sent invitations
//   useAdminReferrals           — fetch a paginated, filterable list of referral records
//   useExportUsers              — mutation to trigger a CSV download of the users list
//   useExportWaitlist           — mutation to trigger a CSV download of the waitlist
//   useExportReferrals          — mutation to trigger a CSV download of the referrals list
//   useUpdateUser               — mutation to edit any user's profile or role from the admin panel
//   useBanUser                  — mutation to ban a user from the platform
//   useUnbanUser                — mutation to lift a ban and restore a user's access
//   useDeleteUser               — mutation to permanently delete a single user account
//   useBulkDeleteUsers          — mutation to permanently delete multiple user accounts at once
//   useCreateInvite             — mutation to send a single invitation email to a new user
//   useResendInvite             — mutation to re-send an invitation email that expired or was missed
//   useRevokeInvite             — mutation to cancel an outstanding invitation before it is accepted
//   useBulkCreateInvites        — mutation to send invitation emails to a list of email addresses at once
//   useDeleteWaitlistEntry      — mutation to remove a single entry from the waitlist
//   useBulkDeleteWaitlist       — mutation to remove multiple entries from the waitlist at once
//   useConvertWaitlistToInvite  — mutation to promote a waitlist entry into a real invitation
export {
  adminQueryKeys,
  useAdminStats,
  useAdminUsers,
  useAdminUser,
  useAdminWaitlist,
  useAdminInvites,
  useAdminReferrals,
  useExportUsers,
  useExportWaitlist,
  useExportReferrals,
  useUpdateUser,
  useBanUser,
  useUnbanUser,
  useDeleteUser,
  useBulkDeleteUsers,
  useCreateInvite,
  useResendInvite,
  useRevokeInvite,
  useBulkCreateInvites,
  useDeleteWaitlistEntry,
  useBulkDeleteWaitlist,
  useConvertWaitlistToInvite,
} from "./admin";

// ---- Admin hooks (TypeScript types) ----
// Re-exports TypeScript interface definitions from the "./admin" module.
// These are pure type definitions — they produce no runtime code.
// Importing them lets other parts of the codebase annotate variables and
// function parameters with the exact shape of admin data objects.
//   AdminStats     — shape of the platform-wide statistics object
//   AdminUser      — shape of a single user record as seen from the admin panel
//   WaitlistEntry  — shape of a single waitlist sign-up record
//   AdminInvite    — shape of a single invitation record
//   AdminReferral  — shape of a single referral record
//   PageInfo       — shape of cursor-based pagination metadata (hasNextPage, cursors, etc.)
//   Connection<T>  — generic wrapper that pairs a list of items with totalCount and PageInfo
//   ExportResult   — shape of the object returned after triggering a CSV export
export type {
  AdminStats,
  AdminUser,
  WaitlistEntry,
  AdminInvite,
  AdminReferral,
  PageInfo,
  Connection,
  ExportResult,
} from "./admin";

// ---- Diagnose hooks ----
// Re-exports hooks from the "./diagnose" module.
// The Diagnose feature uses AI to help users analyze their financial or group situation.
//   useDiagnosePageData — convenience hook that fetches everything the Diagnose page needs at once
export { useDiagnosePageData } from "./diagnose";
