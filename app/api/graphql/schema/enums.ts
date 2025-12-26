/**
 * GraphQL Enums
 *
 * Enums are like multiple-choice questions - you can only pick from predefined options.
 * They prevent typos and ensure data consistency.
 *
 * Shared across all domains (User, Group, Issue, Decision, Guide).
 */

export const enumTypeDefs = /* GraphQL */ `
  # ============================================
  # GROUP & MEMBER ENUMS
  # ============================================

  # Group member roles - determines permissions and responsibilities
  # Groups are flexible: solo user, couple, family, roommates, friends splitting expenses, etc.
  enum MemberRole {
    ORGANIZER    # Person who created the group - full control
    ADMIN        # Equal rights to organizer - can manage everything
    MEMBER       # Participant - can view, comment, vote on decisions
  }

  # How willing is the group to take on risky DIY projects?
  # Affects which repair/fix options the AI recommends
  # Example: Low risk = replacing air filter, High risk = electrical wiring
  enum RiskTolerance {
    VERY_LOW     # "I never want to risk anything going wrong"
    LOW          # "I'm cautious, prefer safe options"
    MODERATE     # "I'm okay with some calculated risks"
    HIGH         # "I'm comfortable with risky projects"
    VERY_HIGH    # "I'm willing to tackle anything"
  }

  # Does the group prefer to do repairs/fixes themselves or hire professionals?
  # Affects which options are shown first by the AI
  enum DIYPreference {
    PREFER_DIY    # "We like fixing things ourselves"
    NEUTRAL       # "Depends on the situation"
    PREFER_HIRE   # "We'd rather pay someone else to do it"
  }

  # ============================================
  # ISSUE ENUMS
  # ============================================

  # High-level issue categories - matches our 9 interactive 3D demos
  # Examples: "brake pad replacement" → AUTOMOTIVE + subcategory: "Brakes"
  #           "leaky faucet" → HOME_REPAIR + subcategory: "Plumbing"
  enum IssueCategory {
    AUTOMOTIVE        # Cars, trucks, motorcycles (brake pads, headlight fog, oil changes)
    HOME_REPAIR       # Plumbing, electrical, HVAC, structural (leaks, wiring, heating)
    APPLIANCE         # Dishwasher, fridge, washer, dryer (not working, strange noises)
    CLEANING          # Mold, stains, algae, odors (requires treatment/removal)
    YARD_OUTDOOR      # Gutters, deck, sprinklers, landscaping (exterior maintenance)
    SAFETY            # Gas leaks, sparking outlets, CO detector (immediate attention needed)
    MAINTENANCE       # HVAC filter, water heater, preventive care (scheduled upkeep)
    INSTALLATION      # Smart thermostat, home theater, networking (adding new systems)
    OTHER             # Everything else that doesn't fit above
  }

  # Workflow stages for tracking issue resolution
  # An issue moves through these states from creation to resolution
  enum IssueStatus {
    OPEN                # Just created, no investigation yet
    INVESTIGATING       # AI is analyzing evidence, generating hypotheses
    OPTIONS_GENERATED   # AI has provided DIY/hire/defer options
    DECIDED             # Group has chosen an option (but not started work)
    IN_PROGRESS         # Work is underway (DIY in progress or waiting for vendor)
    RESOLVED            # Issue is fixed, outcome recorded
    DEFERRED            # Group decided to postpone (e.g., "wait until spring")
  }

  # How urgent is this issue?
  # Affects sorting/filtering and AI recommendation urgency
  enum IssuePriority {
    LOW       # Can wait weeks/months (cosmetic issues, minor annoyances)
    MEDIUM    # Should address within weeks (efficiency issues, minor leaks)
    HIGH      # Address within days (affecting daily life, small safety concerns)
    URGENT    # Address immediately (safety hazards, major damage risk)
  }

  # Types of evidence users can upload to help AI diagnose issues
  # Photos/videos are encrypted; observations are stored as text
  enum EvidenceType {
    PHOTO         # Image file (JPEG, PNG, etc.) - encrypted storage
    VIDEO         # Video file (MP4, MOV, etc.) - encrypted storage
    AUDIO         # Audio recording (unusual sounds, noises)
    TEXT          # Written description from user
    OBSERVATION   # AI-extracted info from other evidence types
  }

  # ============================================
  # DECISION ENUMS
  # ============================================

  # How risky is a particular repair option?
  # Used by AI to warn users about potential failure scenarios
  enum RiskLevel {
    LOW            # Safe, unlikely to cause issues (e.g., replacing air filter)
    MEDIUM         # Some risk if done incorrectly (e.g., installing outlet cover)
    HIGH           # Significant risk, expertise recommended (e.g., electrical wiring)
    CATASTROPHIC   # Could cause injury/major damage (e.g., gas line work, structural)
  }

  # Types of solutions the AI can recommend
  enum OptionType {
    DIY       # Do it yourself - user does the repair
    HIRE      # Hire a professional - get quotes from vendors
    DEFER     # Wait/postpone - monitor the issue, address later
    REPLACE   # Replace entire system/component instead of repairing
  }

  # Group member voting on decisions (OPTIONAL - mainly for groups, not solo users)
  # Voting helps groups agree on major repair decisions
  # Examples: "Should we fix or replace the dishwasher?"
  #           "DIY the deck repair or hire a contractor?"
  # For emergencies or solo users, skip voting and just make the decision
  enum VoteType {
    APPROVE   # Yes, I agree with this decision
    REJECT    # No, I disagree, let's choose a different option
    ABSTAIN   # I don't have a strong opinion, others can decide
  }

  # ============================================
  # FINANCE ENUMS
  # ============================================

  # How often does income/expense occur?
  # Used for budgeting calculations and financial projections
  enum IncomeFrequency {
    WEEKLY         # Every week (e.g., weekly paycheck, DoorDash earnings)
    BI_WEEKLY      # Every 2 weeks (common payroll schedule)
    SEMI_MONTHLY   # Twice per month (1st and 15th)
    MONTHLY        # Once per month (salary, rent, utilities)
    QUARTERLY      # Every 3 months (quarterly bonus, property tax)
    ANNUAL         # Once per year (tax refund, annual insurance)
    ONE_TIME       # Single occurrence (bonus, unexpected expense)
  }
`;
