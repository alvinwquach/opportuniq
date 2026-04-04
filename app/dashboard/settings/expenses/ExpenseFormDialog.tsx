"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  IoCheckmark,
  IoAdd,
  IoPencil,
  IoCalendar,
  IoPricetag,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { expenseFormSchema, expenseCategories } from "./schemas";
import { addExpense } from "./actions/addExpense";
import { updateExpense } from "./actions/updateExpense";
import type { ExpenseFrequency } from "./actions/types";
import { useEncryptedFinancials, type DecryptedExpense } from "@/hooks/useEncryptedFinancials";

const FREQUENCY_OPTIONS: { value: ExpenseFrequency; label: string }[] = [
  { value: "one_time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi-weekly" },
  { value: "semi_monthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

interface ExpenseFormDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpense?: DecryptedExpense | null;
}

export function ExpenseFormDialog({
  userId,
  open,
  onOpenChange,
  editingExpense,
}: ExpenseFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { encryptExpenseData, isEncrypting } = useEncryptedFinancials();
  const isEditing = !!editingExpense;

  // Determine default frequency from editing expense
  const getDefaultFrequency = (): ExpenseFrequency => {
    if (!editingExpense) return "one_time";
    if (!editingExpense.isRecurring) return "one_time";
    return (editingExpense.recurringFrequency as ExpenseFrequency) || "monthly";
  };

  const form = useForm({
    defaultValues: {
      category: editingExpense?.category ?? "",
      amount: editingExpense?.amount ?? 0,
      frequency: getDefaultFrequency(),
      description: editingExpense?.description ?? "",
      date: editingExpense
        ? new Date(editingExpense.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      startTransition(async () => {
        try {
          // Encrypt sensitive fields before sending to server
          const encryptedData = await encryptExpenseData({
            category: value.category,
            amount: value.amount,
            description: value.description || undefined,
            date: new Date(value.date),
            frequency: value.frequency,
          });

          if (isEditing && editingExpense) {
            await updateExpense(editingExpense.id, userId, encryptedData);
          } else {
            await addExpense(userId, encryptedData);
          }
          form.reset();
          onOpenChange(false);
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      });
    },
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const showOptionalLabels = !isEditing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f87171]/10 flex items-center justify-center">
              {isEditing ? (
                <IoPencil className="w-4 h-4 text-[#f87171]" />
              ) : (
                <IoAdd className="w-4 h-4 text-[#f87171]" />
              )}
            </div>
            <DialogTitle className="text-gray-900">
              {isEditing ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </div>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="category"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      expenseFormSchema.shape.category.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Category
                    </label>
                    <div className="relative">
                      <IoPricetag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#f87171]/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select category</option>
                        {expenseCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] text-red-400 mt-1">
                        {field.state.meta.errors[0]?.toString()}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Amount */}
              <form.Field
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      expenseFormSchema.shape.amount.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={field.state.value || ""}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        onBlur={field.handleBlur}
                        className="w-full h-10 pl-7 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-[#444] focus:outline-none focus:border-[#f87171]/50 transition-colors"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] text-red-400 mt-1">
                        {field.state.meta.errors[0]?.toString()}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <form.Field name="frequency">
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Frequency
                    </label>
                    <select
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value as ExpenseFrequency)
                      }
                      className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#f87171]/50 transition-colors appearance-none cursor-pointer"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>
              <form.Field
                name="date"
                validators={{
                  onChange: ({ value }) => {
                    const result = expenseFormSchema.shape.date.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => {
                  const isOneTime = form.state.values.frequency === "one_time";
                  return (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                        {isOneTime ? "Date" : "Start Date"}
                      </label>
                      <div className="relative">
                        <IoCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#f87171]/50 transition-colors"
                        />
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-[10px] text-red-400 mt-1">
                          {field.state.meta.errors[0]?.toString()}
                        </p>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            </div>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                    Description{" "}
                    {showOptionalLabels && (
                      <span className="text-[#444]">(optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Netflix subscription, Electric bill"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-[#444] focus:outline-none focus:border-[#f87171]/50 transition-colors"
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex gap-2 pt-6">
            <button
              type="submit"
              disabled={isPending || isSubmitting || isEncrypting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f87171] hover:bg-[#f87171]/90 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-medium text-sm transition-colors"
            >
              {isPending || isSubmitting || isEncrypting ? (
                <ImSpinner8 className="w-4 h-4 animate-spin" />
              ) : (
                <IoCheckmark className="w-4 h-4" />
              )}
              {isEditing ? "Save Changes" : "Add Expense"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
