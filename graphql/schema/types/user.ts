/**
 * User GraphQL Type Definitions
 */

export const userTypes = /* GraphQL */ `
  type UserPreferences {
    language: String
    theme: String
    emailNotifications: Boolean
    smsNotifications: Boolean
    weeklyDigest: Boolean
    unitSystem: String
    currency: String
  }

  type User {
    id: ID!
    email: String!
    name: String
    avatarUrl: String
    city: String
    stateProvince: String
    postalCode: String
    country: String
    preferences: UserPreferences
    monthlyBudget: String
    emergencyBuffer: String
    riskTolerance: UserRiskTolerance
    createdAt: DateTime!
    lastSeenAt: DateTime
    groups: [Group!]!
    guides: [DIYGuide!]!
    groupCount: Int!
  }
`;

export const userQueries = /* GraphQL */ `
  extend type Query {
    "Get the currently authenticated user"
    me: User
  }
`;

export const userMutations = /* GraphQL */ `
  extend type Mutation {
    "Update current user's profile"
    updateProfile(
      name: String
      city: String
      stateProvince: String
      postalCode: String
      country: String
      monthlyBudget: String
      emergencyBuffer: String
      riskTolerance: UserRiskTolerance
    ): User!

    "Update user preferences"
    updatePreferences(
      language: String
      theme: String
      emailNotifications: Boolean
      smsNotifications: Boolean
      weeklyDigest: Boolean
      unitSystem: String
      currency: String
    ): User!
  }
`;
