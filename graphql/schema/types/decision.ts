/**
 * Decision GraphQL Type Definitions
 */

export const decisionTypes = /* GraphQL */ `
  type PPERequirement {
    item: String!
    priority: String!
    reason: String!
  }

  type DecisionOption {
    id: ID!
    type: OptionType!
    title: String!
    description: String
    costMin: String
    costMax: String
    timeEstimate: String
    riskLevel: String
    failureCost: String
    failureRisk: String
    diyViable: Boolean!
    diyWarning: String
    requiredSkills: [String!]
    requiredTools: [String!]
    requiredParts: [String!]
    recommended: Boolean!
    reasoning: String
    confidenceScore: Int
    ppe: [PPERequirement!]
    doNotProceedWithout: [String!]
    hazards: [String!]
    workLocation: String
    createdAt: DateTime!
    issue: Issue!
    products: [ProductRecommendation!]!
    vendors: [VendorContact!]!
  }

  type Decision {
    id: ID!
    assumptions: JSON
    revisitDate: DateTime
    approvedAt: DateTime!
    createdAt: DateTime!
    issue: Issue!
    selectedOption: DecisionOption!
    votes: [DecisionVote!]!
    voteCount: Int!
    approvalCount: Int!
  }

  type DecisionVote {
    id: ID!
    vote: VoteType!
    comment: String
    votedAt: DateTime!
    member: GroupMember!
  }

  type ProductRecommendation {
    id: ID!
    productName: String!
    productCategory: String
    estimatedCost: String
    storeName: String!
    storeAddress: String
    storeDistance: String
    storeUrl: String
    inStock: Boolean
    createdAt: DateTime!
  }

  type VendorContact {
    id: ID!
    vendorName: String!
    contactInfo: JSON
    quoteAmount: String
    quoteDetails: String
    rating: String
    reviewSummary: String
    specialties: [String!]
    distance: String
    address: String
    contacted: Boolean!
    emailDraft: String
    createdAt: DateTime!
  }
`;

export const decisionInputs = /* GraphQL */ `
  input VoteOnDecisionInput {
    decisionId: ID!
    vote: VoteType!
    comment: String
  }
`;

export const decisionQueries = /* GraphQL */ `
  extend type Query {
    "Get a decision option by ID"
    decisionOption(id: ID!): DecisionOption
  }
`;

export const decisionMutations = /* GraphQL */ `
  extend type Mutation {
    "Select an option and create a decision (coordinator/collaborator only)"
    selectDecisionOption(optionId: ID!, assumptions: JSON): Decision!

    "Vote on a decision"
    voteOnDecision(input: VoteOnDecisionInput!): DecisionVote!

    "Change your vote on a decision"
    changeVote(voteId: ID!, vote: VoteType!, comment: String): DecisionVote!

    "Mark a vendor as contacted"
    markVendorContacted(vendorId: ID!): VendorContact!

    "Add or update a vendor quote"
    addVendorQuote(vendorId: ID!, amount: String!, details: String): VendorContact!
  }
`;
