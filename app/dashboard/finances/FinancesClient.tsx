// Tell React and Next.js to run this component in the browser (client-side).
// Without this, hooks like useState/useMemo/useRef/useEffect wouldn't work.
"use client";

// useState  = track UI state (active tab, whether the "Add" dropdown is open).
// useMemo   = cache transformed data arrays so the transformation only reruns when server data changes.
// useRef    = get a direct reference to the "Add" dropdown DOM element so we can
//             detect clicks outside it and close it.
// useEffect = run a side-effect after render (attaching the "click outside" event listener).
import { useState, useMemo, useRef, useEffect } from "react";

// Icon components from react-icons Ionicons 5 set.
// IoAdd       = "+" icon on the "Add" button.
// IoArrowUp   = upward arrow icon on the "Income" dropdown item (money in).
// IoArrowDown = downward arrow icon on the "Expense" dropdown item (money out).
// IoChevronDown = chevron that rotates 180° when the "Add" dropdown is open.
import { IoAdd, IoArrowUp, IoArrowDown, IoChevronDown } from "react-icons/io5";

// TypeScript types for the local data shapes used by this component.
// TabType          = "overview" | "income" | "expenses"
// IncomeStream     = shape of a single income source (salary, freelance, etc.)
// Expense          = shape of a single expense record (category, amount, date, etc.)
// UpcomingExpense  = shape of a future expected cost (amount, due date, urgency)
// SpendingCategory = shape of a spending breakdown slice (category label + amount)
import type {
  TabType,
  IncomeStream,
  Expense,
  UpcomingExpense,
  SpendingCategory,
} from "./types";

// frequencyMultipliers = a lookup table that maps frequency strings (e.g. "weekly", "monthly")
// to a numeric multiplier so we can normalize all recurring expenses to monthly equivalents.
// e.g. "weekly" → 4.33, "annual" → 1/12, "monthly" → 1
import { frequencyMultipliers } from "./types";

// Import every sub-component used in the finances page layout.
// FinancesSkeleton    = loading placeholder shown while data is fetching.
// AvailableFundsCard  = the large "available funds" balance card at the top.
// SummaryCards        = the row of four smaller stat cards (income, budget, remaining, DIY saved).
// BudgetChart         = donut chart showing budget usage (spent vs remaining).
// SpendingByCategory  = bar or list showing spending broken down by category.
// CashFlowChart       = line/area chart showing income vs expenses over time.
// UpcomingExpenses    = list of future expected costs.
// RecentExpenses      = table of recent expense transactions.
// IncomeTab           = full income management UI (add/edit/delete income streams).
// ExpensesTab         = full expenses management UI (add/delete expenses, category breakdown).
import {
  FinancesSkeleton,
  AvailableFundsCard,
  SummaryCards,
  BudgetChart,
  SpendingByCategory,
  CashFlowChart,
  UpcomingExpenses,
  RecentExpenses,
  IncomeTab,
  ExpensesTab,
} from "./components";

// Custom TanStack Query hooks for finances data and mutations.
// useFinancesPageData  = fetches all finances data; returns { data, isLoading, error }.
// useAddIncomeStream   = mutation to add a new income source.
// useUpdateIncomeStream = mutation to edit an existing income source.
// useDeleteIncomeStream = mutation to remove an income source.
// useAddExpense        = mutation to record a new expense.
// useDeleteExpense     = mutation to remove an expense record.
import {
  useFinancesPageData,
  useAddIncomeStream,
  useUpdateIncomeStream,
  useDeleteIncomeStream,
  useAddExpense,
  useDeleteExpense,
} from "@/lib/hooks/finances";

// FinancesPageDataResponse = TypeScript type describing the full server response shape,
// used to type the transform functions below.
import type { FinancesPageDataResponse } from "@/lib/hooks/types";

// Transform a single income stream from the server response shape into the local IncomeStream type.
// This is needed because the server may return fields with slightly different names or types
// (e.g. frequency as a plain string vs. the narrower union type the components expect).
function transformIncomeStream(
  stream: FinancesPageDataResponse["incomeStreams"][0]
): IncomeStream {
  return {
    id: stream.id,
    source: stream.source,
    amount: stream.amount,
    // Cast the generic string to the specific union type ("weekly" | "biweekly" | "monthly" | etc.)
    frequency: stream.frequency as IncomeStream["frequency"],
    isActive: stream.isActive,
    description: stream.description,
    // Pre-computed monthly equivalent amount (the server calculates this for us).
    monthlyEquivalent: stream.monthlyEquivalent,
  };
}

// Transform a single expense record from the server response into the local Expense type.
// Converts the date string to a JavaScript Date object for easy comparison in the component.
function transformExpense(
  expense: FinancesPageDataResponse["expenses"][0]
): Expense {
  return {
    id: expense.id,
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
    // Convert the ISO date string from the server into a JavaScript Date object.
    date: new Date(expense.date),
    isRecurring: expense.isRecurring,
    // Cast the generic frequency string to the narrower Expense["frequency"] union type.
    frequency: expense.frequency as Expense["frequency"],
    issueTitle: expense.issueTitle,
    // Cast the generic urgency string to the narrower Expense["urgency"] union type.
    urgency: expense.urgency as Expense["urgency"],
  };
}

// Transform a single upcoming expense from the server response into the local UpcomingExpense type.
// Converts the due date string to a JavaScript Date object.
function transformUpcomingExpense(
  expense: FinancesPageDataResponse["upcomingExpenses"][0]
): UpcomingExpense {
  return {
    id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    // Convert the ISO due date string to a JavaScript Date object.
    dueDate: new Date(expense.dueDate),
    urgency: expense.urgency,
    isRecurring: expense.isRecurring,
  };
}

// FinancesClient is the page-level shell for the Finances section.
// It fetches data, transforms it, computes derived values, and passes
// everything down to the appropriate tab's presentational components.
export function FinancesClient() {
  // Fetch all finances data from the server via GraphQL.
  // isLoading = true while the request is in flight.
  // error     = set if the request fails.
  // data      = the server response once it succeeds.
  const { data, isLoading, error } = useFinancesPageData();

  // Set up every mutation hook. Each returns a { mutate, isPending } object.
  // isPending is used to show loading states when the user triggers a mutation.
  const addIncomeMutation = useAddIncomeStream();
  const updateIncomeMutation = useUpdateIncomeStream();
  const deleteIncomeMutation = useDeleteIncomeStream();
  const addExpenseMutation = useAddExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // Which tab is currently active: "overview", "income", or "expenses".
  // Changing this switches which content section is rendered.
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Whether the "Add → Income / Expense" split dropdown is open.
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // A ref to the dropdown container div.
  // Used by the useEffect below to detect clicks outside the dropdown so it auto-closes.
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // Side-effect: attach a "mousedown" listener to the document that closes the
  // dropdown whenever the user clicks outside of it.
  // The cleanup function (return) removes the listener when the component unmounts
  // to prevent memory leaks.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the click target is NOT inside the dropdown container, close the dropdown.
      if (
        addDropdownRef.current &&
        !addDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAddDropdown(false);
      }
    }
    // Attach the listener when the component mounts.
    document.addEventListener("mousedown", handleClickOutside);
    // Return a cleanup function that removes the listener when the component unmounts.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Transform the raw income stream array into local IncomeStream objects.
  // useMemo caches this so the map() only reruns when data.incomeStreams changes,
  // not on every tab switch or dropdown toggle.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const incomeStreams = useMemo(() => {
    // Return an empty array if data hasn't loaded yet to avoid rendering errors.
    if (!data?.incomeStreams) return [];
    return data.incomeStreams.map(transformIncomeStream);
  }, [data?.incomeStreams]);

  // Transform the raw expense array into local Expense objects (with Date objects).
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const expenses = useMemo(() => {
    if (!data?.expenses) return [];
    return data.expenses.map(transformExpense);
  }, [data?.expenses]);

  // Transform the raw upcoming expenses array into local UpcomingExpense objects.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const upcomingExpenses = useMemo(() => {
    if (!data?.upcomingExpenses) return [];
    return data.upcomingExpenses.map(transformUpcomingExpense);
  }, [data?.upcomingExpenses]);

  // Pass through spending-by-category data as-is (already in the correct shape).
  // useMemo still caches the reference so child components don't get a new array
  // reference on every render (which would cause unnecessary re-renders).
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const spendingByCategory: SpendingCategory[] = useMemo(() => {
    if (!data?.spendingByCategory) return [];
    return data.spendingByCategory;
  }, [data?.spendingByCategory]);

  // Extract scalar values from the server response with safe fallback defaults.
  // These are used directly in the overview tab's display components.
  const monthlyIncome = data?.monthlyIncome ?? 0;
  const monthlyExpenses = data?.monthlyExpenses ?? 0;
  const availableFunds = data?.availableFunds ?? 0;
  // Default monthly budget to $800 if not set by the user.
  const monthlyBudget = data?.monthlyBudget ?? 800;
  // Remaining = budget minus what's been spent so far this month.
  const remaining = data?.remaining ?? monthlyBudget;
  // What percentage of the emergency fund target has been reached (0-100).
  const emergencyFundPercent = data?.emergencyFundPercent ?? 0;
  // Total amount saved through DIY resolutions this month.
  const diySaved = data?.diySaved ?? 0;
  // Number of urgent upcoming expenses awaiting user attention.
  const pendingUrgent = data?.pendingUrgent ?? 0;

  // Calculate the total monthly cost of all recurring expenses.
  // Uses frequencyMultipliers to normalize non-monthly frequencies to a monthly amount
  // (e.g. a weekly expense of $100 × 4.33 = $433/month).
  const recurringTotal = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => {
      // Look up the multiplier for this expense's frequency; default to 1 (monthly) if unknown.
      const multiplier = frequencyMultipliers[e.frequency ?? "monthly"] ?? 1;
      return sum + e.amount * multiplier;
    }, 0);

  // Calculate the total amount of NON-recurring (one-time) expenses this calendar month.
  // Only counts expenses that occurred in the current month and year.
  const oneTimeThisMonth = expenses
    .filter((e) => {
      // Skip recurring expenses — we only want one-time purchases here.
      if (e.isRecurring) return false;
      const now = new Date();
      // Check that the expense's date is in the current month AND year.
      return (
        e.date.getMonth() === now.getMonth() &&
        e.date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Handle the user clicking "Delete" on an income stream row.
  // Calls the mutation which sends a DELETE request and updates the cache.
  const handleDeleteIncome = (id: string) => {
    deleteIncomeMutation.mutate(id);
  };

  // Handle the user clicking "Delete" on an expense row.
  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(id);
  };

  // Handle the user clicking "Income" in the "Add" dropdown.
  // Closes the dropdown. TODO: would open an "Add Income" modal.
  const handleAddIncome = () => {
    setShowAddDropdown(false);
    // Would open modal - for now just log
  };

  // Handle the user clicking "Expense" in the "Add" dropdown.
  // Closes the dropdown. TODO: would open an "Add Expense" modal.
  const handleAddExpense = () => {
    setShowAddDropdown(false);
    // Would open modal - for now just log
  };

  // Guard: while the server request is in flight, show the skeleton placeholder.
  if (isLoading) {
    return <FinancesSkeleton />;
  }

  // Guard: if the server request failed, show a centered error message.
  if (error) {
    return (
      <div className="p-6 min-h-[calc(100vh-48px)] bg-gray-50">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load finances. Please try again.</p>
        </div>
      </div>
    );
  }

  // Happy path: data loaded — render the full finances page.
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-gray-50">
      {/* ─── PAGE HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Finances</h2>
          <p className="text-sm text-gray-500">
            Track income, expenses, and home maintenance costs
          </p>
        </div>
        {/* "Add" split dropdown button — opens a two-option menu (Income / Expense). */}
        {/* The ref is attached here so the useEffect can detect outside clicks. */}
        <div className="relative" ref={addDropdownRef}>
          {/* Clicking the button toggles the dropdown open/closed. */}
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <IoAdd className="w-4 h-4" />
            Add
            {/* Chevron rotates 180° when the dropdown is open to signal it can be closed. */}
            <IoChevronDown
              className={`w-3 h-3 transition-transform ${
                showAddDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {/* Dropdown menu: only rendered when showAddDropdown is true. */}
          {showAddDropdown && (
            // z-50 ensures the dropdown renders above all other page content.
            <div className="absolute right-0 top-full mt-1 w-40 bg-gray-100 rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
              {/* "Income" option: green upward arrow to signal money coming in. */}
              <button
                onClick={handleAddIncome}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:bg-[#333] transition-colors"
              >
                <IoArrowUp className="w-4 h-4 text-blue-600" />
                Income
              </button>
              {/* "Expense" option: amber downward arrow to signal money going out.
                  border-t separates it from the Income option. */}
              <button
                onClick={handleAddExpense}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:bg-[#333] transition-colors border-t border-gray-200"
              >
                <IoArrowDown className="w-4 h-4 text-amber-400" />
                Expense
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── TAB NAVIGATION ───────────────────────────────────── */}
      {/* Three tabs in a pill container: Overview | Income | Expenses.
          Only one tab is active at a time; clicking a tab sets activeTab state. */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg border border-gray-200 p-1 w-fit">
        {/* Iterate over the three tab names as a constant tuple to guarantee type safety. */}
        {(["overview", "income", "expenses"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              // Active tab gets the emerald highlight; inactive tabs are grey.
              activeTab === tab
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {/* Capitalize the first letter for display: "overview" → "Overview". */}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─────────────────────────────────────── */}
      {/* Only rendered when "overview" is the active tab. */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Large "Available Funds" hero card showing the spendable balance. */}
          <AvailableFundsCard
            availableFunds={availableFunds}
            monthlyIncome={monthlyIncome}
            totalSpent={monthlyExpenses}
            pendingUrgent={pendingUrgent}
          />

          {/* Row of four summary stat cards: monthly income, budget, remaining, DIY saved. */}
          <SummaryCards
            monthlyIncome={monthlyIncome}
            monthlyBudget={monthlyBudget}
            remaining={remaining}
            totalSpent={monthlyExpenses}
            diySaved={diySaved}
            emergencyFundPercent={emergencyFundPercent}
          />

          {/* Side-by-side row: budget donut chart (left) + spending-by-category breakdown (right). */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Donut chart: spent vs remaining vs budget. */}
            <BudgetChart
              totalSpent={monthlyExpenses}
              remaining={remaining}
              budget={monthlyBudget}
            />
            {/* Category breakdown: bar or list showing where money went. */}
            <SpendingByCategory data={spendingByCategory} />
          </div>

          {/* Side-by-side row: cash flow trend chart (left) + upcoming expenses list (right). */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Area chart showing income vs expenses over past months.
                Falls back to an empty array if no history data is available. */}
            <CashFlowChart data={data?.cashFlowHistory ?? []} />
            {/* List of upcoming expenses (future costs the user has logged). */}
            <UpcomingExpenses expenses={upcomingExpenses} />
          </div>

          {/* Recent expenses table at the bottom of the overview.
              "View All" button switches the active tab to "expenses" for full management. */}
          <RecentExpenses
            expenses={expenses}
            onViewAll={() => setActiveTab("expenses")}
          />
        </div>
      )}

      {/* ─── INCOME TAB ───────────────────────────────────────── */}
      {/* Only rendered when "income" is the active tab. */}
      {activeTab === "income" && (
        <IncomeTab
          incomeStreams={incomeStreams}
          monthlyIncome={monthlyIncome}
          onDelete={handleDeleteIncome}
          onAdd={handleAddIncome}
        />
      )}

      {/* ─── EXPENSES TAB ─────────────────────────────────────── */}
      {/* Only rendered when "expenses" is the active tab. */}
      {activeTab === "expenses" && (
        <ExpensesTab
          expenses={expenses}
          // Pass the pre-calculated total of all recurring expenses (normalized to monthly).
          monthlyExpenses={recurringTotal}
          // Pass the pre-calculated total of all one-time expenses in the current month.
          oneTimeThisMonth={oneTimeThisMonth}
          spendingByCategory={spendingByCategory}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  );
}
