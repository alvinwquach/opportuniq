/**
 * Group Domain Schema
 *
 * Everything related to groups and shared finances:
 * - Groups (solo user, couples, roommates, families)
 * - Group members and roles
 * - Shared expenses (visible to all group members)
 * - Group-wide preferences and constraints
 *
 * Groups are flexible - use for any budget/expense tracking scenario!
 */

export const groupTypeDefs = /* GraphQL */ `
  # ============================================
  # GROUP TYPES
  # ============================================
  # Groups can be used for any budget/expense tracking scenario:
  # - Solo user (just yourself tracking personal projects/repairs)
  # - Couples (boyfriend/girlfriend sharing expenses)
  # - Roommates (housemates splitting costs)
  # - Families (parents + kids managing home repairs)
  # - Friends (sharing project expenses)
  # The app is flexible - use it however you want!

  # Represents a group of people tracking expenses/issues together (or just yourself!)
  # Examples: "My Personal Projects", "Johnson Family", "Apartment 4B Roommates", "Me & Sarah"
  type Group {
    # Core fields
    id: ID!                      # Unique identifier - REQUIRED
    name: String!                # REQUIRED - flexible naming
                                 # Solo: "My Projects" or "Personal Repairs"
                                 # Couple: "Me & Alex" or "Our Home"
                                 # Roommates: "Apartment 4B" or "Downtown Loft"
                                 # Family: "Johnson Family" or "The Smiths"

    # Location - zip code only for privacy (no exact address stored)
    # Used to find nearby service providers/vendors when looking for repair help
    zipCode: String              # OPTIONAL - e.g., "94102"
    defaultSearchRadius: Int     # OPTIONAL - miles to search for vendors (e.g., 25)

    # Timestamps
    createdAt: String!           # REQUIRED - when group was created
    updatedAt: String!           # REQUIRED - last update

    # Relationships
    # [GroupMember!]! = REQUIRED array of REQUIRED members
    # Even solo users have 1 member (themselves as ORGANIZER)
    members: [GroupMember!]!         # All people in the group (minimum 1)
    constraints: GroupConstraints    # OPTIONAL - budget/preference settings (nullable)
    issues: [Issue!]!                # All issues/repairs for this group
    sharedExpenses: [GroupExpense!]! # Expenses visible to all members
  }

  # Represents a shared expense visible to all group members
  # Unlike UserExpense (private), everyone in the group can see these
  # Use cases:
  #   - Solo user: Track your own project costs
  #   - Couple: Shared bills (rent, utilities, repairs)
  #   - Roommates: Split expenses (groceries, cleaning supplies, repairs)
  #   - Family: Household expenses everyone should know about
  type GroupExpense {
    id: ID!                      # Unique identifier - REQUIRED
    groupId: ID!                 # Which group this expense belongs to - REQUIRED

    # Expense details
    category: String!            # REQUIRED - flexible: "Utilities", "Repairs", "Rent", "Groceries"
    amount: String!              # REQUIRED - stored as string: "250.00"
    date: String!                # REQUIRED - when expense occurred (ISO 8601: "2024-01-15")
    description: String          # OPTIONAL - details: "Electric bill for December"

    # Categorization
    isEmergency: Boolean!        # REQUIRED - true if urgent/unexpected
                                 # Examples: burst pipe, car breakdown, broken appliance
    isRecurring: Boolean!        # REQUIRED - true if repeats regularly
                                 # Examples: monthly rent, quarterly pest control, annual insurance
    recurringFrequency: IncomeFrequency  # OPTIONAL - how often (only if isRecurring=true)
    nextDueDate: String          # OPTIONAL - when next payment is due (ISO 8601)

    # Connections
    issueId: ID                  # OPTIONAL - links to Issue if repair/fix-related
    paidBy: ID!                  # REQUIRED - which member paid (for tracking/reimbursement)

    createdAt: String!           # REQUIRED - when expense was recorded

    # Relationships
    payer: GroupMember!          # REQUIRED - full member object who paid
  }

  # Represents a person's membership in a group
  # A user can be a member of multiple groups
  # Examples:
  #   - Solo: User "alex@example.com" is ORGANIZER of "My Personal Projects"
  #   - Couple: User "alex@example.com" is ORGANIZER, "sam@example.com" is ADMIN of "Our Apartment"
  #   - Roommates: 4 users all as MEMBER of "Downtown Loft Roommates"
  type GroupMember {
    id: ID!                      # Unique identifier - REQUIRED
    groupId: ID!                 # Which group - REQUIRED
    userId: ID!                  # Which user - REQUIRED
    role: MemberRole!            # REQUIRED - ORGANIZER, ADMIN, or MEMBER

    # Invitation/join tracking
    invitedAt: String!           # REQUIRED - when user was invited (or created group)
    joinedAt: String             # OPTIONAL - when user accepted invitation
                                 # null if invitation still pending
                                 # For organizer (group creator), this is immediate
  }

  # Group-wide preferences and constraints for decision-making
  # Helps AI tailor recommendations to the group's situation
  # Examples:
  #   - Solo: "Budget $300/month, prefer DIY, moderate risk tolerance"
  #   - Couple: "Budget $500/month, prefer hiring pros, low risk tolerance"
  #   - Roommates: "Budget $200/month, depends on task, never DIY electrical"
  type GroupConstraints {
    id: ID!                      # Unique identifier - REQUIRED
    groupId: ID!                 # Which group - REQUIRED

    # Financial constraints
    monthlyBudget: String        # OPTIONAL - max spending per month on repairs/projects
                                 # Example: "500.00" for $500/month
    emergencyBuffer: String      # OPTIONAL - emergency fund available for urgent issues
                                 # Example: "2000.00" for $2,000 emergency fund
    sharedBalance: String!       # REQUIRED - current balance in shared budget pool
                                 # Updated when members contribute or group pays expenses
                                 # Example: "350.00" for $350 available

    # Decision-making preferences
    riskTolerance: RiskTolerance # OPTIONAL - VERY_LOW to VERY_HIGH
                                 # Affects which repair options AI recommends
    diyPreference: DIYPreference # OPTIONAL - PREFER_DIY, NEUTRAL, PREFER_HIRE
                                 # Affects whether AI shows DIY or hire options first

    # Safety boundaries
    # [String!] = OPTIONAL array of REQUIRED strings (array can be null, but if present, no null items)
    neverDIY: [String!]          # OPTIONAL - categories the group should NEVER attempt DIY
                                 # Examples: ["Electrical", "Gas", "Structural"]
                                 # Smart for safety - some things should always be hired out

    # Timestamps
    createdAt: String!           # REQUIRED - when constraints were first set
    updatedAt: String!           # REQUIRED - when last modified
  }

  # Represents a member's contribution to the shared budget pool
  # Tracks who contributed what amount and when
  # Examples:
  #   - "Alex contributed $200 for monthly rent share"
  #   - "Sam added $50 to emergency fund"
  type BudgetContribution {
    id: ID!                      # Unique identifier - REQUIRED
    groupId: ID!                 # Which group - REQUIRED
    memberId: ID!                # Who contributed - REQUIRED
    amount: String!              # How much - REQUIRED (e.g., "200.00")
    note: String                 # OPTIONAL - why/what for (e.g., "Monthly rent contribution")
    contributedAt: String!       # REQUIRED - when contribution was made

    # Relationships
    member: GroupMember!         # REQUIRED - full member object who contributed
  }

  # Represents a magic link invitation to join a group
  # When organizer invites someone, a unique token is generated
  # Example URL: https://opportuniq.app/invite/abc123def456
  type GroupInvitation {
    id: ID!                      # Unique identifier - REQUIRED
    groupId: ID!                 # Which group - REQUIRED
    inviteeEmail: String!        # Email of person being invited - REQUIRED
    token: String!               # Unique token for magic link - REQUIRED
    invitedBy: ID!               # Who sent invitation - REQUIRED
    expiresAt: String!           # When invitation expires - REQUIRED (typically 7 days)
    acceptedAt: String           # OPTIONAL - when invitee accepted (null if pending)
    createdAt: String!           # REQUIRED - when invitation was created

    # Relationships
    group: Group!                # REQUIRED - group being invited to
    inviter: User!               # REQUIRED - user who sent invitation
  }

  # ============================================
  # GROUP INPUT TYPES
  # ============================================

  # Create a new group
  # Solo users: Create a group with just yourself
  # Multi-member: Create and then invite others
  input CreateGroupInput {
    name: String!            # REQUIRED - e.g., "My Projects", "Johnson Family"
    zipCode: String          # OPTIONAL - for vendor search
  }

  # Update group-wide preferences and budgets
  # Only ORGANIZER or ADMIN can update
  input UpdateConstraintsInput {
    groupId: ID!                     # REQUIRED - which group to update
    monthlyBudget: String            # OPTIONAL - set/update monthly budget
    emergencyBuffer: String          # OPTIONAL - set/update emergency fund
    sharedBalance: String            # OPTIONAL - update shared balance
    riskTolerance: RiskTolerance     # OPTIONAL - update risk tolerance
    diyPreference: DIYPreference     # OPTIONAL - update DIY preference
    neverDIY: [String!]              # OPTIONAL - update categories to never DIY
  }

  # Record a shared expense for the group
  input CreateGroupExpenseInput {
    groupId: ID!                     # REQUIRED - which group
    category: String!                # REQUIRED - e.g., "Utilities", "Repairs", "Rent"
    amount: String!                  # REQUIRED - e.g., "250.00"
    date: String!                    # REQUIRED - when expense occurred
    description: String              # OPTIONAL - extra details
    isEmergency: Boolean             # OPTIONAL - defaults to false
    isRecurring: Boolean             # OPTIONAL - defaults to false
    recurringFrequency: IncomeFrequency  # OPTIONAL - only if isRecurring=true
    nextDueDate: String              # OPTIONAL - when next payment due
    issueId: ID                      # OPTIONAL - link to repair issue
  }

  # Record a member's contribution to shared budget pool
  input CreateBudgetContributionInput {
    groupId: ID!                     # REQUIRED - which group
    amount: String!                  # REQUIRED - how much (e.g., "200.00")
    note: String                     # OPTIONAL - what this contribution is for
  }

  # Invite someone to join a group via magic link
  input CreateGroupInvitationInput {
    groupId: ID!                     # REQUIRED - which group
    inviteeEmail: String!            # REQUIRED - email of person to invite
  }

  # Update group details (name, location, search radius)
  input UpdateGroupInput {
    groupId: ID!                     # REQUIRED - which group to update
    name: String                     # OPTIONAL - update group name
    zipCode: String                  # OPTIONAL - update location
    defaultSearchRadius: Int         # OPTIONAL - update vendor search radius
  }

  # Accept a group invitation via magic link token
  input AcceptGroupInvitationInput {
    token: String!                   # REQUIRED - unique invitation token from email
  }

  # Update a member's role in the group
  # Only ORGANIZER can update roles
  input UpdateGroupMemberRoleInput {
    groupMemberId: ID!               # REQUIRED - which member to update
    role: MemberRole!                # REQUIRED - new role (ORGANIZER, ADMIN, MEMBER)
  }

`;
