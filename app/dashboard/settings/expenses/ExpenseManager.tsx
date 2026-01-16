"use client";


import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { ExpenseCard } from "./ExpenseCard";
import { ExpenseFormDialog } from "./ExpenseFormDialog";
import { deleteExpense } from "./actions/deleteExpense";
import { type DecryptedExpense } from "@/hooks/useEncryptedFinancials";

interface ExpenseManagerProps {
  userId: string;
  decryptedExpenses: DecryptedExpense[];
}

export function ExpenseManager({
  userId,
  decryptedExpenses,
}: ExpenseManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<DecryptedExpense | null>(null);

  const handleEdit = (expense: DecryptedExpense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingExpense(null);
    }
  };

  const handleDelete = (expenseId: string) => {
    startTransition(async () => {
      await deleteExpense(expenseId, userId);
      router.refresh();
    });
  };

  const recurringExpenses = decryptedExpenses.filter((expense) => expense.isRecurring);
  const oneTimeExpenses = decryptedExpenses.filter((expense) => !expense.isRecurring);

  return (
    <div className="space-y-6">
      {recurringExpenses.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">
            Recurring Expenses
          </h3>
          <div className="space-y-2">
            {recurringExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => handleEdit(expense)}
                onDelete={() => handleDelete(expense.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}
      {oneTimeExpenses.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">
            One-time Expenses
          </h3>
          <div className="space-y-2">
            {oneTimeExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => handleEdit(expense)}
                onDelete={() => handleDelete(expense.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}
      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#f87171]/50 transition-colors"
      >
        <IoAdd className="w-4 h-4" />
        Add Expense
      </button>
      <ExpenseFormDialog
        userId={userId}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingExpense={editingExpense}
      />
    </div>
  );
}
