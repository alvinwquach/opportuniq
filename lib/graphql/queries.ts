/**
 * GraphQL Query Documents
 *
 * All query strings for the application.
 * Import these in your hooks or components.
 *
 * Naming convention: ENTITY_ACTION_QUERY
 * Example: USER_ME_QUERY, GROUP_BY_ID_QUERY
 */

// =============================================================================
// USER QUERIES
// =============================================================================

export const USER_ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      email
      name
      avatarUrl
      city
      stateProvince
      postalCode
      country
      preferences {
        language
        theme
        emailNotifications
        smsNotifications
        weeklyDigest
        unitSystem
        currency
      }
      monthlyBudget
      emergencyBuffer
      riskTolerance
      createdAt
      lastSeenAt
      groupCount
    }
  }
`;

export const USER_WITH_GROUPS_QUERY = /* GraphQL */ `
  query MeWithGroups {
    me {
      id
      email
      name
      avatarUrl
      riskTolerance
      groups {
        id
        name
        memberCount
        activeIssueCount
      }
      guides {
        id
        title
        source
        wasBookmarked
      }
      groupCount
    }
  }
`;

// =============================================================================
// GROUP QUERIES
// =============================================================================

export const GROUP_BY_ID_QUERY = /* GraphQL */ `
  query Group($id: ID!) {
    group(id: $id) {
      id
      name
      postalCode
      defaultSearchRadius
      createdAt
      memberCount
      issueCount
      activeIssueCount
      constraints {
        id
        monthlyBudget
        emergencyBuffer
        sharedBalance
        riskTolerance
        diyPreference
        neverDIY
      }
    }
  }
`;

export const GROUP_WITH_MEMBERS_QUERY = /* GraphQL */ `
  query GroupWithMembers($id: ID!) {
    group(id: $id) {
      id
      name
      postalCode
      defaultSearchRadius
      memberCount
      activeIssueCount
      members {
        id
        role
        status
        joinedAt
        user {
          id
          name
          email
          avatarUrl
        }
      }
      activeMembers {
        id
        role
        user {
          id
          name
          avatarUrl
        }
      }
      constraints {
        id
        monthlyBudget
        emergencyBuffer
        sharedBalance
        riskTolerance
        diyPreference
      }
    }
  }
`;

export const MY_GROUPS_QUERY = /* GraphQL */ `
  query MyGroups {
    myGroups {
      id
      name
      postalCode
      memberCount
      issueCount
      activeIssueCount
      createdAt
    }
  }
`;

// =============================================================================
// ISSUE QUERIES
// =============================================================================

export const ISSUE_BY_ID_QUERY = /* GraphQL */ `
  query Issue($id: ID!) {
    issue(id: $id) {
      id
      title
      description
      category
      subcategory
      assetName
      assetDetails
      status
      priority
      confidenceLevel
      diagnosis
      severity
      urgency
      ignoreRisk
      warningSignsToWatch
      whenToEscalate
      isEmergency
      emergencyInstructions
      emergencyType
      resolutionType
      resolutionNotes
      resolvedAt
      createdAt
      updatedAt
      completedAt
      evidenceCount
      commentCount
      group {
        id
        name
      }
      createdBy {
        id
        user {
          id
          name
          avatarUrl
        }
      }
      resolvedBy {
        id
        user {
          id
          name
        }
      }
    }
  }
`;

export const ISSUE_WITH_OPTIONS_QUERY = /* GraphQL */ `
  query IssueWithOptions($id: ID!) {
    issue(id: $id) {
      id
      title
      description
      category
      status
      priority
      diagnosis
      severity
      urgency
      isEmergency
      emergencyInstructions
      options {
        id
        type
        title
        description
        costMin
        costMax
        timeEstimate
        riskLevel
        diyViable
        diyWarning
        requiredSkills
        requiredTools
        requiredParts
        recommended
        reasoning
        confidenceScore
        ppe {
          item
          priority
          reason
        }
        hazards
      }
      decision {
        id
        approvedAt
        selectedOption {
          id
          title
          type
        }
        voteCount
        approvalCount
      }
      evidence {
        id
        evidenceType
        fileName
        storageUrl
        createdAt
      }
      hypotheses {
        id
        hypothesis
        confidence
        createdAt
      }
      comments {
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
  }
`;

export const ISSUES_LIST_QUERY = /* GraphQL */ `
  query Issues(
    $groupId: ID!
    $status: IssueStatus
    $priority: IssuePriority
    $category: IssueCategory
    $limit: Int
    $offset: Int
  ) {
    issues(
      groupId: $groupId
      status: $status
      priority: $priority
      category: $category
      limit: $limit
      offset: $offset
    ) {
      id
      title
      description
      category
      subcategory
      status
      priority
      confidenceLevel
      diagnosis
      severity
      urgency
      isEmergency
      createdAt
      updatedAt
      group {
        id
        name
      }
      createdBy {
        id
        user {
          name
          avatarUrl
        }
      }
    }
  }
`;

// =============================================================================
// DECISION QUERIES
// =============================================================================

export const DECISION_OPTION_QUERY = /* GraphQL */ `
  query DecisionOption($id: ID!) {
    decisionOption(id: $id) {
      id
      type
      title
      description
      costMin
      costMax
      timeEstimate
      riskLevel
      failureCost
      failureRisk
      diyViable
      diyWarning
      requiredSkills
      requiredTools
      requiredParts
      recommended
      reasoning
      confidenceScore
      ppe {
        item
        priority
        reason
      }
      doNotProceedWithout
      hazards
      workLocation
      products {
        id
        productName
        productCategory
        estimatedCost
        storeName
        storeAddress
        storeDistance
        storeUrl
        inStock
      }
      vendors {
        id
        vendorName
        contactInfo
        quoteAmount
        quoteDetails
        rating
        reviewSummary
        specialties
        distance
        address
        contacted
        emailDraft
      }
    }
  }
`;

// =============================================================================
// GUIDE QUERIES
// =============================================================================

export const MY_GUIDES_QUERY = /* GraphQL */ `
  query MyGuides($bookmarkedOnly: Boolean, $source: GuideSource, $limit: Int) {
    myGuides(bookmarkedOnly: $bookmarkedOnly, source: $source, limit: $limit) {
      id
      title
      url
      source
      subreddit
      upvotes
      commentCount
      postAge
      excerpt
      relevanceScore
      focusArea
      wasClicked
      wasBookmarked
      wasHelpful
      searchQuery
      issueCategory
      createdAt
      clickedAt
    }
  }
`;

// =============================================================================
// FINANCE QUERIES
// =============================================================================

export const MY_INCOME_STREAMS_QUERY = /* GraphQL */ `
  query MyIncomeStreams($activeOnly: Boolean) {
    myIncomeStreams(activeOnly: $activeOnly) {
      id
      source
      amount
      description
      frequency
      isActive
      startDate
      endDate
      monthlyEquivalent
      createdAt
      updatedAt
    }
  }
`;

export const MY_EXPENSES_QUERY = /* GraphQL */ `
  query MyExpenses(
    $startDate: DateTime
    $endDate: DateTime
    $category: String
    $isRecurring: Boolean
    $limit: Int
    $offset: Int
  ) {
    myExpenses(
      startDate: $startDate
      endDate: $endDate
      category: $category
      isRecurring: $isRecurring
      limit: $limit
      offset: $offset
    ) {
      id
      category
      amount
      description
      date
      isRecurring
      recurringFrequency
      nextDueDate
      issueId
      createdAt
    }
  }
`;

export const MY_BUDGETS_QUERY = /* GraphQL */ `
  query MyBudgets {
    myBudgets {
      id
      category
      monthlyLimit
      currentSpend
      remainingBudget
      percentUsed
      updatedAt
    }
  }
`;

export const MY_FINANCIAL_SUMMARY_QUERY = /* GraphQL */ `
  query MyFinancialSummary {
    myFinancialSummary {
      totalMonthlyIncome
      totalMonthlyExpenses
      netMonthlyCashFlow
      totalBudgetLimit
      totalBudgetSpent
      emergencyFundTarget
      emergencyFundCurrent
    }
  }
`;

// =============================================================================
// DASHBOARD QUERIES
// =============================================================================

export const DASHBOARD_STATS_QUERY = /* GraphQL */ `
  query DashboardStats {
    dashboardStats {
      openIssues
      pendingDecisions
      diyProjectsCompleted
      totalSaved
      activeGroups
      upcomingReminders
    }
  }
`;

export const GROUP_RESOLUTION_STATS_QUERY = /* GraphQL */ `
  query GroupResolutionStats($groupId: ID!, $timeRange: String) {
    groupResolutionStats(groupId: $groupId, timeRange: $timeRange) {
      totalResolved
      diyCount
      hiredCount
      replacedCount
      deferredCount
      totalSaved
      averageSavings
    }
  }
`;

export const DASHBOARD_DATA_QUERY = /* GraphQL */ `
  query DashboardData {
    dashboardData {
      user {
        id
        name
        email
        avatarUrl
        postalCode
        city
        latitude
        longitude
      }
      financials {
        monthlyIncome
        annualIncome
        hourlyRate
        totalSpent
        remaining
        budgetUsedPercent
        totalBudget
      }
      stats {
        activeIssues
        activeIssuesTrend
        pendingDecisions
        pendingDecisionsTrend
        totalSaved
        totalSavedTrend
        groupCount
        groupCountTrend
      }
      pipelineSummary {
        open
        investigating
        optionsGenerated
        decided
        inProgress
        completed
        deferred
      }
      openIssues {
        id
        title
        status
        priority
        groupName
        groupId
        createdAt
      }
      safetyAlerts {
        id
        title
        severity
        groupName
        emergencyInstructions
      }
      pendingDecisions {
        id
        issueId
        title
        priority
        groupName
        optionType
        costMin
        costMax
        timeEstimate
        voteCount
        totalMembers
      }
      deferredDecisions {
        id
        title
        revisitDate
        reason
      }
      groups {
        id
        name
        role
        memberCount
        issueCount
        savings
      }
      calendarEvents {
        id
        title
        date
        time
        type
        groupName
      }
      reminders {
        id
        issueId
        title
        groupName
        date
      }
      activeGuides {
        id
        title
        progress
        totalSteps
        completedSteps
      }
      recentOutcomes {
        id
        issueTitle
        success
        optionType
        actualCost
        costDelta
      }
      outcomeSummary {
        diySuccessRate
        totalResolved
        avgCostDelta
        avgResolutionTimeDays
      }
      pendingVendors {
        id
        vendorName
        issueTitle
        rating
        quoteAmount
      }
      shoppingList {
        id
        productName
        storeName
        estimatedCost
        inStock
      }
      spendingByCategory {
        category
        amount
        color
      }
      savingsOverTime {
        month
        savings
        diy
        hired
      }
      recentActivity {
        id
        message
        time
        avatar
        type
      }
      userLocation {
        postalCode
        city
        latitude
        longitude
      }
    }
  }
`;

// =============================================================================
// INVITATION QUERIES
// =============================================================================

export const GROUP_INVITATIONS_QUERY = /* GraphQL */ `
  query GroupInvitations($groupId: ID!) {
    groupInvitations(groupId: $groupId) {
      id
      email
      role
      message
      invitedAt
      expiresAt
      group {
        id
        name
      }
      invitedBy {
        id
        user {
          name
        }
      }
    }
  }
`;

export const MY_PENDING_INVITATIONS_QUERY = /* GraphQL */ `
  query MyPendingInvitations {
    myPendingInvitations {
      id
      email
      role
      message
      invitedAt
      expiresAt
      group {
        id
        name
        memberCount
      }
      invitedBy {
        id
        user {
          name
          avatarUrl
        }
      }
    }
  }
`;

// =============================================================================
// OUTCOME QUERIES
// =============================================================================

export const DECISION_OUTCOME_QUERY = /* GraphQL */ `
  query DecisionOutcome($decisionId: ID!) {
    decisionOutcome(decisionId: $decisionId) {
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
        categoryPattern
        recommendation
      }
      preferenceUpdates {
        field
        currentValue
        suggestedValue
        reason
      }
      decision {
        id
        selectedOption {
          title
          type
          costMin
          costMax
        }
      }
    }
  }
`;

export const PREFERENCE_HISTORY_QUERY = /* GraphQL */ `
  query PreferenceHistory($groupId: ID!, $limit: Int) {
    preferenceHistory(groupId: $groupId, limit: $limit) {
      id
      field
      oldValue
      newValue
      reason
      changedAt
      changedBy {
        id
        user {
          name
        }
      }
    }
  }
`;

// =============================================================================
// SCHEDULE QUERIES
// =============================================================================

export const SCHEDULE_BY_ID_QUERY = /* GraphQL */ `
  query Schedule($id: ID!) {
    schedule(id: $id) {
      id
      scheduledTime
      estimatedDuration
      participants
      calendarEventId
      createdAt
      updatedAt
      issue {
        id
        title
        status
      }
      createdBy {
        id
        user {
          name
          avatarUrl
        }
      }
      participantMembers {
        id
        user {
          name
          avatarUrl
        }
      }
    }
  }
`;

export const MY_SCHEDULES_QUERY = /* GraphQL */ `
  query MySchedules($startDate: DateTime, $endDate: DateTime) {
    mySchedules(startDate: $startDate, endDate: $endDate) {
      id
      scheduledTime
      estimatedDuration
      participants
      calendarEventId
      createdAt
      issue {
        id
        title
        status
        priority
        group {
          id
          name
        }
      }
      createdBy {
        id
        user {
          name
        }
      }
      participantMembers {
        id
        user {
          name
          avatarUrl
        }
      }
    }
  }
`;

export const GROUP_SCHEDULES_QUERY = /* GraphQL */ `
  query GroupSchedules($groupId: ID!, $startDate: DateTime, $endDate: DateTime) {
    groupSchedules(groupId: $groupId, startDate: $startDate, endDate: $endDate) {
      id
      scheduledTime
      estimatedDuration
      participants
      calendarEventId
      createdAt
      issue {
        id
        title
        status
        priority
      }
      createdBy {
        id
        user {
          name
        }
      }
      participantMembers {
        id
        user {
          name
          avatarUrl
        }
      }
    }
  }
`;

export const ISSUES_FOR_SCHEDULING_QUERY = /* GraphQL */ `
  query IssuesForScheduling($groupId: ID!) {
    issuesForScheduling(groupId: $groupId) {
      id
      title
      status
      priority
      category
    }
  }
`;

// =============================================================================
// EXPENSE SETTINGS QUERIES
// =============================================================================

export const GROUP_EXPENSE_SETTINGS_QUERY = /* GraphQL */ `
  query GroupExpenseSettings($groupId: ID!) {
    groupExpenseSettings(groupId: $groupId) {
      id
      approvalMode
      defaultThreshold
      trustOwnerAdmin
      moderatorThreshold
      allowModeratorApprove
      createdAt
      updatedAt
    }
  }
`;

export const GROUP_EXPENSE_CATEGORIES_QUERY = /* GraphQL */ `
  query GroupExpenseCategories($groupId: ID!) {
    groupExpenseCategories(groupId: $groupId) {
      id
      name
      icon
      approvalRule
      customThreshold
      sortOrder
      createdAt
    }
  }
`;

// =============================================================================
// ISSUES PAGE QUERIES
// =============================================================================

export const ISSUES_PAGE_DATA_QUERY = /* GraphQL */ `
  query IssuesPageData {
    issuesPageData {
      totalSaved
      diyCount
      proCount
      activeIssueCount
      issues {
        id
        title
        status
        priority
        category
        groupId
        groupName
        createdAt
        updatedAt
        diagnosis
        confidence
        diyCost
        proCost
        resolvedAt
        resolvedBy
        savedAmount
      }
      savingsOverTime {
        month
        savings
        issues
      }
      categoryDistribution {
        name
        value
        color
      }
      resolutionBreakdown {
        diy
        pro
        diySuccessRate
      }
      groups {
        id
        name
      }
      categories
    }
  }
`;

// =============================================================================
// GROUPS PAGE QUERIES
// =============================================================================

// =============================================================================
// CALENDAR PAGE QUERIES
// =============================================================================

export const CALENDAR_PAGE_DATA_QUERY = /* GraphQL */ `
  query CalendarPageData($year: Int, $month: Int) {
    calendarPageData(year: $year, month: $month) {
      events {
        id
        title
        date
        time
        type
        isRecurring
        recurringPattern
        location
        assignee
        notes
        estimatedCost
        reminder
        linkedIssueId
        linkedIssueTitle
        groupId
        groupName
      }
      monthStats {
        scheduledEvents
        completedEvents
        proVisits
        diyProjects
        reminders
      }
      upcomingExpenses {
        id
        title
        date
        amount
        type
      }
      totalUpcomingExpenses
      eventTypeDistribution {
        name
        value
        color
      }
      weeklyActivity {
        week
        events
        expenses
      }
      monthlyComparison {
        month
        events
        completed
      }
      upcomingEvents {
        id
        title
        date
        time
        type
        groupName
      }
      schedulableIssues {
        id
        title
        groupName
        status
      }
    }
  }
`;

// =============================================================================
// FINANCES PAGE QUERIES
// =============================================================================

export const FINANCES_PAGE_DATA_QUERY = /* GraphQL */ `
  query FinancesPageData {
    financesPageData {
      monthlyIncome
      monthlyExpenses
      availableFunds
      monthlyBudget
      remaining
      emergencyFundPercent
      diySaved
      pendingUrgent
      incomeStreams {
        id
        source
        amount
        frequency
        isActive
        description
        monthlyEquivalent
      }
      expenses {
        id
        category
        amount
        description
        date
        isRecurring
        frequency
        issueTitle
        urgency
      }
      upcomingExpenses {
        id
        category
        description
        amount
        dueDate
        urgency
        isRecurring
      }
      spendingByCategory {
        category
        amount
        color
      }
      cashFlowHistory {
        month
        income
        expenses
      }
      incomeHistory {
        month
        total
        primary
        secondary
      }
      expenseHistory {
        month
        total
        recurring
        oneTime
      }
      budgetVsActual {
        category
        budget
        actual
      }
      categories
    }
  }
`;

// =============================================================================
// GUIDES PAGE QUERIES
// =============================================================================

export const GUIDES_PAGE_DATA_QUERY = /* GraphQL */ `
  query GuidesPageData {
    guidesPageData {
      guides {
        id
        title
        description
        url
        source
        category
        difficulty
        timeEstimate
        rating
        viewCount
        isVideo
        isBookmarked
        progress
        completedSteps
        totalSteps
        author
        createdAt
      }
      stats {
        completedCount
        inProgressCount
        savedCount
        totalGuides
        totalSaved
        timeSaved
      }
      savingsOverTime {
        month
        saved
        wouldCost
      }
      categories
      sources
    }
  }
`;

// =============================================================================
// DIAGNOSE PAGE QUERIES
// =============================================================================

export const DIAGNOSE_PAGE_DATA_QUERY = /* GraphQL */ `
  query DiagnosePageData($issueId: ID) {
    diagnosePageData(issueId: $issueId) {
      issues {
        id
        title
        icon
        iconColor
        status
        category
        createdAt
        isResolved
        confidence
      }
      currentIssue {
        id
        title
        icon
        iconColor
        status
        category
        createdAt
        isResolved
        diagnosis
        difficulty
        estimatedTime
        diyCost
        proCost
        confidence
        safetyNote
        chatMessages {
          id
          role
          content
          hasImage
          hasVoice
          visionAnalysis
          createdAt
        }
        guides {
          id
          source
          title
          url
          duration
          steps
          rating
          icon
        }
        parts {
          id
          name
          price
          store
          distance
          inStock
          storeUrl
        }
        pros {
          id
          name
          rating
          reviews
          distance
          price
          available
          source
          email
          phone
          specialty
        }
      }
    }
  }
`;

export const GROUPS_PAGE_DATA_QUERY = /* GraphQL */ `
  query GroupsPageData {
    groupsPageData {
      totalGroups
      totalMembers
      totalSavings
      totalIssues
      activeIssueCount
      resolvedIssueCount
      groups {
        id
        name
        postalCode
        role
        memberCount
        issueCount
        activeIssueCount
        resolvedCount
        savings
        members {
          id
          name
          avatar
          role
        }
        createdAt
      }
      selectedGroup {
        id
        name
        postalCode
        role
        createdAt
        openIssueCount
        resolvedCount
        balance
        savings
        monthlyBudget
        monthlySpent
        emergencyFund
        members {
          id
          userId
          name
          email
          avatar
          role
          joinedAt
          contributions
          issuesCreated
          issuesResolved
        }
        pendingInvitations {
          id
          email
          role
          createdAt
          expiresAt
        }
        budgetUsedPercent
        diyRate
        contributionData {
          name
          value
          color
        }
        monthlySavingsData {
          month
          savings
          spent
        }
        resolutionData {
          name
          diy
          hired
        }
        recentIssues {
          id
          title
          category
          status
          priority
          createdAt
        }
        recentActivity {
          id
          type
          message
          memberName
          memberAvatar
          savings
          timestamp
        }
      }
    }
  }
`;
