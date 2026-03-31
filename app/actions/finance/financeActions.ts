// This directive marks every exported function in this file as a Next.js
// Server Action — all of the code runs on the server, never in the user's
// browser. TanStack Query hooks in lib/hooks/ call these functions and
// Next.js handles the network transport automatically.
"use server";

// Import the Supabase server-side client factory. The server variant reads
// the logged-in user's session from HTTP-only cookies, which are inaccessible
// in the browser, making this the secure way to identify the caller.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client. All SQL queries in this file
// execute through this object against the PostgreSQL database.
import { db } from "@/app/db/client";

// Import the four database table definitions and one enum used in this file:
//   userIncomeStreams — rows describing recurring or one-time income sources for a user
//   userExpenses     — individual expense records for a user
//   userBudgets      — per-category monthly spending limits for a user
//   incomeFrequencyEnum — the allowed values for income/expense frequency
//                         (e.g. "weekly", "monthly", "annual")
import { userIncomeStreams, userExpenses, userBudgets, incomeFrequencyEnum } from "@/app/db/schema";

// Import Drizzle ORM query helpers:
//   eq(col, val)       — SQL: WHERE col = val
//   and(...conditions) — SQL: AND (combines multiple WHERE clauses)
//   desc(col)          — SQL: ORDER BY col DESC (newest first)
//   gte(col, val)      — SQL: WHERE col >= val (greater than or equal)
//   lte(col, val)      — SQL: WHERE col <= val (less than or equal)
import { eq, and, desc, gte, lte } from "drizzle-orm";

// Private helper: verifies that the caller has an active login session.
// Every action in this file calls this first to prevent unauthenticated access
// to personal financial data.
async function getAuthUser() {
  // Create a fresh Supabase server client for this request.
  const supabase = await createClient();
  // Validate the session cookie and return the logged-in user object.
  const { data: { user } } = await supabase.auth.getUser();
  // If no valid session exists, stop immediately — financial data is sensitive
  // and must never be accessible without authentication.
  if (!user) throw new Error("Unauthorized");
  // Return the user object so callers can access user.id.
  return user;
}

// Exported server action: returns all income streams for the logged-in user.
// Parameters:
//   activeOnly — if true, only return income streams that are currently active
// Returns: an array of userIncomeStreams rows, ordered newest-first
export async function getMyIncomeStreams(activeOnly?: boolean) {
  // Authenticate and get the user so we can scope the query to their records.
  const user = await getAuthUser();
  // Start building the WHERE conditions. Always filter to the current user.
  const conditions = [eq(userIncomeStreams.userId, user.id)];
  // If the caller only wants active streams, add:
  //   AND isActive = true
  if (activeOnly) conditions.push(eq(userIncomeStreams.isActive, true));
  // SQL: SELECT * FROM userIncomeStreams WHERE <conditions> ORDER BY createdAt DESC
  return db.select().from(userIncomeStreams).where(and(...conditions)).orderBy(desc(userIncomeStreams.createdAt));
}

// Exported server action: adds a new income stream record for the logged-in user.
// Parameters:
//   input.source      — label describing the income source (e.g. "Salary", "Freelance")
//   input.amount      — income amount per period as a string (e.g. "3000.00")
//   input.frequency   — how often this income is received (must match incomeFrequencyEnum)
//   input.description — optional additional notes about this income source
//   input.startDate   — optional ISO date string for when this income began
//   input.endDate     — optional ISO date string for when this income ends
// Returns: the newly created userIncomeStreams row
export async function addIncomeStream(input: { source: string; amount: string; frequency: string; description?: string; startDate?: string; endDate?: string }) {
  // Authenticate and get the user ID so the new row is linked to this user.
  const user = await getAuthUser();
  // SQL: INSERT INTO userIncomeStreams (...) VALUES (...)
  // Convert startDate/endDate ISO strings to Date objects if provided because
  // Postgres timestamp columns require Date objects, not strings.
  // The frequency is cast to the enum type to satisfy TypeScript's type checker.
  // isActive defaults to true — a newly added income stream is assumed to be current.
  const [stream] = await db.insert(userIncomeStreams)
    .values({ userId: user.id, source: input.source, amount: input.amount, frequency: input.frequency as "weekly" | "bi_weekly" | "semi_monthly" | "monthly" | "quarterly" | "annual" | "one_time", description: input.description, startDate: input.startDate ? new Date(input.startDate) : undefined, endDate: input.endDate ? new Date(input.endDate) : undefined, isActive: true })
    .returning();
  // Return the saved row.
  return stream;
}

// Exported server action: updates fields on an existing income stream.
// Parameters:
//   input.id          — the UUID of the row to update (required)
//   input.source      — optional new label for the income source
//   input.amount      — optional updated amount
//   input.frequency   — optional updated frequency (must match incomeFrequencyEnum)
//   input.description — optional updated notes
//   input.isActive    — optional flag to activate or deactivate this stream
//   input.startDate   — optional updated start date as ISO string
//   input.endDate     — optional updated end date as ISO string
// Returns: the updated userIncomeStreams row
export async function updateIncomeStream(input: { id: string; source?: string; amount?: string; frequency?: string; description?: string; isActive?: boolean; startDate?: string; endDate?: string }) {
  // Authenticate. We use the user ID to scope the update so a user cannot
  // edit another user's income stream even if they know its ID.
  const user = await getAuthUser();
  // Destructure the fields that need special handling (date conversion, enum cast)
  // away from the straightforward fields collected in `rest`.
  const { id, startDate, endDate, frequency, ...rest } = input;
  // SQL:
  //   UPDATE userIncomeStreams
  //   SET <rest fields>, [frequency = ...], [startDate = ...], [endDate = ...], updatedAt = now()
  //   WHERE id = id AND userId = user.id
  // Each date/frequency field is conditionally spread: if the caller provided it,
  // convert and include it; otherwise skip it so the existing value is preserved.
  // The userId check in WHERE ensures users can only update their own records.
  const [updated] = await db.update(userIncomeStreams)
    .set({ ...rest, ...(frequency ? { frequency: frequency as "weekly" | "bi_weekly" | "semi_monthly" | "monthly" | "quarterly" | "annual" | "one_time" } : {}), ...(startDate ? { startDate: new Date(startDate) } : {}), ...(endDate ? { endDate: new Date(endDate) } : {}), updatedAt: new Date() })
    .where(and(eq(userIncomeStreams.id, id), eq(userIncomeStreams.userId, user.id)))
    .returning();
  // Return the updated row.
  return updated;
}

// Exported server action: permanently deletes an income stream record.
// Parameters:
//   id — the UUID of the userIncomeStreams row to delete
// Returns: true to signal successful deletion
export async function deleteIncomeStream(id: string) {
  // Authenticate and scope the delete to the current user so they cannot
  // delete another user's income stream.
  const user = await getAuthUser();
  // SQL:
  //   DELETE FROM userIncomeStreams WHERE id = id AND userId = user.id
  await db.delete(userIncomeStreams).where(and(eq(userIncomeStreams.id, id), eq(userIncomeStreams.userId, user.id)));
  // Return true as a success signal.
  return true;
}

// Exported server action: returns expense records for the logged-in user
// with optional filtering by date range, category, recurrence, and pagination.
// Parameters:
//   filters (optional):
//     startDate   — ISO date string; only include expenses on or after this date
//     endDate     — ISO date string; only include expenses on or before this date
//     category    — only include expenses in this category
//     isRecurring — filter to recurring or non-recurring expenses
//     limit       — cap the number of rows returned (pagination)
//     offset      — skip this many rows before returning results (pagination)
// Returns: an array of userExpenses rows ordered by date DESC (newest first)
export async function getMyExpenses(filters?: { startDate?: string; endDate?: string; category?: string; isRecurring?: boolean; limit?: number; offset?: number }) {
  // Authenticate and get the user to scope the query to their expenses.
  const user = await getAuthUser();
  // Build the WHERE conditions, always starting with the current user's ID.
  const conditions = [eq(userExpenses.userId, user.id)];
  // Filter to expenses on or after startDate if provided.
  if (filters?.startDate) conditions.push(gte(userExpenses.date, new Date(filters.startDate)));
  // Filter to expenses on or before endDate if provided.
  if (filters?.endDate) conditions.push(lte(userExpenses.date, new Date(filters.endDate)));
  // Filter to a specific expense category if provided.
  if (filters?.category) conditions.push(eq(userExpenses.category, filters.category));
  // Filter by recurrence if provided. The `!== undefined` check is important
  // because `false` is a valid value we want to honour (not just skip).
  if (filters?.isRecurring !== undefined) conditions.push(eq(userExpenses.isRecurring, filters.isRecurring));
  // Build the base query with all conditions combined.
  const query = db.select().from(userExpenses).where(and(...conditions)).orderBy(desc(userExpenses.date));
  // Append LIMIT if the caller wants a page size cap.
  if (filters?.limit) query.limit(filters.limit);
  // Append OFFSET to skip rows for pagination (e.g. "page 2" starts at offset 20).
  if (filters?.offset) query.offset(filters.offset);
  // Execute and return the query results.
  return query;
}

// Exported server action: adds a new expense record for the logged-in user.
// Parameters:
//   input.category          — expense category label (e.g. "Groceries", "Repairs")
//   input.amount            — cost as a string (e.g. "42.50")
//   input.description       — optional description of what was bought/paid
//   input.date              — ISO date string for when the expense occurred
//   input.isRecurring       — whether this expense repeats (default: false)
//   input.recurringFrequency — how often it recurs (must match incomeFrequencyEnum)
//   input.issueId           — optional link to a repair issue this expense is for
// Returns: the newly created userExpenses row
export async function addExpense(input: { category: string; amount: string; description?: string; date: string; isRecurring?: boolean; recurringFrequency?: string; issueId?: string }) {
  // Authenticate and retrieve the user ID to link the expense to this user.
  const user = await getAuthUser();
  // SQL: INSERT INTO userExpenses (...) VALUES (...)
  // Convert the date ISO string to a Date object for the Postgres timestamp column.
  // Cast recurringFrequency to the enum type when provided.
  // isRecurring defaults to false if not provided.
  const [expense] = await db.insert(userExpenses)
    .values({ userId: user.id, category: input.category, amount: input.amount, description: input.description, date: new Date(input.date), isRecurring: input.isRecurring ?? false, recurringFrequency: input.recurringFrequency as typeof incomeFrequencyEnum.enumValues[number] | undefined, issueId: input.issueId })
    .returning();
  // Return the created row.
  return expense;
}

// Exported server action: updates fields on an existing expense record.
// Parameters:
//   input.id                — the UUID of the row to update (required)
//   input.category          — optional updated category
//   input.amount            — optional updated amount
//   input.description       — optional updated description
//   input.date              — optional updated date as ISO string
//   input.isRecurring       — optional updated recurrence flag
//   input.recurringFrequency — optional updated frequency (must match enum)
// Returns: the updated userExpenses row
export async function updateExpense(input: { id: string; category?: string; amount?: string; description?: string; date?: string; isRecurring?: boolean; recurringFrequency?: string }) {
  // Authenticate and scope the update to the current user.
  const user = await getAuthUser();
  // Separate id, date, and recurringFrequency from the simple fields in `rest`
  // because they each need special handling before being passed to the DB.
  const { id, date, recurringFrequency, ...rest } = input;
  // SQL:
  //   UPDATE userExpenses
  //   SET <rest fields>, [date = ...], [recurringFrequency = ...]
  //   WHERE id = id AND userId = user.id
  // Date is conditionally converted; frequency is conditionally cast.
  // The userId check prevents editing another user's expenses.
  const [updated] = await db.update(userExpenses)
    .set({ ...rest, ...(date ? { date: new Date(date) } : {}), ...(recurringFrequency ? { recurringFrequency: recurringFrequency as typeof incomeFrequencyEnum.enumValues[number] } : {}) })
    .where(and(eq(userExpenses.id, id), eq(userExpenses.userId, user.id)))
    .returning();
  // Return the updated row.
  return updated;
}

// Exported server action: permanently deletes an expense record.
// Parameters:
//   id — the UUID of the userExpenses row to delete
// Returns: true to signal successful deletion
export async function deleteExpense(id: string) {
  // Authenticate and scope the delete to the current user.
  const user = await getAuthUser();
  // SQL: DELETE FROM userExpenses WHERE id = id AND userId = user.id
  await db.delete(userExpenses).where(and(eq(userExpenses.id, id), eq(userExpenses.userId, user.id)));
  // Return true as a success signal.
  return true;
}

// Exported server action: returns all budget rows for the logged-in user.
// Each budget row represents a per-category monthly spending limit.
// Parameters: none
// Returns: an array of userBudgets rows
export async function getMyBudgets() {
  // Authenticate and retrieve the user so we can scope the query.
  const user = await getAuthUser();
  // SQL: SELECT * FROM userBudgets WHERE userId = user.id
  return db.select().from(userBudgets).where(eq(userBudgets.userId, user.id));
}

// Exported server action: creates or updates the monthly budget limit for a
// specific expense category. Uses an upsert — if a budget row already exists
// for this user + category pair, update the limit; otherwise insert a new row.
// Parameters:
//   input.category    — the expense category this budget applies to
//   input.monthlyLimit — the spending cap per month as a string (e.g. "500.00")
// Returns: the inserted or updated userBudgets row
export async function setBudget(input: { category: string; monthlyLimit: string }) {
  // Authenticate and get the user ID to link the budget to this user.
  const user = await getAuthUser();
  // SQL (upsert):
  //   INSERT INTO userBudgets (userId, category, monthlyLimit) VALUES (...)
  //   ON CONFLICT (userId, category) DO UPDATE SET monthlyLimit = ..., updatedAt = now()
  // The unique constraint target [userId, category] ensures only one budget
  // row per category per user. If one exists, just update the limit.
  const [budget] = await db.insert(userBudgets)
    .values({ userId: user.id, category: input.category, monthlyLimit: input.monthlyLimit })
    .onConflictDoUpdate({ target: [userBudgets.userId, userBudgets.category], set: { monthlyLimit: input.monthlyLimit, updatedAt: new Date() } })
    .returning();
  // Return the saved budget row.
  return budget;
}

// Exported server action: updates the "current spend" figure on a budget row.
// This is called when expenses are tracked so the UI can show how much of the
// budget has been used so far this month.
// Parameters:
//   id           — the UUID of the userBudgets row to update
//   currentSpend — the total amount spent so far this period as a string
// Returns: the updated userBudgets row
export async function updateBudgetSpend(id: string, currentSpend: string) {
  // Authenticate and scope the update to the current user so they cannot
  // modify another user's budget spend figures.
  const user = await getAuthUser();
  // SQL:
  //   UPDATE userBudgets
  //   SET currentSpend = currentSpend, updatedAt = now()
  //   WHERE id = id AND userId = user.id
  const [updated] = await db.update(userBudgets)
    .set({ currentSpend, updatedAt: new Date() })
    .where(and(eq(userBudgets.id, id), eq(userBudgets.userId, user.id)))
    .returning();
  // Return the updated row.
  return updated;
}

// Exported server action: permanently deletes a budget row.
// Parameters:
//   id — the UUID of the userBudgets row to delete
// Returns: true to signal successful deletion
export async function deleteBudget(id: string) {
  // Authenticate and scope the delete to the current user.
  const user = await getAuthUser();
  // SQL: DELETE FROM userBudgets WHERE id = id AND userId = user.id
  await db.delete(userBudgets).where(and(eq(userBudgets.id, id), eq(userBudgets.userId, user.id)));
  // Return true as a success signal.
  return true;
}

// Exported server action: computes a high-level financial summary for the
// logged-in user covering monthly income, this month's spending, budgets,
// and annual income. All three DB queries run in parallel for efficiency.
// Parameters: none
// Returns: an object with:
//   monthlyIncome — estimated total income per month across all active streams
//   totalSpent    — total of all expenses recorded so far this calendar month
//   totalBudget   — sum of all monthly budget limits across all categories
//   remaining     — how much budget is left (totalBudget - totalSpent, floored at 0)
//   annualIncome  — estimated annual income (monthlyIncome * 12)
export async function getMyFinancialSummary() {
  // Authenticate and get the user ID to scope all three queries.
  const user = await getAuthUser();
  // Compute the first moment of the current calendar month so we can filter
  // expenses to just "this month".
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Run all three SELECT queries concurrently using Promise.all so we don't
  // wait for each one sequentially. This keeps the action as fast as possible.
  const [incomeStreams, monthlyExpenses, budgets] = await Promise.all([
    // Query 1: all active income streams for this user.
    // SQL: SELECT * FROM userIncomeStreams WHERE userId = user.id AND isActive = true
    db.select().from(userIncomeStreams).where(and(eq(userIncomeStreams.userId, user.id), eq(userIncomeStreams.isActive, true))),
    // Query 2: all expenses recorded on or after the first of this month.
    // SQL: SELECT * FROM userExpenses WHERE userId = user.id AND date >= startOfMonth
    db.select().from(userExpenses).where(and(eq(userExpenses.userId, user.id), gte(userExpenses.date, startOfMonth))),
    // Query 3: all budget rows for this user (no date filtering needed).
    // SQL: SELECT * FROM userBudgets WHERE userId = user.id
    db.select().from(userBudgets).where(eq(userBudgets.userId, user.id)),
  ]);
  // A lookup table that converts each frequency label into a multiplier
  // representing "how many times does this frequency occur per month?"
  //   weekly:      ~4.33 pay periods per month
  //   bi_weekly:   ~2.17 pay periods per month (26 per year / 12)
  //   semi_monthly: 2 pay periods per month
  //   monthly:     1 pay period per month
  //   quarterly:   1/3 of a pay period per month (4 per year / 12)
  //   annual:      1/12 of a pay period per month
  //   one_time:    0 — a one-time payment does not recur, so contributes 0/month
  const frequencyMap: Record<string, number> = { weekly: 4.33, bi_weekly: 2.17, semi_monthly: 2, monthly: 1, quarterly: 1/3, annual: 1/12, one_time: 0 };
  // Sum up all active income streams, converting each to a monthly amount
  // using the frequency multiplier defined above.
  const monthlyIncome = incomeStreams.reduce((sum, s) => sum + Number(s.amount) * (frequencyMap[s.frequency] || 0), 0);
  // Sum the amount of every expense recorded this month.
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  // Sum all monthly budget limits to get the user's total budgeted amount.
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  // Return the computed summary. Math.max(0, ...) ensures "remaining" never
  // goes below zero in the summary even if spending exceeded the budget.
  return { monthlyIncome, totalSpent, totalBudget, remaining: Math.max(0, totalBudget - totalSpent), annualIncome: monthlyIncome * 12 };
}
