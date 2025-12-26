/**
 * DIY Guide Domain Schema
 *
 * Everything related to AI-generated step-by-step repair guides:
 * - Guides (repair instructions with 3D demos)
 * - Guide steps (individual instructions)
 * - User progress tracking
 * - Public guide library
 *
 * Guides can be generated from user issues or created manually
 */

export const guideTypeDefs = /* GraphQL */ `
  # ============================================
  # GUIDE TYPES
  # ============================================

  # Represents a step-by-step repair guide
  # Can be AI-generated from a user's issue or manually created
  # Examples: "How to Replace Brake Pads", "Fix a Leaky Faucet"
  type Guide {
    id: ID!
    title: String!               # E.g., "How to Replace Brake Pads on a Honda Civic"
    description: String          # OPTIONAL - overview of what this guide teaches
    difficulty: String           # OPTIONAL - "Beginner", "Intermediate", "Advanced"
    estimatedDuration: Int       # OPTIONAL - total time in minutes

    # Required materials
    # [String!] = OPTIONAL array of REQUIRED strings (array can be null, items can't be null)
    requiredTools: [String!]     # OPTIONAL - e.g., ["Socket wrench", "Jack stands"]
    requiredSkills: [String!]    # OPTIONAL - e.g., ["Basic mechanical knowledge"]
    requiredParts: [String!]     # OPTIONAL - e.g., ["Brake pads", "Brake cleaner"]

    # AI metadata
    generatedFromIssueId: ID     # OPTIONAL - which issue generated this guide
    aiGenerated: Boolean!        # REQUIRED - was this AI-generated or manually created?
    aiModel: String              # OPTIONAL - AI model used (e.g., "gpt-4-turbo-2024-01-25")
    aiConfidence: Int            # OPTIONAL - AI confidence score (0-100)
    sources: [GuideSource!]      # OPTIONAL - where AI found this information

    # Authorship
    createdById: ID              # OPTIONAL - user who triggered generation (null for system)
    createdAt: String!
    updatedAt: String!

    # Visibility
    isPublic: Boolean!           # REQUIRED - can other users see this guide?
                                 # false = private (only you can see)
                                 # true = public (searchable by all users)

    # Analytics
    viewCount: Int!              # How many times this guide has been viewed
    completionCount: Int!        # How many users completed this guide

    # Relationships
    steps: [GuideStep!]!              # The step-by-step instructions
    generatedFromIssue: Issue         # OPTIONAL - original issue (if AI-generated)
    createdBy: User                   # OPTIONAL - author (if manually created)
  }

  # Represents a single step in a guide
  # Example: "Step 1: Jack up the car and remove the wheel"
  type GuideStep {
    id: ID!
    guideId: ID!
    stepNumber: Int!             # 1, 2, 3, etc.
    title: String!               # Short step title
    description: String          # OPTIONAL - detailed instructions

    # Media
    imageUrl: String             # OPTIONAL - photo showing this step
    videoUrl: String             # OPTIONAL - video demonstration

    # Interactive 3D (optional)
    # Links to our 3D demos (brake pads, headlight fog, etc.)
    demoId: String               # OPTIONAL - which 3D demo to show
    defaultCamera: String        # OPTIONAL - which camera angle to use

    # Safety & Tips
    # [String!]! = REQUIRED array of REQUIRED strings (never null, items never null)
    warnings: [String!]          # OPTIONAL - safety warnings for this step
    tips: [String!]              # OPTIONAL - helpful tips for this step

    # Time
    estimatedDuration: Int       # OPTIONAL - minutes for this step

    createdAt: String!
    updatedAt: String!
  }

  # Tracks a user's progress through a guide
  # Example: User is on step 3 of 5, has completed steps 1 and 2
  type UserGuideProgress {
    id: ID!
    userId: ID!
    guideId: ID!

    # Progress tracking
    currentStepId: ID            # OPTIONAL - which step user is currently on
    completedStepIds: [String!]! # Steps user has finished
    isCompleted: Boolean!        # Has user finished the entire guide?

    # Feedback
    rating: Int                  # OPTIONAL - user's rating (1-5 stars)
    feedback: String             # OPTIONAL - user's comments about the guide

    # Timing
    startedAt: String!           # When user first opened this guide
    completedAt: String          # OPTIONAL - when user finished (null if not completed)
    lastAccessedAt: String!      # Last time user viewed this guide

    # Relationships
    user: User!
    guide: Guide!
    currentStep: GuideStep       # OPTIONAL - the step user is on
  }

  # Represents a source where AI found information for a guide
  # Used for attribution, legal protection, and quality tracking
  # Example: Reddit post, YouTube video, manufacturer manual
  type GuideSource {
    url: String!                 # Source URL
    type: String!                # "reddit", "youtube", "forum", "manual", "article", "blog"
    title: String!               # Source title
    author: String               # OPTIONAL - author/creator
    scrapedAt: String!           # When AI scraped this source
    relevanceScore: Float        # OPTIONAL - how relevant (0.0-1.0)
  }

  # Represents a 3D model asset for interactive repair demos
  # Maps demoId to actual 3D model files and metadata
  type DemoModel {
    id: ID!
    demoId: String!              # Unique identifier (e.g., "brake-pad-demo")
    name: String!                # Display name
    description: String          # OPTIONAL - what this demo teaches
    modelUrl: String!            # URL to .glb 3D model file
    thumbnailUrl: String         # OPTIONAL - preview image
    metadata: JSON               # Camera positions, animations, hints
    createdAt: String!
    updatedAt: String!
  }

  # ============================================
  # GUIDE INPUT TYPES
  # ============================================

  # Create a new guide (manually or AI-generated)
  input CreateGuideInput {
    title: String!               # REQUIRED
    description: String          # OPTIONAL
    difficulty: String           # OPTIONAL
    estimatedDuration: Int       # OPTIONAL
    requiredTools: [String!]     # OPTIONAL
    requiredSkills: [String!]    # OPTIONAL
    requiredParts: [String!]     # OPTIONAL
    generatedFromIssueId: ID     # OPTIONAL - if AI-generated from issue
    aiModel: String              # OPTIONAL - AI model used
    aiConfidence: Int            # OPTIONAL - AI confidence (0-100)
    sources: [GuideSourceInput!] # OPTIONAL - source attribution
    isPublic: Boolean            # OPTIONAL - defaults to false
  }

  # Input for guide source attribution
  input GuideSourceInput {
    url: String!                 # REQUIRED
    type: String!                # REQUIRED - "reddit", "youtube", etc.
    title: String!               # REQUIRED
    author: String               # OPTIONAL
    scrapedAt: String!           # REQUIRED
    relevanceScore: Float        # OPTIONAL
  }

  # Add a step to a guide
  input CreateGuideStepInput {
    guideId: ID!                 # REQUIRED - which guide
    stepNumber: Int!             # REQUIRED - order (1, 2, 3, etc.)
    title: String!               # REQUIRED
    description: String          # OPTIONAL
    imageUrl: String             # OPTIONAL
    videoUrl: String             # OPTIONAL
    demoId: String               # OPTIONAL
    defaultCamera: String        # OPTIONAL
    warnings: [String!]          # OPTIONAL
    tips: [String!]              # OPTIONAL
    estimatedDuration: Int       # OPTIONAL
  }

  # Update user's progress through a guide
  input UpdateGuideProgressInput {
    guideId: ID!                 # REQUIRED - which guide
    currentStepId: ID            # OPTIONAL - update current step
    completedStepIds: [String!]  # OPTIONAL - update completed steps
    isCompleted: Boolean         # OPTIONAL - mark guide as completed
    rating: Int                  # OPTIONAL - rate the guide (1-5)
    feedback: String             # OPTIONAL - provide feedback
  }

  # Update guide metadata (title, difficulty, visibility, etc.)
  input UpdateGuideInput {
    guideId: ID!                 # REQUIRED - which guide to update
    title: String                # OPTIONAL - update title
    description: String          # OPTIONAL - update description
    difficulty: String           # OPTIONAL - update difficulty level
    estimatedDuration: Int       # OPTIONAL - update time estimate
    requiredTools: [String!]     # OPTIONAL - update tools list
    requiredSkills: [String!]    # OPTIONAL - update skills list
    requiredParts: [String!]     # OPTIONAL - update parts list
    isPublic: Boolean            # OPTIONAL - make guide public/private
  }

  # Create a 3D model asset for interactive demos
  input CreateDemoModelInput {
    demoId: String!              # REQUIRED - unique identifier (e.g., "brake-pad-demo")
    name: String!                # REQUIRED - display name
    description: String          # OPTIONAL - what this demo teaches
    modelUrl: String!            # REQUIRED - URL to .glb 3D model file
    thumbnailUrl: String         # OPTIONAL - preview image URL
    metadata: JSON               # OPTIONAL - camera positions, animations, etc.
  }

`;
