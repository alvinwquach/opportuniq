/**
 * Fixtures for database-related tests
 */

export const SAMPLE_USER = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user" as const,
  createdAt: new Date("2024-01-01"),
};

export const SAMPLE_GROUP = {
  id: "group-456",
  name: "The Johnson Household",
  createdBy: "user-123",
  createdAt: new Date("2024-01-15"),
};

export const SAMPLE_GROUP_MEMBER = {
  id: "member-789",
  groupId: "group-456",
  userId: "user-123",
  role: "coordinator" as const,
  status: "active" as const,
  joinedAt: new Date("2024-01-15"),
};

export const SAMPLE_ISSUE = {
  id: "issue-001",
  groupId: "group-456",
  createdBy: "user-123",
  title: "Leaky Kitchen Faucet",
  description: "Dripping under the sink",
  status: "open" as const,
  priority: "medium" as const,
  category: "home_repair" as const,
  createdAt: new Date("2024-02-01"),
};

export const SAMPLE_DECISION_OPTION = {
  id: "option-001",
  issueId: "issue-001",
  type: "diy" as const,
  title: "DIY Repair",
  description: "Fix it yourself with a wrench",
  costMin: "20.00",
  costMax: "50.00",
  timeEstimate: "2 hours",
  riskLevel: "low",
};

export const SAMPLE_INCOME_STREAM = {
  id: "income-001",
  userId: "user-123",
  encryptedSource: "encrypted-salary",
  sourceIv: "iv-source",
  encryptedAmount: "encrypted-5000",
  amountIv: "iv-amount",
  frequency: "monthly" as const,
  isActive: true,
  isEncrypted: true,
  keyVersion: 1,
};

export const SAMPLE_EXPENSE = {
  id: "expense-001",
  userId: "user-123",
  encryptedCategory: "encrypted-utilities",
  categoryIv: "iv-cat",
  encryptedAmount: "encrypted-150",
  amountIv: "iv-amt",
  date: new Date("2024-02-15"),
  isRecurring: false,
  isEncrypted: true,
  keyVersion: 1,
};

export const SAMPLE_BUDGET = {
  id: "budget-001",
  userId: "user-123",
  encryptedCategory: "encrypted-home",
  categoryIv: "iv-cat",
  encryptedMonthlyLimit: "encrypted-500",
  monthlyLimitIv: "iv-limit",
  encryptedCurrentSpend: "encrypted-250",
  currentSpendIv: "iv-spend",
  isEncrypted: true,
  keyVersion: 1,
};

export const SAMPLE_INVITATION = {
  id: "inv-001",
  groupId: "group-456",
  email: "newmember@example.com",
  role: "collaborator" as const,
  token: "invite-token-abc",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  usedAt: null,
  revokedAt: null,
  createdBy: "user-123",
};

export const SAMPLE_WAITLIST = {
  id: "waitlist-001",
  email: "waiting@example.com",
  phase: "beta" as const,
  source: "referral",
  referralCode: "REF123",
  myReferralCode: "MY456",
  referralCount: "0",
  createdAt: new Date("2024-01-01"),
  convertedAt: null,
  convertedUserId: null,
};
