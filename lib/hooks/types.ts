/**
 * types.ts — Shared TypeScript type definitions for all server actions and React hooks.
 *
 * This file is the single source of truth for every data shape used across the app.
 * It covers users, groups, issues, decisions, finances, guides, calendar events,
 * dashboard aggregates, admin data, and more.
 *
 * Originally auto-generated from a GraphQL schema; now defined inline so the app
 * no longer depends on GraphQL at runtime.
 *
 * HOW TO READ THIS FILE
 * ---------------------
 * - "Response" types  → data returned FROM the server to the UI
 * - "Input" types     → data sent FROM the UI to a server action
 * - Optional fields (field?: type) are marked with why they may be absent
 * - Union types (T | null) are explained for each possible state
 */

// =============================================================================
// USER TYPES
// =============================================================================

/**
 * The full profile of the currently authenticated user.
 * Returned by the `getMe` server action and used wherever the app needs
 * to display or act on the logged-in user's own data.
 */
export interface MeResponse {
  /** Unique database ID for this user. */
  id: string;
  /** The user's email address, used for login and notifications. */
  email: string;
  /** The user's display name. Null if the user has not set one yet. */
  name: string | null;
  /** URL of the user's profile avatar image. Null if no avatar has been uploaded. */
  avatarUrl: string | null;
  /** The city portion of the user's address. Null if not provided. */
  city: string | null;
  /** State or province portion of the user's address. Null if not provided. */
  stateProvince: string | null;
  /** Postal / ZIP code for the user's location. Null if not provided. */
  postalCode: string | null;
  /** Country of residence. Null if not provided. */
  country: string | null;
  /** The user's notification and display preferences. Null if not yet configured. */
  preferences: UserPreferences | null;
  /** The user's self-reported monthly budget as a decimal string (e.g. "2500.00"). Null if not set. */
  monthlyBudget: string | null;
  /** The user's desired emergency cash buffer as a decimal string. Null if not set. */
  emergencyBuffer: string | null;
  /** The user's risk tolerance level (e.g. "low", "medium", "high"). Null if not set. */
  riskTolerance: string | null;
  /** ISO 8601 timestamp of when the user account was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the user's most recent activity. Null if they have never been seen after sign-up. */
  lastSeenAt: string | null;
  /** Total number of groups the user belongs to. Used for quick badge counts in the UI. */
  groupCount: number;
}

/**
 * The user's configurable preferences controlling UI appearance and notifications.
 * Nested inside MeResponse. Every field is nullable because users may not have
 * set any preferences yet; the app falls back to sensible defaults in that case.
 */
export interface UserPreferences {
  /** Preferred UI language code (e.g. "en", "fr"). Null means use the browser default. */
  language: string | null;
  /** UI color theme (e.g. "light", "dark", "system"). Null means use the system default. */
  theme: string | null;
  /** Whether the user wants to receive email notifications. Null means not yet configured. */
  emailNotifications: boolean | null;
  /** Whether the user wants to receive SMS notifications. Null means not yet configured. */
  smsNotifications: boolean | null;
  /** Whether the user wants a weekly digest email summarizing activity. Null means not yet configured. */
  weeklyDigest: boolean | null;
  /** Measurement unit system preference (e.g. "imperial", "metric"). Null means not yet set. */
  unitSystem: string | null;
  /** Preferred currency code for financial display (e.g. "USD", "CAD"). Null means not yet set. */
  currency: string | null;
}

/**
 * Extended version of MeResponse that also includes the groups the user belongs to
 * and any how-to guides associated with their account.
 * Returned by server actions that need to hydrate the full sidebar/nav in one request.
 */
export interface MeWithGroupsResponse extends MeResponse {
  /** All groups the user is a member of, as lightweight list items for navigation. */
  groups: GroupListItem[];
  /** How-to guides saved or in-progress for this user. */
  guides: GuideResponse[];
}

/**
 * A lightweight representation of any user in the system, used when the app needs
 * to display another person (e.g. a group member, a comment author) rather than
 * the current user's own full profile.
 */
export interface UserResponse {
  /** Unique database ID for this user. */
  id: string;
  /** The user's display name. Null if they have not set one. */
  name: string | null;
  /** The user's email address. */
  email: string;
  /** URL of the user's avatar image. Null if none uploaded. */
  avatarUrl: string | null;
  /**
   * Optional user preferences. Absent in contexts where preferences are not
   * needed (e.g. comment author attribution), to avoid over-fetching.
   */
  preferences?: UserPreferences | null;
}

// =============================================================================
// GROUP TYPES
// =============================================================================

/**
 * A compact summary of a group used in lists and navigation menus.
 * Contains just enough data to render a group card without loading full membership details.
 */
export interface GroupListItem {
  /** Unique database ID for this group. */
  id: string;
  /** Human-readable name of the group (e.g. "123 Maple St Owners"). */
  name: string;
  /** Postal/ZIP code associated with the group's location. Null if not set. */
  postalCode: string | null;
  /** Total number of members in the group. */
  memberCount: number;
  /** Total number of issues (all statuses) ever created in this group. */
  issueCount: number;
  /** Number of issues currently in an active (non-resolved/non-deferred) state. */
  activeIssueCount: number;
  /** ISO 8601 timestamp of when this group was created. */
  createdAt: string;
}

/**
 * A group with additional operational settings beyond the basic list item.
 * Used on group detail pages where the full configuration is needed.
 */
export interface GroupResponse extends GroupListItem {
  /** Default radius in miles/km used when searching for local vendors. Null if not configured. */
  defaultSearchRadius: number | null;
  /** Budget and risk constraints that govern how the group makes decisions. Null if not yet set up. */
  constraints: GroupConstraintsResponse | null;
}

/**
 * A group that also includes its full member roster, split into all members
 * and a convenience subset of only active members.
 * Used on the group management page.
 */
export interface GroupWithMembersResponse extends GroupResponse {
  /** All members of the group regardless of activity status. */
  members: GroupMemberResponse[];
  /** Members who are currently active (a subset of `members`). */
  activeMembers: GroupMemberResponse[];
}

/**
 * Financial and operational constraints that a group has configured to guide
 * its decision-making process (budgets, risk tolerance, DIY preferences).
 */
export interface GroupConstraintsResponse {
  /** Unique database ID for this constraints record. */
  id: string;
  /** The group's monthly maintenance budget as a decimal string. Null if not set. */
  monthlyBudget: string | null;
  /** The emergency reserve buffer amount the group wants to maintain. Null if not set. */
  emergencyBuffer: string | null;
  /** The group's current shared financial balance as a decimal string. Always present. */
  sharedBalance: string;
  /** The group's risk tolerance level (e.g. "low", "medium", "high"). Null if not set. */
  riskTolerance: string | null;
  /** The group's preference for DIY vs. hiring professionals (e.g. "prefer-diy"). Null if not set. */
  diyPreference: string | null;
  /**
   * Categories of tasks the group will never attempt as DIY (e.g. ["electrical", "gas"]).
   * Null if no restrictions have been configured.
   */
  neverDIY: string[] | null;
}

/**
 * A single member of a group, including their role, membership status,
 * and a reference to their user account.
 * Used in member lists and permission checks.
 */
export interface GroupMemberResponse {
  /** Unique database ID for this group membership record. */
  id: string;
  /** The member's role within the group (e.g. "owner", "admin", "member"). */
  role: string;
  /** The membership status (e.g. "active", "invited", "removed"). */
  status: string;
  /** ISO 8601 timestamp of when the user joined the group. Null if the invitation is still pending. */
  joinedAt: string | null;
  /** The underlying user account associated with this membership. */
  user: {
    /** Unique database ID of the user. */
    id: string;
    /** The user's display name. Null if not set. */
    name: string | null;
    /** The user's email address. */
    email: string;
    /** URL of the user's avatar image. Null if none uploaded. */
    avatarUrl: string | null;
  };
}

/**
 * An outstanding invitation sent to a person to join a group.
 * Shown in the group management UI so owners/admins can track pending invites.
 */
export interface GroupInvitationResponse {
  /** Unique database ID for this invitation record. */
  id: string;
  /** Email address the invitation was sent to. */
  email: string;
  /** The role that will be granted if the invitation is accepted (e.g. "member", "admin"). */
  role: string;
  /** Optional personal message included in the invitation email. Null if none was written. */
  message: string | null;
  /** ISO 8601 timestamp of when the invitation was sent. */
  invitedAt: string;
  /** ISO 8601 timestamp after which the invitation link is no longer valid. Null if it never expires. */
  expiresAt: string | null;
  /** The group this invitation is for (id and name for display purposes). */
  group: { id: string; name: string };
  /** The group member who sent the invitation. */
  invitedBy: GroupMemberResponse;
}

// =============================================================================
// ISSUE TYPES
// =============================================================================

/**
 * A compact summary of a maintenance or repair issue, suitable for list views
 * and search results. Does not include the full resolution history or evidence.
 */
export interface IssueListItem {
  /** Unique database ID for this issue. */
  id: string;
  /** Short human-readable title of the issue (e.g. "Leaking kitchen faucet"). Null if not yet titled. */
  title: string | null;
  /** Longer description of what the user observed or reported. Null if not yet provided. */
  description: string | null;
  /** Top-level category of the issue (e.g. "plumbing", "electrical"). Null if not yet categorized. */
  category: string | null;
  /** More specific subcategory within the category (e.g. "faucet", "drain"). Null if not yet set. */
  subcategory: string | null;
  /**
   * Workflow status of the issue.
   * Common values: "open", "investigating", "options_generated", "decided", "in_progress", "completed", "deferred".
   */
  status: string;
  /**
   * Priority level of the issue.
   * Common values: "low", "medium", "high", "critical".
   */
  priority: string;
  /**
   * AI diagnosis confidence score from 0 to 100.
   * Null if no AI diagnosis has been run yet.
   */
  confidenceLevel: number | null;
  /** The AI-generated or manually entered diagnosis text. Null if not yet diagnosed. */
  diagnosis: string | null;
  /**
   * Severity rating of the issue (e.g. "minor", "moderate", "severe").
   * Null if not yet assessed.
   */
  severity: string | null;
  /**
   * How urgently the issue needs attention (e.g. "can-wait", "soon", "urgent", "immediate").
   * Null if not yet assessed.
   */
  urgency: string | null;
  /** True if this issue has been flagged as a safety emergency requiring immediate action. */
  isEmergency: boolean;
  /** ISO 8601 timestamp of when the issue was first reported. */
  createdAt: string;
  /** ISO 8601 timestamp of the most recent update to this issue. */
  updatedAt: string;
  /** The group this issue belongs to (id and name for display). */
  group: { id: string; name: string };
  /** The group member who created/reported the issue and their display info. */
  createdBy: {
    /** The group membership ID of the reporter. */
    id: string;
    /** The user account of the reporter. */
    user: { name: string | null; avatarUrl: string | null };
  };
}

/**
 * A full issue record with all fields needed for the issue detail page.
 * Extends IssueListItem with resolution data, evidence counts, and AI output fields.
 */
export interface IssueResponse extends IssueListItem {
  /** Name of the asset or item involved (e.g. "Bosch dishwasher", "north roof section"). Null if not specified. */
  assetName: string | null;
  /** Flexible JSON blob of additional asset metadata (model, age, serial number, etc.). Shape varies by asset type. */
  assetDetails: unknown;
  /**
   * Notes recorded when the user chose to ignore a risk warning.
   * Null if no risk was ignored.
   */
  ignoreRisk: string | null;
  /**
   * List of symptoms or conditions to monitor after a decision is made (e.g. ["water stain spreading", "noise returning"]).
   * Null if not specified.
   */
  warningSignsToWatch: string[] | null;
  /** Instructions describing when the user should escalate to a professional. Null if not specified. */
  whenToEscalate: string | null;
  /** Step-by-step safety instructions for use during an emergency situation. Null if not an emergency issue. */
  emergencyInstructions: string | null;
  /** Classification of what kind of emergency this is (e.g. "fire", "flood", "gas-leak"). Null if not an emergency. */
  emergencyType: string | null;
  /** How the issue was ultimately resolved (e.g. "diy", "hired", "replaced", "deferred"). Null until resolved. */
  resolutionType: string | null;
  /** Free-text notes written by the resolver describing what was done. Null until resolved. */
  resolutionNotes: string | null;
  /** ISO 8601 timestamp of when the issue was marked resolved. Null if still open. */
  resolvedAt: string | null;
  /** ISO 8601 timestamp of when any associated work was fully completed. Null if not yet completed. */
  completedAt: string | null;
  /** Total number of evidence items (photos, documents) attached to this issue. */
  evidenceCount: number;
  /** Total number of comments posted on this issue. */
  commentCount: number;
  /**
   * The group member who resolved the issue with their user details.
   * Null if the issue has not yet been resolved.
   */
  resolvedBy: { id: string; user: { id: string; name: string | null } } | null;
}

/**
 * The most complete version of an issue, including all decision options, the final
 * decision (if made), attached evidence, AI hypotheses, and comments.
 * Used on the full issue detail / diagnose page.
 */
export interface IssueWithOptionsResponse extends IssueResponse {
  /** All repair/resolution options that were generated for this issue. */
  options: DecisionOptionResponse[];
  /** The decision that was made (chosen option + vote summary). Null if no decision has been made yet. */
  decision: DecisionResponse | null;
  /** All evidence items (photos, files) attached to this issue. */
  evidence: EvidenceResponse[];
  /** AI-generated diagnostic hypotheses for this issue. */
  hypotheses: HypothesisResponse[];
  /** All comments posted on this issue. */
  comments: CommentResponse[];
}

// =============================================================================
// DECISION TYPES
// =============================================================================

/**
 * A single repair/resolution option presented to the group for a given issue.
 * Options are typically AI-generated and include cost estimates, safety notes,
 * and a recommendation flag.
 */
export interface DecisionOptionResponse {
  /** Unique database ID for this option. */
  id: string;
  /** The option type describing the resolution approach (e.g. "diy", "hire", "replace", "defer"). */
  type: string;
  /** Short title of the option (e.g. "Replace the wax ring yourself"). */
  title: string;
  /** Longer explanation of what this option involves. Null if not provided. */
  description: string | null;
  /** Minimum estimated cost for this option as a decimal string. Null if unknown. */
  costMin: string | null;
  /** Maximum estimated cost for this option as a decimal string. Null if unknown. */
  costMax: string | null;
  /** Human-readable estimate of how long this option will take (e.g. "2-3 hours"). Null if unknown. */
  timeEstimate: string | null;
  /** Risk level associated with this option (e.g. "low", "medium", "high"). Null if not assessed. */
  riskLevel: string | null;
  /** True if a non-professional could realistically complete this option themselves. */
  diyViable: boolean;
  /** A warning message shown when DIY is technically possible but has important caveats. Null if no warning. */
  diyWarning: string | null;
  /**
   * Skills a person needs to complete this option (e.g. ["basic plumbing", "soldering"]).
   * Null if no specific skills are required.
   */
  requiredSkills: string[] | null;
  /**
   * Tools needed to complete this option (e.g. ["pipe wrench", "multimeter"]).
   * Null if no special tools are required.
   */
  requiredTools: string[] | null;
  /**
   * Parts or materials needed to complete this option (e.g. ["wax ring", "toilet bolts"]).
   * Null if no parts are required.
   */
  requiredParts: string[] | null;
  /** True if this option is the AI-recommended best choice for the group. */
  recommended: boolean;
  /** Explanation of why this option is or isn't recommended. Null if no reasoning was generated. */
  reasoning: string | null;
  /**
   * AI confidence score (0–100) for this option being the correct course of action.
   * Null if no confidence score was calculated.
   */
  confidenceScore: number | null;
  /**
   * List of required personal protective equipment (PPE) for this option.
   * Each entry has the item name, priority level, and the reason it's needed.
   * Null if no PPE is required.
   */
  ppe: { item: string; priority: string; reason: string }[] | null;
  /**
   * List of hazards associated with attempting this option (e.g. ["electrical shock risk", "sharp edges"]).
   * Null if no hazards identified.
   */
  hazards: string[] | null;
}

/**
 * The decision that was made for an issue — which option was selected,
 * when it was approved, and a summary of the group vote.
 */
export interface DecisionResponse {
  /** Unique database ID for this decision record. */
  id: string;
  /** ISO 8601 timestamp of when the decision was approved by the group. */
  approvedAt: string;
  /** The option that was chosen, with its id, title, and type for display. */
  selectedOption: { id: string; title: string; type: string };
  /** Total number of votes cast on this decision. */
  voteCount: number;
  /** Number of votes that were in approval (as opposed to rejection or abstention). */
  approvalCount: number;
}

/**
 * A post-resolution record capturing how the chosen option actually played out.
 * Created after a repair is completed so the group can learn from experience.
 */
export interface DecisionOutcomeResponse {
  /** Unique database ID for this outcome record. */
  id: string;
  /** The actual money spent as a decimal string. Null if not recorded. */
  actualCost: string | null;
  /** The actual time it took, as a human-readable string (e.g. "4 hours"). Null if not recorded. */
  actualTime: string | null;
  /** Whether the resolution attempt was considered successful. */
  success: boolean;
  /** ISO 8601 timestamp of when the work was completed. */
  completedAt: string;
  /**
   * Difference between actual cost and the estimated cost (positive = over budget, negative = under).
   * Decimal string. Null if cost data is incomplete.
   */
  costDelta: string | null;
  /**
   * Difference between actual time and estimated time.
   * Human-readable string. Null if time data is incomplete.
   */
  timeDelta: string | null;
  /** Free-text description of what went well. Null if not filled in. */
  whatWentWell: string | null;
  /** Free-text description of what went wrong. Null if not filled in. */
  whatWentWrong: string | null;
  /** Key takeaways or advice for future issues like this. Null if not filled in. */
  lessonsLearned: string | null;
  /** Whether the group would choose the same option again given the outcome. Null if not answered. */
  wouldDoAgain: boolean | null;
  /** The original decision this outcome is associated with. */
  decision: DecisionResponse;
}

/**
 * A single piece of evidence (photo, document, audio clip) attached to an issue.
 * Evidence helps the AI and group members diagnose the problem.
 */
export interface EvidenceResponse {
  /** Unique database ID for this evidence item. */
  id: string;
  /** The kind of evidence (e.g. "photo", "video", "document", "audio"). */
  evidenceType: string;
  /** The original filename of the uploaded file. Null if not captured. */
  fileName: string | null;
  /** The URL where the file can be accessed in storage. Null if upload is not complete. */
  storageUrl: string | null;
  /** ISO 8601 timestamp of when this evidence was attached. */
  createdAt: string;
}

/**
 * An AI-generated hypothesis about what might be causing an issue.
 * Multiple hypotheses may be generated; each has an individual confidence score.
 */
export interface HypothesisResponse {
  /** Unique database ID for this hypothesis. */
  id: string;
  /** The hypothesis text (e.g. "The wax ring seal has failed due to toilet movement"). Null if not yet generated. */
  hypothesis: string | null;
  /** Confidence score from 0 to 100 representing how likely this hypothesis is correct. */
  confidence: number;
  /** ISO 8601 timestamp of when this hypothesis was generated. */
  createdAt: string;
}

/**
 * A single comment posted by a group member on an issue.
 * Used in the issue discussion thread.
 */
export interface CommentResponse {
  /** Unique database ID for this comment. */
  id: string;
  /** The text content of the comment. Null if the comment was deleted or is being drafted. */
  content: string | null;
  /** ISO 8601 timestamp of when this comment was posted. */
  createdAt: string;
  /** The group member who wrote this comment, with their user display info. */
  author: {
    /** The group membership ID of the comment author. */
    id: string;
    /** The user account of the comment author. */
    user: { id: string; name: string | null; avatarUrl: string | null };
  };
}

// =============================================================================
// GUIDE TYPES
// =============================================================================

/**
 * A how-to guide or resource (from Reddit, YouTube, or other sources) that has been
 * surfaced as relevant to an issue or category. Tracks whether the user clicked,
 * bookmarked, or found it helpful.
 */
export interface GuideResponse {
  /** Unique database ID for this guide record. */
  id: string;
  /** Title of the guide or post. */
  title: string;
  /** The URL where the guide can be found. */
  url: string;
  /** The platform or site this guide came from (e.g. "reddit", "youtube", "wikihow"). */
  source: string;
  /** The specific Reddit subreddit if the source is Reddit (e.g. "r/DIY"). Null for non-Reddit sources. */
  subreddit: string | null;
  /** Number of upvotes this post has on Reddit. Null for non-Reddit sources or if unavailable. */
  upvotes: number | null;
  /** Number of comments on the original post. Null if unavailable. */
  commentCount: number | null;
  /** Human-readable age of the original post (e.g. "2 years ago"). Null if unavailable. */
  postAge: string | null;
  /** A short excerpt or summary of the guide content. Null if not generated. */
  excerpt: string | null;
  /** How relevant this guide is to the current issue, from 0 to 1. Null if not scored. */
  relevanceScore: number | null;
  /** The specific focus area of this guide (e.g. "wax ring replacement"). Null if not categorized. */
  focusArea: string | null;
  /** Whether the user has clicked through to this guide. */
  wasClicked: boolean;
  /** Whether the user has bookmarked this guide for later reference. */
  wasBookmarked: boolean;
  /** Whether the user marked this guide as helpful. Null if the user has not yet rated it. */
  wasHelpful: boolean | null;
  /** The search query that surfaced this guide. Null if not tracked. */
  searchQuery: string | null;
  /** The issue category this guide is associated with (e.g. "plumbing"). Null if not categorized. */
  issueCategory: string | null;
  /** ISO 8601 timestamp of when this guide was saved/associated. */
  createdAt: string;
  /** ISO 8601 timestamp of when the user first clicked this guide. Null if never clicked. */
  clickedAt: string | null;
}

// =============================================================================
// FINANCE TYPES
// =============================================================================

/**
 * A single income stream contributing to the user's total monthly income.
 * Examples: salary, freelance work, rental income, dividends.
 */
export interface IncomeStreamResponse {
  /** Unique database ID for this income stream. */
  id: string;
  /** Name or label of the income source (e.g. "Day job", "Airbnb rental"). */
  source: string;
  /** The income amount as a decimal string (e.g. "3500.00"). */
  amount: string;
  /** Optional notes about this income stream. Null if not provided. */
  description: string | null;
  /** How often this income is received (e.g. "monthly", "biweekly", "annual"). */
  frequency: string;
  /** Whether this income stream is currently active and being earned. */
  isActive: boolean;
  /** ISO 8601 date when this income stream started. Null if not tracked. */
  startDate: string | null;
  /** ISO 8601 date when this income stream ended or is expected to end. Null if ongoing. */
  endDate: string | null;
  /** The normalized monthly equivalent amount as a decimal string, accounting for frequency. */
  monthlyEquivalent: string;
  /** ISO 8601 timestamp of when this record was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the most recent update to this record. */
  updatedAt: string;
}

/**
 * A single expense record — either a one-time payment or a recurring bill.
 * Used in the finances page to track money going out.
 */
export interface ExpenseResponse {
  /** Unique database ID for this expense. */
  id: string;
  /** Category of the expense (e.g. "utilities", "repairs", "maintenance"). */
  category: string;
  /** The expense amount as a decimal string (e.g. "150.00"). */
  amount: string;
  /** Optional description of what was purchased or paid for. Null if not provided. */
  description: string | null;
  /** ISO 8601 date the expense was incurred. */
  date: string;
  /** Whether this expense recurs on a regular schedule. */
  isRecurring: boolean;
  /**
   * How often a recurring expense repeats (e.g. "monthly", "quarterly").
   * Null if the expense is not recurring.
   */
  recurringFrequency: string | null;
  /**
   * ISO 8601 date of the next time this recurring expense is due.
   * Null if not recurring or due date is not tracked.
   */
  nextDueDate: string | null;
  /**
   * The ID of the issue this expense is associated with (e.g. a contractor invoice).
   * Null if this expense is not tied to a specific issue.
   */
  issueId: string | null;
  /** ISO 8601 timestamp of when this expense record was created. */
  createdAt: string;
}

/**
 * A budget limit set for a specific spending category.
 * Used to track how much of each category's budget has been used this month.
 */
export interface BudgetResponse {
  /** Unique database ID for this budget record. */
  id: string;
  /** The spending category this budget applies to (e.g. "repairs", "utilities"). */
  category: string;
  /** The monthly spending limit as a decimal string. */
  monthlyLimit: string;
  /** How much has been spent in this category so far this month as a decimal string. */
  currentSpend: string;
  /** How much budget remains in this category as a decimal string (monthlyLimit minus currentSpend). */
  remainingBudget: string;
  /** Percentage of the monthly budget that has been used (0–100). */
  percentUsed: number;
  /** ISO 8601 timestamp of the most recent update to this budget record. */
  updatedAt: string;
}

/**
 * An aggregated financial snapshot for the user or group.
 * Used to display high-level financial health metrics on summary cards.
 */
export interface FinancialSummaryResponse {
  /** Total monthly income across all active income streams as a decimal string. */
  totalMonthlyIncome: string;
  /** Total monthly expenses across all categories as a decimal string. */
  totalMonthlyExpenses: string;
  /** Net monthly cash flow (income minus expenses) as a decimal string. May be negative. */
  netMonthlyCashFlow: string;
  /** Sum of all monthly budget limits as a decimal string. */
  totalBudgetLimit: string;
  /** Total amount spent across all budget categories this month as a decimal string. */
  totalBudgetSpent: string;
  /** The target amount for the emergency fund as a decimal string. Null if not configured. */
  emergencyFundTarget: string | null;
  /** How much is currently saved in the emergency fund as a decimal string. Null if not tracked. */
  emergencyFundCurrent: string | null;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

/**
 * Simple numeric stats shown as stat cards at the top of the dashboard.
 * Each field is a count or total for quick at-a-glance status.
 */
export interface DashboardStatsResponse {
  /** Number of issues currently in an open/active state across all groups. */
  openIssues: number;
  /** Number of issues that have been decided but are awaiting final group approval. */
  pendingDecisions: number;
  /** Total number of DIY projects the user has successfully completed. */
  diyProjectsCompleted: number;
  /** Total money saved by choosing DIY over hiring professionals, as a decimal string. */
  totalSaved: string;
  /** Number of groups the user is currently an active member of. */
  activeGroups: number;
  /** Number of reminders due within the upcoming period. */
  upcomingReminders: number;
}

/**
 * Aggregate statistics about how issues have been resolved across the user's groups.
 * Displayed on summary/analytics sections of the dashboard.
 */
export interface ResolutionStatsResponse {
  /** Total number of issues that have been resolved (any resolution type). */
  totalResolved: number;
  /** Number resolved by the group doing it themselves (DIY). */
  diyCount: number;
  /** Number resolved by hiring a professional. */
  hiredCount: number;
  /** Number resolved by replacing the asset entirely. */
  replacedCount: number;
  /** Number deferred (acknowledged but postponed). */
  deferredCount: number;
  /** Total money saved across all DIY resolutions as a decimal string. */
  totalSaved: string;
  /** Average savings per DIY resolution as a decimal string. */
  averageSavings: string;
}

// =============================================================================
// PREFERENCE TYPES
// =============================================================================

/**
 * A single entry in the audit trail of changes made to a group or user preference.
 * Used to show who changed what and why, and to support rollback.
 */
export interface PreferenceHistoryResponse {
  /** Unique database ID for this history entry. */
  id: string;
  /** The name of the preference field that was changed (e.g. "riskTolerance", "monthlyBudget"). */
  field: string;
  /** The value the field had before the change. Null if the field was previously unset. */
  oldValue: string | null;
  /** The value the field was changed to. */
  newValue: string;
  /** Optional explanation of why the change was made. Null if not recorded. */
  reason: string | null;
  /**
   * The group member who made the change.
   * Null if the change was made by a system process or the user themselves outside a group context.
   */
  changedBy: GroupMemberResponse | null;
  /** ISO 8601 timestamp of when the change occurred. */
  changedAt: string;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Fields the user can update on their own profile.
 * All fields are optional — only the fields provided will be updated (partial update).
 */
export interface UpdateProfileInput {
  /** New display name. Omit to leave unchanged. */
  name?: string;
  /** New city. Omit to leave unchanged. */
  city?: string;
  /** New state or province. Omit to leave unchanged. */
  stateProvince?: string;
  /** New postal/ZIP code. Omit to leave unchanged. */
  postalCode?: string;
  /** New country. Omit to leave unchanged. */
  country?: string;
  /** New monthly budget amount as a decimal string. Omit to leave unchanged. */
  monthlyBudget?: string;
  /** New emergency buffer amount as a decimal string. Omit to leave unchanged. */
  emergencyBuffer?: string;
  /** New risk tolerance level (e.g. "low", "medium", "high"). Omit to leave unchanged. */
  riskTolerance?: string;
}

/**
 * Fields the user can update in their notification and display preferences.
 * All fields are optional — only the fields provided will be updated (partial update).
 */
export interface UpdatePreferencesInput {
  /** New language code (e.g. "en", "fr"). Omit to leave unchanged. */
  language?: string;
  /** New theme (e.g. "light", "dark", "system"). Omit to leave unchanged. */
  theme?: string;
  /** New email notification setting. Omit to leave unchanged. */
  emailNotifications?: boolean;
  /** New SMS notification setting. Omit to leave unchanged. */
  smsNotifications?: boolean;
  /** New weekly digest setting. Omit to leave unchanged. */
  weeklyDigest?: boolean;
  /** New unit system (e.g. "imperial", "metric"). Omit to leave unchanged. */
  unitSystem?: string;
  /** New currency code (e.g. "USD", "CAD"). Omit to leave unchanged. */
  currency?: string;
}

/**
 * Data required to create a new group.
 */
export interface CreateGroupInput {
  /** The name of the new group (e.g. "123 Maple St Owners"). Required. */
  name: string;
  /** Postal/ZIP code for the group's location. Optional — can be added later. */
  postalCode?: string;
  /** Default vendor search radius in miles or km. Optional — falls back to the system default if omitted. */
  defaultSearchRadius?: number;
}

/**
 * Fields that can be updated on an existing group.
 * All fields are optional — only the fields provided will be updated (partial update).
 */
export interface UpdateGroupInput {
  /** New group name. Omit to leave unchanged. */
  name?: string;
  /** New postal/ZIP code. Omit to leave unchanged. */
  postalCode?: string;
  /** New default vendor search radius. Omit to leave unchanged. */
  defaultSearchRadius?: number;
}

/**
 * Data required to create a new issue within a group.
 */
export interface CreateIssueInput {
  /** The ID of the group this issue belongs to. Required. */
  groupId: string;
  /** A short descriptive title for the issue. Required. */
  title: string;
  /** Longer description of what the user observed. Optional — can be added later. */
  description?: string;
  /** Top-level category of the issue (e.g. "plumbing"). Optional — can be set later or by AI. */
  category?: string;
  /** Subcategory for more specific classification. Optional. */
  subcategory?: string;
  /** Initial priority level. Optional — defaults to "medium" if omitted. */
  priority?: string;
  /** Name of the affected asset (e.g. "Water heater"). Optional. */
  assetName?: string;
  /** Flexible JSON metadata about the asset. Optional. Shape is asset-type dependent. */
  assetDetails?: unknown;
}

/**
 * Fields that can be updated on an existing issue.
 * All fields are optional — only the fields provided will be updated (partial update).
 */
export interface UpdateIssueInput {
  /** Updated title. Omit to leave unchanged. */
  title?: string;
  /** Updated description. Omit to leave unchanged. */
  description?: string;
  /** Updated category. Omit to leave unchanged. */
  category?: string;
  /** Updated subcategory. Omit to leave unchanged. */
  subcategory?: string;
  /** Updated priority. Omit to leave unchanged. */
  priority?: string;
  /** Updated workflow status. Omit to leave unchanged. */
  status?: string;
  /** Updated asset name. Omit to leave unchanged. */
  assetName?: string;
  /** Updated asset metadata blob. Omit to leave unchanged. */
  assetDetails?: unknown;
}

/**
 * Data required to add a new income stream to the user's financial profile.
 */
export interface AddIncomeStreamInput {
  /** Name or label of the income source (e.g. "Day job"). Required. */
  source: string;
  /** The income amount as a decimal string (e.g. "3500.00"). Required. */
  amount: string;
  /** How often this income is received (e.g. "monthly", "biweekly"). Required. */
  frequency: string;
  /** Optional notes about this income source. Omit if not needed. */
  description?: string;
  /** ISO 8601 date when this income stream started. Optional. */
  startDate?: string;
  /** ISO 8601 date when this income stream ends (for fixed-term income). Optional. */
  endDate?: string;
}

/**
 * Fields that can be updated on an existing income stream.
 * All fields except the ID are optional (partial update).
 */
export interface UpdateIncomeStreamInput {
  /** The ID of the income stream to update. Required to identify the record. */
  id: string;
  /** Updated source name. Omit to leave unchanged. */
  source?: string;
  /** Updated amount as a decimal string. Omit to leave unchanged. */
  amount?: string;
  /** Updated frequency. Omit to leave unchanged. */
  frequency?: string;
  /** Updated description notes. Omit to leave unchanged. */
  description?: string;
  /** Updated active status. Omit to leave unchanged. */
  isActive?: boolean;
  /** Updated start date. Omit to leave unchanged. */
  startDate?: string;
  /** Updated end date. Omit to leave unchanged. */
  endDate?: string;
}

/**
 * Data required to record a new expense.
 */
export interface AddExpenseInput {
  /** The spending category (e.g. "repairs", "utilities"). Required. */
  category: string;
  /** The expense amount as a decimal string. Required. */
  amount: string;
  /** Optional description of what was purchased or paid for. Omit if not needed. */
  description?: string;
  /** ISO 8601 date the expense was incurred. Required. */
  date: string;
  /** Whether this is a recurring expense. Optional — defaults to false if omitted. */
  isRecurring?: boolean;
  /** How often it recurs (e.g. "monthly"). Only relevant when isRecurring is true. Optional. */
  recurringFrequency?: string;
  /** Optional ID of an issue this expense is tied to (e.g. a contractor invoice). Omit if unrelated to an issue. */
  issueId?: string;
}

/**
 * Fields that can be updated on an existing expense.
 * All fields except the ID are optional (partial update).
 */
export interface UpdateExpenseInput {
  /** The ID of the expense to update. Required to identify the record. */
  id: string;
  /** Updated category. Omit to leave unchanged. */
  category?: string;
  /** Updated amount as a decimal string. Omit to leave unchanged. */
  amount?: string;
  /** Updated description. Omit to leave unchanged. */
  description?: string;
  /** Updated date. Omit to leave unchanged. */
  date?: string;
  /** Updated recurring flag. Omit to leave unchanged. */
  isRecurring?: boolean;
  /** Updated recurrence frequency. Omit to leave unchanged. */
  recurringFrequency?: string;
}

/**
 * Data required to set or update a monthly budget limit for a category.
 */
export interface SetBudgetInput {
  /** The spending category this budget applies to (e.g. "repairs"). Required. */
  category: string;
  /** The monthly spending limit as a decimal string. Required. */
  monthlyLimit: string;
}

/**
 * Data required to record the outcome after a decision has been executed.
 * Captures real-world results vs. the original estimate.
 */
export interface RecordOutcomeInput {
  /** The ID of the decision this outcome is for. Required. */
  decisionId: string;
  /** The actual money spent as a decimal string. Optional — may not be known at record time. */
  actualCost?: string;
  /** The actual time it took as a human-readable string (e.g. "3 hours"). Optional. */
  actualTime?: string;
  /** Whether the resolution was considered successful. Required. */
  success: boolean;
  /** Free-text description of what went well. Optional. */
  whatWentWell?: string;
  /** Free-text description of what went wrong. Optional. */
  whatWentWrong?: string;
  /** Key lessons or advice for handling similar issues in the future. Optional. */
  lessonsLearned?: string;
  /** Whether the group would choose the same approach again. Optional. */
  wouldDoAgain?: boolean;
}

// =============================================================================
// SCHEDULE TYPES
// =============================================================================

/**
 * A scheduled appointment or work session associated with an issue.
 * Used in the calendar view to show upcoming contractor visits or DIY sessions.
 */
export interface ScheduleResponse {
  /** Unique database ID for this schedule entry. */
  id: string;
  /** ISO 8601 datetime of when the appointment or work session is scheduled to start. */
  scheduledTime: string;
  /** Estimated duration of the appointment in minutes. Null if not specified. */
  estimatedDuration: number | null;
  /** List of group member IDs who are expected to participate. Empty array if just the organizer. */
  participants: string[];
  /**
   * The external calendar event ID (e.g. Google Calendar event ID) if this has been synced.
   * Null if not yet synced to an external calendar.
   */
  calendarEventId: string | null;
  /** ISO 8601 timestamp of when this schedule entry was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the most recent update. */
  updatedAt: string;
  /** The issue this appointment is associated with. */
  issue: {
    /** Unique ID of the associated issue. */
    id: string;
    /** Title of the associated issue. Null if not yet set. */
    title: string | null;
    /** Current workflow status of the associated issue. */
    status: string;
  };
  /** The group member who created this schedule entry, with their display info. */
  createdBy: {
    /** Group membership ID of the creator. */
    id: string;
    /** User display info for the creator. */
    user: { name: string | null; avatarUrl: string | null };
  };
  /** Full display info for each participant member (id and user display info). */
  participantMembers: {
    /** Group membership ID of this participant. */
    id: string;
    /** User display info for this participant. */
    user: { name: string | null; avatarUrl: string | null };
  }[];
}

/**
 * Extended version of ScheduleResponse that includes additional issue context
 * (priority and group) needed for detailed calendar cards.
 */
export interface ScheduleWithDetailsResponse extends ScheduleResponse {
  /** The associated issue with additional priority and group fields. */
  issue: {
    /** Unique ID of the associated issue. */
    id: string;
    /** Title of the associated issue. Null if not yet set. */
    title: string | null;
    /** Current workflow status of the associated issue. */
    status: string;
    /** Priority level of the associated issue. */
    priority: string;
    /** The group this issue belongs to. */
    group: { id: string; name: string };
  };
}

/**
 * Data required to create a new schedule entry for an issue.
 */
export interface CreateScheduleInput {
  /** The ID of the issue to schedule work for. Required. */
  issueId: string;
  /** ISO 8601 datetime for the scheduled appointment. Required. */
  scheduledTime: string;
  /** Estimated duration in minutes. Optional. */
  estimatedDuration?: number;
  /** List of group member IDs to include as participants. Optional — defaults to just the creator. */
  participants?: string[];
}

/**
 * Fields that can be updated on an existing schedule entry.
 * All fields are optional (partial update).
 */
export interface UpdateScheduleInput {
  /** Updated scheduled datetime. Omit to leave unchanged. */
  scheduledTime?: string;
  /** Updated estimated duration in minutes. Omit to leave unchanged. */
  estimatedDuration?: number;
  /** Updated list of participant member IDs. Omit to leave unchanged. */
  participants?: string[];
}

// =============================================================================
// EXPENSE SETTINGS TYPES
// =============================================================================

/**
 * Group-level settings that control how expense approvals are handled.
 * Owners and admins configure this to define who can approve spending.
 */
export interface ExpenseSettingsResponse {
  /** Unique database ID for this settings record. */
  id: string;
  /**
   * The overall approval mode for the group.
   * E.g. "any-member", "admin-only", "threshold-based".
   */
  approvalMode: string;
  /**
   * The default dollar threshold above which expenses require explicit approval.
   * Decimal string. Null if no default threshold is set.
   */
  defaultThreshold: string | null;
  /** If true, the group owner and admins can approve their own expenses without a secondary approver. */
  trustOwnerAdmin: boolean;
  /**
   * A separate approval threshold that applies specifically to moderators.
   * Decimal string. Null if not configured separately from the default threshold.
   */
  moderatorThreshold: string | null;
  /** If true, moderators (not just owners/admins) are allowed to approve expenses. */
  allowModeratorApprove: boolean;
  /** ISO 8601 timestamp of when these settings were created. */
  createdAt: string;
  /** ISO 8601 timestamp of the most recent update. */
  updatedAt: string;
}

/**
 * A custom spending category defined by the group, with its own approval rules.
 * Groups can create categories beyond the system defaults.
 */
export interface ExpenseCategoryResponse {
  /** Unique database ID for this category. */
  id: string;
  /** Display name of the category (e.g. "Emergency Repairs", "Landscaping"). */
  name: string;
  /** Optional emoji or icon identifier for display in the UI. Null if not set. */
  icon: string | null;
  /**
   * The approval rule applied to expenses in this category.
   * E.g. "always-approve", "threshold", "always-require-approval".
   */
  approvalRule: string;
  /**
   * A custom dollar threshold for this specific category, overriding the group default.
   * Decimal string. Null if using the group's default threshold.
   */
  customThreshold: string | null;
  /** Display order for this category in lists and dropdowns. Lower numbers appear first. */
  sortOrder: number;
  /** ISO 8601 timestamp of when this category was created. */
  createdAt: string;
}

/**
 * Data required to update group expense approval settings.
 * All fields are optional (partial update).
 */
export interface UpdateExpenseSettingsInput {
  /** Updated approval mode. Omit to leave unchanged. */
  approvalMode?: string;
  /** Updated default approval threshold as a decimal string. Omit to leave unchanged. */
  defaultThreshold?: string;
  /** Updated owner/admin self-approval trust flag. Omit to leave unchanged. */
  trustOwnerAdmin?: boolean;
  /** Updated moderator threshold as a decimal string. Omit to leave unchanged. */
  moderatorThreshold?: string;
  /** Updated moderator approval permission. Omit to leave unchanged. */
  allowModeratorApprove?: boolean;
}

/**
 * Data required to create a new custom expense category for a group.
 */
export interface CreateExpenseCategoryInput {
  /** Display name of the new category. Required. */
  name: string;
  /** Optional icon/emoji identifier. Omit if not needed. */
  icon?: string;
  /** Approval rule for this category. Optional — defaults to the group's default if omitted. */
  approvalRule?: string;
  /** Custom dollar threshold for this category as a decimal string. Optional. */
  customThreshold?: string;
  /** Display sort order. Optional — defaults to end of list if omitted. */
  sortOrder?: number;
}

/**
 * Fields that can be updated on an existing expense category.
 * All fields are optional (partial update).
 */
export interface UpdateExpenseCategoryInput {
  /** Updated display name. Omit to leave unchanged. */
  name?: string;
  /** Updated icon/emoji identifier. Omit to leave unchanged. */
  icon?: string;
  /** Updated approval rule. Omit to leave unchanged. */
  approvalRule?: string;
  /** Updated custom dollar threshold. Omit to leave unchanged. */
  customThreshold?: string;
  /** Updated sort order. Omit to leave unchanged. */
  sortOrder?: number;
}

// =============================================================================
// VENDOR TYPES
// =============================================================================

/**
 * A contractor or service provider that was found or contacted in relation to an issue.
 * Stores quote information, ratings, and contact history.
 */
export interface VendorContactResponse {
  /** Unique database ID for this vendor contact record. */
  id: string;
  /** The name of the vendor or contracting company. */
  vendorName: string;
  /** Flexible JSON blob containing contact details (phone, email, website). Shape may vary. */
  contactInfo: unknown;
  /** The vendor's quoted price as a decimal string. Null if no quote has been received yet. */
  quoteAmount: string | null;
  /** Additional details about what the quote covers. Null if not provided. */
  quoteDetails: string | null;
  /** The vendor's rating (e.g. "4.5" out of 5). Null if no rating is available. */
  rating: string | null;
  /** A summary of reviews for this vendor. Null if not available. */
  reviewSummary: string | null;
  /**
   * List of service specialties for this vendor (e.g. ["plumbing", "water heater"]).
   * Null if not specified.
   */
  specialties: string[] | null;
  /** Distance from the user's location to the vendor (e.g. "3.2 miles"). Null if not calculated. */
  distance: string | null;
  /** Street address of the vendor. Null if not available. */
  address: string | null;
  /** Whether the user has already reached out to this vendor. */
  contacted: boolean;
  /** A draft email generated for contacting this vendor. Null if none has been drafted. */
  emailDraft: string | null;
  /** ISO 8601 timestamp of when this vendor was added to the issue. */
  createdAt: string;
}

// =============================================================================
// RESOLVE ISSUE INPUT
// =============================================================================

/**
 * Data required to mark an issue as resolved.
 */
export interface ResolveIssueInput {
  /**
   * How the issue was resolved.
   * E.g. "diy", "hired", "replaced", "deferred", "wont-fix".
   */
  resolutionType: string;
  /** Optional notes describing what was done to resolve the issue. Omit if not needed. */
  resolutionNotes?: string;
}

// =============================================================================
// COMPREHENSIVE DASHBOARD DATA TYPES
// =============================================================================

/**
 * The full data payload for the main dashboard page, aggregated in a single server
 * action call. Contains everything needed to render all dashboard sections without
 * additional round-trips.
 */
export interface DashboardDataResponse {
  /** Basic profile info for the current user, used for the header and personalization. */
  user: DashboardUser;
  /** Aggregated financial figures (income, spending, budget usage). */
  financials: DashboardFinancials;
  /** Numeric stat card values shown at the top of the dashboard. */
  stats: DashboardStatCards;
  /** Count of issues at each stage of the workflow pipeline. */
  pipelineSummary: PipelineSummary;
  /** Issues that are currently open and require attention. */
  openIssues: DashboardIssue[];
  /** Issues flagged as safety emergencies requiring immediate action. */
  safetyAlerts: SafetyAlert[];
  /** Issues where a decision option has been generated but not yet approved. */
  pendingDecisions: PendingDecision[];
  /** Issues where a decision has been deferred to a future date. */
  deferredDecisions: DeferredDecision[];
  /** All groups the user belongs to, with summary stats. */
  groups: DashboardGroup[];
  /** Upcoming scheduled appointments and reminders on the calendar. */
  calendarEvents: CalendarEvent[];
  /** Active reminders set by the user or group. */
  reminders: Reminder[];
  /** How-to guides the user is currently working through. */
  activeGuides: ActiveGuide[];
  /** The most recently completed issue resolutions. */
  recentOutcomes: RecentOutcome[];
  /** Aggregate statistics across all past outcomes. */
  outcomeSummary: OutcomeSummary;
  /** Vendors that have been contacted but have not yet provided a final quote. */
  pendingVendors: PendingVendor[];
  /** Parts and materials the user needs to purchase for upcoming repairs. */
  shoppingList: ShoppingItem[];
  /** Breakdown of spending by category for the current period. */
  spendingByCategory: SpendingCategory[];
  /** Month-by-month savings trend data for the savings chart. */
  savingsOverTime: MonthlySavings[];
  /** Recent activity feed items showing group and issue activity. */
  recentActivity: ActivityItem[];
  /** The user's resolved location data. Null if location has not been determined. */
  userLocation: UserLocation | null;
  /** Current and forecast weather data for the user's location. Null if unavailable or location not set. */
  weatherData: WeatherData | null;
}

/**
 * A minimal user profile used within the dashboard payload.
 * Includes location coordinates for weather and vendor distance calculations.
 */
export interface DashboardUser {
  /** Unique database ID for this user. */
  id: string;
  /** The user's display name. Null if not set. */
  name: string | null;
  /** The user's email address. */
  email: string;
  /** URL of the user's avatar image. Null if none uploaded. */
  avatarUrl: string | null;
  /** Postal/ZIP code for weather and vendor searches. Null if not provided. */
  postalCode: string | null;
  /** City name for display and location services. Null if not provided. */
  city: string | null;
  /** Latitude coordinate for precise location services. Null if not resolved. */
  latitude: number | null;
  /** Longitude coordinate for precise location services. Null if not resolved. */
  longitude: number | null;
}

/**
 * Aggregated financial figures used for the dashboard's financial summary section.
 * All monetary values are numbers (not strings) for easy chart/display rendering.
 */
export interface DashboardFinancials {
  /** Total monthly income in the user's preferred currency. */
  monthlyIncome: number;
  /** Total annual income (monthly x 12). */
  annualIncome: number;
  /** Effective hourly rate derived from annual income (annualIncome / 2080 hours). */
  hourlyRate: number;
  /** Total amount spent this month across all expense categories. */
  totalSpent: number;
  /** Amount remaining from the monthly budget after current spending. */
  remaining: number;
  /** Percentage of the total monthly budget that has been spent (0–100). */
  budgetUsedPercent: number;
  /** The total monthly budget limit across all categories. */
  totalBudget: number;
}

/**
 * Numeric values and trend indicators for the top-of-dashboard stat cards.
 * Trend fields describe directional change (e.g. "+2 this week"). Null if trend is unavailable.
 */
export interface DashboardStatCards {
  /** Number of issues currently in an active state. */
  activeIssues: number;
  /** Human-readable trend description for active issues. Null if not calculated. */
  activeIssuesTrend: string | null;
  /** Number of decisions awaiting final group approval. */
  pendingDecisions: number;
  /** Human-readable trend description for pending decisions. Null if not calculated. */
  pendingDecisionsTrend: string | null;
  /** Total money saved via DIY decisions. */
  totalSaved: number;
  /** Human-readable trend description for savings. Null if not calculated. */
  totalSavedTrend: string | null;
  /** Number of groups the user belongs to. */
  groupCount: number;
  /** Human-readable trend description for group count. Null if not calculated. */
  groupCountTrend: string | null;
}

/**
 * A count of issues at each stage of the workflow pipeline.
 * Used to render the pipeline funnel/progress bar on the dashboard.
 */
export interface PipelineSummary {
  /** Issues just reported with no investigation started yet. */
  open: number;
  /** Issues currently being investigated (AI diagnosis in progress or evidence being gathered). */
  investigating: number;
  /** Issues where repair/resolution options have been generated and are ready for review. */
  optionsGenerated: number;
  /** Issues where the group has voted and a decision has been made. */
  decided: number;
  /** Issues where approved work is actively underway. */
  inProgress: number;
  /** Issues that have been fully resolved and closed out. */
  completed: number;
  /** Issues that have been deliberately postponed to a future date. */
  deferred: number;
}

/**
 * A lightweight issue representation used in the dashboard's open issues list.
 * Contains just enough info to render a list item and link to the full issue.
 */
export interface DashboardIssue {
  /** Unique database ID for this issue. */
  id: string;
  /** Title of the issue for display in the list. */
  title: string;
  /** Current workflow status (e.g. "open", "investigating"). */
  status: string;
  /** Priority level (e.g. "high", "critical"). */
  priority: string;
  /** Name of the group this issue belongs to. */
  groupName: string;
  /** ID of the group, used to build navigation links. */
  groupId: string;
  /** ISO 8601 timestamp of when the issue was created. */
  createdAt: string;
}

/**
 * An issue flagged as a safety emergency, displayed prominently on the dashboard.
 * Contains the information needed to render an urgent alert card.
 */
export interface SafetyAlert {
  /** Unique database ID of the underlying issue. */
  id: string;
  /** Title of the issue for display in the alert. */
  title: string;
  /** Severity level of the emergency (e.g. "critical", "severe"). */
  severity: string;
  /** Name of the group the issue belongs to. */
  groupName: string;
  /** Step-by-step instructions for handling the emergency. Null if not specified. */
  emergencyInstructions: string | null;
}

/**
 * An issue that has generated decision options but has not yet been approved by the group.
 * Displayed in the "Needs Your Vote" section of the dashboard.
 */
export interface PendingDecision {
  /** Unique database ID of the underlying issue. */
  id: string;
  /** ID of the issue, used to build the navigation link. */
  issueId: string;
  /** Title of the issue. */
  title: string;
  /** Priority level of the issue. */
  priority: string;
  /** Name of the group this issue belongs to. */
  groupName: string;
  /** The type of the recommended option (e.g. "diy", "hired"). Null if no recommendation exists. */
  optionType: string | null;
  /** Minimum estimated cost in the user's currency. Null if unknown. */
  costMin: number | null;
  /** Maximum estimated cost in the user's currency. Null if unknown. */
  costMax: number | null;
  /** Human-readable time estimate (e.g. "2–3 hours"). Null if unknown. */
  timeEstimate: string | null;
  /** Number of votes cast so far. */
  voteCount: number;
  /** Total number of members eligible to vote. */
  totalMembers: number;
}

/**
 * An issue that has been deliberately deferred to be revisited later.
 * Shown in the "Deferred" section of the dashboard.
 */
export interface DeferredDecision {
  /** Unique database ID of the underlying issue. */
  id: string;
  /** Title of the issue. */
  title: string;
  /** ISO 8601 date of when the group planned to revisit this issue. Null if no date was set. */
  revisitDate: string | null;
  /** The reason this issue was deferred (e.g. "Waiting for warmer weather"). Null if not recorded. */
  reason: string | null;
}

/**
 * A compact group summary used in the dashboard's groups section.
 */
export interface DashboardGroup {
  /** Unique database ID for this group. */
  id: string;
  /** Human-readable name of the group. */
  name: string;
  /** The current user's role within this group (e.g. "owner", "admin", "member"). */
  role: string;
  /** Total number of members in the group. */
  memberCount: number;
  /** Total number of issues ever created in this group. */
  issueCount: number;
  /** Total money saved by this group through DIY decisions. */
  savings: number;
}

/**
 * A single calendar event shown on the dashboard calendar widget.
 * Can represent a scheduled appointment, a due date, or a reminder.
 */
export interface CalendarEvent {
  /** Unique database ID for this calendar event. */
  id: string;
  /** Title of the event for display. */
  title: string;
  /** ISO 8601 date of the event. */
  date: string;
  /** Time of the event in HH:MM format. Null if an all-day event. */
  time: string | null;
  /** Category of the event (e.g. "appointment", "reminder", "due-date"). */
  type: string;
  /** Name of the group this event is associated with. Null if not tied to a group. */
  groupName: string | null;
}

/**
 * A reminder set by the user or group, shown in the dashboard reminders widget.
 */
export interface Reminder {
  /** Unique database ID for this reminder. */
  id: string;
  /** The ID of the issue this reminder is about. Null if the reminder is not tied to a specific issue. */
  issueId: string | null;
  /** Title or subject of the reminder. */
  title: string;
  /** Name of the group this reminder is associated with. Null if it is a personal reminder. */
  groupName: string | null;
  /** ISO 8601 date when this reminder is due. */
  date: string;
}

/**
 * A how-to guide the user is currently in the middle of completing.
 * Shown in the "In Progress Guides" section of the dashboard.
 */
export interface ActiveGuide {
  /** Unique database ID for this guide record. */
  id: string;
  /** Title of the guide. */
  title: string;
  /** Completion percentage (0–100), derived from completedSteps / totalSteps. */
  progress: number;
  /** Total number of steps in this guide. */
  totalSteps: number;
  /** Number of steps the user has marked as completed. */
  completedSteps: number;
}

/**
 * A summary of a recently completed issue resolution, shown in the outcomes feed.
 */
export interface RecentOutcome {
  /** Unique database ID for this outcome record. */
  id: string;
  /** Title of the resolved issue. */
  issueTitle: string;
  /** Whether the resolution attempt was considered successful. */
  success: boolean;
  /** The type of resolution chosen (e.g. "diy", "hired", "replaced"). */
  optionType: string;
  /** The actual cost incurred. Null if cost was not recorded. */
  actualCost: number | null;
  /**
   * The cost delta compared to the estimate (positive = over budget, negative = under).
   * Null if cost data is incomplete.
   */
  costDelta: number | null;
}

/**
 * Aggregate statistics across all past issue outcomes for the current user.
 * Used for the "Your Track Record" summary card.
 */
export interface OutcomeSummary {
  /** Percentage of DIY attempts that were marked as successful (0–100). */
  diySuccessRate: number;
  /** Total number of issues that have been resolved. */
  totalResolved: number;
  /** Average cost delta across all resolutions (negative = typically under budget). */
  avgCostDelta: number;
  /** Average number of days from issue creation to resolution. */
  avgResolutionTimeDays: number;
}

/**
 * A vendor contact that has been saved but a final decision has not yet been made.
 * Shown in the "Pending Vendors" section of the dashboard.
 */
export interface PendingVendor {
  /** Unique database ID for this vendor contact record. */
  id: string;
  /** Name of the vendor or contracting company. */
  vendorName: string;
  /** Title of the issue this vendor was contacted for. Null if not linked to a specific issue. */
  issueTitle: string | null;
  /** The vendor's rating (out of 5). Null if no rating is available. */
  rating: number | null;
  /** The vendor's quoted price. Null if no quote has been received yet. */
  quoteAmount: number | null;
}

/**
 * A single item on the user's shopping list for an upcoming repair.
 */
export interface ShoppingItem {
  /** Unique database ID for this shopping list item. */
  id: string;
  /** Name of the part or product to purchase (e.g. "Wax ring", "PVC elbow 90°"). */
  productName: string;
  /** The store where this item can be purchased (e.g. "Home Depot"). Null if not specified. */
  storeName: string | null;
  /** Estimated price of the item. Null if unknown. */
  estimatedCost: number | null;
  /** Whether the item is currently in stock at the specified store. Null if stock status is unknown. */
  inStock: boolean | null;
}

/**
 * A single slice of the spending-by-category pie/donut chart.
 */
export interface SpendingCategory {
  /** The spending category name (e.g. "Plumbing", "Electrical"). */
  category: string;
  /** Total amount spent in this category for the current period. */
  amount: number;
  /** Hex color string used to render this slice in the chart (e.g. "#6366f1"). */
  color: string;
}

/**
 * A single data point in the monthly savings trend chart.
 * Breaks down savings by resolution type so the chart can show stacked bars.
 */
export interface MonthlySavings {
  /** The month label for the x-axis (e.g. "Jan", "2024-03"). */
  month: string;
  /** Total amount saved this month (diy + hired savings combined). */
  savings: number;
  /** Savings attributable to DIY resolutions this month. */
  diy: number;
  /** Savings attributable to hiring a pro instead of a more expensive alternative this month. */
  hired: number;
}

/**
 * A single item in the recent activity feed shown on the dashboard.
 * Represents any notable event: issue created, decision made, member joined, etc.
 */
export interface ActivityItem {
  /** Unique database ID for this activity record. */
  id: string;
  /** Human-readable description of the activity (e.g. "Alice resolved the leaking pipe issue"). */
  message: string;
  /** Human-readable relative timestamp (e.g. "2 hours ago"). */
  time: string;
  /** URL of the avatar image for the person who triggered this activity. Null if no avatar. */
  avatar: string | null;
  /** The category of activity (e.g. "issue", "decision", "member"). Null if not categorized. */
  type: string | null;
}

/**
 * The user's resolved geographic location, used for weather and vendor distance calculations.
 */
export interface UserLocation {
  /** Postal/ZIP code. Null if not resolved. */
  postalCode: string | null;
  /** City name. Null if not resolved. */
  city: string | null;
  /** Latitude coordinate. Null if not resolved. */
  latitude: number | null;
  /** Longitude coordinate. Null if not resolved. */
  longitude: number | null;
}

/**
 * Weather data for the user's location, shown on the dashboard weather widget.
 * Each section is nullable in case that data failed to load independently.
 */
export interface WeatherData {
  /** Current conditions snapshot. Null if unavailable. */
  current: CurrentWeather | null;
  /** Multi-day forecast array. Null if unavailable. */
  daily: DailyWeather[] | null;
  /** Air quality index data. Null if unavailable. */
  airQuality: AirQuality | null;
}

/**
 * Current weather conditions at the user's location.
 */
export interface CurrentWeather {
  /** Current air temperature in the user's preferred unit (°C or °F). */
  temperature: number;
  /** "Feels like" temperature accounting for wind chill and humidity. */
  feelsLike: number;
  /** Relative humidity percentage (0–100). */
  humidity: number;
  /** Wind speed in km/h or mph. */
  windSpeed: number;
  /** WMO weather interpretation code representing the current condition. */
  weatherCode: number;
  /** Human-readable description of the current condition (e.g. "Partly cloudy"). */
  weatherDescription: string;
  /** True if it is currently daytime at the user's location. */
  isDay: boolean;
  /** UV index (0–11+). Higher values indicate more intense solar radiation. */
  uvIndex: number;
  /** Precipitation amount in mm for the current hour. */
  precipitation: number;
  /** Visibility distance in km or miles. */
  visibility: number;
}

/**
 * Forecast data for a single day.
 */
export interface DailyWeather {
  /** ISO 8601 date for this forecast day. */
  date: string;
  /** Forecast high temperature in the user's preferred unit. */
  temperatureMax: number;
  /** Forecast low temperature in the user's preferred unit. */
  temperatureMin: number;
  /** Probability of precipitation as a percentage (0–100). */
  precipitationProbability: number;
  /** WMO weather interpretation code for the dominant condition of the day. */
  weatherCode: number;
  /** Human-readable weather description for the day (e.g. "Rain showers"). */
  weatherDescription: string;
  /** ISO 8601 datetime of sunrise. */
  sunrise: string;
  /** ISO 8601 datetime of sunset. */
  sunset: string;
  /** Maximum wind speed during the day. */
  windSpeedMax: number;
  /** Maximum UV index during the day. */
  uvIndexMax: number;
}

/**
 * Air quality index data for the user's location.
 */
export interface AirQuality {
  /** Overall Air Quality Index value. Higher values mean more pollution. */
  aqi: number;
  /** Fine particulate matter (PM2.5) concentration in µg/m³. */
  pm25: number;
  /** Coarse particulate matter (PM10) concentration in µg/m³. */
  pm10: number;
  /** Human-readable description of the air quality level (e.g. "Good", "Unhealthy for Sensitive Groups"). */
  description: string;
}

// =============================================================================
// FINANCES PAGE DATA TYPES
// =============================================================================

/**
 * The full data payload for the finances page, returned by a single server action.
 * Contains income, expenses, budgets, and all chart data needed to render the page.
 */
export interface FinancesPageDataResponse {
  /** Total monthly income across all active income streams. */
  monthlyIncome: number;
  /** Total monthly expenses across all categories. */
  monthlyExpenses: number;
  /** Cash available after all expenses (monthlyIncome minus monthlyExpenses). */
  availableFunds: number;
  /** The user's configured monthly budget limit. */
  monthlyBudget: number;
  /** Amount remaining in the budget after current spending. */
  remaining: number;
  /** Percentage of the emergency fund target that has been reached (0–100). */
  emergencyFundPercent: number;
  /** Total money saved through DIY decisions. */
  diySaved: number;
  /** Number of urgent/overdue pending expenses needing attention. */
  pendingUrgent: number;
  /** All income streams for display in the income table. */
  incomeStreams: IncomeStreamItemResponse[];
  /** All expense records for display in the expenses table. */
  expenses: ExpenseItemResponse[];
  /** Upcoming expenses that are due soon, used in the upcoming bills widget. */
  upcomingExpenses: UpcomingExpenseItemResponse[];
  /** Spending broken down by category for the pie/donut chart. */
  spendingByCategory: SpendingCategoryDataResponse[];
  /** Monthly income vs. expenses history for the cash flow chart. */
  cashFlowHistory: CashFlowDataPointResponse[];
  /** Monthly income history broken down by primary vs. secondary sources. */
  incomeHistory: IncomeHistoryDataPointResponse[];
  /** Monthly expense history broken down by recurring vs. one-time. */
  expenseHistory: ExpenseHistoryDataPointResponse[];
  /** Budget vs. actual comparison per category for the bar chart. */
  budgetVsActual: BudgetVsActualDataPointResponse[];
  /** List of available spending category names for filters and dropdowns. */
  categories: string[];
}

/**
 * A single income stream as displayed in the finances page income table.
 * Uses number types (not strings) for easy chart/math rendering.
 */
export interface IncomeStreamItemResponse {
  /** Unique database ID. */
  id: string;
  /** Name of the income source (e.g. "Salary", "Freelance"). */
  source: string;
  /** Raw income amount in the user's preferred currency. */
  amount: number;
  /** How often this income is received (e.g. "monthly", "biweekly"). */
  frequency: string;
  /** Whether this stream is currently active. */
  isActive: boolean;
  /** Optional notes about this income source. Null if not provided. */
  description: string | null;
  /** The normalized monthly equivalent, accounting for frequency. */
  monthlyEquivalent: number;
}

/**
 * A single expense record as displayed in the finances page expense table.
 */
export interface ExpenseItemResponse {
  /** Unique database ID. */
  id: string;
  /** Spending category (e.g. "Utilities", "Repairs"). */
  category: string;
  /** Expense amount. */
  amount: number;
  /** Optional description of what was purchased. Null if not provided. */
  description: string | null;
  /** ISO 8601 date the expense was incurred. */
  date: string;
  /** Whether this is a recurring expense. */
  isRecurring: boolean;
  /** Recurrence frequency (e.g. "monthly"). Null if one-time. */
  frequency: string | null;
  /** Title of the linked issue, if this expense is related to a repair. Null if unrelated. */
  issueTitle: string | null;
  /** Urgency classification of this expense (e.g. "urgent", "normal"). Null if not classified. */
  urgency: string | null;
}

/**
 * An upcoming expense shown in the "Bills Coming Up" widget on the finances page.
 */
export interface UpcomingExpenseItemResponse {
  /** Unique database ID. */
  id: string;
  /** Spending category. */
  category: string;
  /** Description of what the expense is for. */
  description: string;
  /** Expected expense amount. */
  amount: number;
  /** ISO 8601 date when this expense is due. */
  dueDate: string;
  /** Urgency level (e.g. "urgent", "normal"). Null if not classified. */
  urgency: string | null;
  /** Whether this is a recurring bill. */
  isRecurring: boolean;
}

/**
 * A single slice of the spending-by-category chart on the finances page.
 */
export interface SpendingCategoryDataResponse {
  /** Category name (e.g. "Plumbing", "Insurance"). */
  category: string;
  /** Total amount spent in this category for the current period. */
  amount: number;
  /** Hex color string for chart rendering (e.g. "#6366f1"). */
  color: string;
}

/**
 * A single month's income vs. expenses data point for the cash flow chart.
 */
export interface CashFlowDataPointResponse {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Total income received during this month. */
  income: number;
  /** Total expenses incurred during this month. */
  expenses: number;
}

/**
 * A single month's income history data point, split by source type.
 * Used in the income trend chart on the finances page.
 */
export interface IncomeHistoryDataPointResponse {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Total income from all sources during this month. */
  total: number;
  /** Income from the primary/main source during this month. */
  primary: number;
  /** Income from all secondary sources combined during this month. */
  secondary: number;
}

/**
 * A single month's expense history data point, split by expense type.
 * Used in the expense trend chart on the finances page.
 */
export interface ExpenseHistoryDataPointResponse {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Total expenses during this month. */
  total: number;
  /** Portion of expenses that are from recurring bills. */
  recurring: number;
  /** Portion of expenses that are one-time payments. */
  oneTime: number;
}

/**
 * A comparison of budgeted vs. actual spending for a single category.
 * Used in the budget vs. actual bar chart on the finances page.
 */
export interface BudgetVsActualDataPointResponse {
  /** The spending category (e.g. "Repairs", "Utilities"). */
  category: string;
  /** The budgeted (target) amount for this category. */
  budget: number;
  /** The actual amount spent in this category. */
  actual: number;
}

// =============================================================================
// GUIDES PAGE DATA TYPES
// =============================================================================

/**
 * The full data payload for the guides/resources page.
 * Returned by a single server action to hydrate the entire page.
 */
export interface GuidesPageDataResponse {
  /** All guides accessible to the user, with full detail for list/card rendering. */
  guides: GuideDetailResponse[];
  /** Aggregate statistics about the user's guide activity (completed, in progress, etc.). */
  stats: GuideStatsResponse;
  /** Month-by-month savings data attributed to guides followed. */
  savingsOverTime: GuideSavingsDataResponse[];
  /** Available guide category names for filter dropdowns. */
  categories: string[];
  /** Available source platform names for filter dropdowns (e.g. "reddit", "youtube"). */
  sources: string[];
}

/**
 * A guide with full detail for rendering a guide card on the guides page.
 */
export interface GuideDetailResponse {
  /** Unique database ID. */
  id: string;
  /** Title of the guide. */
  title: string;
  /** Longer description of what the guide covers. Null if not provided. */
  description: string | null;
  /** URL where the guide can be accessed. */
  url: string;
  /** The platform the guide is from (e.g. "reddit", "youtube", "wikihow"). */
  source: string;
  /** The issue category this guide belongs to (e.g. "plumbing", "electrical"). */
  category: string;
  /**
   * How difficult this guide is to follow.
   * - "beginner": No prior experience needed.
   * - "intermediate": Some familiarity with tools or the trade is helpful.
   * - "advanced": Requires significant skill or experience.
   */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Human-readable estimate of how long the guide takes (e.g. "30 minutes", "2–3 hours"). */
  timeEstimate: string;
  /** User or community rating out of 5. Null if no ratings yet. */
  rating: number | null;
  /** Number of times this guide has been viewed by any user. Null if not tracked. */
  viewCount: number | null;
  /** True if this guide is primarily a video (e.g. YouTube). */
  isVideo: boolean;
  /** Whether the current user has bookmarked this guide. */
  isBookmarked: boolean;
  /** The current user's completion progress (0–100). Null if not started. */
  progress: number | null;
  /** Number of steps the user has completed. Null if not started. */
  completedSteps: number | null;
  /** Total number of steps in the guide. Null if the guide has no discrete steps. */
  totalSteps: number | null;
  /** The author or creator of the guide. Null if not attributed. */
  author: string | null;
  /** ISO 8601 timestamp of when this guide was added to the system. */
  createdAt: string;
}

/**
 * Aggregate statistics about the current user's guide activity.
 * Shown in the stats cards at the top of the guides page.
 */
export interface GuideStatsResponse {
  /** Number of guides the user has fully completed. */
  completedCount: number;
  /** Number of guides the user has started but not yet finished. */
  inProgressCount: number;
  /** Number of guides the user has bookmarked/saved for later. */
  savedCount: number;
  /** Total number of guides available to the user. */
  totalGuides: number;
  /** Total money the user has saved by following guides instead of hiring pros. */
  totalSaved: number;
  /** Human-readable total time saved by following DIY guides (e.g. "12 hours"). */
  timeSaved: string;
}

/**
 * A single month's savings data point for the guides savings chart.
 * Compares what the user actually saved vs. what a professional would have cost.
 */
export interface GuideSavingsDataResponse {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Amount the user actually saved by doing it themselves this month. */
  saved: number;
  /** What a professional would have charged for the same work this month. */
  wouldCost: number;
}

// =============================================================================
// ISSUES PAGE DATA TYPES
// =============================================================================

/**
 * The full data payload for the issues list page.
 * Returned by a single server action to hydrate the entire page.
 */
export interface IssuesPageDataResponse {
  /** Total money saved across all resolved issues. */
  totalSaved: number;
  /** Number of issues resolved via DIY. */
  diyCount: number;
  /** Number of issues resolved by hiring a professional. */
  proCount: number;
  /** Number of issues currently in an active (non-resolved) state. */
  activeIssueCount: number;
  /** All issues across all groups, with details for list card rendering. */
  issues: IssueWithDetails[];
  /** Month-by-month savings and issue count trend for the chart. */
  savingsOverTime: MonthlySavingsPoint[];
  /** Breakdown of issues by category for the category distribution chart. */
  categoryDistribution: CategoryCount[];
  /** Summary of how issues have been resolved (DIY vs. pro, success rates). */
  resolutionBreakdown: IssueResolutionStats;
  /** All groups the user belongs to, used for the group filter dropdown. */
  groups: GroupOption[];
  /** All available issue categories for the category filter dropdown. */
  categories: string[];
}

/**
 * A single issue with all the fields needed for the issues page list cards.
 */
export interface IssueWithDetails {
  /** Unique database ID. */
  id: string;
  /** Title of the issue. */
  title: string;
  /** Current workflow status. */
  status: string;
  /** Priority level. */
  priority: string;
  /** Top-level category. Null if not yet categorized. */
  category: string | null;
  /** ID of the group this issue belongs to. */
  groupId: string;
  /** Name of the group this issue belongs to. */
  groupName: string;
  /** ISO 8601 timestamp of when the issue was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the most recent update. */
  updatedAt: string;
  /** The AI-generated or manually entered diagnosis text. Null if not yet diagnosed. */
  diagnosis: string | null;
  /** AI diagnosis confidence score (0–100). Null if no diagnosis yet. */
  confidence: number | null;
  /** Estimated cost for the DIY option. Null if no options have been generated. */
  diyCost: number | null;
  /** Estimated cost for the hire-a-pro option. Null if no options have been generated. */
  proCost: number | null;
  /** ISO 8601 timestamp of when the issue was resolved. Null if still open. */
  resolvedAt: string | null;
  /** Name of the person who resolved the issue. Null if still open. */
  resolvedBy: string | null;
  /** Amount saved by the chosen resolution (vs. the alternative). Null if not yet calculated. */
  savedAmount: number | null;
}

/**
 * A single data point in the issues page savings-over-time chart.
 */
export interface MonthlySavingsPoint {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Total savings in this month. */
  savings: number;
  /** Number of issues resolved in this month. */
  issues: number;
}

/**
 * A single entry in the category distribution chart on the issues page.
 */
export interface CategoryCount {
  /** The category name (e.g. "Plumbing", "Electrical"). */
  name: string;
  /** Number of issues in this category. */
  value: number;
  /** Hex color string for chart rendering. */
  color: string;
}

/**
 * Summary of how issues have been resolved, used for the resolution breakdown chart.
 */
export interface IssueResolutionStats {
  /** Number of issues resolved via DIY. */
  diy: number;
  /** Number of issues resolved by hiring a professional. */
  pro: number;
  /** Percentage of DIY resolutions that were marked as successful (0–100). */
  diySuccessRate: number;
}

/**
 * A minimal group identifier used in filter dropdowns on the issues page.
 */
export interface GroupOption {
  /** Unique database ID of the group. */
  id: string;
  /** Display name of the group. */
  name: string;
}

// =============================================================================
// CALENDAR PAGE DATA TYPES
// =============================================================================

/**
 * The full data payload for the calendar page.
 * Returned by a single server action to hydrate the entire page.
 */
export interface CalendarPageDataResponse {
  /** All calendar events for the user across all groups. */
  events: CalendarEventDetail[];
  /** Aggregate counts for the currently displayed month. */
  monthStats: CalendarMonthStats;
  /** Upcoming expenses with due dates, shown in the financial timeline on the calendar. */
  upcomingExpenses: CalendarUpcomingExpense[];
  /** The total monetary value of all upcoming expenses. */
  totalUpcomingExpenses: number;
  /** Breakdown of event counts by type for the event type chart. */
  eventTypeDistribution: CalendarEventTypeDistribution[];
  /** Week-by-week activity data for the weekly activity chart. */
  weeklyActivity: CalendarWeeklyActivity[];
  /** Month-by-month comparison of events scheduled vs. completed for the trend chart. */
  monthlyComparison: CalendarMonthlyComparison[];
  /** The next few upcoming events, shown in the "Coming Up" sidebar widget. */
  upcomingEvents: CalendarEventDetail[];
  /** Issues that can be scheduled (i.e. they are active but have no appointment yet). */
  schedulableIssues: CalendarSchedulableIssue[];
}

/**
 * A fully detailed calendar event for display on the calendar page.
 */
export interface CalendarEventDetail {
  /** Unique database ID for this calendar event. */
  id: string;
  /** Title of the event. */
  title: string;
  /** ISO 8601 date of the event. */
  date: string;
  /** Time of the event in HH:MM format. Null if this is an all-day event. */
  time: string | null;
  /** Category of the event (e.g. "appointment", "reminder", "due-date"). */
  type: string;
  /** Whether this event recurs on a regular schedule. */
  isRecurring: boolean;
  /** Description of the recurrence pattern (e.g. "Every month on the 1st"). Null if not recurring. */
  recurringPattern: string | null;
  /** Location of the appointment (e.g. "123 Maple St"). Null if not specified. */
  location: string | null;
  /** Name of the person assigned to this event. Null if not assigned. */
  assignee: string | null;
  /** Additional notes about this event. Null if not provided. */
  notes: string | null;
  /** Estimated cost associated with this event (e.g. contractor fee). Null if not applicable. */
  estimatedCost: number | null;
  /** Reminder setting for this event (e.g. "1 day before"). Null if no reminder set. */
  reminder: string | null;
  /** ID of the issue linked to this event. Null if not associated with an issue. */
  linkedIssueId: string | null;
  /** Title of the linked issue for display. Null if not associated with an issue. */
  linkedIssueTitle: string | null;
  /** ID of the group this event belongs to. Null if it is a personal event. */
  groupId: string | null;
  /** Name of the group this event belongs to. Null if it is a personal event. */
  groupName: string | null;
}

/**
 * Aggregate counts for the events in the currently displayed calendar month.
 */
export interface CalendarMonthStats {
  /** Total number of events scheduled in this month. */
  scheduledEvents: number;
  /** Number of those events that have been completed. */
  completedEvents: number;
  /** Number of contractor/professional visits scheduled this month. */
  proVisits: number;
  /** Number of DIY work sessions scheduled this month. */
  diyProjects: number;
  /** Number of reminders due this month. */
  reminders: number;
}

/**
 * A financial obligation shown on the calendar timeline (upcoming expense or income).
 */
export interface CalendarUpcomingExpense {
  /** Unique database ID for this record. */
  id: string;
  /** Display title (e.g. "Water bill", "Contractor payment"). */
  title: string;
  /** ISO 8601 date when this payment is due or income is expected. */
  date: string;
  /** The dollar amount of the transaction. */
  amount: number;
  /**
   * The type of financial event.
   * - "contractor": Payment to a hired professional.
   * - "diy": Cost of DIY parts/materials.
   * - "reminder": A general financial reminder with no specific type.
   * - "income": Expected income arrival.
   * - "expense": A regular expense due date.
   */
  type: "contractor" | "diy" | "reminder" | "income" | "expense";
}

/**
 * A single slice in the event-type distribution chart on the calendar page.
 */
export interface CalendarEventTypeDistribution {
  /** The event type name (e.g. "Appointment", "Reminder"). */
  name: string;
  /** Number of events of this type. */
  value: number;
  /** Hex color string for chart rendering. */
  color: string;
}

/**
 * A single week's activity data point for the calendar's weekly activity chart.
 */
export interface CalendarWeeklyActivity {
  /** The week label (e.g. "Week 1", "Mar 24–30"). */
  week: string;
  /** Number of events that occurred during this week. */
  events: number;
  /** Total expenses incurred during this week. */
  expenses: number;
}

/**
 * A single month's comparison data for the calendar's monthly comparison chart.
 * Shows how many events were scheduled vs. how many were completed.
 */
export interface CalendarMonthlyComparison {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Number of events that were scheduled in this month. */
  events: number;
  /** Number of those events that were completed before month end. */
  completed: number;
}

/**
 * A minimal issue representation for the "Schedule an Issue" dropdown on the calendar page.
 * Only active, unscheduled issues are included.
 */
export interface CalendarSchedulableIssue {
  /** Unique database ID of the issue. */
  id: string;
  /** Title of the issue. */
  title: string;
  /** Name of the group this issue belongs to. */
  groupName: string;
  /** Current workflow status of the issue. */
  status: string;
}

// =============================================================================
// GROUPS PAGE DATA TYPES
// =============================================================================

/**
 * The full data payload for the groups management page.
 * Returned by a single server action to hydrate the entire page.
 */
export interface GroupsPageDataResponse {
  /** Total number of groups the user belongs to. */
  totalGroups: number;
  /** Total number of members across all the user's groups. */
  totalMembers: number;
  /** Total money saved across all the user's groups. */
  totalSavings: number;
  /** Total number of issues ever created across all the user's groups. */
  totalIssues: number;
  /** Number of issues currently in an active state across all groups. */
  activeIssueCount: number;
  /** Number of issues that have been resolved across all groups. */
  resolvedIssueCount: number;
  /** All groups the user belongs to, with stats for group card rendering. */
  groups: GroupWithStats[];
  /**
   * The currently selected group's full details.
   * Null if no group is selected (e.g. on initial page load or "All Groups" view).
   */
  selectedGroup: GroupDetails | null;
}

/**
 * A group card representation including aggregate statistics and a member preview.
 * Used in the groups list on the groups page.
 */
export interface GroupWithStats {
  /** Unique database ID. */
  id: string;
  /** Human-readable group name. */
  name: string;
  /** Postal/ZIP code for the group's location. Null if not set. */
  postalCode: string | null;
  /** The current user's role in this group (e.g. "owner", "admin", "member"). */
  role: string;
  /** Total number of members. */
  memberCount: number;
  /** Total number of issues (all statuses) ever created in this group. */
  issueCount: number;
  /** Number of issues currently active. */
  activeIssueCount: number;
  /** Number of issues that have been fully resolved. */
  resolvedCount: number;
  /** Total money saved by this group through DIY decisions. */
  savings: number;
  /** A preview list of up to a few members for avatar stacking in the UI. */
  members: GroupMemberPreview[];
  /** ISO 8601 timestamp of when the group was created. */
  createdAt: string;
}

/**
 * A minimal member representation used for avatar stacking previews in group cards.
 */
export interface GroupMemberPreview {
  /** Unique database ID of the group membership record. */
  id: string;
  /** The member's display name. Null if not set. */
  name: string | null;
  /** URL of the member's avatar image. Null if none uploaded. */
  avatar: string | null;
  /** The member's role in the group. */
  role: string;
}

/**
 * The full details of a selected group, used to render the group detail panel
 * on the groups page. Includes financials, member roster, charts, and activity.
 */
export interface GroupDetails {
  /** Unique database ID. */
  id: string;
  /** Human-readable group name. */
  name: string;
  /** Postal/ZIP code for the group's location. Null if not set. */
  postalCode: string | null;
  /** The current user's role in this group. */
  role: string;
  /** ISO 8601 timestamp of when the group was created. */
  createdAt: string;
  /** Number of issues currently in an open/active state. */
  openIssueCount: number;
  /** Number of issues that have been fully resolved. */
  resolvedCount: number;
  /** The group's current shared financial balance. */
  balance: number;
  /** Total money saved by the group through DIY decisions. */
  savings: number;
  /** The group's configured monthly budget limit. Null if not set. */
  monthlyBudget: number | null;
  /** Amount spent by the group so far this month. */
  monthlySpent: number;
  /** The group's configured emergency fund target. Null if not set. */
  emergencyFund: number | null;
  /** All members of this group with full detail (roles, contributions, etc.). */
  members: GroupMemberDetails[];
  /** Invitations that have been sent but not yet accepted. */
  pendingInvitations: GroupPendingInvitation[];
  /** Percentage of the monthly budget that has been spent (0–100). */
  budgetUsedPercent: number;
  /** Percentage of issues resolved via DIY (0–100). */
  diyRate: number;
  /** Each member's contribution share for the contribution chart. */
  contributionData: MemberContribution[];
  /** Month-by-month savings vs. spending for the group savings chart. */
  monthlySavingsData: GroupMonthlySavings[];
  /** Resolution method (DIY vs. hired) per issue category for the resolution chart. */
  resolutionData: GroupResolutionData[];
  /** The most recently created or updated issues in the group. */
  recentIssues: GroupRecentIssue[];
  /** Recent activity feed items for this group. */
  recentActivity: GroupActivityItem[];
}

/**
 * Full details for a single group member, including activity statistics.
 * Used in the group detail member roster table.
 */
export interface GroupMemberDetails {
  /** Unique database ID of the group membership record. */
  id: string;
  /** The user's database ID. */
  userId: string;
  /** The member's display name. Null if not set. */
  name: string | null;
  /** The member's email address. */
  email: string;
  /** URL of the member's avatar image. Null if none uploaded. */
  avatar: string | null;
  /** The member's role in the group (e.g. "owner", "admin", "member"). */
  role: string;
  /** ISO 8601 timestamp of when this person joined the group. Null if the invitation is still pending. */
  joinedAt: string | null;
  /** Total number of expense contributions this member has made to the group. */
  contributions: number;
  /** Number of issues this member has created/reported. */
  issuesCreated: number;
  /** Number of issues this member has resolved. */
  issuesResolved: number;
}

/**
 * A pending group invitation that has been sent but not yet accepted or expired.
 * Shown in the group detail's "Pending Invites" section.
 */
export interface GroupPendingInvitation {
  /** Unique database ID of the invitation record. */
  id: string;
  /** The email address the invite was sent to. */
  email: string;
  /** The role that will be granted upon acceptance. */
  role: string;
  /** ISO 8601 timestamp of when the invitation was created. */
  createdAt: string;
  /** ISO 8601 timestamp of when the invitation link expires. */
  expiresAt: string;
}

/**
 * A single slice in the member contribution pie chart for a group.
 */
export interface MemberContribution {
  /** The member's display name. */
  name: string;
  /** The member's contribution value (e.g. number of expenses or total dollar amount). */
  value: number;
  /** Hex color string for chart rendering. */
  color: string;
}

/**
 * A single month's savings vs. spending data for a group's savings chart.
 */
export interface GroupMonthlySavings {
  /** The month label (e.g. "Jan", "2024-03"). */
  month: string;
  /** Total money saved by the group in this month. */
  savings: number;
  /** Total money spent by the group in this month. */
  spent: number;
}

/**
 * A single category's resolution breakdown for the group's resolution chart.
 * Shows how many issues in this category were resolved DIY vs. by hiring.
 */
export interface GroupResolutionData {
  /** The issue category name (e.g. "Plumbing", "Electrical"). */
  name: string;
  /** Number of issues in this category resolved via DIY. */
  diy: number;
  /** Number of issues in this category resolved by hiring a professional. */
  hired: number;
}

/**
 * A compact issue summary for the "Recent Issues" list in the group detail panel.
 */
export interface GroupRecentIssue {
  /** Unique database ID of the issue. */
  id: string;
  /** Title of the issue. */
  title: string;
  /** Top-level category. Null if not yet categorized. */
  category: string | null;
  /** Current workflow status. */
  status: string;
  /** Priority level. */
  priority: string;
  /** ISO 8601 timestamp of when the issue was created. */
  createdAt: string;
}

/**
 * A single activity feed item for a group, shown in the group's recent activity section.
 */
export interface GroupActivityItem {
  /** Unique database ID of this activity record. */
  id: string;
  /** Category of the activity event (e.g. "issue_resolved", "member_joined"). */
  type: string;
  /** Human-readable description of the event. */
  message: string;
  /** Display name of the member who triggered the event. Null if not attributed to a specific member. */
  memberName: string | null;
  /** URL of the member's avatar. Null if no avatar or not attributed. */
  memberAvatar: string | null;
  /** Amount saved if this activity was a resolution event. Null if not applicable. */
  savings: number | null;
  /** ISO 8601 timestamp of when this activity occurred. */
  timestamp: string;
}

// =============================================================================
// DIAGNOSE PAGE DATA TYPES
// =============================================================================

/**
 * The full data payload for the diagnose/chat page.
 * Returned by a single server action to hydrate the issue list and the currently active issue.
 */
export interface DiagnosePageDataResponse {
  /** All issues available for the user to diagnose, shown in the left sidebar list. */
  issues: DiagnoseIssue[];
  /**
   * The full details of the currently selected issue, including chat history and recommendations.
   * Null if no issue is currently selected.
   */
  currentIssue: DiagnoseIssueDetail | null;
}

/**
 * A compact issue representation used in the diagnose page's left sidebar list.
 */
export interface DiagnoseIssue {
  /** Unique database ID. */
  id: string;
  /** Title of the issue. */
  title: string;
  /** Emoji or icon identifier for display. Null if not assigned. */
  icon: string | null;
  /** Hex color string for the icon background. Always present (falls back to a default). */
  iconColor: string;
  /** Current workflow status. */
  status: string;
  /** Top-level category. Null if not categorized. */
  category: string | null;
  /** ISO 8601 timestamp of when the issue was created. */
  createdAt: string;
  /** Whether this issue has been fully resolved and closed. */
  isResolved: boolean;
  /** AI diagnosis confidence score (0–100). Null if no AI diagnosis has been run yet. */
  confidence: number | null;
}

/**
 * The full detail view of an issue on the diagnose page, including all AI output,
 * chat messages, guides, parts, and professional recommendations.
 */
export interface DiagnoseIssueDetail {
  /** Unique database ID. */
  id: string;
  /** Title of the issue. */
  title: string;
  /** Emoji or icon identifier for display. Null if not assigned. */
  icon: string | null;
  /** Hex color string for the icon background. */
  iconColor: string;
  /** Current workflow status. */
  status: string;
  /** Top-level category. Null if not categorized. */
  category: string | null;
  /** ISO 8601 timestamp of when the issue was created. */
  createdAt: string;
  /** Whether this issue has been fully resolved. */
  isResolved: boolean;
  /** The AI-generated or manually entered diagnosis text. Null if not yet diagnosed. */
  diagnosis: string | null;
  /** Estimated difficulty of fixing this issue (e.g. "easy", "medium", "hard"). */
  difficulty: string;
  /** Human-readable time estimate for the repair (e.g. "1–2 hours"). Null if not estimated. */
  estimatedTime: string | null;
  /** Estimated cost for the DIY option. Null if not estimated. */
  diyCost: number | null;
  /** Estimated cost for hiring a professional. Null if not estimated. */
  proCost: number | null;
  /** AI confidence score for the current diagnosis (0–100). */
  confidence: number;
  /** An important safety note about this issue or repair. Null if no safety concerns. */
  safetyNote: string | null;
  /** The full conversation history between the user and the AI for this issue. */
  chatMessages: DiagnoseChatMessage[];
  /** How-to guides recommended for this issue. */
  guides: DiagnoseGuide[];
  /** Parts and materials needed for the DIY repair option. */
  parts: DiagnosePart[];
  /** Local professionals who could be hired to fix this issue. */
  pros: DiagnosePro[];
}

/**
 * A single message in the AI diagnostic chat conversation for an issue.
 */
export interface DiagnoseChatMessage {
  /** Unique database ID. */
  id: string;
  /** Who sent this message: "user" or "assistant". */
  role: string;
  /** The text content of the message. */
  content: string;
  /** Whether the user attached an image with this message. */
  hasImage: boolean;
  /** Whether the user sent a voice recording with this message. */
  hasVoice: boolean;
  /** Whether the AI performed image vision analysis on an attached photo. */
  visionAnalysis: boolean;
  /** ISO 8601 timestamp of when this message was sent. */
  createdAt: string;
}

/**
 * A single step within a DiagnoseGuide, used to render step-by-step instructions.
 */
export interface DiagnoseGuideStep {
  /** The step number (1-indexed) for display (e.g. "Step 1", "Step 2"). */
  stepNumber: number;
  /** Short title of this step (e.g. "Turn off the water supply"). */
  title: string;
  /** Detailed instructions for completing this step. */
  description: string;
}

/**
 * A how-to guide recommended on the diagnose page for the current issue.
 * Includes optional step-by-step content and the tools needed.
 */
export interface DiagnoseGuide {
  /** Unique database ID. */
  id: string;
  /** Platform source (e.g. "reddit", "youtube", "wikihow"). */
  source: string;
  /** Title of the guide. */
  title: string;
  /** URL to the guide. Null if the guide is inline content only. */
  url: string | null;
  /** Human-readable duration for following the guide (e.g. "20 min"). Null if unknown. */
  duration: string | null;
  /** Total number of steps in the guide. Null if the guide has no discrete steps. */
  steps: number | null;
  /**
   * The full step-by-step content for inline display.
   * Null if the guide only links out to an external URL.
   */
  stepContent: DiagnoseGuideStep[] | null;
  /**
   * Tools needed to follow this guide (e.g. ["pliers", "screwdriver"]).
   * Null if no tools are required.
   */
  toolsNeeded: string[] | null;
  /** Community or editorial rating for this guide. Null if not rated. */
  rating: number | null;
  /** Emoji or icon identifier shown next to the guide in the UI. */
  icon: string;
}

/**
 * A part or material the user needs to purchase for a DIY repair.
 * Sourced from local store inventory lookups.
 */
export interface DiagnosePart {
  /** Unique database ID. */
  id: string;
  /** Name of the part (e.g. "Wax ring", "1/2\" compression fitting"). */
  name: string;
  /** Price of the part in the user's preferred currency. */
  price: number;
  /** Store where this part is available (e.g. "Home Depot", "Ace Hardware"). */
  store: string;
  /** Distance from the user to the store (e.g. "2.3 miles"). Null if not calculated. */
  distance: string | null;
  /** Whether this part is currently in stock at the listed store. */
  inStock: boolean;
  /** URL to the part's product page on the store's website. Null if not available. */
  storeUrl: string | null;
  /**
   * Whether this item is personal protective equipment (PPE) rather than a repair part.
   * Optional — absent means false (this is a regular part).
   */
  isPPE?: boolean;
}

/**
 * A local professional recommended for the current issue.
 * Sourced from professional directory lookups.
 */
export interface DiagnosePro {
  /** Unique database ID. */
  id: string;
  /** The professional or company name. */
  name: string;
  /** Average rating out of 5. */
  rating: number;
  /** Number of reviews the rating is based on. */
  reviews: number;
  /** Distance from the user's location (e.g. "4.1 miles"). */
  distance: string;
  /** Estimated price or hourly rate in the user's preferred currency. */
  price: number;
  /** When this professional is next available (e.g. "Tomorrow", "This week"). Null if unknown. */
  available: string | null;
  /** Source directory this professional was found in (e.g. "google", "yelp"). */
  source: string;
  /** Email address to contact this professional. Null if not publicly available. */
  email: string | null;
  /** Phone number to contact this professional. Null if not publicly available. */
  phone: string | null;
  /** This professional's area of expertise (e.g. "Plumber", "Electrician"). Null if not specified. */
  specialty: string | null;
}

// =============================================================================
// SERVER ACTION COMPATIBLE OVERRIDES
// (DB returns Date objects; these allow Date | string for date fields)
// =============================================================================

/**
 * A version of IssueWithDetails where `createdAt` can be either a JS Date object
 * (as returned directly from the database ORM) or an ISO 8601 string (as serialized
 * over the wire). Server actions return this type before the date is serialized.
 */
export type ServerIssueWithDetails = Omit<IssueWithDetails, "createdAt"> & {
  createdAt: Date | string;
};

/**
 * A version of GroupWithStats where `createdAt` can be either a JS Date object
 * or an ISO 8601 string, for the same reason as ServerIssueWithDetails above.
 */
export type ServerGroupWithStats = Omit<GroupWithStats, "createdAt"> & {
  createdAt: Date | string;
};

/**
 * A version of GroupDetails where `createdAt` can be either a JS Date object
 * or an ISO 8601 string, for the same reason as ServerIssueWithDetails above.
 */
export type ServerGroupDetails = Omit<GroupDetails, "createdAt"> & {
  createdAt: Date | string;
};
