/**
 * Admin GraphQL Types
 *
 * Types for admin dashboard operations including:
 * - User management (list, update tier, ban)
 * - Waitlist management (list, export, convert)
 * - Invite management (list, create, resend, revoke)
 * - Referral management (list, export)
 * - Analytics and audit logs
 */

export const adminTypes = /* GraphQL */ `
  """Admin user with additional metadata"""
  type AdminUser {
    id: ID!
    email: String!
    name: String
    avatarUrl: String
    role: String!
    accessTier: String
    referralCode: String
    referralCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime
    lastLoginAt: DateTime
    groups: [Group!]
    notes: String
  }

  """Waitlist entry"""
  type WaitlistEntry {
    id: ID!
    email: String!
    source: String
    createdAt: DateTime!
    convertedAt: DateTime
    convertedUserId: ID
  }

  """Admin invite"""
  type AdminInvite {
    id: ID!
    email: String!
    token: String!
    tier: String
    acceptedAt: DateTime
    expiresAt: DateTime!
    createdAt: DateTime!
    inviterId: ID
    inviterName: String
    emailSent: Boolean!
  }

  """Referral entry"""
  type AdminReferral {
    id: ID!
    referrerId: ID!
    referrerEmail: String
    referrerName: String
    refereeEmail: String!
    status: String!
    createdAt: DateTime!
    convertedAt: DateTime
  }

  """Audit log entry"""
  type AuditLogEntry {
    id: ID!
    adminId: ID!
    adminEmail: String!
    action: String!
    targetType: String!
    targetId: ID
    details: JSON
    createdAt: DateTime!
  }

  """Admin stats summary"""
  type AdminStats {
    totalUsers: Int!
    usersThisWeek: Int!
    usersLastWeek: Int!
    growthPercent: Float!
    totalWaitlist: Int!
    waitlistToday: Int!
    waitlistThisWeek: Int!
    totalInvites: Int!
    invitesAccepted: Int!
    invitesPending: Int!
    invitesExpired: Int!
    inviteAcceptanceRate: Float!
    totalReferrals: Int!
    referralsConverted: Int!
    referralsPending: Int!
    referralConversionRate: Float!
    tierDistribution: TierDistribution!
    roleDistribution: RoleDistribution!
  }

  type TierDistribution {
    johatsu: Int!
    alpha: Int!
    beta: Int!
    public: Int!
  }

  type RoleDistribution {
    admin: Int!
    moderator: Int!
    user: Int!
    banned: Int!
  }

  """Paginated response wrapper"""
  type AdminUserConnection {
    nodes: [AdminUser!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type WaitlistConnection {
    nodes: [WaitlistEntry!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type InviteConnection {
    nodes: [AdminInvite!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type ReferralConnection {
    nodes: [AdminReferral!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type AuditLogConnection {
    nodes: [AuditLogEntry!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  """Export result"""
  type ExportResult {
    success: Boolean!
    url: String
    filename: String
    rowCount: Int!
  }
`;

export const adminInputs = /* GraphQL */ `
  input AdminUserFilters {
    search: String
    role: String
    accessTier: String
    dateFrom: DateTime
    dateTo: DateTime
  }

  input WaitlistFilters {
    search: String
    source: String
    converted: Boolean
    dateFrom: DateTime
    dateTo: DateTime
  }

  input InviteFilters {
    search: String
    tier: String
    status: String
    dateFrom: DateTime
    dateTo: DateTime
  }

  input ReferralFilters {
    search: String
    status: String
    dateFrom: DateTime
    dateTo: DateTime
  }

  input PaginationInput {
    limit: Int
    offset: Int
    cursor: String
  }

  input UpdateUserInput {
    role: String
    accessTier: String
    notes: String
  }

  input CreateInviteInput {
    email: String!
    tier: String
    expiresInDays: Int
  }

  input BulkActionInput {
    ids: [ID!]!
  }

  input DateRangeInput {
    from: DateTime!
    to: DateTime!
  }
`;

export const adminQueries = /* GraphQL */ `
  extend type Query {
    """Get admin dashboard stats"""
    adminStats(dateRange: DateRangeInput): AdminStats! @adminOnly

    """List users with filters and pagination"""
    adminUsers(
      filters: AdminUserFilters
      pagination: PaginationInput
    ): AdminUserConnection! @adminOnly

    """Get a single user by ID"""
    adminUser(id: ID!): AdminUser @adminOnly

    """List waitlist entries"""
    adminWaitlist(
      filters: WaitlistFilters
      pagination: PaginationInput
    ): WaitlistConnection! @adminOnly

    """List invites"""
    adminInvites(
      filters: InviteFilters
      pagination: PaginationInput
    ): InviteConnection! @adminOnly

    """List referrals"""
    adminReferrals(
      filters: ReferralFilters
      pagination: PaginationInput
    ): ReferralConnection! @adminOnly

    """Get audit log"""
    adminAuditLog(
      pagination: PaginationInput
      targetType: String
    ): AuditLogConnection! @adminOnly

    """Export users to CSV"""
    exportUsers(filters: AdminUserFilters): ExportResult! @adminOnly

    """Export waitlist to CSV"""
    exportWaitlist(filters: WaitlistFilters): ExportResult! @adminOnly

    """Export referrals to CSV"""
    exportReferrals(filters: ReferralFilters): ExportResult! @adminOnly
  }
`;

export const adminMutations = /* GraphQL */ `
  extend type Mutation {
    """Update a user's role or tier"""
    adminUpdateUser(id: ID!, input: UpdateUserInput!): AdminUser! @adminOnly

    """Ban a user"""
    adminBanUser(id: ID!, reason: String): AdminUser! @adminOnly

    """Unban a user"""
    adminUnbanUser(id: ID!): AdminUser! @adminOnly

    """Delete a user"""
    adminDeleteUser(id: ID!): Boolean! @adminOnly

    """Bulk delete users"""
    adminBulkDeleteUsers(input: BulkActionInput!): Int! @adminOnly

    """Create an invite"""
    adminCreateInvite(input: CreateInviteInput!): AdminInvite! @adminOnly

    """Resend an invite email"""
    adminResendInvite(id: ID!): AdminInvite! @adminOnly

    """Revoke an invite"""
    adminRevokeInvite(id: ID!): Boolean! @adminOnly

    """Bulk create invites"""
    adminBulkCreateInvites(emails: [String!]!, tier: String): [AdminInvite!]! @adminOnly

    """Delete waitlist entry"""
    adminDeleteWaitlistEntry(id: ID!): Boolean! @adminOnly

    """Bulk delete waitlist entries"""
    adminBulkDeleteWaitlist(input: BulkActionInput!): Int! @adminOnly

    """Convert waitlist entry to invite"""
    adminConvertWaitlistToInvite(id: ID!, tier: String): AdminInvite! @adminOnly

    """Add admin note to user"""
    adminAddUserNote(id: ID!, note: String!): AdminUser! @adminOnly
  }
`;
