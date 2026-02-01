/**
 * Issue GraphQL Type Definitions
 */

export const issueTypes = /* GraphQL */ `
  type IssueEvidence {
    id: ID!
    evidenceType: String!
    fileName: String
    fileSize: Int
    mimeType: String
    content: String
    storageUrl: String
    extractedInfo: JSON
    createdAt: DateTime!
    uploadedBy: GroupMember!
  }

  type IssueHypothesis {
    id: ID!
    hypothesis: String
    confidence: Int!
    evidenceUsed: JSON
    reasoningChain: JSON
    createdAt: DateTime!
  }

  type IssueComment {
    id: ID!
    content: String
    createdAt: DateTime!
    updatedAt: DateTime!
    author: GroupMember!
  }

  type Issue {
    id: ID!
    title: String
    description: String
    category: IssueCategory
    subcategory: String
    assetName: String
    assetDetails: JSON
    status: IssueStatus!
    priority: IssuePriority!
    confidenceLevel: Int
    diagnosis: String
    severity: Severity
    urgency: Urgency
    ignoreRisk: String
    warningSignsToWatch: [String!]
    whenToEscalate: String
    isEmergency: Boolean!
    emergencyInstructions: String
    emergencyType: String
    resolutionType: ResolutionType
    resolutionNotes: String
    resolvedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    completedAt: DateTime
    group: Group!
    createdBy: GroupMember!
    resolvedBy: GroupMember
    evidence: [IssueEvidence!]!
    hypotheses: [IssueHypothesis!]!
    comments: [IssueComment!]!
    options: [DecisionOption!]!
    decision: Decision
    evidenceCount: Int!
    commentCount: Int!
  }
`;

export const issueInputs = /* GraphQL */ `
  input CreateIssueInput {
    groupId: ID!
    title: String!
    description: String
    category: IssueCategory
    subcategory: String
    priority: IssuePriority
    assetName: String
    assetDetails: JSON
  }

  input UpdateIssueInput {
    title: String
    description: String
    category: IssueCategory
    subcategory: String
    priority: IssuePriority
    status: IssueStatus
    assetName: String
    assetDetails: JSON
  }

  input ResolveIssueInput {
    resolutionType: ResolutionType!
    resolutionNotes: String
  }

  input AddCommentInput {
    issueId: ID!
    content: String!
  }
`;

export const issueQueries = /* GraphQL */ `
  extend type Query {
    "Get an issue by ID (must be member of issue's group)"
    issue(id: ID!): Issue

    "Get issues for a group with optional filters"
    issues(
      groupId: ID!
      status: IssueStatus
      priority: IssuePriority
      category: IssueCategory
      limit: Int
      offset: Int
    ): [Issue!]!

    "Get comprehensive data for the issues page view"
    issuesPageData: IssuesPageData!
  }

  "Comprehensive data for the issues page with stats, charts, and issues"
  type IssuesPageData {
    # Stats cards
    totalSaved: Float!
    diyCount: Int!
    proCount: Int!
    activeIssueCount: Int!

    # All issues for client-side filtering
    issues: [IssueWithDetails!]!

    # Chart data
    savingsOverTime: [MonthlySavingsPoint!]!
    categoryDistribution: [CategoryCount!]!
    resolutionBreakdown: IssueResolutionStats!

    # Filter options (derived from data)
    groups: [GroupOption!]!
    categories: [String!]!
  }

  "Issue with all details needed for the issues page UI"
  type IssueWithDetails {
    id: ID!
    title: String!
    status: IssueStatus!
    priority: IssuePriority!
    category: String
    groupId: ID!
    groupName: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    diagnosis: String
    confidence: Int
    diyCost: Float
    proCost: Float
    resolvedAt: DateTime
    resolvedBy: String
    savedAmount: Float
  }

  "Category count for pie chart"
  type CategoryCount {
    name: String!
    value: Int!
    color: String!
  }

  "Resolution stats for bar chart"
  type IssueResolutionStats {
    diy: Int!
    pro: Int!
    diySuccessRate: Float!
  }

  "Monthly savings point for area chart"
  type MonthlySavingsPoint {
    month: String!
    savings: Float!
    issues: Int!
  }

  "Group option for filter dropdown"
  type GroupOption {
    id: ID!
    name: String!
  }
`;

export const issueMutations = /* GraphQL */ `
  extend type Mutation {
    "Create a new issue"
    createIssue(input: CreateIssueInput!): Issue!

    "Update an existing issue"
    updateIssue(id: ID!, input: UpdateIssueInput!): Issue!

    "Mark an issue as resolved"
    resolveIssue(id: ID!, input: ResolveIssueInput!): Issue!

    "Reopen a completed/deferred issue"
    reopenIssue(id: ID!): Issue!

    "Delete an issue (coordinator/collaborator or creator only)"
    deleteIssue(id: ID!): Boolean!

    "Add a comment to an issue"
    addComment(input: AddCommentInput!): IssueComment!

    "Edit a comment (author only)"
    editComment(id: ID!, content: String!): IssueComment!

    "Delete a comment (author or coordinator only)"
    deleteComment(id: ID!): Boolean!
  }
`;
