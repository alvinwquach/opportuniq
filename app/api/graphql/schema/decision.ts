/**
 * Decision & AI Recommendations Domain Schema
 *
 * Everything related to AI-generated repair options and group decision-making:
 * - Decision options (DIY, hire, defer, replace)
 * - Cost/time/risk analysis
 * - Product recommendations (where to buy parts)
 * - Vendor contacts (service providers)
 * - Group voting (optional, for collaborative decisions)
 * - Scenario simulations
 */

export const decisionTypeDefs = /* GraphQL */ `
  # ============================================
  # DECISION OPTION TYPES
  # ============================================
  # AI-generated repair options with cost, time, and risk analysis

  # Represents a repair option suggested by AI
  # Example options for "dishwasher not draining":
  #   Option 1 (DIY): Clean drain filter - $0, 30min, LOW risk
  #   Option 2 (HIRE): Call plumber - $150-250, same day, MEDIUM risk
  #   Option 3 (REPLACE): Buy new dishwasher - $400-800, 2-3 days, LOW risk
  type DecisionOption {
    id: ID!
    issueId: ID!                 # Which issue this option solves
    type: OptionType!            # DIY, HIRE, DEFER, or REPLACE

    # What is this option?
    title: String!               # Short description: "Clean drain filter"
    description: String          # OPTIONAL - detailed steps or explanation

    # Cost & Time estimates
    costMin: String              # OPTIONAL - minimum cost: "0.00" or "150.00"
    costMax: String              # OPTIONAL - maximum cost: "0.00" or "250.00"
    timeEstimate: String         # OPTIONAL - e.g., "30 minutes", "2-3 days"

    # Risk Assessment
    riskLevel: RiskLevel         # OPTIONAL - LOW, MEDIUM, HIGH, CATASTROPHIC
    failureCost: String          # OPTIONAL - cost if this option fails
    failureRisk: String          # OPTIONAL - probability/description of failure
    category: IssueCategory      # OPTIONAL - same as issue category

    # DIY Safety & Requirements
    diyViable: Boolean           # OPTIONAL - is DIY feasible for this issue?
    diyWarning: String           # OPTIONAL - safety warnings for DIY
    requiredSkills: [String!]    # OPTIONAL - skills needed: ["basic plumbing", "electrical"]
    requiredTools: [String!]     # OPTIONAL - tools needed: ["screwdriver", "wrench"]
    requiredParts: [String!]     # OPTIONAL - parts needed: ["drain filter", "hose clamp"]

    # AI Reasoning
    recommended: Boolean!        # REQUIRED - does AI recommend this option?
    reasoning: String            # OPTIONAL - why AI recommends/doesn't recommend
    confidenceScore: Int         # OPTIONAL - AI's confidence (0-100)

    createdAt: String!           # When AI generated this option

    # Relationships
    simulations: [OptionSimulation!]!      # What-if scenarios
    productRecommendations: [ProductRecommendation!]!  # Where to buy parts
  }

  # What-if scenario simulation for an option
  # Example: "If you defer this repair 6 months, cost could increase to $500"
  type OptionSimulation {
    id: ID!
    optionId: ID!
    scenarioType: String!        # E.g., "defer_6_months", "best_case", "worst_case"
    scenarioDescription: String  # OPTIONAL - human-readable description
    projectedOutcome: JSON       # Projected results: cost, time, risk changes
    createdAt: String!
  }

  # Product recommendation for DIY option
  # Example: "Dishwasher drain filter - $12 at Home Depot (2.3 miles away)"
  type ProductRecommendation {
    id: ID!
    optionId: ID!

    # Product details
    productName: String!         # E.g., "GE Dishwasher Drain Filter WD12X10207"
    productCategory: String      # OPTIONAL - e.g., "Appliance Parts"
    estimatedCost: String        # OPTIONAL - e.g., "12.00"

    # Where to buy
    storeName: String!           # E.g., "Home Depot", "Amazon", "AutoZone"
    storeAddress: String         # OPTIONAL - physical store address
    storeDistance: String        # OPTIONAL - distance from user: "2.3 miles"
    storeUrl: String             # OPTIONAL - online link to product
    inStock: Boolean             # OPTIONAL - is it available now?

    searchedAt: String!          # When AI searched for this product
    createdAt: String!
  }

  # ============================================
  # DECISION & VOTING TYPES
  # ============================================
  # Final decision on which option to pursue

  # Represents the chosen repair option
  # After reviewing AI options, group (or solo user) picks one
  type Decision {
    id: ID!
    issueId: ID!
    selectedOptionId: ID!        # Which option was chosen

    # Context & Planning
    assumptions: JSON            # OPTIONAL - assumptions made when deciding
    revisitDate: String          # OPTIONAL - when to check if still the right choice

    approvedAt: String!          # When decision was finalized
    createdAt: String!

    # Relationships
    selectedOption: DecisionOption!       # The chosen option
    votes: [DecisionVote!]!              # Group member votes (empty for solo)
    vendorContacts: [VendorContact!]!    # Service providers contacted
    outcome: DecisionOutcome             # OPTIONAL - how it actually went (null until completed)
  }

  # Group member vote on a decision (OPTIONAL - mainly for groups, not solo)
  # Voting helps groups agree on major repair decisions
  # For emergencies or solo users, skip voting and just make the decision
  # Example: Roommates voting on "Fix dishwasher ($200) vs Replace ($800)"
  type DecisionVote {
    id: ID!
    decisionId: ID!
    memberId: ID!                # Which group member voted
    vote: VoteType!              # APPROVE, REJECT, or ABSTAIN
    comment: String              # OPTIONAL - why they voted this way
    votedAt: String!             # When they voted
  }

  # ============================================
  # VENDOR/SERVICE PROVIDER TYPES
  # ============================================

  # Contact information for a service provider
  # Example: "ABC Plumbing - $150 quote, 4.5 stars, 3 miles away"
  type VendorContact {
    id: ID!
    optionId: ID                 # OPTIONAL - which option recommended this vendor
    issueId: ID                  # OPTIONAL - which issue this vendor can fix

    # Vendor info
    vendorName: String!          # E.g., "ABC Plumbing", "Joe's Auto Repair"
    contactInfo: JSON            # Phone, email, website, address
    quoteAmount: String          # OPTIONAL - quoted price if available
    quoteDetails: String         # OPTIONAL - what quote includes
    rating: String               # OPTIONAL - star rating or score
    reviewSummary: String        # OPTIONAL - summary of reviews
    specialties: [String!]       # OPTIONAL - what they specialize in
    distance: String             # OPTIONAL - distance from user

    contacted: Boolean!          # Has the vendor been contacted yet?
    emailDraft: String           # OPTIONAL - AI-generated email to send
    createdAt: String!
  }

  # ============================================
  # DECISION INPUT TYPES
  # ============================================

  # Create a decision option (AI-generated repair strategy)
  input CreateDecisionOptionInput {
    issueId: ID!                 # REQUIRED - which issue this solves
    type: OptionType!            # REQUIRED - DIY, HIRE, DEFER, or REPLACE
    title: String!               # REQUIRED - e.g., "Clean drain filter"
    description: String          # OPTIONAL - detailed explanation
    costMin: String              # OPTIONAL - minimum cost estimate
    costMax: String              # OPTIONAL - maximum cost estimate
    timeEstimate: String         # OPTIONAL - e.g., "30 minutes", "2-3 days"
    riskLevel: RiskLevel         # OPTIONAL - LOW, MEDIUM, HIGH, CATASTROPHIC
    failureCost: String          # OPTIONAL - cost if option fails
    failureRisk: String          # OPTIONAL - failure probability/description
    category: IssueCategory      # OPTIONAL - same as issue category
    diyViable: Boolean           # OPTIONAL - is DIY safe/feasible?
    diyWarning: String           # OPTIONAL - safety warnings for DIY
    requiredSkills: [String!]    # OPTIONAL - skills needed
    requiredTools: [String!]     # OPTIONAL - tools needed
    requiredParts: [String!]     # OPTIONAL - parts needed
    recommended: Boolean         # OPTIONAL - AI's top recommendation (defaults false)
    reasoning: String            # OPTIONAL - why AI recommends/doesn't recommend
    confidenceScore: Int         # OPTIONAL - AI confidence (0-100)
  }

  # Create a what-if scenario simulation
  input CreateOptionSimulationInput {
    optionId: ID!                # REQUIRED - which option to simulate
    scenarioType: String!        # REQUIRED - e.g., "defer_6_months", "worst_case"
    scenarioDescription: String  # OPTIONAL - human-readable description
    projectedOutcome: JSON       # OPTIONAL - projected results
  }

  # Create a product recommendation for DIY option
  input CreateProductRecommendationInput {
    optionId: ID!                # REQUIRED - which option needs this product
    productName: String!         # REQUIRED - specific product name
    productCategory: String      # OPTIONAL - e.g., "Appliance Parts"
    estimatedCost: String        # OPTIONAL - price
    storeName: String!           # REQUIRED - where to buy
    storeAddress: String         # OPTIONAL - physical location
    storeDistance: String        # OPTIONAL - distance from user
    storeUrl: String             # OPTIONAL - product page URL
    inStock: Boolean             # OPTIONAL - availability
  }

  # Finalize a decision (choose which option to pursue)
  input CreateDecisionInput {
    issueId: ID!                 # REQUIRED - which issue
    selectedOptionId: ID!        # REQUIRED - which option chosen
    assumptions: JSON            # OPTIONAL - context/assumptions made
    revisitDate: String          # OPTIONAL - when to re-evaluate (ISO 8601)
  }

  # Record a group member's vote on a decision
  input CreateDecisionVoteInput {
    decisionId: ID!              # REQUIRED - which decision
    vote: VoteType!              # REQUIRED - APPROVE, REJECT, or ABSTAIN
    comment: String              # OPTIONAL - explanation for vote
  }

  # Add a vendor/service provider contact
  input CreateVendorContactInput {
    issueId: ID                  # OPTIONAL - which issue (if not option-specific)
    optionId: ID                 # OPTIONAL - which option (if specific to an option)
    vendorName: String!          # REQUIRED - business name
    contactInfo: JSON            # OPTIONAL - phone, email, website, etc.
    quoteAmount: String          # OPTIONAL - quoted price
    quoteDetails: String         # OPTIONAL - what quote includes
    rating: String               # OPTIONAL - star rating
    reviewSummary: String        # OPTIONAL - summary of reviews
    specialties: [String!]       # OPTIONAL - what they specialize in
    distance: String             # OPTIONAL - distance from user
    emailDraft: String           # OPTIONAL - AI-generated email template
  }

  # Update vendor contact status
  input UpdateVendorContactInput {
    vendorContactId: ID!         # REQUIRED - which vendor
    contacted: Boolean           # OPTIONAL - mark as contacted
    quoteAmount: String          # OPTIONAL - update quote
    quoteDetails: String         # OPTIONAL - update quote details
  }

`;
