"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { IoCheckmark, IoWallet, IoShield, IoSpeedometer } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { Slider } from "@/components/ui/slider";
import { updateBudgetSettings } from "./actions";
import {
  riskToleranceLevels,
  riskToleranceLabels,
  riskToleranceDescriptions,
  type RiskTolerance,
  type BudgetSettingsFormValues,
} from "./schemas";

interface BudgetSettingsFormProps {
  userId: string;
  initialValues: BudgetSettingsFormValues;
}

export function BudgetSettingsForm({
  userId,
  initialValues,
}: BudgetSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      monthlyBudget: initialValues.monthlyBudget ?? undefined,
      emergencyBuffer: initialValues.emergencyBuffer ?? undefined,
      riskTolerance: initialValues.riskTolerance ?? "moderate",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setSaveMessage(null);
      startTransition(async () => {
        try {
          await updateBudgetSettings(userId, {
            monthlyBudget: value.monthlyBudget ?? null,
            emergencyBuffer: value.emergencyBuffer ?? null,
            riskTolerance: value.riskTolerance as RiskTolerance,
          });
          setSaveMessage("Settings saved");
          setTimeout(() => setSaveMessage(null), 3000);
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="monthlyBudget">
          {(field) => (
            <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
                  <IoWallet className="w-5 h-5 text-[#5eead4]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white block">
                    Monthly Budget
                  </label>
                  <p className="text-[11px] text-[#555]">
                    Max spending per month on repairs
                  </p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                  $
                </span>
                <input
                  type="number"
                  placeholder="e.g., 500"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full h-11 pl-7 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                />
              </div>
            </div>
          )}
        </form.Field>
        <form.Field name="emergencyBuffer">
          {(field) => (
            <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <IoShield className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white block">
                    Emergency Buffer
                  </label>
                  <p className="text-[11px] text-[#555]">
                    Savings for unexpected repairs
                  </p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                  $
                </span>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full h-11 pl-7 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                />
              </div>
            </div>
          )}
        </form.Field>
      </div>
      <form.Field name="riskTolerance">
        {(field) => {
          const currentIndex = riskToleranceLevels.indexOf(
            field.state.value as RiskTolerance
          );
          const sliderValue = currentIndex >= 0 ? currentIndex : 3; // default to moderate (index 3)
          const currentLevel = riskToleranceLevels[sliderValue];

          return (
            <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <IoSpeedometer className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white block">
                    DIY Risk Tolerance
                  </label>
                  <p className="text-[11px] text-[#555]">
                    How comfortable are you with DIY repairs?
                  </p>
                </div>
              </div>
              <div className="mb-6 p-4 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a]">
                <p className="text-lg font-medium text-purple-400 mb-1">
                  {riskToleranceLabels[currentLevel]}
                </p>
                <p className="text-sm text-[#888]">
                  {riskToleranceDescriptions[currentLevel]}
                </p>
              </div>
              <div className="px-1">
                <Slider
                  value={[sliderValue]}
                  onValueChange={(values) => {
                    const newLevel = riskToleranceLevels[values[0]];
                    field.handleChange(newLevel);
                  }}
                  min={0}
                  max={riskToleranceLevels.length - 1}
                  step={1}
                  className="[&_[data-slot=slider-track]]:bg-[#2a2a2a] [&_[data-slot=slider-range]]:bg-purple-500 [&_[data-slot=slider-thumb]]:border-purple-500 [&_[data-slot=slider-thumb]]:bg-white"
                />
              </div>
              <div className="flex justify-between mt-3 px-1">
                {riskToleranceLevels.map((level, index) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => field.handleChange(level)}
                    className={`text-[10px] transition-colors ${
                      index === sliderValue
                        ? "text-purple-400 font-medium"
                        : "text-[#555] hover:text-[#888]"
                    }`}
                  >
                    {riskToleranceLabels[level]}
                  </button>
                ))}
              </div>
            </div>
          );
        }}
      </form.Field>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-sm transition-colors"
        >
          {isPending || isSubmitting ? (
            <ImSpinner8 className="w-4 h-4 animate-spin" />
          ) : (
            <IoCheckmark className="w-4 h-4" />
          )}
          Save Settings
        </button>
        {saveMessage && (
          <span className="text-sm text-[#5eead4]">{saveMessage}</span>
        )}
      </div>
    </form>
  );
}
