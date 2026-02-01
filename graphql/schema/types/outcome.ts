/**
 * Outcome GraphQL Type Definitions
 */

export const outcomeTypes = /* GraphQL */ `
  type BiasDetection {
    costBias: String
    timeBias: String
    categoryPattern: String
    userPattern: String
    confidence: Int
    sampleSize: Int
    recommendation: String
  }

  type PreferenceUpdate {
    field: String
    currentValue: String
    suggestedValue: String
    reason: String
    confidence: Int
    evidence: [String!]
  }

  type DecisionOutcome {
    id: ID!
    actualCost: String
    actualTime: String
    success: Boolean!
    completedAt: DateTime!
    costDelta: String
    timeDelta: String
    whatWentWell: String
    whatWentWrong: String
    lessonsLearned: String
    wouldDoAgain: Boolean
    biasDetected: BiasDetection
    preferenceUpdates: PreferenceUpdate
    createdAt: DateTime!
    updatedAt: DateTime!
    decision: Decision!
  }

  type PreferenceHistory {
    id: ID!
    field: String!
    oldValue: String
    newValue: String!
    reason: String
    changedBy: GroupMember
    changedAt: DateTime!
  }
`;

export const outcomeQueries = /* GraphQL */ `
  extend type Query {
    "Get outcome for a decision"
    decisionOutcome(decisionId: ID!): DecisionOutcome

    "Get preference history for a group"
    preferenceHistory(groupId: ID!, limit: Int): [PreferenceHistory!]!
  }
`;

export const outcomeMutations = /* GraphQL */ `
  extend type Mutation {
    "Record the actual outcome of a decision"
    recordOutcome(
      decisionId: ID!
      actualCost: String
      actualTime: String
      success: Boolean!
      whatWentWell: String
      whatWentWrong: String
      lessonsLearned: String
      wouldDoAgain: Boolean
    ): DecisionOutcome!
  }
`;
