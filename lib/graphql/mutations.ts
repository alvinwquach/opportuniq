/**
 * GraphQL Mutation Documents
 *
 * All mutation strings for the application.
 * Import these in your hooks or components.
 *
 * Naming convention: ENTITY_ACTION_MUTATION
 * Example: GROUP_CREATE_MUTATION, ISSUE_UPDATE_MUTATION
 */

// =============================================================================
// USER MUTATIONS
// =============================================================================

export const USER_UPDATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation UpdateProfile(
    $name: String
    $city: String
    $stateProvince: String
    $postalCode: String
    $country: String
    $monthlyBudget: String
    $emergencyBuffer: String
    $riskTolerance: UserRiskTolerance
  ) {
    updateProfile(
      name: $name
      city: $city
      stateProvince: $stateProvince
      postalCode: $postalCode
      country: $country
      monthlyBudget: $monthlyBudget
      emergencyBuffer: $emergencyBuffer
      riskTolerance: $riskTolerance
    ) {
      id
      name
      city
      stateProvince
      postalCode
      country
      monthlyBudget
      emergencyBuffer
      riskTolerance
    }
  }
`;

export const USER_UPDATE_PREFERENCES_MUTATION = /* GraphQL */ `
  mutation UpdatePreferences(
    $language: String
    $theme: String
    $emailNotifications: Boolean
    $smsNotifications: Boolean
    $weeklyDigest: Boolean
    $unitSystem: String
    $currency: String
  ) {
    updatePreferences(
      language: $language
      theme: $theme
      emailNotifications: $emailNotifications
      smsNotifications: $smsNotifications
      weeklyDigest: $weeklyDigest
      unitSystem: $unitSystem
      currency: $currency
    ) {
      id
      preferences {
        language
        theme
        emailNotifications
        smsNotifications
        weeklyDigest
        unitSystem
        currency
      }
    }
  }
`;

// =============================================================================
// GROUP MUTATIONS
// =============================================================================

export const GROUP_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      name
      postalCode
      defaultSearchRadius
      createdAt
    }
  }
`;

export const GROUP_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateGroup($id: ID!, $input: UpdateGroupInput!) {
    updateGroup(id: $id, input: $input) {
      id
      name
      postalCode
      defaultSearchRadius
    }
  }
`;

export const GROUP_UPDATE_CONSTRAINTS_MUTATION = /* GraphQL */ `
  mutation UpdateGroupConstraints($groupId: ID!, $input: UpdateGroupConstraintsInput!) {
    updateGroupConstraints(groupId: $groupId, input: $input) {
      id
      monthlyBudget
      emergencyBuffer
      sharedBalance
      riskTolerance
      diyPreference
      neverDIY
    }
  }
`;

export const GROUP_INVITE_MEMBER_MUTATION = /* GraphQL */ `
  mutation InviteMember($groupId: ID!, $email: String!, $role: GroupRole!) {
    inviteMember(groupId: $groupId, email: $email, role: $role) {
      id
      role
      status
      invitedAt
      user {
        id
        email
        name
      }
    }
  }
`;

export const GROUP_REMOVE_MEMBER_MUTATION = /* GraphQL */ `
  mutation RemoveMember($groupId: ID!, $memberId: ID!) {
    removeMember(groupId: $groupId, memberId: $memberId)
  }
`;

export const GROUP_LEAVE_MUTATION = /* GraphQL */ `
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

export const GROUP_UPDATE_MEMBER_ROLE_MUTATION = /* GraphQL */ `
  mutation UpdateMemberRole($groupId: ID!, $memberId: ID!, $role: GroupRole!) {
    updateMemberRole(groupId: $groupId, memberId: $memberId, role: $role) {
      id
      role
      status
      user {
        id
        name
      }
    }
  }
`;

// =============================================================================
// INVITATION MUTATIONS
// =============================================================================

export const INVITATION_ACCEPT_MUTATION = /* GraphQL */ `
  mutation AcceptInvitation($invitationId: ID!) {
    acceptInvitation(invitationId: $invitationId) {
      id
      role
      status
      joinedAt
      group {
        id
        name
      }
    }
  }
`;

export const INVITATION_DECLINE_MUTATION = /* GraphQL */ `
  mutation DeclineInvitation($invitationId: ID!) {
    declineInvitation(invitationId: $invitationId)
  }
`;

// =============================================================================
// ISSUE MUTATIONS
// =============================================================================

export const ISSUE_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      id
      title
      description
      category
      subcategory
      priority
      status
      assetName
      assetDetails
      createdAt
      group {
        id
        name
      }
      createdBy {
        id
        user {
          name
        }
      }
    }
  }
`;

export const ISSUE_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateIssue($id: ID!, $input: UpdateIssueInput!) {
    updateIssue(id: $id, input: $input) {
      id
      title
      description
      category
      subcategory
      priority
      status
      assetName
      assetDetails
      updatedAt
    }
  }
`;

export const ISSUE_RESOLVE_MUTATION = /* GraphQL */ `
  mutation ResolveIssue($id: ID!, $input: ResolveIssueInput!) {
    resolveIssue(id: $id, input: $input) {
      id
      status
      resolutionType
      resolutionNotes
      resolvedAt
      resolvedBy {
        id
        user {
          name
        }
      }
    }
  }
`;

export const ISSUE_REOPEN_MUTATION = /* GraphQL */ `
  mutation ReopenIssue($id: ID!) {
    reopenIssue(id: $id) {
      id
      status
      resolutionType
      resolvedAt
    }
  }
`;

export const ISSUE_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteIssue($id: ID!) {
    deleteIssue(id: $id)
  }
`;

// =============================================================================
// COMMENT MUTATIONS
// =============================================================================

export const COMMENT_ADD_MUTATION = /* GraphQL */ `
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
      content
      createdAt
      author {
        id
        user {
          id
          name
          avatarUrl
        }
      }
    }
  }
`;

export const COMMENT_EDIT_MUTATION = /* GraphQL */ `
  mutation EditComment($id: ID!, $content: String!) {
    editComment(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

export const COMMENT_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

// =============================================================================
// DECISION MUTATIONS
// =============================================================================

export const DECISION_SELECT_OPTION_MUTATION = /* GraphQL */ `
  mutation SelectDecisionOption($optionId: ID!, $assumptions: JSON) {
    selectDecisionOption(optionId: $optionId, assumptions: $assumptions) {
      id
      approvedAt
      assumptions
      selectedOption {
        id
        title
        type
        costMin
        costMax
      }
      issue {
        id
        status
      }
    }
  }
`;

export const DECISION_VOTE_MUTATION = /* GraphQL */ `
  mutation VoteOnDecision($input: VoteOnDecisionInput!) {
    voteOnDecision(input: $input) {
      id
      vote
      comment
      votedAt
      member {
        id
        user {
          name
        }
      }
    }
  }
`;

export const DECISION_CHANGE_VOTE_MUTATION = /* GraphQL */ `
  mutation ChangeVote($voteId: ID!, $vote: VoteType!, $comment: String) {
    changeVote(voteId: $voteId, vote: $vote, comment: $comment) {
      id
      vote
      comment
      votedAt
    }
  }
`;

// =============================================================================
// GUIDE MUTATIONS
// =============================================================================

export const GUIDE_BOOKMARK_MUTATION = /* GraphQL */ `
  mutation BookmarkGuide($input: BookmarkGuideInput!) {
    bookmarkGuide(input: $input) {
      id
      wasBookmarked
    }
  }
`;

export const GUIDE_RATE_MUTATION = /* GraphQL */ `
  mutation RateGuide($guideId: ID!, $helpful: Boolean!) {
    rateGuide(guideId: $guideId, helpful: $helpful) {
      id
      wasHelpful
    }
  }
`;

export const GUIDE_TRACK_CLICK_MUTATION = /* GraphQL */ `
  mutation TrackGuideClick($guideId: ID!) {
    trackGuideClick(guideId: $guideId) {
      id
      wasClicked
      clickedAt
    }
  }
`;

export const GUIDE_UPDATE_PROGRESS_MUTATION = /* GraphQL */ `
  mutation UpdateGuideProgress($guideId: ID!, $progress: Int!, $completedSteps: Int) {
    updateGuideProgress(guideId: $guideId, progress: $progress, completedSteps: $completedSteps)
  }
`;

// =============================================================================
// FINANCE MUTATIONS
// =============================================================================

export const INCOME_ADD_MUTATION = /* GraphQL */ `
  mutation AddIncomeStream(
    $source: String!
    $amount: String!
    $frequency: IncomeFrequency!
    $description: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    addIncomeStream(
      source: $source
      amount: $amount
      frequency: $frequency
      description: $description
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      source
      amount
      frequency
      description
      isActive
      monthlyEquivalent
      createdAt
    }
  }
`;

export const INCOME_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateIncomeStream(
    $id: ID!
    $source: String
    $amount: String
    $frequency: IncomeFrequency
    $description: String
    $isActive: Boolean
    $startDate: DateTime
    $endDate: DateTime
  ) {
    updateIncomeStream(
      id: $id
      source: $source
      amount: $amount
      frequency: $frequency
      description: $description
      isActive: $isActive
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      source
      amount
      frequency
      description
      isActive
      monthlyEquivalent
      updatedAt
    }
  }
`;

export const INCOME_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteIncomeStream($id: ID!) {
    deleteIncomeStream(id: $id)
  }
`;

export const EXPENSE_ADD_MUTATION = /* GraphQL */ `
  mutation AddExpense(
    $category: String!
    $amount: String!
    $description: String
    $date: DateTime!
    $isRecurring: Boolean
    $recurringFrequency: IncomeFrequency
    $issueId: ID
  ) {
    addExpense(
      category: $category
      amount: $amount
      description: $description
      date: $date
      isRecurring: $isRecurring
      recurringFrequency: $recurringFrequency
      issueId: $issueId
    ) {
      id
      category
      amount
      description
      date
      isRecurring
      recurringFrequency
      createdAt
    }
  }
`;

export const EXPENSE_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateExpense(
    $id: ID!
    $category: String
    $amount: String
    $description: String
    $date: DateTime
    $isRecurring: Boolean
    $recurringFrequency: IncomeFrequency
  ) {
    updateExpense(
      id: $id
      category: $category
      amount: $amount
      description: $description
      date: $date
      isRecurring: $isRecurring
      recurringFrequency: $recurringFrequency
    ) {
      id
      category
      amount
      description
      date
      isRecurring
      recurringFrequency
    }
  }
`;

export const EXPENSE_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

export const BUDGET_SET_MUTATION = /* GraphQL */ `
  mutation SetBudget($category: String!, $monthlyLimit: String!) {
    setBudget(category: $category, monthlyLimit: $monthlyLimit) {
      id
      category
      monthlyLimit
      currentSpend
      remainingBudget
      percentUsed
    }
  }
`;

export const BUDGET_UPDATE_SPEND_MUTATION = /* GraphQL */ `
  mutation UpdateBudgetSpend($id: ID!, $currentSpend: String!) {
    updateBudgetSpend(id: $id, currentSpend: $currentSpend) {
      id
      currentSpend
      remainingBudget
      percentUsed
    }
  }
`;

export const BUDGET_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteBudget($id: ID!) {
    deleteBudget(id: $id)
  }
`;

// =============================================================================
// OUTCOME MUTATIONS
// =============================================================================

export const OUTCOME_RECORD_MUTATION = /* GraphQL */ `
  mutation RecordOutcome(
    $decisionId: ID!
    $actualCost: String
    $actualTime: String
    $success: Boolean!
    $whatWentWell: String
    $whatWentWrong: String
    $lessonsLearned: String
    $wouldDoAgain: Boolean
  ) {
    recordOutcome(
      decisionId: $decisionId
      actualCost: $actualCost
      actualTime: $actualTime
      success: $success
      whatWentWell: $whatWentWell
      whatWentWrong: $whatWentWrong
      lessonsLearned: $lessonsLearned
      wouldDoAgain: $wouldDoAgain
    ) {
      id
      actualCost
      actualTime
      success
      completedAt
      costDelta
      timeDelta
      whatWentWell
      whatWentWrong
      lessonsLearned
      wouldDoAgain
      biasDetected {
        costBias
        timeBias
        recommendation
      }
    }
  }
`;

// =============================================================================
// VENDOR MUTATIONS
// =============================================================================

export const VENDOR_MARK_CONTACTED_MUTATION = /* GraphQL */ `
  mutation MarkVendorContacted($vendorId: ID!) {
    markVendorContacted(vendorId: $vendorId) {
      id
      vendorName
      contacted
    }
  }
`;

export const VENDOR_ADD_QUOTE_MUTATION = /* GraphQL */ `
  mutation AddVendorQuote($vendorId: ID!, $amount: String!, $details: String) {
    addVendorQuote(vendorId: $vendorId, amount: $amount, details: $details) {
      id
      vendorName
      quoteAmount
      quoteDetails
    }
  }
`;

// =============================================================================
// SCHEDULE MUTATIONS
// =============================================================================

export const SCHEDULE_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateSchedule($input: CreateScheduleInput!) {
    createSchedule(input: $input) {
      id
      scheduledTime
      estimatedDuration
      participants
      calendarEventId
      createdAt
      issue {
        id
        title
      }
      createdBy {
        id
        user {
          name
        }
      }
    }
  }
`;

export const SCHEDULE_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateSchedule($id: ID!, $input: UpdateScheduleInput!) {
    updateSchedule(id: $id, input: $input) {
      id
      scheduledTime
      estimatedDuration
      participants
      updatedAt
    }
  }
`;

export const SCHEDULE_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteSchedule($id: ID!) {
    deleteSchedule(id: $id)
  }
`;

// =============================================================================
// EXPENSE SETTINGS MUTATIONS
// =============================================================================

export const EXPENSE_SETTINGS_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateExpenseSettings($groupId: ID!, $input: UpdateExpenseSettingsInput!) {
    updateExpenseSettings(groupId: $groupId, input: $input) {
      id
      approvalMode
      defaultThreshold
      trustOwnerAdmin
      moderatorThreshold
      allowModeratorApprove
    }
  }
`;

export const EXPENSE_CATEGORY_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateExpenseCategory($groupId: ID!, $input: CreateExpenseCategoryInput!) {
    createExpenseCategory(groupId: $groupId, input: $input) {
      id
      name
      icon
      approvalRule
      customThreshold
      sortOrder
    }
  }
`;

export const EXPENSE_CATEGORY_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateExpenseCategory($id: ID!, $input: UpdateExpenseCategoryInput!) {
    updateExpenseCategory(id: $id, input: $input) {
      id
      name
      icon
      approvalRule
      customThreshold
      sortOrder
    }
  }
`;

export const EXPENSE_CATEGORY_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteExpenseCategory($id: ID!) {
    deleteExpenseCategory(id: $id)
  }
`;
