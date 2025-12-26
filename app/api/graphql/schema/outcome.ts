/**
 * Outcome & Learning Domain Schema
 *
 * Everything related to repair outcomes and AI learning:
 * - How the repair actually went (vs. what was estimated)
 * - What went well / what went wrong
 * - Lessons learned for future decisions
 * - AI bias detection and preference updates
 *
 * This is how the AI gets smarter over time!
 */

export const outcomeTypeDefs = /* GraphQL */ `
  # ============================================
  # OUTCOME TYPES
  # ============================================
  # Track how the repair actually went vs. AI predictions

  # Represents the actual result of a repair decision
  # Compare AI estimates to reality to improve future recommendations
  # Example: AI said "$200, 2 hours" but actually cost "$275, 3.5 hours"
  type DecisionOutcome {
    id: ID!
    decisionId: ID!              # Which decision this outcome is for

    # Actual results
    actualCost: String           # OPTIONAL - what it really cost: "275.00"
    actualTime: String           # OPTIONAL - how long it really took: "3.5 hours"
    success: Boolean!            # REQUIRED - did the repair work?
    completedAt: String!         # When the repair was finished

    # Delta analysis (actual vs. estimated)
    # These help AI learn and improve predictions
    costDelta: String            # OPTIONAL - difference: "+75.00" or "-25.00"
    timeDelta: String            # OPTIONAL - difference: "+1.5 hours"

    # Learning & Reflection
    # User feedback to help AI improve
    whatWentWell: String         # OPTIONAL - what worked great
    whatWentWrong: String        # OPTIONAL - what didn't work
    lessonsLearned: String       # OPTIONAL - key takeaways
    wouldDoAgain: Boolean        # OPTIONAL - would you choose this option again?

    # AI Reflection & Learning
    # AI analyzes outcomes to improve future recommendations
    biasDetected: JSON           # OPTIONAL - did AI detect any biases in its prediction?
    preferenceUpdates: JSON      # OPTIONAL - how should AI adjust its recommendations?

    createdAt: String!           # When outcome was first recorded
    updatedAt: String!           # Last time outcome was updated
  }

  # ============================================
  # OUTCOME INPUT TYPES
  # ============================================

  # Record the actual outcome of a repair decision
  # Compare what AI predicted vs. what actually happened
  input CreateDecisionOutcomeInput {
    decisionId: ID!              # REQUIRED - which decision this is for
    actualCost: String           # OPTIONAL - what it really cost
    actualTime: String           # OPTIONAL - how long it really took
    success: Boolean!            # REQUIRED - did the repair work?
    completedAt: String!         # REQUIRED - when repair was finished (ISO 8601)
    whatWentWell: String         # OPTIONAL - what worked great
    whatWentWrong: String        # OPTIONAL - what didn't work
    lessonsLearned: String       # OPTIONAL - key takeaways for future
    wouldDoAgain: Boolean        # OPTIONAL - would you choose this option again?
  }

  # Update outcome with additional reflections or AI analysis
  input UpdateDecisionOutcomeInput {
    outcomeId: ID!               # REQUIRED - which outcome to update
    actualCost: String           # OPTIONAL - update actual cost
    actualTime: String           # OPTIONAL - update actual time
    costDelta: String            # OPTIONAL - calculated difference
    timeDelta: String            # OPTIONAL - calculated difference
    whatWentWell: String         # OPTIONAL - add/update reflection
    whatWentWrong: String        # OPTIONAL - add/update reflection
    lessonsLearned: String       # OPTIONAL - add/update lessons
    wouldDoAgain: Boolean        # OPTIONAL - update recommendation
    biasDetected: JSON           # OPTIONAL - AI's bias analysis
    preferenceUpdates: JSON      # OPTIONAL - suggested preference changes
  }

`;
