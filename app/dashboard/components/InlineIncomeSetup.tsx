"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IoAdd,
  IoReload,
  IoBriefcase,
  IoCalendar,
  IoCash,
  IoCheckmark,
  IoClose,
  IoTime,
  IoChevronDown,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type IncomeFrequency =
  | "weekly"
  | "bi_weekly"
  | "semi_monthly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "hourly";

type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "CNY" | "INR" | "MXN" | "BRL";

interface InlineIncomeSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const CURRENCY_OPTIONS: {
  value: Currency;
  label: string;
  symbol: string;
}[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "MXN", label: "Mexican Peso", symbol: "$" },
  { value: "BRL", label: "Brazilian Real", symbol: "R$" },
];

const FREQUENCY_OPTIONS: {
  value: IncomeFrequency;
  label: string;
  description: string;
}[] = [
  { value: "hourly", label: "Hourly", description: "I know my hourly rate" },
  { value: "weekly", label: "Weekly", description: "Every week" },
  { value: "bi_weekly", label: "Bi-weekly", description: "Every 2 weeks" },
  { value: "semi_monthly", label: "Semi-monthly", description: "Twice a month" },
  { value: "monthly", label: "Monthly", description: "Once a month" },
  { value: "quarterly", label: "Quarterly", description: "Every 3 months" },
  { value: "annual", label: "Annual", description: "Once a year" },
];

// Multipliers to convert to monthly
const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  hourly: 173.33, // 40 hrs/week * 52 weeks / 12 months
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
};

export function InlineIncomeSetup({
  open,
  onOpenChange,
  userId,
}: InlineIncomeSetupProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<IncomeFrequency>("monthly");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");

  const currencySymbol = CURRENCY_OPTIONS.find((c) => c.value === currency)?.symbol || "$";

  const resetForm = () => {
    setSource("");
    setAmount("");
    setFrequency("monthly");
    setCurrency("USD");
    setDescription("");
    setStartDate("");
  };

  const handleSubmit = async () => {
    if (!source.trim() || !amount || parseFloat(amount) <= 0) return;

    startTransition(async () => {
      // Import the action dynamically to avoid server/client issues
      const { addIncomeStream } = await import(
        "@/app/dashboard/settings/income/actions"
      );

      // For hourly rate, we store it as monthly equivalent
      const actualFrequency = frequency === "hourly" ? "monthly" : frequency;
      const actualAmount =
        frequency === "hourly"
          ? parseFloat(amount) * FREQUENCY_TO_MONTHLY.hourly
          : parseFloat(amount);

      await addIncomeStream(userId, {
        source: source.trim(),
        amount: actualAmount,
        frequency: actualFrequency as Exclude<IncomeFrequency, "hourly">,
        description:
          frequency === "hourly"
            ? `Hourly rate: $${amount}/hr${description ? ` - ${description.trim()}` : ""}`
            : description.trim() || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
      });

      resetForm();
      onOpenChange(false);
      router.refresh();
    });
  };

  // Calculate preview
  const monthlyAmount = amount
    ? parseFloat(amount) * (FREQUENCY_TO_MONTHLY[frequency] || 1)
    : 0;
  const hourlyRate = (monthlyAmount * 12) / 2080;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
              <IoCash className="w-4 h-4 text-[#5eead4]" />
            </div>
            Add Income
          </DialogTitle>
          <DialogDescription className="text-[#666]">
            Add your income to calculate your hourly rate and make better DIY vs
            hire decisions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
              Source
            </label>
            <div className="relative">
              <IoBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                type="text"
                placeholder="e.g., Salary, Freelance, Side gig"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full h-10 px-2 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.symbol} {opt.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
              className="w-full h-10 px-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {frequency !== "hourly" && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                {frequency === "bi_weekly" ? "Next Payday" : "Start Date"}{" "}
                <span className="text-[#444]">(optional)</span>
              </label>
              <div className="relative">
                <IoCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                />
              </div>
              {frequency === "bi_weekly" && (
                <p className="text-[10px] text-[#555] mt-1">
                  We&apos;ll calculate your recurring paydays from this date.
                </p>
              )}
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
              Description <span className="text-[#444]">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer at Acme Corp"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
            />
          </div>
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
              <p className="text-[10px] uppercase tracking-wider text-[#555] mb-2">
                Preview
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {currencySymbol}{monthlyAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[11px] text-[#555]">per month</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#5eead4]">
                    {currencySymbol}{hourlyRate.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-[#555]">per hour</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#666]">
                <IoTime className="w-3 h-3" />
                <span>
                  A 4-hour DIY project costs you {currencySymbol}{(hourlyRate * 4).toFixed(0)} in time
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isPending || !source.trim() || !amount || parseFloat(amount) <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-sm transition-colors"
            >
              {isPending ? (
                <IoReload className="w-4 h-4 animate-spin" />
              ) : (
                <IoCheckmark className="w-4 h-4" />
              )}
              Add Income
            </button>
            <button
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="px-4 py-2.5 rounded-lg text-[#888] hover:text-white hover:bg-[#1f1f1f] text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
