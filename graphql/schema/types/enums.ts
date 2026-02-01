/**
 * GraphQL Enum Type Definitions
 *
 * All enums match Drizzle pgEnum values exactly.
 */

export const enumTypes = /* GraphQL */ `
  # User enums
  enum UserRiskTolerance {
    none
    very_low
    low
    moderate
    high
    very_high
  }

  # Group enums
  enum GroupRole {
    coordinator
    collaborator
    participant
    contributor
    observer
  }

  enum MemberStatus {
    pending
    active
    inactive
  }

  enum RiskTolerance {
    very_low
    low
    moderate
    high
    very_high
  }

  enum DiyPreference {
    prefer_diy
    neutral
    prefer_hire
  }

  # Issue enums
  enum IssueStatus {
    open
    investigating
    options_generated
    decided
    in_progress
    completed
    deferred
  }

  enum IssuePriority {
    low
    medium
    high
    urgent
  }

  enum IssueCategory {
    automotive
    home_repair
    appliance
    cleaning
    yard_outdoor
    safety
    maintenance
    installation
    other
  }

  enum Severity {
    cosmetic
    minor
    moderate
    serious
    critical
  }

  enum Urgency {
    monitor
    this_month
    this_week
    today
    now
    emergency
  }

  enum ResolutionType {
    diy
    hired
    replaced
    abandoned
    deferred
    monitoring
  }

  # Decision enums
  enum OptionType {
    diy
    hire
    defer
    replace
  }

  enum VoteType {
    approve
    reject
    abstain
  }

  # Guide enums
  enum GuideSource {
    reddit
    diy_stackexchange
    instructables
    family_handyman
    this_old_house
    bob_vila
    doityourself
    hometalk
    diy_chatroom
    ifixit
    youtube
    other
  }

  # Finance enums
  enum IncomeFrequency {
    weekly
    bi_weekly
    semi_monthly
    monthly
    quarterly
    annual
    one_time
  }
`;
