/**
 * GraphQL Hooks - Barrel Export
 *
 * Re-exports all hooks from domain modules for convenient importing.
 *
 * @example
 * import { useMe, useMyGroups, useIssues } from "@/lib/graphql/hooks";
 */

// User hooks
export {
  useMe,
  useMeWithGroups,
  useUpdateProfile,
  useUpdatePreferences,
} from "./user";

// Group hooks
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

// Issue hooks
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

// Decision hooks
export {
  useDecisionOption,
  useVoteOnDecision,
  useApproveDecision,
  useChangeVote,
} from "./decision";

// Guide hooks
export {
  useMyGuides,
  useBookmarkGuide,
  useTrackGuideClick,
  useRateGuide,
} from "./guide";

// Guides page hooks (GraphQL)
export {
  useGuidesPageData,
  useUpdateGuideProgress,
} from "./guides";

// Finance hooks
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

// Finances page hooks (GraphQL)
export {
  useFinancesPageData,
  useIncomeStreams,
  useExpenses,
  useBudgets,
  useFinancialSummary,
} from "./finances";

// Dashboard hooks
export {
  useDashboardStats,
  useDashboardData,
  useGroupResolutionStats,
  useDecisionOutcome,
  useRecordOutcome,
  usePreferenceHistory,
} from "./dashboard";

// Calendar hooks
export {
  useCalendarPageData,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "./calendar";

// Schedule hooks
export {
  useSchedule,
  useMySchedules,
  useGroupSchedules,
  useIssuesForScheduling,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "./schedule";

// Expense settings hooks
export {
  useGroupExpenseSettings,
  useGroupExpenseCategories,
  useUpdateExpenseSettings,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from "./expense-settings";

// Vendor hooks
export {
  useMarkVendorContacted,
  useAddVendorQuote,
} from "./vendor";

// Admin hooks
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

// Admin types
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

// Diagnose hooks
export { useDiagnosePageData } from "./diagnose";
