"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { IoAdd, IoArrowUp, IoArrowDown, IoChevronDown } from "react-icons/io5";
import type {
  TabType,
  IncomeStream,
  Expense,
  UpcomingExpense,
  SpendingCategory,
} from "./types";
import { frequencyMultipliers } from "./types";
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
import {
  useFinancesPageData,
  useAddIncomeStream,
  useUpdateIncomeStream,
  useDeleteIncomeStream,
  useAddExpense,
  useDeleteExpense,
} from "@/lib/graphql/hooks/finances";
import type { FinancesPageDataResponse } from "@/lib/graphql/types";

// Transform GraphQL response to local types
function transformIncomeStream(
  stream: FinancesPageDataResponse["incomeStreams"][0]
): IncomeStream {
  return {
    id: stream.id,
    source: stream.source,
    amount: stream.amount,
    frequency: stream.frequency as IncomeStream["frequency"],
    isActive: stream.isActive,
    description: stream.description,
    monthlyEquivalent: stream.monthlyEquivalent,
  };
}

function transformExpense(
  expense: FinancesPageDataResponse["expenses"][0]
): Expense {
  return {
    id: expense.id,
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
    date: new Date(expense.date),
    isRecurring: expense.isRecurring,
    frequency: expense.frequency as Expense["frequency"],
    issueTitle: expense.issueTitle,
    urgency: expense.urgency as Expense["urgency"],
  };
}

function transformUpcomingExpense(
  expense: FinancesPageDataResponse["upcomingExpenses"][0]
): UpcomingExpense {
  return {
    id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    dueDate: new Date(expense.dueDate),
    urgency: expense.urgency,
    isRecurring: expense.isRecurring,
  };
}

export function FinancesClient() {
  // Fetch data via GraphQL
  const { data, isLoading, error } = useFinancesPageData();

  // Mutations
  const addIncomeMutation = useAddIncomeStream();
  const updateIncomeMutation = useUpdateIncomeStream();
  const deleteIncomeMutation = useDeleteIncomeStream();
  const addExpenseMutation = useAddExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        addDropdownRef.current &&
        !addDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAddDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Transform data
  const incomeStreams = useMemo(() => {
    if (!data?.incomeStreams) return [];
    return data.incomeStreams.map(transformIncomeStream);
  }, [data?.incomeStreams]);

  const expenses = useMemo(() => {
    if (!data?.expenses) return [];
    return data.expenses.map(transformExpense);
  }, [data?.expenses]);

  const upcomingExpenses = useMemo(() => {
    if (!data?.upcomingExpenses) return [];
    return data.upcomingExpenses.map(transformUpcomingExpense);
  }, [data?.upcomingExpenses]);

  const spendingByCategory: SpendingCategory[] = useMemo(() => {
    if (!data?.spendingByCategory) return [];
    return data.spendingByCategory;
  }, [data?.spendingByCategory]);

  // Stats from GraphQL or defaults
  const monthlyIncome = data?.monthlyIncome ?? 0;
  const monthlyExpenses = data?.monthlyExpenses ?? 0;
  const availableFunds = data?.availableFunds ?? 0;
  const monthlyBudget = data?.monthlyBudget ?? 800;
  const remaining = data?.remaining ?? monthlyBudget;
  const emergencyFundPercent = data?.emergencyFundPercent ?? 0;
  const diySaved = data?.diySaved ?? 0;
  const pendingUrgent = data?.pendingUrgent ?? 0;

  // Calculate recurring vs one-time for expenses tab
  const recurringTotal = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => {
      const multiplier = frequencyMultipliers[e.frequency ?? "monthly"] ?? 1;
      return sum + e.amount * multiplier;
    }, 0);

  const oneTimeThisMonth = expenses
    .filter((e) => {
      if (e.isRecurring) return false;
      const now = new Date();
      return (
        e.date.getMonth() === now.getMonth() &&
        e.date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Handlers
  const handleDeleteIncome = (id: string) => {
    deleteIncomeMutation.mutate(id);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(id);
  };

  const handleAddIncome = () => {
    setShowAddDropdown(false);
    // Would open modal - for now just log
    console.log("Open add income modal");
  };

  const handleAddExpense = () => {
    setShowAddDropdown(false);
    // Would open modal - for now just log
    console.log("Open add expense modal");
  };

  // Loading state
  if (isLoading) {
    return <FinancesSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load finances. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Finances</h2>
          <p className="text-sm text-[#666]">
            Track income, expenses, and home maintenance costs
          </p>
        </div>
        <div className="relative" ref={addDropdownRef}>
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <IoAdd className="w-4 h-4" />
            Add
            <IoChevronDown
              className={`w-3 h-3 transition-transform ${
                showAddDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showAddDropdown && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-lg z-50 overflow-hidden">
              <button
                onClick={handleAddIncome}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#888] hover:bg-[#333] transition-colors"
              >
                <IoArrowUp className="w-4 h-4 text-emerald-400" />
                Income
              </button>
              <button
                onClick={handleAddExpense}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#888] hover:bg-[#333] transition-colors border-t border-[#2a2a2a]"
              >
                <IoArrowDown className="w-4 h-4 text-amber-400" />
                Expense
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-1 w-fit">
        {(["overview", "income", "expenses"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-[#888] hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Available Funds */}
          <AvailableFundsCard
            availableFunds={availableFunds}
            monthlyIncome={monthlyIncome}
            totalSpent={monthlyExpenses}
            pendingUrgent={pendingUrgent}
          />

          {/* Summary Cards */}
          <SummaryCards
            monthlyIncome={monthlyIncome}
            monthlyBudget={monthlyBudget}
            remaining={remaining}
            totalSpent={monthlyExpenses}
            diySaved={diySaved}
            emergencyFundPercent={emergencyFundPercent}
          />

          {/* Budget & Spending Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <BudgetChart
              totalSpent={monthlyExpenses}
              remaining={remaining}
              budget={monthlyBudget}
            />
            <SpendingByCategory data={spendingByCategory} />
          </div>

          {/* Cash Flow & Upcoming Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <CashFlowChart data={data?.cashFlowHistory ?? []} />
            <UpcomingExpenses expenses={upcomingExpenses} />
          </div>

          {/* Recent Expenses */}
          <RecentExpenses
            expenses={expenses}
            onViewAll={() => setActiveTab("expenses")}
          />
        </div>
      )}

      {/* Income Tab */}
      {activeTab === "income" && (
        <IncomeTab
          incomeStreams={incomeStreams}
          monthlyIncome={monthlyIncome}
          onDelete={handleDeleteIncome}
          onAdd={handleAddIncome}
        />
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <ExpensesTab
          expenses={expenses}
          monthlyExpenses={recurringTotal}
          oneTimeThisMonth={oneTimeThisMonth}
          spendingByCategory={spendingByCategory}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  );
}
