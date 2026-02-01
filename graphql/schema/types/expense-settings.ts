/**
 * Group Expense Settings GraphQL Type Definitions
 */

export const expenseSettingsTypes = /* GraphQL */ `
  type GroupExpenseSettings {
    id: ID!
    groupId: ID!
    approvalMode: ExpenseApprovalMode!
    defaultThreshold: String
    trustOwnerAdmin: Boolean!
    moderatorThreshold: String
    allowModeratorApprove: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type GroupExpenseCategory {
    id: ID!
    groupId: ID!
    name: String!
    icon: String
    approvalRule: CategoryApprovalRule!
    customThreshold: String
    sortOrder: Int!
    createdBy: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const expenseSettingsEnums = /* GraphQL */ `
  enum ExpenseApprovalMode {
    none
    required
    threshold
  }

  enum CategoryApprovalRule {
    use_default
    always_require
    custom_threshold
  }
`;

export const expenseSettingsInputs = /* GraphQL */ `
  input UpdateExpenseSettingsInput {
    approvalMode: ExpenseApprovalMode
    defaultThreshold: String
    trustOwnerAdmin: Boolean
    moderatorThreshold: String
    allowModeratorApprove: Boolean
  }

  input CreateExpenseCategoryInput {
    name: String!
    icon: String
    approvalRule: CategoryApprovalRule
    customThreshold: String
    sortOrder: Int
  }

  input UpdateExpenseCategoryInput {
    name: String
    icon: String
    approvalRule: CategoryApprovalRule
    customThreshold: String
    sortOrder: Int
  }
`;

export const expenseSettingsQueries = /* GraphQL */ `
  extend type Query {
    "Get expense settings for a group"
    groupExpenseSettings(groupId: ID!): GroupExpenseSettings

    "Get expense categories for a group"
    groupExpenseCategories(groupId: ID!): [GroupExpenseCategory!]!
  }
`;

export const expenseSettingsMutations = /* GraphQL */ `
  extend type Mutation {
    "Update group expense settings"
    updateExpenseSettings(groupId: ID!, input: UpdateExpenseSettingsInput!): GroupExpenseSettings!

    "Create an expense category"
    createExpenseCategory(groupId: ID!, input: CreateExpenseCategoryInput!): GroupExpenseCategory!

    "Update an expense category"
    updateExpenseCategory(id: ID!, input: UpdateExpenseCategoryInput!): GroupExpenseCategory!

    "Delete an expense category"
    deleteExpenseCategory(id: ID!): Boolean!
  }
`;
