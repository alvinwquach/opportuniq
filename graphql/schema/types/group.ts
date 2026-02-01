/**
 * Group GraphQL Type Definitions
 */

export const groupTypes = /* GraphQL */ `
  type GroupMember {
    id: ID!
    role: GroupRole!
    status: MemberStatus!
    invitedAt: DateTime!
    joinedAt: DateTime
    user: User!
    group: Group!
  }

  type GroupConstraints {
    id: ID!
    monthlyBudget: String
    emergencyBuffer: String
    sharedBalance: String!
    riskTolerance: RiskTolerance
    diyPreference: DiyPreference
    neverDIY: [String!]
  }

  type Group {
    id: ID!
    name: String!
    postalCode: String
    defaultSearchRadius: Int
    createdAt: DateTime!
    members: [GroupMember!]!
    activeMembers: [GroupMember!]!
    constraints: GroupConstraints
    issues(status: IssueStatus, limit: Int): [Issue!]!
    memberCount: Int!
    issueCount: Int!
    activeIssueCount: Int!
  }

  type GroupInvitation {
    id: ID!
    email: String!
    role: GroupRole!
    message: String
    invitedAt: DateTime!
    expiresAt: DateTime
    group: Group!
    invitedBy: GroupMember!
  }
`;

export const groupInputs = /* GraphQL */ `
  input CreateGroupInput {
    name: String!
    postalCode: String
    defaultSearchRadius: Int
  }

  input UpdateGroupInput {
    name: String
    postalCode: String
    defaultSearchRadius: Int
  }

  input UpdateGroupConstraintsInput {
    monthlyBudget: String
    emergencyBuffer: String
    riskTolerance: RiskTolerance
    diyPreference: DiyPreference
    neverDIY: [String!]
  }
`;

export const groupQueries = /* GraphQL */ `
  extend type Query {
    "Get a group by ID (must be a member)"
    group(id: ID!): Group

    "Get all groups the user belongs to"
    myGroups: [Group!]!

    "Get pending invitations for a group (coordinators only)"
    groupInvitations(groupId: ID!): [GroupInvitation!]!

    "Get user's pending invitations to join groups"
    myPendingInvitations: [GroupInvitation!]!

    "Get comprehensive data for the groups page view"
    groupsPageData: GroupsPageData!
  }

  "Comprehensive data for the groups page with stats, charts, and group details"
  type GroupsPageData {
    # Summary stats (across all groups)
    totalGroups: Int!
    totalMembers: Int!
    totalSavings: Float!
    totalIssues: Int!
    activeIssueCount: Int!
    resolvedIssueCount: Int!

    # All groups for sidebar
    groups: [GroupWithStats!]!

    # Currently selected group details (first group by default)
    selectedGroup: GroupDetails
  }

  "Group with summary stats for sidebar display"
  type GroupWithStats {
    id: ID!
    name: String!
    postalCode: String
    role: GroupRole!
    memberCount: Int!
    issueCount: Int!
    activeIssueCount: Int!
    resolvedCount: Int!
    savings: Float!
    members: [GroupMemberPreview!]!
    createdAt: DateTime!
  }

  "Preview of group member for avatar display"
  type GroupMemberPreview {
    id: ID!
    name: String
    avatar: String
    role: GroupRole!
  }

  "Full group details for main content area"
  type GroupDetails {
    id: ID!
    name: String!
    postalCode: String
    role: GroupRole!
    createdAt: DateTime!

    # Stats cards
    openIssueCount: Int!
    resolvedCount: Int!
    balance: Float!
    savings: Float!
    monthlyBudget: Float
    monthlySpent: Float!
    emergencyFund: Float

    # Members list
    members: [GroupMemberDetails!]!
    pendingInvitations: [GroupPendingInvitation!]!

    # Budget info
    budgetUsedPercent: Float!
    diyRate: Float!

    # Charts data
    contributionData: [MemberContribution!]!
    monthlySavingsData: [GroupMonthlySavings!]!
    resolutionData: [GroupResolutionData!]!

    # Recent issues
    recentIssues: [GroupRecentIssue!]!

    # Recent activity
    recentActivity: [GroupActivityItem!]!
  }

  "Full member details"
  type GroupMemberDetails {
    id: ID!
    userId: ID!
    name: String
    email: String!
    avatar: String
    role: GroupRole!
    joinedAt: DateTime
    contributions: Float!
    issuesCreated: Int!
    issuesResolved: Int!
  }

  "Pending invitation info"
  type GroupPendingInvitation {
    id: ID!
    email: String!
    role: GroupRole!
    createdAt: DateTime!
    expiresAt: DateTime!
  }

  "Member contribution for pie chart"
  type MemberContribution {
    name: String!
    value: Float!
    color: String!
  }

  "Monthly savings point for area chart"
  type GroupMonthlySavings {
    month: String!
    savings: Float!
    spent: Float!
  }

  "Resolution data by group for bar chart"
  type GroupResolutionData {
    name: String!
    diy: Int!
    hired: Int!
  }

  "Recent issue for list display"
  type GroupRecentIssue {
    id: ID!
    title: String!
    category: String
    status: IssueStatus!
    priority: IssuePriority!
    createdAt: DateTime!
  }

  "Activity item for feed display"
  type GroupActivityItem {
    id: ID!
    type: String!
    message: String!
    memberName: String
    memberAvatar: String
    savings: Float
    timestamp: DateTime!
  }
`;

export const groupMutations = /* GraphQL */ `
  extend type Mutation {
    "Create a new group (user becomes coordinator)"
    createGroup(input: CreateGroupInput!): Group!

    "Update group settings (coordinator/collaborator only)"
    updateGroup(id: ID!, input: UpdateGroupInput!): Group!

    "Update group budget constraints (coordinator/collaborator only)"
    updateGroupConstraints(groupId: ID!, input: UpdateGroupConstraintsInput!): GroupConstraints!

    "Invite a member to the group (coordinator/collaborator only)"
    inviteMember(groupId: ID!, email: String!, role: GroupRole!): GroupMember!

    "Remove a member from the group (coordinator only)"
    removeMember(groupId: ID!, memberId: ID!): Boolean!

    "Leave a group (can't leave if only coordinator)"
    leaveGroup(groupId: ID!): Boolean!

    "Accept a group invitation"
    acceptInvitation(invitationId: ID!): GroupMember!

    "Decline a group invitation"
    declineInvitation(invitationId: ID!): Boolean!

    "Update a member's role (coordinator only)"
    updateMemberRole(groupId: ID!, memberId: ID!, role: GroupRole!): GroupMember!
  }
`;
