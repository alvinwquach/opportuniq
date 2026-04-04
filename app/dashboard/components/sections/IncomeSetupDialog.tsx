"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  IoReload,
  IoCheckmark,
  IoAdd,
  IoBriefcase,
  IoCalendar,
  IoCash,
  IoWallet,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { incomeFormSchema } from "../../settings/income/schemas";
import {
  addIncomeStream,
  type IncomeFrequency,
} from "../../settings/income/actions";
import { trackIncomeAdded } from "@/lib/analytics";
import { useEncryptedFinancials } from "@/hooks/useEncryptedFinancials";

const FREQUENCY_OPTIONS: { value: IncomeFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi-weekly" },
  { value: "semi_monthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "one_time", label: "One-time" },
];

interface IncomeSetupDialogProps {
  userId: string;
  variant?: "budget" | "prompt";
}

export function IncomeSetupDialog({ userId, variant = "prompt" }: IncomeSetupDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { encryptIncomeData, isEncrypting } = useEncryptedFinancials();

  const form = useForm({
    defaultValues: {
      source: "",
      amount: 0,
      frequency: "monthly" as IncomeFrequency,
      description: "",
      startDate: undefined as string | undefined,
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

          await addIncomeStream(userId, encryptedData);
          // Track income added event
          trackIncomeAdded({
            frequency: value.frequency,
            hasDescription: !!value.description,
          });
          form.reset();
          setOpen(false);
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      });
    },
  });

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  // Budget variant (shows in BudgetGlanceCard)
  if (variant === "budget") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="w-full text-left p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#333] transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <IoWallet className="w-5 h-5 text-[#a3a3a3]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">This Month</p>
                <p className="text-sm font-medium text-[#ccc] group-hover:text-gray-900 transition-colors">
                  Set up income
                </p>
              </div>
            </div>
            <p className="text-xs text-[#a3a3a3] mb-3">
              Track your budget and see how much you have available for repairs.
            </p>
            <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors text-xs font-medium">
              <IoAdd className="w-3.5 h-3.5" />
              Get Started
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white border-gray-200 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
                <IoAdd className="w-4 h-4 text-[#5eead4]" />
              </div>
              <DialogTitle className="text-gray-900">Add Income</DialogTitle>
            </div>
          </DialogHeader>
          <IncomeForm
            form={form}
            isPending={isPending || isEncrypting}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Prompt variant (shows in IncomeSetupPrompt)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#333] transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <IoCash className="w-4 h-4 text-[#a3a3a3]" />
            </div>
            <h3 className="text-sm font-medium text-[#ccc] group-hover:text-gray-900 transition-colors">
              Set up your income
            </h3>
            <div className="ml-auto w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <IoAdd className="w-3.5 h-3.5 text-[#a3a3a3]" />
            </div>
          </div>
          <p className="text-xs text-[#a3a3a3]">
            Add income to calculate your hourly rate and see if DIY is worth your time.
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
              <IoAdd className="w-4 h-4 text-[#5eead4]" />
            </div>
            <DialogTitle className="text-gray-900">Add Income</DialogTitle>
          </div>
        </DialogHeader>
        <IncomeForm
          form={form}
          isPending={isPending || isEncrypting}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Extracted form component to avoid duplication
function IncomeForm({
  form,
  isPending,
  isSubmitting,
  onCancel,
}: {
   
  form: any;
  isPending: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  return (
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
              onChange: ({ value }: { value: string }) => {
                const result = incomeFormSchema.shape.source.safeParse(value);
                return result.success ? undefined : result.error.issues[0]?.message;
              },
            }}
          >
            {(field: any) => (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Source
                </label>
                <div className="relative">
                  <IoBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g., Salary, Freelance"
                    value={field.state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#5eead4]/50 transition-colors"
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
              onChange: ({ value }: { value: number }) => {
                const result = incomeFormSchema.shape.amount.safeParse(value);
                return result.success ? undefined : result.error.issues[0]?.message;
              },
            }}
          >
            {(field: any) => (
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
                    placeholder="0"
                    value={field.state.value || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    className="w-full h-10 pl-7 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#5eead4]/50 transition-colors"
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
            {(field: any) => (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Frequency
                </label>
                <select
                  value={field.state.value}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.handleChange(e.target.value as IncomeFrequency)}
                  className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
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
            {(field: any) => {
              const isOneTime = form.state.values.frequency === "one_time";
              return (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                    {isOneTime ? "Date" : "Start Date"}{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <IoCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={field.state.value ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value || undefined)}
                      onBlur={field.handleBlur}
                      className="w-full h-10 pl-10 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                    />
                  </div>
                </div>
              );
            }}
          </form.Field>
        </div>

        {/* Description */}
        <form.Field name="description">
          {(field: any) => (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Software Engineer at Acme Corp"
                value={field.state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#5eead4]/50 transition-colors"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex gap-2 pt-6">
        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium text-sm transition-colors"
        >
          {isPending || isSubmitting ? (
            <IoReload className="w-4 h-4 animate-spin" />
          ) : (
            <IoCheckmark className="w-4 h-4" />
          )}
          Add Income
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-gray-900 hover:bg-gray-100 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
