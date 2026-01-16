"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { IoCheckmark, IoAdd, IoPencil, IoBriefcase, IoCalendar } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { incomeFormSchema } from "./schemas";
import { addIncomeStream } from "./actions/addIncomeStream";
import { updateIncomeStream } from "./actions/updateIncomeStream";
import type { IncomeFrequency } from "./actions/types";
import { useEncryptedFinancials, type DecryptedIncomeStream } from "@/hooks/useEncryptedFinancials";

const FREQUENCY_OPTIONS: { value: IncomeFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi-weekly" },
  { value: "semi_monthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "one_time", label: "One-time" },
];

interface IncomeFormDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStream?: DecryptedIncomeStream | null;
}

export function IncomeFormDialog({
  userId,
  open,
  onOpenChange,
  editingStream,
}: IncomeFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { encryptIncomeData, isEncrypting } = useEncryptedFinancials();
  const isEditing = !!editingStream;

  const form = useForm({
    defaultValues: {
      source: editingStream?.source ?? "",
      amount: editingStream?.amount ?? 0,
      frequency: (editingStream?.frequency ?? "monthly") as IncomeFrequency,
      description: editingStream?.description ?? "",
      startDate: editingStream?.startDate
        ? new Date(editingStream.startDate).toISOString().split("T")[0]
        : undefined,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      startTransition(async () => {
        try {
          // Encrypt sensitive fields before sending to server
          const encryptedData = await encryptIncomeData({
            source: value.source,
            amount: value.amount,
            description: value.description || undefined,
            frequency: value.frequency,
            startDate: value.startDate ? new Date(value.startDate) : undefined,
          });

          if (isEditing && editingStream) {
            await updateIncomeStream(editingStream.id, userId, encryptedData);
          } else {
            await addIncomeStream(userId, encryptedData);
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
      <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
              {isEditing ? (
                <IoPencil className="w-4 h-4 text-[#5eead4]" />
              ) : (
                <IoAdd className="w-4 h-4 text-[#5eead4]" />
              )}
            </div>
            <DialogTitle className="text-white">
              {isEditing ? "Edit Income" : "Add Income"}
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
              {/* Source */}
              <form.Field
                name="source"
                validators={{
                  onChange: ({ value }) => {
                    const result = incomeFormSchema.shape.source.safeParse(value);
                    return result.success ? undefined : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                      Source
                    </label>
                    <div className="relative">
                      <IoBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                      <input
                        type="text"
                        placeholder="e.g., Salary, Freelance"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
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

              {/* Amount */}
              <form.Field
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    const result = incomeFormSchema.shape.amount.safeParse(value);
                    return result.success ? undefined : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        className="w-full h-10 pl-7 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
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
              {/* Frequency */}
              <form.Field name="frequency">
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                      Frequency
                    </label>
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as IncomeFrequency)}
                      className="w-full h-10 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
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

              {/* Start Date */}
              <form.Field name="startDate">
                {(field) => {
                  const isOneTime = form.state.values.frequency === "one_time";
                  return (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                        {isOneTime ? "Date" : "Start Date"}{" "}
                        {showOptionalLabels && <span className="text-[#444]">(optional)</span>}
                      </label>
                      <div className="relative">
                        <IoCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                        <input
                          type="date"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value || undefined)}
                          onBlur={field.handleBlur}
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                        />
                      </div>
                    </div>
                  );
                }}
              </form.Field>
            </div>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                    Description{" "}
                    {showOptionalLabels && <span className="text-[#444]">(optional)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer at Acme Corp"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full h-10 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex gap-2 pt-6">
            <button
              type="submit"
              disabled={isPending || isSubmitting || isEncrypting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-sm transition-colors"
            >
              {isPending || isSubmitting || isEncrypting ? (
                <ImSpinner8 className="w-4 h-4 animate-spin" />
              ) : (
                <IoCheckmark className="w-4 h-4" />
              )}
              {isEditing ? "Save Changes" : "Add Income"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-[#888] hover:text-white hover:bg-[#1f1f1f] text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
