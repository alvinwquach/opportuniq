import { IncomeStream, Expense, frequencyMultipliers } from './types';

export function calculateMonthlyIncome(incomeStreams: IncomeStream[]): number {
  return incomeStreams
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + s.amount * frequencyMultipliers[s.frequency], 0);
}

export function calculateMonthlyExpenses(expenses: Expense[]): number {
  return expenses
    .filter(e => e.isRecurring)
    .reduce((sum, e) => sum + e.amount * frequencyMultipliers[e.frequency || "monthly"], 0);
}

export function calculateOneTimeExpensesThisMonth(expenses: Expense[]): number {
  return expenses
    .filter(e => !e.isRecurring && new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0);
}

export function calculateAvailableFunds(
  monthlyIncome: number,
  monthlyExpenses: number,
  emergencyFund: number,
  pendingUrgentExpenses: number
): number {
  // Available = Income - Fixed Expenses - Emergency Reserve - Pending Urgent
  const monthlyBuffer = monthlyIncome * 0.1; // Keep 10% buffer
  return monthlyIncome - monthlyExpenses - monthlyBuffer - pendingUrgentExpenses;
}

export function getUrgencyColor(urgency?: string): string {
  switch (urgency) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'important': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'normal': return 'text-blue-600 bg-blue-50 border-blue-500/20';
    case 'deferrable': return 'text-gray-500 bg-[#333] border-[#444]';
    default: return 'text-gray-500 bg-[#333] border-[#444]';
  }
}

export function getUrgencyLabel(urgency?: string): string {
  switch (urgency) {
    case 'critical': return 'Critical';
    case 'important': return 'Important';
    case 'normal': return 'Normal';
    case 'deferrable': return 'Can Wait';
    default: return 'Normal';
  }
}
