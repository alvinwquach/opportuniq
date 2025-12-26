/**
 * Issue Tracking Domain Schema
 *
 * Everything related to problems that need fixing:
 * - Issues (repairs, fixes, projects)
 * - Evidence (photos, videos, observations)
 * - Comments and collaboration
 * - DIY scheduling
 * - AI-generated hypotheses
 */

export const issueTypeDefs = /* GraphQL */ `
  # ============================================
  # ISSUE TYPES
  # ============================================
  # Issues = problems that need fixing (car repair, appliance broken, leak, etc.)
  # Can be tracked solo or with group collaboration

  # Represents a problem/repair that needs addressing
  # Examples:
  #   - Solo: "My car's brake pads are squeaking"
  #   - Couple: "Kitchen faucet is leaking"
  #   - Roommates: "Dishwasher not working"
  #   - Family: "Roof has missing shingles"
  type Issue {
    id: ID!
    groupId: ID!                 # Which group this issue belongs to

    # What's the problem?
    title: String!               # REQUIRED - short description
    description: String          # OPTIONAL - detailed explanation

    # Flexible categorization
    category: IssueCategory      # OPTIONAL - AUTOMOTIVE, HOME_REPAIR, APPLIANCE, etc.
    subcategory: String          # OPTIONAL - flexible text: "Brakes", "Plumbing", etc.

    # Optional asset tracking
    # Example: assetName="2018 Honda Civic", assetDetails={vin: "...", mileage: 85000}
    assetName: String            # OPTIONAL - what item has the issue
    assetDetails: JSON           # OPTIONAL - flexible metadata about the asset

    # Issue tracking
    status: IssueStatus!         # REQUIRED - OPEN, INVESTIGATING, OPTIONS_GENERATED, etc.
    priority: IssuePriority!     # REQUIRED - LOW, MEDIUM, HIGH, URGENT
    confidenceLevel: Int         # OPTIONAL - AI's confidence in diagnosis (0-100)

    createdBy: ID!               # REQUIRED - which user created this issue
    createdAt: String!           # REQUIRED - when created
    updatedAt: String!           # REQUIRED - last update
    resolvedAt: String           # OPTIONAL - when issue was fixed (null if not resolved)

    # Relationships - what's attached to this issue
    evidence: [IssueEvidence!]!     # Photos, videos, observations
    hypotheses: [IssueHypothesis!]! # AI-generated diagnoses
    options: [DecisionOption!]!     # AI-generated repair options (DIY/hire/defer)
    decision: Decision              # OPTIONAL - chosen option (null if not decided yet)
    comments: [IssueComment!]!      # Discussion/collaboration
    diySchedules: [DiySchedule!]!   # Scheduled DIY work sessions
  }

  # Comments on an issue - for group collaboration and discussion
  # Solo users can leave notes to themselves, groups can discuss repair options
  type IssueComment {
    id: ID!
    issueId: ID!
    userId: ID!
    content: String!             # The comment text
    createdAt: String!
    updatedAt: String!

    # Relationships
    user: GroupMember!           # The group member who wrote this comment
  }

  # DIY project scheduling - coordinate with group members or set reminders for yourself
  # Examples: "Fix leaky faucet Saturday 10am", "Replace brake pads next weekend"
  type DiySchedule {
    id: ID!
    issueId: ID!
    scheduledTime: String!       # When the DIY work is scheduled (ISO 8601)
    estimatedDuration: Int       # How many minutes you expect it to take
    participants: JSON           # Array of user IDs who will help (empty array for solo)
    calendarEventId: String      # OPTIONAL - Google/Outlook calendar event ID
    createdBy: ID!
    createdAt: String!
    updatedAt: String!

    # Relationships
    creator: GroupMember!        # The member who scheduled this DIY session
  }

  # Evidence users upload to help AI diagnose issues
  # Photos/videos are end-to-end encrypted for privacy
  type IssueEvidence {
    id: ID!
    issueId: ID!
    evidenceType: EvidenceType!  # PHOTO, VIDEO, AUDIO, TEXT, OBSERVATION

    # E2E Encryption fields (for photos/videos)
    storageUrl: String           # OPTIONAL - where encrypted file is stored
    encryptionIv: String         # OPTIONAL - encryption initialization vector
    fileName: String             # OPTIONAL - original file name
    fileSize: Int                # OPTIONAL - file size in bytes
    mimeType: String             # OPTIONAL - e.g., "image/jpeg", "video/mp4"

    # Text content (not encrypted)
    content: String              # OPTIONAL - for TEXT or OBSERVATION types

    # AI-extracted information
    # Example: {objects: ["water stain", "mold"], colors: ["brown", "black"]}
    extractedInfo: JSON          # OPTIONAL - AI vision analysis results

    uploadedBy: ID!              # Who uploaded this evidence
    createdAt: String!           # When uploaded
  }

  # AI-generated hypothesis about what's causing the issue
  # Example: "Likely cause: Worn brake pads (confidence: 85%)"
  type IssueHypothesis {
    id: ID!
    issueId: ID!
    hypothesis: String!          # The AI's theory about the problem
    confidence: Int!             # How confident the AI is (0-100)
    evidenceUsed: JSON           # Which evidence pieces support this hypothesis
    reasoningChain: JSON         # Step-by-step AI reasoning
    createdAt: String!
  }

  # ============================================
  # ISSUE INPUT TYPES
  # ============================================

  # Create a new issue/repair
  input CreateIssueInput {
    groupId: ID!                 # REQUIRED - which group
    title: String!               # REQUIRED - short description
    description: String          # OPTIONAL - detailed explanation
    category: IssueCategory      # OPTIONAL - categorize the issue
    subcategory: String          # OPTIONAL - flexible subcategory
    assetName: String            # OPTIONAL - what item has the issue
    assetDetails: JSON           # OPTIONAL - metadata about the asset
    priority: IssuePriority      # OPTIONAL - defaults to MEDIUM
  }

  # Add a comment to an issue
  input CreateIssueCommentInput {
    issueId: ID!                 # REQUIRED - which issue
    content: String!             # REQUIRED - comment text
  }

  # Schedule a DIY work session
  input CreateDiyScheduleInput {
    issueId: ID!                 # REQUIRED - which issue
    scheduledTime: String!       # REQUIRED - when (ISO 8601)
    estimatedDuration: Int       # OPTIONAL - how many minutes
    participants: JSON           # OPTIONAL - array of user IDs who will help
  }

  # Update an existing issue
  input UpdateIssueInput {
    issueId: ID!                 # REQUIRED - which issue to update
    title: String                # OPTIONAL - update title
    description: String          # OPTIONAL - update description
    status: IssueStatus          # OPTIONAL - update status
    priority: IssuePriority      # OPTIONAL - update priority
    category: IssueCategory      # OPTIONAL - update category
    subcategory: String          # OPTIONAL - update subcategory
    assetName: String            # OPTIONAL - update asset name
    assetDetails: JSON           # OPTIONAL - update asset metadata
  }

  # Upload evidence for an issue (photo, video, observation, etc.)
  input CreateIssueEvidenceInput {
    issueId: ID!                 # REQUIRED - which issue
    evidenceType: EvidenceType!  # REQUIRED - PHOTO, VIDEO, AUDIO, TEXT, or OBSERVATION
    storageUrl: String           # OPTIONAL - encrypted file storage URL
    encryptionIv: String         # OPTIONAL - encryption initialization vector
    fileName: String             # OPTIONAL - original file name
    fileSize: Int                # OPTIONAL - file size in bytes
    mimeType: String             # OPTIONAL - e.g., "image/jpeg", "video/mp4"
    content: String              # OPTIONAL - text content for TEXT/OBSERVATION types
  }

  # Create an AI-generated hypothesis about issue cause
  input CreateIssueHypothesisInput {
    issueId: ID!                 # REQUIRED - which issue
    hypothesis: String!          # REQUIRED - AI's theory about the problem
    confidence: Int!             # REQUIRED - AI confidence (0-100)
    evidenceUsed: JSON           # OPTIONAL - which evidence supports this
    reasoningChain: JSON         # OPTIONAL - step-by-step AI reasoning
  }

`;
