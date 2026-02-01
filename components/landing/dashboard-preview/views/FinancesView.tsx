"use client";

import { useState, useRef, useEffect } from "react";
import { IoAdd, IoArrowUp, IoArrowDown, IoChevronDown } from "react-icons/io5";
import {
  TabType,
  IncomeStream,
  Expense,
  IncomeFrequency,
  frequencyMultipliers,
  expenseCategories,
  initialIncomeStreams,
  initialExpenses,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateOneTimeExpensesThisMonth,
  calculateAvailableFunds,
  AvailableFundsCard,
  SummaryCards,
  BudgetChart,
  SpendingByCategory,
  CashFlowChart,
  UpcomingExpenses,
  DIYSavingsChart,
  WhatIfScenario,
  RecentExpenses,
  IncomeTab,
  ExpensesTab,
  IncomeModal,
  ExpenseModal,
  OverviewSidebar,
  BudgetSidebar,
  TrendsSidebar,
  IncomeSidebar,
  ExpensesSidebar,
} from "./finances";

export function FinancesView() {
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>(initialIncomeStreams);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeStream | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    source: "", amount: "", frequency: "monthly" as IncomeFrequency, description: ""
  });
  const [expenseForm, setExpenseForm] = useState({
    category: "Repairs", amount: "", description: "", isRecurring: false, frequency: "monthly" as IncomeFrequency
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addDropdownRef.current && !addDropdownRef.current.contains(event.target as Node)) {
        setShowAddDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculations
  const monthlyIncome = calculateMonthlyIncome(incomeStreams);
  const monthlyExpenses = calculateMonthlyExpenses(expenses);
  const oneTimeThisMonth = calculateOneTimeExpensesThisMonth(expenses);
  const totalSpent = monthlyExpenses + oneTimeThisMonth;
  const monthlyBudget = 800;
  const remaining = monthlyBudget - totalSpent;
  const emergencyFundPercent = 47;
  const diySaved = 1190;

  // Pending urgent expenses
  const pendingUrgent = expenses
    .filter(e => e.urgency === 'critical' || e.urgency === 'important')
    .filter(e => e.isRecurring && e.nextDueDate && e.nextDueDate > new Date())
    .reduce((sum, e) => sum + e.amount, 0);

  const availableFunds = calculateAvailableFunds(monthlyIncome, monthlyExpenses, 4700, pendingUrgent);

  // Spending by category
  const spendingByCategory = expenseCategories.map(cat => {
    const total = expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => {
        if (e.isRecurring) {
          return sum + e.amount * frequencyMultipliers[e.frequency || "monthly"];
        }
        if (new Date(e.date).getMonth() === new Date().getMonth()) {
          return sum + e.amount;
        }
        return sum;
      }, 0);
    return { category: cat, amount: Math.round(total) };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  // Handlers
  const handleAddIncome = () => {
    if (!incomeForm.source || !incomeForm.amount) return;
    const newIncome: IncomeStream = {
      id: Date.now().toString(),
      source: incomeForm.source,
      amount: parseFloat(incomeForm.amount),
      frequency: incomeForm.frequency,
      isActive: true,
      description: incomeForm.description || undefined,
    };
    setIncomeStreams([...incomeStreams, newIncome]);
    setIncomeForm({ source: "", amount: "", frequency: "monthly", description: "" });
    setShowIncomeModal(false);
  };

  const handleEditIncome = () => {
    if (!editingIncome || !incomeForm.source || !incomeForm.amount) return;
    setIncomeStreams(incomeStreams.map(i =>
      i.id === editingIncome.id
        ? { ...i, source: incomeForm.source, amount: parseFloat(incomeForm.amount), frequency: incomeForm.frequency, description: incomeForm.description || undefined }
        : i
    ));
    setEditingIncome(null);
    setIncomeForm({ source: "", amount: "", frequency: "monthly", description: "" });
    setShowIncomeModal(false);
  };

  const handleDeleteIncome = (id: string) => setIncomeStreams(incomeStreams.filter(i => i.id !== id));

  const handleAddExpense = () => {
    if (!expenseForm.category || !expenseForm.amount) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      date: new Date(),
      isRecurring: expenseForm.isRecurring,
      frequency: expenseForm.isRecurring ? expenseForm.frequency : undefined,
    };
    setExpenses([newExpense, ...expenses]);
    setExpenseForm({ category: "Repairs", amount: "", description: "", isRecurring: false, frequency: "monthly" });
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));

  const openEditIncome = (income: IncomeStream) => {
    setEditingIncome(income);
    setIncomeForm({ source: income.source, amount: income.amount.toString(), frequency: income.frequency, description: income.description || "" });
    setShowIncomeModal(true);
  };

  const openAddIncome = () => {
    setEditingIncome(null);
    setIncomeForm({ source: "", amount: "", frequency: "monthly", description: "" });
    setShowIncomeModal(true);
    setShowAddDropdown(false);
  };

  const openAddExpense = () => {
    setExpenseForm({ category: "Repairs", amount: "", description: "", isRecurring: false, frequency: "monthly" });
    setShowExpenseModal(true);
    setShowAddDropdown(false);
  };

  return (
    <>
      <IncomeModal
        isOpen={showIncomeModal}
        isEditing={!!editingIncome}
        form={incomeForm}
        onChange={setIncomeForm}
        onSave={editingIncome ? handleEditIncome : handleAddIncome}
        onClose={() => setShowIncomeModal(false)}
      />
      <ExpenseModal
        isOpen={showExpenseModal}
        form={expenseForm}
        onChange={setExpenseForm}
        onSave={handleAddExpense}
        onClose={() => setShowExpenseModal(false)}
      />

      <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Finances</h2>
            <p className="text-sm text-[#666]">Track income, expenses, and home maintenance costs</p>
          </div>
          <div className="relative" ref={addDropdownRef}>
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <IoAdd className="w-4 h-4" />
              Add
              <IoChevronDown className={`w-3 h-3 transition-transform ${showAddDropdown ? "rotate-180" : ""}`} />
            </button>
            {showAddDropdown && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-lg z-50 overflow-hidden">
                <button onClick={openAddIncome} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#888] hover:bg-[#333] transition-colors">
                  <IoArrowUp className="w-4 h-4 text-emerald-400" />
                  Income
                </button>
                <button onClick={openAddExpense} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#888] hover:bg-[#333] transition-colors border-t border-[#2a2a2a]">
                  <IoArrowDown className="w-4 h-4 text-amber-400" />
                  Expense
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-1 w-fit overflow-x-auto">
          {(["overview", "budget", "trends", "income", "expenses"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab ? "bg-emerald-500/20 text-emerald-400" : "text-[#888] hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Layout - Two Column with Sidebar */}
        <div className="grid xl:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="space-y-6 min-w-0">
            {/* Overview Tab - Key metrics at a glance */}
            {activeTab === "overview" && (
              <>
                {/* Available Funds - Prominent */}
                <AvailableFundsCard
                  availableFunds={availableFunds}
                  monthlyIncome={monthlyIncome}
                  totalSpent={totalSpent}
                  pendingUrgent={pendingUrgent}
                />

                {/* Summary Cards */}
                <SummaryCards
                  monthlyIncome={monthlyIncome}
                  monthlyBudget={monthlyBudget}
                  remaining={remaining}
                  totalSpent={totalSpent}
                  diySaved={diySaved}
                  emergencyFundPercent={emergencyFundPercent}
                />

                {/* Upcoming Expenses */}
                <UpcomingExpenses expenses={expenses} />
              </>
            )}

            {/* Budget Tab - Budget tracking and what-if */}
            {activeTab === "budget" && (
              <>
                {/* Budget Chart & What-If */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <BudgetChart totalSpent={totalSpent} remaining={remaining} budget={monthlyBudget} />
                  <WhatIfScenario availableFunds={availableFunds} />
                </div>

                {/* Spending by Category */}
                <SpendingByCategory data={spendingByCategory} />

                {/* Recent Expenses */}
                <RecentExpenses expenses={expenses} onViewAll={() => setActiveTab("expenses")} />
              </>
            )}

            {/* Trends Tab - Cash flow and savings trends */}
            {activeTab === "trends" && (
              <>
                {/* Cash Flow */}
                <CashFlowChart />

                {/* DIY Savings */}
                <DIYSavingsChart />
              </>
            )}

            {/* Income Tab */}
            {activeTab === "income" && (
              <IncomeTab
                incomeStreams={incomeStreams}
                monthlyIncome={monthlyIncome}
                onEdit={openEditIncome}
                onDelete={handleDeleteIncome}
                onAdd={openAddIncome}
              />
            )}

            {/* Expenses Tab */}
            {activeTab === "expenses" && (
              <ExpensesTab
                expenses={expenses}
                monthlyExpenses={monthlyExpenses}
                oneTimeThisMonth={oneTimeThisMonth}
                spendingByCategory={spendingByCategory}
                onDelete={handleDeleteExpense}
              />
            )}
          </div>

          {/* Sidebar - Contextual based on active tab */}
          <div className="min-w-0">
            {activeTab === "overview" && (
              <OverviewSidebar
                monthlyIncome={monthlyIncome}
                totalSpent={totalSpent}
                remaining={remaining}
                diySaved={diySaved}
              />
            )}
            {activeTab === "budget" && (
              <BudgetSidebar
                monthlyBudget={monthlyBudget}
                totalSpent={totalSpent}
                remaining={remaining}
                spendingByCategory={spendingByCategory}
              />
            )}
            {activeTab === "trends" && (
              <TrendsSidebar
                monthlyIncome={monthlyIncome}
                totalSpent={totalSpent}
                diySaved={diySaved}
              />
            )}
            {activeTab === "income" && (
              <IncomeSidebar
                incomeStreams={incomeStreams}
                monthlyIncome={monthlyIncome}
                onAddIncome={openAddIncome}
              />
            )}
            {activeTab === "expenses" && (
              <ExpensesSidebar
                expenses={expenses}
                monthlyExpenses={monthlyExpenses}
                oneTimeThisMonth={oneTimeThisMonth}
                spendingByCategory={spendingByCategory}
                onAddExpense={openAddExpense}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
