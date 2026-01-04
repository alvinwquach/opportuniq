"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IoCash, IoAdd, IoTrash, IoReload, IoArrowForward, IoBriefcase } from "react-icons/io5";
import { addIncomeStream } from "../actions";

interface IncomeSetupProps {
  userId: string;
}

type Frequency = "weekly" | "bi_weekly" | "semi_monthly" | "monthly";

const FREQUENCY_OPTIONS: { value: Frequency; label: string; multiplier: number }[] = [
  { value: "weekly", label: "Weekly", multiplier: 4.33 },
  { value: "bi_weekly", label: "Bi-weekly", multiplier: 2.17 },
  { value: "semi_monthly", label: "Semi-monthly", multiplier: 2 },
  { value: "monthly", label: "Monthly", multiplier: 1 },
];

const ANNUAL_HOURS = 2080;

export function IncomeSetup({ userId }: IncomeSetupProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [streams, setStreams] = useState<
    { source: string; amount: string; frequency: Frequency }[]
  >([{ source: "", amount: "", frequency: "bi_weekly" }]);

  const addStream = () => {
    setStreams([...streams, { source: "", amount: "", frequency: "bi_weekly" }]);
  };

  const removeStream = (index: number) => {
    if (streams.length > 1) {
      setStreams(streams.filter((_, i) => i !== index));
    }
  };

  const updateStream = (
    index: number,
    field: "source" | "amount" | "frequency",
    value: string
  ) => {
    const updated = [...streams];
    if (field === "frequency") {
      updated[index][field] = value as Frequency;
    } else {
      updated[index][field] = value;
    }
    setStreams(updated);
  };

  const monthlyIncome = streams.reduce((sum, s) => {
    const amount = parseFloat(s.amount) || 0;
    const freq = FREQUENCY_OPTIONS.find((f) => f.value === s.frequency);
    return sum + amount * (freq?.multiplier || 0);
  }, 0);

  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  const handleSubmit = () => {
    const validStreams = streams.filter(
      (s) => s.source.trim() && parseFloat(s.amount) > 0
    );

    if (validStreams.length === 0) return;

    startTransition(async () => {
      for (const stream of validStreams) {
        await addIncomeStream(userId, {
          source: stream.source,
          amount: parseFloat(stream.amount),
          frequency: stream.frequency,
        });
      }
      router.refresh();
    });
  };

  const isValid = streams.some(
    (s) => s.source.trim() && parseFloat(s.amount) > 0
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5eead4]/10 border border-[#5eead4]/20 mb-4">
          <IoCash className="w-7 h-7 text-[#5eead4]" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Set up your income
        </h2>
        <p className="text-[#888] text-sm max-w-md mx-auto">
          We use this to calculate your hourly rate, helping you decide if DIY is worth your time.
        </p>
      </div>
      <div className="space-y-3 mb-6">
        {streams.map((stream, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]"
          >
            <div className="flex-1 grid grid-cols-[1fr_120px_140px] gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                  Source
                </label>
                <div className="relative">
                  <IoBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input
                    type="text"
                    placeholder="e.g., Salary, Freelance"
                    value={stream.source}
                    onChange={(e) => updateStream(index, "source", e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  />
                </div>
              </div>
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
                    value={stream.amount}
                    onChange={(e) => updateStream(index, "amount", e.target.value)}
                    className="w-full h-10 pl-7 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                  Frequency
                </label>
                <select
                  value={stream.frequency}
                  onChange={(e) => updateStream(index, "frequency", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {streams.length > 1 && (
              <button
                onClick={() => removeStream(index)}
                className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <IoTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addStream}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors text-sm mb-8"
      >
        <IoAdd className="w-4 h-4" />
        Add another income source
      </button>
      {monthlyIncome > 0 && (
        <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f] mb-8">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                Monthly
              </p>
              <p className="text-xl font-semibold text-white">
                ${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                Annual
              </p>
              <p className="text-xl font-semibold text-white">
                ${annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">
                Your hourly rate
              </p>
              <p className="text-xl font-semibold text-[#5eead4]">
                ${hourlyRate.toFixed(2)}/hr
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#555] mt-4">
            A 4-hour DIY project costs you ${(hourlyRate * 4).toFixed(0)} in time.
            If hiring costs less, it might be worth it.
          </p>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-semibold text-sm transition-colors"
      >
        {isPending ? (
          <>
            <IoReload className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue to Dashboard
            <IoArrowForward className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-center text-[11px] text-[#555] mt-4">
        Your financial data is private and never shared with other group members.
      </p>
    </div>
  );
}
