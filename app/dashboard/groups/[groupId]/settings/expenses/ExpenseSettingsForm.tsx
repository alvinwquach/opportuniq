"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { IoCheckmark, IoShieldCheckmark, IoSpeedometer, IoLockClosed } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateExpenseSettings } from "./actions";
import {
  expenseApprovalModes,
  approvalModeLabels,
  approvalModeDescriptions,
  type ExpenseApprovalMode,
  type ExpenseSettingsFormValues,
} from "./schemas";

interface ExpenseSettingsFormProps {
  groupId: string;
  initialValues: ExpenseSettingsFormValues;
  canEdit: boolean;
}

export function ExpenseSettingsForm({
  groupId,
  initialValues,
  canEdit,
}: ExpenseSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      approvalMode: initialValues.approvalMode,
      defaultThreshold: initialValues.defaultThreshold ?? undefined,
      trustOwnerAdmin: initialValues.trustOwnerAdmin,
      moderatorThreshold: initialValues.moderatorThreshold ?? undefined,
      allowModeratorApprove: initialValues.allowModeratorApprove,
    },
    onSubmit: async ({ value }) => {
      if (!canEdit) return;

      setIsSubmitting(true);
      setSaveMessage(null);
      startTransition(async () => {
        try {
          const result = await updateExpenseSettings(groupId, {
            approvalMode: value.approvalMode,
            defaultThreshold: value.defaultThreshold ?? null,
            trustOwnerAdmin: value.trustOwnerAdmin,
            moderatorThreshold: value.moderatorThreshold ?? null,
            allowModeratorApprove: value.allowModeratorApprove,
          });

          if (result.success) {
            setSaveMessage("Settings saved");
            setTimeout(() => setSaveMessage(null), 3000);
            router.refresh();
          } else {
            setSaveMessage(result.error ?? "Failed to save");
          }
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
      {/* Approval Mode Selection */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <IoShieldCheckmark className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Approval Mode</h3>
            <p className="text-[11px] text-[#555]">
              How should expenses be approved?
            </p>
          </div>
        </div>

        <form.Field name="approvalMode">
          {(field) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {expenseApprovalModes.map((mode) => {
                const isSelected = field.state.value === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => field.handleChange(mode)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500/50 text-white"
                        : "bg-[#0c0c0c] border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a] hover:text-white"
                    } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {approvalModeLabels[mode]}
                    </p>
                    <p className="text-[11px] text-[#555] leading-tight">
                      {approvalModeDescriptions[mode]}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </form.Field>
      </div>

      {/* Threshold Settings - Only show when threshold mode is selected */}
      <form.Subscribe selector={(state) => state.values.approvalMode}>
        {(currentMode) => currentMode === "threshold" && (
        <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
              <IoSpeedometer className="w-5 h-5 text-[#5eead4]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Default Threshold</h3>
              <p className="text-[11px] text-[#555]">
                Auto-approve expenses under this amount
              </p>
            </div>
          </div>

          <form.Field name="defaultThreshold">
            {(field) => (
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                  $
                </span>
                <input
                  type="number"
                  placeholder="e.g., 75"
                  disabled={!canEdit}
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full h-11 pl-7 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}
          </form.Field>
        </div>
        )}
      </form.Subscribe>

      {/* Role Settings */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <IoLockClosed className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Role Settings</h3>
            <p className="text-[11px] text-[#555]">
              Configure permissions by role
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Trust Owner/Admin */}
          <form.Field name="trustOwnerAdmin">
            {(field) => (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a]">
                <div>
                  <Label htmlFor="trustOwnerAdmin" className="text-sm text-white cursor-pointer">
                    Trust Coordinator/Collaborator
                  </Label>
                  <p className="text-[11px] text-[#555]">
                    Skip approval for expenses submitted by coordinators and collaborators
                  </p>
                </div>
                <Switch
                  id="trustOwnerAdmin"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  disabled={!canEdit}
                />
              </div>
            )}
          </form.Field>

          {/* Moderator Threshold */}
          <form.Subscribe selector={(state) => state.values.approvalMode}>
            {(currentMode) => currentMode === "threshold" && (
              <form.Field name="moderatorThreshold">
                {(field) => (
                  <div className="p-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label className="text-sm text-white">
                          Higher Threshold for Participants
                        </Label>
                        <p className="text-[11px] text-[#555]">
                          Optional: Give participants a higher auto-approval limit
                        </p>
                      </div>
                    </div>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Leave empty to use default"
                        disabled={!canEdit}
                        value={field.state.value ?? ""}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        onBlur={field.handleBlur}
                        className="w-full h-11 pl-7 pr-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </form.Field>
            )}
          </form.Subscribe>

          {/* Allow Moderator Approve */}
          <form.Field name="allowModeratorApprove">
            {(field) => (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a]">
                <div>
                  <Label htmlFor="allowModeratorApprove" className="text-sm text-white cursor-pointer">
                    Allow Participants to Approve
                  </Label>
                  <p className="text-[11px] text-[#555]">
                    Let participants approve pending expenses
                  </p>
                </div>
                <Switch
                  id="allowModeratorApprove"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  disabled={!canEdit}
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Submit Button */}
      {canEdit && (
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
            <span className={`text-sm ${saveMessage.includes("Failed") ? "text-red-400" : "text-[#5eead4]"}`}>
              {saveMessage}
            </span>
          )}
        </div>
      )}
    </form>
  );
}
