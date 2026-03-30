/**
 * Admin GraphQL Hooks
 *
 * TanStack Query hooks for admin operations.
 * All hooks require admin authentication.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import { queryKeys } from "../keys";

// Query Keys for Admin
export const adminQueryKeys = {
  all: ["admin"] as const,
  stats: (dateRange?: { from: string; to: string }) =>
    [...adminQueryKeys.all, "stats", dateRange] as const,
  users: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "users", filters, pagination] as const,
  user: (id: string) => [...adminQueryKeys.all, "user", id] as const,
  waitlist: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "waitlist", filters, pagination] as const,
  invites: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "invites", filters, pagination] as const,
  referrals: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
    [...adminQueryKeys.all, "referrals", filters, pagination] as const,
  auditLog: (pagination?: Record<string, unknown>, targetType?: string) =>
    [...adminQueryKeys.all, "auditLog", pagination, targetType] as const,
};

// GraphQL Queries
const ADMIN_STATS_QUERY = /* GraphQL */ `
  query AdminStats($dateRange: DateRangeInput) {
    adminStats(dateRange: $dateRange) {
      totalUsers
      usersThisWeek
      usersLastWeek
      growthPercent
      totalWaitlist
      waitlistToday
      waitlistThisWeek
      totalInvites
      invitesAccepted
      invitesPending
      invitesExpired
      inviteAcceptanceRate
      totalReferrals
      referralsConverted
      referralsPending
      referralConversionRate
      tierDistribution {
        johatsu
        alpha
        beta
        public
      }
      roleDistribution {
        admin
        moderator
        user
        banned
      }
    }
  }
`;

const ADMIN_USERS_QUERY = /* GraphQL */ `
  query AdminUsers($filters: AdminUserFilters, $pagination: PaginationInput) {
    adminUsers(filters: $filters, pagination: $pagination) {
      nodes {
        id
        email
        name
        avatarUrl
        role
        accessTier
        referralCode
        referralCount
        createdAt
        updatedAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const ADMIN_USER_QUERY = /* GraphQL */ `
  query AdminUser($id: ID!) {
    adminUser(id: $id) {
      id
      email
      name
      avatarUrl
      role
      accessTier
      referralCode
      referralCount
      createdAt
      updatedAt
      lastLoginAt
      notes
    }
  }
`;

const ADMIN_WAITLIST_QUERY = /* GraphQL */ `
  query AdminWaitlist($filters: WaitlistFilters, $pagination: PaginationInput) {
    adminWaitlist(filters: $filters, pagination: $pagination) {
      nodes {
        id
        email
        source
        createdAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const ADMIN_INVITES_QUERY = /* GraphQL */ `
  query AdminInvites($filters: InviteFilters, $pagination: PaginationInput) {
    adminInvites(filters: $filters, pagination: $pagination) {
      nodes {
        id
        email
        token
        tier
        acceptedAt
        expiresAt
        createdAt
        inviterId
        inviterName
        emailSent
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const ADMIN_REFERRALS_QUERY = /* GraphQL */ `
  query AdminReferrals($filters: ReferralFilters, $pagination: PaginationInput) {
    adminReferrals(filters: $filters, pagination: $pagination) {
      nodes {
        id
        referrerId
        referrerEmail
        referrerName
        refereeEmail
        status
        createdAt
        convertedAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const EXPORT_USERS_QUERY = /* GraphQL */ `
  query ExportUsers($filters: AdminUserFilters) {
    exportUsers(filters: $filters) {
      success
      url
      filename
      rowCount
    }
  }
`;

const EXPORT_WAITLIST_QUERY = /* GraphQL */ `
  query ExportWaitlist($filters: WaitlistFilters) {
    exportWaitlist(filters: $filters) {
      success
      url
      filename
      rowCount
    }
  }
`;

const EXPORT_REFERRALS_QUERY = /* GraphQL */ `
  query ExportReferrals($filters: ReferralFilters) {
    exportReferrals(filters: $filters) {
      success
      url
      filename
      rowCount
    }
  }
`;

// GraphQL Mutations
const ADMIN_UPDATE_USER_MUTATION = /* GraphQL */ `
  mutation AdminUpdateUser($id: ID!, $input: UpdateUserInput!) {
    adminUpdateUser(id: $id, input: $input) {
      id
      email
      name
      role
      accessTier
      updatedAt
    }
  }
`;

const ADMIN_BAN_USER_MUTATION = /* GraphQL */ `
  mutation AdminBanUser($id: ID!, $reason: String) {
    adminBanUser(id: $id, reason: $reason) {
      id
      email
      role
    }
  }
`;

const ADMIN_UNBAN_USER_MUTATION = /* GraphQL */ `
  mutation AdminUnbanUser($id: ID!) {
    adminUnbanUser(id: $id) {
      id
      email
      role
    }
  }
`;

const ADMIN_DELETE_USER_MUTATION = /* GraphQL */ `
  mutation AdminDeleteUser($id: ID!) {
    adminDeleteUser(id: $id)
  }
`;

const ADMIN_BULK_DELETE_USERS_MUTATION = /* GraphQL */ `
  mutation AdminBulkDeleteUsers($input: BulkActionInput!) {
    adminBulkDeleteUsers(input: $input)
  }
`;

const ADMIN_CREATE_INVITE_MUTATION = /* GraphQL */ `
  mutation AdminCreateInvite($input: CreateInviteInput!) {
    adminCreateInvite(input: $input) {
      id
      email
      token
      tier
      expiresAt
      createdAt
    }
  }
`;

const ADMIN_RESEND_INVITE_MUTATION = /* GraphQL */ `
  mutation AdminResendInvite($id: ID!) {
    adminResendInvite(id: $id) {
      id
      email
      expiresAt
      emailSent
    }
  }
`;

const ADMIN_REVOKE_INVITE_MUTATION = /* GraphQL */ `
  mutation AdminRevokeInvite($id: ID!) {
    adminRevokeInvite(id: $id)
  }
`;

const ADMIN_BULK_CREATE_INVITES_MUTATION = /* GraphQL */ `
  mutation AdminBulkCreateInvites($emails: [String!]!, $tier: String) {
    adminBulkCreateInvites(emails: $emails, tier: $tier) {
      id
      email
      token
      tier
      expiresAt
    }
  }
`;

const ADMIN_DELETE_WAITLIST_MUTATION = /* GraphQL */ `
  mutation AdminDeleteWaitlistEntry($id: ID!) {
    adminDeleteWaitlistEntry(id: $id)
  }
`;

const ADMIN_BULK_DELETE_WAITLIST_MUTATION = /* GraphQL */ `
  mutation AdminBulkDeleteWaitlist($input: BulkActionInput!) {
    adminBulkDeleteWaitlist(input: $input)
  }
`;

const ADMIN_CONVERT_WAITLIST_MUTATION = /* GraphQL */ `
  mutation AdminConvertWaitlistToInvite($id: ID!, $tier: String) {
    adminConvertWaitlistToInvite(id: $id, tier: $tier) {
      id
      email
      token
      tier
      expiresAt
    }
  }
`;

// Types
export interface AdminStats {
  totalUsers: number;
  usersThisWeek: number;
  usersLastWeek: number;
  growthPercent: number;
  totalWaitlist: number;
  waitlistToday: number;
  waitlistThisWeek: number;
  totalInvites: number;
  invitesAccepted: number;
  invitesPending: number;
  invitesExpired: number;
  inviteAcceptanceRate: number;
  totalReferrals: number;
  referralsConverted: number;
  referralsPending: number;
  referralConversionRate: number;
  tierDistribution: {
    johatsu: number;
    alpha: number;
    beta: number;
    public: number;
  };
  roleDistribution: {
    admin: number;
    moderator: number;
    user: number;
    banned: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  accessTier: string | null;
  referralCode: string | null;
  referralCount: number;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  notes: string | null;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  token: string;
  tier: string | null;
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
  inviterId: string | null;
  inviterName: string | null;
  emailSent: boolean;
}

export interface AdminReferral {
  id: string;
  referrerId: string;
  referrerEmail: string | null;
  referrerName: string | null;
  refereeEmail: string;
  status: string;
  createdAt: string;
  convertedAt: string | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Connection<T> {
  nodes: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface ExportResult {
  success: boolean;
  url: string | null;
  filename: string | null;
  rowCount: number;
}

// Query Hooks

export function useAdminStats(dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: adminQueryKeys.stats(dateRange),
    queryFn: () =>
      gqlRequest<{ adminStats: AdminStats }>(ADMIN_STATS_QUERY, { dateRange }),
    select: (data) => data.adminStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminUsers(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: adminQueryKeys.users(filters, pagination),
    queryFn: () =>
      gqlRequest<{ adminUsers: Connection<AdminUser> }>(ADMIN_USERS_QUERY, {
        filters,
        pagination,
      }),
    select: (data) => data.adminUsers,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminQueryKeys.user(id),
    queryFn: () =>
      gqlRequest<{ adminUser: AdminUser | null }>(ADMIN_USER_QUERY, { id }),
    select: (data) => data.adminUser,
    enabled: !!id,
  });
}

export function useAdminWaitlist(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: adminQueryKeys.waitlist(filters, pagination),
    queryFn: () =>
      gqlRequest<{ adminWaitlist: Connection<WaitlistEntry> }>(
        ADMIN_WAITLIST_QUERY,
        { filters, pagination }
      ),
    select: (data) => data.adminWaitlist,
  });
}

export function useAdminInvites(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: adminQueryKeys.invites(filters, pagination),
    queryFn: () =>
      gqlRequest<{ adminInvites: Connection<AdminInvite> }>(ADMIN_INVITES_QUERY, {
        filters,
        pagination,
      }),
    select: (data) => data.adminInvites,
  });
}

export function useAdminReferrals(
  filters?: Record<string, unknown>,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: adminQueryKeys.referrals(filters, pagination),
    queryFn: () =>
      gqlRequest<{ adminReferrals: Connection<AdminReferral> }>(
        ADMIN_REFERRALS_QUERY,
        { filters, pagination }
      ),
    select: (data) => data.adminReferrals,
  });
}

// Export Hooks

export function useExportUsers() {
  return useMutation({
    mutationFn: (filters?: Record<string, unknown>) =>
      gqlRequest<{ exportUsers: ExportResult }>(EXPORT_USERS_QUERY, { filters }),
    onSuccess: (data) => {
      if (data.exportUsers.url) {
        // Trigger download
        const link = document.createElement("a");
        link.href = data.exportUsers.url;
        link.download = data.exportUsers.filename || "users-export.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
}

export function useExportWaitlist() {
  return useMutation({
    mutationFn: (filters?: Record<string, unknown>) =>
      gqlRequest<{ exportWaitlist: ExportResult }>(EXPORT_WAITLIST_QUERY, {
        filters,
      }),
    onSuccess: (data) => {
      if (data.exportWaitlist.url) {
        const link = document.createElement("a");
        link.href = data.exportWaitlist.url;
        link.download = data.exportWaitlist.filename || "waitlist-export.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
}

export function useExportReferrals() {
  return useMutation({
    mutationFn: (filters?: Record<string, unknown>) =>
      gqlRequest<{ exportReferrals: ExportResult }>(EXPORT_REFERRALS_QUERY, {
        filters,
      }),
    onSuccess: (data) => {
      if (data.exportReferrals.url) {
        const link = document.createElement("a");
        link.href = data.exportReferrals.url;
        link.download = data.exportReferrals.filename || "referrals-export.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
}

// Mutation Hooks

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      gqlRequest<{ adminUpdateUser: AdminUser }>(ADMIN_UPDATE_USER_MUTATION, {
        id,
        input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      gqlRequest<{ adminBanUser: AdminUser }>(ADMIN_BAN_USER_MUTATION, {
        id,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ adminUnbanUser: AdminUser }>(ADMIN_UNBAN_USER_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ adminDeleteUser: boolean }>(ADMIN_DELETE_USER_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      gqlRequest<{ adminBulkDeleteUsers: number }>(
        ADMIN_BULK_DELETE_USERS_MUTATION,
        { input: { ids } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; tier?: string; expiresInDays?: number }) =>
      gqlRequest<{ adminCreateInvite: AdminInvite }>(
        ADMIN_CREATE_INVITE_MUTATION,
        { input }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ adminResendInvite: AdminInvite }>(ADMIN_RESEND_INVITE_MUTATION, {
        id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ adminRevokeInvite: boolean }>(ADMIN_REVOKE_INVITE_MUTATION, {
        id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useBulkCreateInvites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emails, tier }: { emails: string[]; tier?: string }) =>
      gqlRequest<{ adminBulkCreateInvites: AdminInvite[] }>(
        ADMIN_BULK_CREATE_INVITES_MUTATION,
        { emails, tier }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useDeleteWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ adminDeleteWaitlistEntry: boolean }>(
        ADMIN_DELETE_WAITLIST_MUTATION,
        { id }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.waitlist() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useBulkDeleteWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      gqlRequest<{ adminBulkDeleteWaitlist: number }>(
        ADMIN_BULK_DELETE_WAITLIST_MUTATION,
        { input: { ids } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.waitlist() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useConvertWaitlistToInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier?: string }) =>
      gqlRequest<{ adminConvertWaitlistToInvite: AdminInvite }>(
        ADMIN_CONVERT_WAITLIST_MUTATION,
        { id, tier }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.waitlist() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.invites() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}
