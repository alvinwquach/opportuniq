/**
 * Finance GraphQL Type Definitions
 */

export const financeTypes = /* GraphQL */ `
  type UserIncomeStream {
    id: ID!
    source: String!
    amount: String!
    description: String
    frequency: IncomeFrequency!
    isActive: Boolean!
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    monthlyEquivalent: String!
  }

  type UserExpense {
    id: ID!
    category: String!
    amount: String!
    description: String
    date: DateTime!
    isRecurring: Boolean!
    recurringFrequency: IncomeFrequency
    nextDueDate: DateTime
    issueId: ID
    issue: Issue
    createdAt: DateTime!
  }

  type UserBudget {
    id: ID!
    category: String!
    monthlyLimit: String!
    currentSpend: String!
    updatedAt: DateTime!
    remainingBudget: String!
    percentUsed: Float!
  }

  type FinancialSummary {
    totalMonthlyIncome: String!
    totalMonthlyExpenses: String!
    netMonthlyCashFlow: String!
    totalBudgetLimit: String!
    totalBudgetSpent: String!
    emergencyFundTarget: String
    emergencyFundCurrent: String
  }
`;

export const financeQueries = /* GraphQL */ `
  extend type Query {
    "Get user's income streams"
    myIncomeStreams(activeOnly: Boolean): [UserIncomeStream!]!

    "Get user's expenses with optional filters"
    myExpenses(
      startDate: DateTime
      endDate: DateTime
      category: String
      isRecurring: Boolean
      limit: Int
      offset: Int
    ): [UserExpense!]!

    "Get user's budget categories"
    myBudgets: [UserBudget!]!

    "Get aggregated financial summary"
    myFinancialSummary: FinancialSummary!

    "Get comprehensive data for the finances page view"
    financesPageData: FinancesPageData!
  }

  # Cash flow data point for charts
  type CashFlowDataPoint {
    month: String!
    income: Float!
    expenses: Float!
  }

  # Income history data point
  type IncomeHistoryDataPoint {
    month: String!
    total: Float!
    primary: Float!
    secondary: Float!
  }

  # Expense history data point
  type ExpenseHistoryDataPoint {
    month: String!
    total: Float!
    recurring: Float!
    oneTime: Float!
  }

  # Budget vs actual data
  type BudgetVsActualDataPoint {
    category: String!
    budget: Float!
    actual: Float!
  }

  # Spending category breakdown
  type SpendingCategoryData {
    category: String!
    amount: Float!
    color: String!
  }

  # Upcoming expense
  type UpcomingExpenseItem {
    id: ID!
    category: String!
    description: String!
    amount: Float!
    dueDate: DateTime!
    urgency: String
    isRecurring: Boolean!
  }

  # Income stream for page display
  type IncomeStreamItem {
    id: ID!
    source: String!
    amount: Float!
    frequency: IncomeFrequency!
    isActive: Boolean!
    description: String
    monthlyEquivalent: Float!
  }

  # Expense item for page display
  type ExpenseItem {
    id: ID!
    category: String!
    amount: Float!
    description: String
    date: DateTime!
    isRecurring: Boolean!
    frequency: IncomeFrequency
    issueTitle: String
    urgency: String
  }

  # Complete finances page response
  type FinancesPageData {
    # Summary stats
    monthlyIncome: Float!
    monthlyExpenses: Float!
    availableFunds: Float!
    monthlyBudget: Float!
    remaining: Float!
    emergencyFundPercent: Float!
    diySaved: Float!
    pendingUrgent: Float!

    # Data lists
    incomeStreams: [IncomeStreamItem!]!
    expenses: [ExpenseItem!]!
    upcomingExpenses: [UpcomingExpenseItem!]!
    spendingByCategory: [SpendingCategoryData!]!

    # Chart data
    cashFlowHistory: [CashFlowDataPoint!]!
    incomeHistory: [IncomeHistoryDataPoint!]!
    expenseHistory: [ExpenseHistoryDataPoint!]!
    budgetVsActual: [BudgetVsActualDataPoint!]!

    # Categories for filters
    categories: [String!]!
  }
`;

export const financeMutations = /* GraphQL */ `
  extend type Mutation {
    "Add an income stream"
    addIncomeStream(
      source: String!
      amount: String!
      frequency: IncomeFrequency!
      description: String
      startDate: DateTime
      endDate: DateTime
    ): UserIncomeStream!

    "Update an income stream"
    updateIncomeStream(
      id: ID!
      source: String
      amount: String
      frequency: IncomeFrequency
      description: String
      isActive: Boolean
      startDate: DateTime
      endDate: DateTime
    ): UserIncomeStream!

    "Delete an income stream"
    deleteIncomeStream(id: ID!): Boolean!

    "Add an expense"
    addExpense(
      category: String!
      amount: String!
      description: String
      date: DateTime!
      isRecurring: Boolean
      recurringFrequency: IncomeFrequency
      issueId: ID
    ): UserExpense!

    "Update an expense"
    updateExpense(
      id: ID!
      category: String
      amount: String
      description: String
      date: DateTime
      isRecurring: Boolean
      recurringFrequency: IncomeFrequency
    ): UserExpense!

    "Delete an expense"
    deleteExpense(id: ID!): Boolean!

    "Set or update a budget category"
    setBudget(category: String!, monthlyLimit: String!): UserBudget!

    "Update budget spending"
    updateBudgetSpend(id: ID!, currentSpend: String!): UserBudget!

    "Delete a budget category"
    deleteBudget(id: ID!): Boolean!
  }
`;
