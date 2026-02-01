/**
 * Guide GraphQL Type Definitions
 */

export const guideTypes = /* GraphQL */ `
  type DIYGuide {
    id: ID!
    title: String!
    url: String!
    source: GuideSource!
    subreddit: String
    upvotes: Int
    commentCount: Int
    postAge: String
    excerpt: String
    relevanceScore: Int
    focusArea: String
    wasClicked: Boolean!
    wasBookmarked: Boolean!
    wasHelpful: Boolean
    searchQuery: String
    issueCategory: String
    createdAt: DateTime!
    clickedAt: DateTime
  }

  # Guide difficulty levels for display
  enum GuideDifficulty {
    beginner
    intermediate
    advanced
  }

  # Individual guide with additional display info
  type GuideDetail {
    id: ID!
    title: String!
    description: String
    url: String!
    source: GuideSource!
    category: String!
    difficulty: GuideDifficulty!
    timeEstimate: String!
    rating: Float
    viewCount: Int
    isVideo: Boolean!
    isBookmarked: Boolean!
    progress: Int
    completedSteps: Int
    totalSteps: Int
    author: String
    createdAt: DateTime!
  }

  # Guide stats for sidebar
  type GuideStats {
    completedCount: Int!
    inProgressCount: Int!
    savedCount: Int!
    totalGuides: Int!
    totalSaved: Float!
    timeSaved: String!
  }

  # Savings data for chart
  type GuideSavingsData {
    month: String!
    saved: Float!
    wouldCost: Float!
  }

  # Complete guides page response
  type GuidesPageData {
    guides: [GuideDetail!]!
    stats: GuideStats!
    savingsOverTime: [GuideSavingsData!]!
    categories: [String!]!
    sources: [GuideSource!]!
  }
`;

export const guideInputs = /* GraphQL */ `
  input BookmarkGuideInput {
    guideId: ID!
    bookmarked: Boolean!
  }
`;

export const guideQueries = /* GraphQL */ `
  extend type Query {
    "Get user's saved DIY guides"
    myGuides(
      bookmarkedOnly: Boolean
      source: GuideSource
      limit: Int
    ): [DIYGuide!]!

    "Get comprehensive data for the guides page view"
    guidesPageData: GuidesPageData!
  }
`;

export const guideMutations = /* GraphQL */ `
  extend type Mutation {
    "Toggle bookmark on a guide"
    bookmarkGuide(input: BookmarkGuideInput!): DIYGuide!

    "Mark guide as helpful/not helpful"
    rateGuide(guideId: ID!, helpful: Boolean!): DIYGuide!

    "Track guide click (for analytics)"
    trackGuideClick(guideId: ID!): DIYGuide!

    "Update guide progress"
    updateGuideProgress(guideId: ID!, progress: Int!, completedSteps: Int): Boolean!
  }
`;
