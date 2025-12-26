/**
 * User Domain Schema
 *
 * Everything related to individual user accounts and personal finances:
 * - User authentication and profile
 * - Income streams (salary, side hustles, gig work)
 * - Personal expenses (PRIVATE - not shared with group)
 * - Personal budgets (spending limits per category)
 */

export const userTypeDefs = /* GraphQL */ `
  # ============================================
  # USER TYPES
  # ============================================

  # Represents a single user of the platform
  # A user can belong to multiple groups and has private financial data
  type User {
    # Core identity fields
    id: ID!                      # Unique identifier - REQUIRED, never null
    email: String!               # Email address - REQUIRED for login
    name: String                 # Display name - OPTIONAL (can be null if not set)

    # Location (for vendor search)
    zipCode: String              # OPTIONAL - used to find nearby service providers
    defaultSearchRadius: Int     # OPTIONAL - miles to search for vendors (e.g., 25)

    # Timestamps
    createdAt: String!           # REQUIRED - when user signed up (ISO 8601 format)
    updatedAt: String!           # REQUIRED - last profile update

    # Relationships to other types
    # [UserIncomeStream!]! = REQUIRED array of REQUIRED items (never null, items never null)
    incomeStreams: [UserIncomeStream!]!  # All user's income sources (salary, side hustles)
    expenses: [UserExpense!]!            # All user's personal expenses
    budgets: [UserBudget!]!              # User's spending limits per category
  }

  # ============================================
  # PERSONAL FINANCE TYPES (PRIVATE)
  # ============================================
  # Financial data visible ONLY to the individual user
  # Other group members CANNOT see this data
  # For shared group finances, see GroupExpense in group.ts

  # Represents a source of income (salary, gig work, side business, etc.)
  # Examples: "Full-time job", "Weekend DoorDash", "Photography side business"
  type UserIncomeStream {
    id: ID!                      # Unique identifier - REQUIRED
    userId: ID!                  # Which user owns this income stream - REQUIRED

    # Income details
    source: String!              # REQUIRED - flexible text: "Salary", "DoorDash", "Photography"
    amount: String!              # REQUIRED - stored as string to avoid floating-point issues
                                 # Example: "5000.00" for $5,000
    frequency: IncomeFrequency!  # REQUIRED - how often paid (WEEKLY, MONTHLY, etc.)
    description: String          # OPTIONAL - extra details: "Software Engineer at Acme Corp"

    # Status tracking
    isActive: Boolean!           # REQUIRED - true if still receiving income, false if ended
    startDate: String            # OPTIONAL - when income started (ISO 8601: "2024-01-15")
    endDate: String              # OPTIONAL - when income ended (null if still active)

    # Timestamps
    createdAt: String!           # REQUIRED - when this income stream was added
    updatedAt: String!           # REQUIRED - last modification
  }

  # Represents a personal expense (rent, groceries, car payment, etc.)
  # Separate from group shared expenses
  type UserExpense {
    id: ID!                      # Unique identifier - REQUIRED
    userId: ID!                  # Which user made this expense - REQUIRED

    # Expense details
    category: String!            # REQUIRED - flexible: "Repairs", "Groceries", "Car Payment"
    amount: String!              # REQUIRED - stored as string: "150.00" for $150
    date: String!                # REQUIRED - when expense occurred (ISO 8601: "2024-01-15")
    description: String          # OPTIONAL - extra details: "Oil change at Jiffy Lube"

    # Recurring expenses (subscriptions, monthly bills)
    isRecurring: Boolean!        # REQUIRED - true if repeats regularly (rent, Netflix)
    recurringFrequency: IncomeFrequency  # OPTIONAL - how often it repeats (only if isRecurring=true)
    nextDueDate: String          # OPTIONAL - when next payment is due (ISO 8601)

    # Link to group repair issue (if expense is repair-related)
    issueId: ID                  # OPTIONAL - connects expense to group Issue

    createdAt: String!           # REQUIRED - when expense was recorded
  }

  # Represents a spending limit for a category (e.g., "Repairs: $500/month")
  # Helps users track if they're overspending in a category
  type UserBudget {
    id: ID!                      # Unique identifier - REQUIRED
    userId: ID!                  # Which user set this budget - REQUIRED

    # Budget details
    category: String!            # REQUIRED - should match expense categories exactly
    monthlyLimit: String!        # REQUIRED - max spending per month: "500.00"
    currentSpend: String!        # REQUIRED - how much spent so far this month: "237.50"
    remainingBudget: String      # OPTIONAL - calculated field: monthlyLimit - currentSpend
                                 # Can be computed on frontend, but provided for convenience

    updatedAt: String!           # REQUIRED - when budget was last updated
  }

  # ============================================
  # USER INPUT TYPES
  # ============================================
  # Input types are used for mutations (creating/updating data)
  # Think of them like function parameters

  # Create a new user account
  input CreateUserInput {
    email: String!     # REQUIRED - must be valid email
    name: String       # OPTIONAL - can set later
    zipCode: String    # OPTIONAL - for vendor search
  }

  # Add a new income source (salary, side hustle, etc.)
  input CreateUserIncomeStreamInput {
    source: String!              # REQUIRED - e.g., "Salary", "DoorDash", "Photography"
    amount: String!              # REQUIRED - e.g., "5000.00"
    frequency: IncomeFrequency!  # REQUIRED - WEEKLY, MONTHLY, etc.
    description: String          # OPTIONAL - e.g., "Software Engineer at Acme"
    startDate: String            # OPTIONAL - when income started
  }

  # Record a personal expense
  input CreateUserExpenseInput {
    category: String!              # REQUIRED - e.g., "Repairs", "Groceries"
    amount: String!                # REQUIRED - e.g., "150.00"
    date: String!                  # REQUIRED - when expense occurred
    description: String            # OPTIONAL - extra details
    isRecurring: Boolean           # OPTIONAL - defaults to false
    recurringFrequency: IncomeFrequency  # OPTIONAL - only if isRecurring=true
    nextDueDate: String            # OPTIONAL - when next payment due
    issueId: ID                    # OPTIONAL - link to group repair if applicable
  }

  # Set a spending limit for a category
  input CreateUserBudgetInput {
    category: String!      # REQUIRED - should match expense categories
    monthlyLimit: String!  # REQUIRED - max to spend per month
  }

  # Update user profile (name, location, search radius)
  input UpdateUserInput {
    userId: ID!                  # REQUIRED - which user to update
    name: String                 # OPTIONAL - update display name
    zipCode: String              # OPTIONAL - update location
    defaultSearchRadius: Int     # OPTIONAL - update vendor search radius
  }

  # Update an income stream (amount, status, dates)
  input UpdateUserIncomeStreamInput {
    incomeStreamId: ID!          # REQUIRED - which income stream to update
    source: String               # OPTIONAL - update source name
    amount: String               # OPTIONAL - update income amount
    frequency: IncomeFrequency   # OPTIONAL - update payment frequency
    description: String          # OPTIONAL - update description
    isActive: Boolean            # OPTIONAL - mark as active/inactive
    endDate: String              # OPTIONAL - set end date if income stopped
  }

  # Update a personal expense
  input UpdateUserExpenseInput {
    expenseId: ID!                      # REQUIRED - which expense to update
    category: String                    # OPTIONAL - update category
    amount: String                      # OPTIONAL - update amount
    date: String                        # OPTIONAL - update date
    description: String                 # OPTIONAL - update description
    isRecurring: Boolean                # OPTIONAL - update recurring status
    recurringFrequency: IncomeFrequency # OPTIONAL - update frequency
    nextDueDate: String                 # OPTIONAL - update next due date
  }

  # Update a budget limit
  input UpdateUserBudgetInput {
    budgetId: ID!            # REQUIRED - which budget to update
    monthlyLimit: String     # OPTIONAL - update spending limit
    currentSpend: String     # OPTIONAL - update current spend (usually auto-calculated)
  }

`;
