/**
 * Diagnose Page GraphQL Type Definitions
 *
 * Types for the AI-powered issue diagnosis interface.
 */

export const diagnoseTypes = /* GraphQL */ `
  "Data for the diagnose page view"
  type DiagnosePageData {
    "All issues available for diagnosis"
    issues: [DiagnoseIssue!]!

    "Currently selected issue (most recent active if not specified)"
    currentIssue: DiagnoseIssueDetail
  }

  "Issue summary for dropdown selector"
  type DiagnoseIssue {
    id: ID!
    title: String!
    icon: String
    iconColor: String!
    status: String!
    category: String
    createdAt: DateTime!
    isResolved: Boolean!
    confidence: Int
  }

  "Full issue details for the diagnosis view"
  type DiagnoseIssueDetail {
    id: ID!
    title: String!
    icon: String
    iconColor: String!
    status: String!
    category: String
    createdAt: DateTime!
    isResolved: Boolean!

    "AI diagnosis details"
    diagnosis: String
    difficulty: String!
    estimatedTime: String
    diyCost: Float
    proCost: Float
    confidence: Int!
    safetyNote: String

    "Chat messages for this issue"
    chatMessages: [DiagnoseChatMessage!]!

    "Repair guides from YouTube, iFixit, etc"
    guides: [DiagnoseGuide!]!

    "Parts needed with store availability"
    parts: [DiagnosePart!]!

    "Professional service providers"
    pros: [DiagnosePro!]!
  }

  "Chat message in the diagnosis conversation"
  type DiagnoseChatMessage {
    id: ID!
    role: String!
    content: String!
    hasImage: Boolean!
    hasVoice: Boolean!
    visionAnalysis: Boolean!
    createdAt: DateTime!
  }

  "Step in a repair guide"
  type DiagnoseGuideStep {
    stepNumber: Int!
    title: String!
    description: String!
  }

  "Repair guide recommendation"
  type DiagnoseGuide {
    id: ID!
    source: String!
    title: String!
    url: String
    duration: String
    steps: Int
    stepContent: [DiagnoseGuideStep!]
    toolsNeeded: [String!]
    rating: Float
    icon: String!
  }

  "Part needed for DIY repair"
  type DiagnosePart {
    id: ID!
    name: String!
    price: Float!
    store: String!
    distance: String
    inStock: Boolean!
    storeUrl: String
    isPPE: Boolean
  }

  "Professional service provider"
  type DiagnosePro {
    id: ID!
    name: String!
    rating: Float!
    reviews: Int!
    distance: String!
    price: Float!
    available: String
    source: String!
    email: String
    phone: String
    specialty: String
  }
`;

export const diagnoseQueries = /* GraphQL */ `
  extend type Query {
    "Get comprehensive data for the diagnose page"
    diagnosePageData(issueId: ID): DiagnosePageData!
  }
`;
