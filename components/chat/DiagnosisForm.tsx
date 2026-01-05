"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import {
  IoHome,
  IoCar,
  IoConstruct,
  IoFlash,
  IoWater,
  IoThermometer,
  IoHammer,
  IoImage,
  IoClose,
  IoChevronDown,
  IoChevronUp,
  IoSend,
  IoLockClosed,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { cn } from "@/lib/utils";
import { VoiceMicButton } from "@/components/voice/VoiceMicButton";
import type { TranscriptionResult } from "@/lib/schemas/voice";
import {
  diagnosisFormSchema,
  type DiagnosisFormValues,
  type IssueCategory,
  type PropertyType,
  type SkillLevel,
  type UrgencyLevel,
  type BudgetRange,
  issueCategories,
  propertyTypes,
  skillLevels,
  urgencyLevels,
  budgetRanges,
  labels,
  formToRequest,
} from "@/lib/schemas/diagnosis";
import { Progress } from "@/components/ui/progress";

const categoryIcons: Record<IssueCategory, React.ReactNode> = {
  plumbing: <IoWater className="w-4 h-4" />,
  electrical: <IoFlash className="w-4 h-4" />,
  hvac: <IoThermometer className="w-4 h-4" />,
  structural: <IoHome className="w-4 h-4" />,
  roofing: <IoHome className="w-4 h-4" />,
  flooring: <IoHome className="w-4 h-4" />,
  appliance: <IoConstruct className="w-4 h-4" />,
  exterior: <IoHome className="w-4 h-4" />,
  auto_engine: <IoCar className="w-4 h-4" />,
  auto_body: <IoCar className="w-4 h-4" />,
  auto_interior: <IoCar className="w-4 h-4" />,
  other: <IoHammer className="w-4 h-4" />,
};

interface DiagnosisFormProps {
  userId: string;
  userPostalCode?: string | null;
  onSubmit: (data: ReturnType<typeof formToRequest>, language?: string) => Promise<void>;
  isSubmitting?: boolean;
  selectedImage?: string | null;
  imageFile?: File | null;
  onImageSelect?: () => void;
  onImageRemove?: () => void;
  isEncrypting?: boolean;
  uploadProgress?: number;
  // Voice input state
  detectedLanguage?: string | null;
  onLanguageDetected?: (language: string) => void;
}

export function DiagnosisForm({
  userId,
  userPostalCode,
  onSubmit,
  isSubmitting = false,
  selectedImage,
  imageFile,
  onImageSelect,
  onImageRemove,
  isEncrypting = false,
  uploadProgress = 0,
  detectedLanguage,
  onLanguageDetected,
}: DiagnosisFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm({
    defaultValues: {
      issueDescription: "",
      issueCategory: undefined as IssueCategory | undefined,
      issueLocation: "",
      propertyType: "house" as PropertyType,
      yearBuilt: "",
      postalCode: userPostalCode || "",
      diySkillLevel: "beginner" as SkillLevel,
      urgency: "flexible" as UrgencyLevel,
      budgetRange: undefined as BudgetRange | undefined,
      hasBasicTools: false,
      prefersDIY: undefined as boolean | undefined,
    },
    onSubmit: async ({ value }) => {
      // If no description but has image, provide a default prompt
      const formValue = {
        ...value,
        // Always use userPostalCode from props if available (handles hydration timing)
        postalCode: userPostalCode || value.postalCode,
        issueDescription: value.issueDescription.trim() || "What issue do you see in this photo? Please diagnose and provide recommendations.",
      } as DiagnosisFormValues;
      const request = formToRequest(formValue);
      // Pass detected language from voice input
      await onSubmit(request, detectedLanguage || undefined);
    },
  });

  // Sync postal code when prop changes (handles SSR hydration timing)
  useEffect(() => {
    if (userPostalCode && form.state.values.postalCode !== userPostalCode) {
      form.setFieldValue("postalCode", userPostalCode);
    }
  }, [userPostalCode, form]);

  // Determine if it's a vehicle based on category or property type
  const isVehicle =
    form.state.values.propertyType === "vehicle" ||
    form.state.values.issueCategory?.startsWith("auto_");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {selectedImage && (
        <div className="relative inline-block">
          <Image
            src={selectedImage}
            alt="Selected"
            width={120}
            height={120}
            className="h-24 w-24 object-cover rounded-lg border border-[#2a2a2a]"
            unoptimized
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <IoClose className="w-4 h-4" />
          </button>
          {isEncrypting && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <IoLockClosed className="w-5 h-5 text-[#5eead4] mx-auto mb-1" />
                <Progress value={uploadProgress} className="w-16 h-1" />
              </div>
            </div>
          )}
        </div>
      )}
      <form.Field name="issueDescription">
        {(field) => (
          <div>
            <textarea
              placeholder={
                selectedImage
                  ? "Add details (optional) or just click Get Diagnosis..."
                  : "Describe the issue you're experiencing..."
              }
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={selectedImage ? 2 : 3}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm placeholder:text-[#666] focus:outline-none focus:border-[#5eead4]/50 resize-none transition-colors"
            />
          </div>
        )}
      </form.Field>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-[#555] mb-2 block">
          Issue Category
        </label>
        <form.Field name="issueCategory">
          {(field) => (
            <div className="flex flex-wrap gap-2">
              {issueCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => field.handleChange(field.state.value === cat ? undefined : cat)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors",
                    field.state.value === cat
                      ? "bg-[#5eead4] text-black"
                      : "bg-[#1a1a1a] text-[#888] hover:bg-[#2a2a2a] hover:text-white border border-[#2a2a2a]"
                  )}
                >
                  {categoryIcons[cat]}
                  {labels.issueCategories[cat]}
                </button>
              ))}
            </div>
          )}
        </form.Field>
      </div>
      {!userPostalCode && (
        <form.Field
          name="postalCode"
          validators={{
            onChange: ({ value }) => {
              const result = diagnosisFormSchema.shape.postalCode.safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                ZIP Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 90210"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                maxLength={10}
                className="w-32 h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-400 mt-1">{field.state.meta.errors[0]?.toString()}</p>
              )}
            </div>
          )}
        </form.Field>
      )}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors"
      >
        {showAdvanced ? <IoChevronUp className="w-4 h-4" /> : <IoChevronDown className="w-4 h-4" />}
        {showAdvanced ? "Hide" : "Show"} advanced options
      </button>
      {showAdvanced && (
        <div className="space-y-4 p-4 rounded-xl bg-[#0c0c0c] border border-[#1f1f1f]">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="propertyType">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                    Property Type
                  </label>
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as PropertyType)}
                    className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {labels.propertyTypes[type]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>
            {!isVehicle && (
              <form.Field name="yearBuilt">
                {(field) => (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                      Year Built <span className="text-[#444]">(optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 1985"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      min={1800}
                      max={new Date().getFullYear()}
                      className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                    />
                    {field.state.value && parseInt(field.state.value) < 1980 && (
                      <p className="text-[10px] text-amber-400 mt-1">
                        Pre-1980 homes may have lead paint or asbestos
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="diySkillLevel">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                    Your DIY Skill Level
                  </label>
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as SkillLevel)}
                    className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
                  >
                    {skillLevels.map((level) => (
                      <option key={level} value={level}>
                        {labels.skillLevels[level]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>
            <form.Field name="urgency">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                    Urgency
                  </label>
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as UrgencyLevel)}
                    className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level} value={level}>
                        {labels.urgencyLevels[level]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="budgetRange">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                    Budget <span className="text-[#444]">(optional)</span>
                  </label>
                  <select
                    value={field.state.value || ""}
                    onChange={(e) =>
                      field.handleChange((e.target.value as BudgetRange) || undefined)
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-[#5eead4]/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select budget...</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>
                        {labels.budgetRanges[range]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>
            <form.Field name="issueLocation">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#555] mb-1.5 block">
                    Location <span className="text-[#444]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isVehicle ? "e.g., front bumper" : "e.g., master bathroom"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex flex-wrap gap-4">
            <form.Field name="hasBasicTools">
              {(field) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#5eead4] focus:ring-[#5eead4]/50 focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#888]">I have basic tools</span>
                </label>
              )}
            </form.Field>
            <form.Field name="prefersDIY">
              {(field) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.state.value || false}
                    onChange={(e) => field.handleChange(e.target.checked || undefined)}
                    className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#5eead4] focus:ring-[#5eead4]/50 focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#888]">I prefer DIY if possible</span>
                </label>
              )}
            </form.Field>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onImageSelect}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a1a1a] text-[#888] hover:text-[#5eead4] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors border border-[#2a2a2a]"
          title="Upload photo"
        >
          <IoImage className="w-5 h-5" />
        </button>
        <VoiceMicButton
          onTranscription={(result: TranscriptionResult) => {
            // Append transcribed text to the description
            const currentValue = form.state.values.issueDescription;
            const newValue = currentValue
              ? `${currentValue}\n${result.text}`
              : result.text;
            form.setFieldValue("issueDescription", newValue);
            // Store detected language
            if (result.language && onLanguageDetected) {
              onLanguageDetected(result.language);
            }
          }}
          disabled={isSubmitting || isEncrypting}
          size="md"
          source="initial_form"
        />
        <button
          type="submit"
          disabled={isSubmitting || isEncrypting || (!form.state.values.issueDescription.trim() && !selectedImage)}
          className="flex-1 h-10 rounded-full bg-[#5eead4] text-black font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4fd1c5] transition-colors"
        >
          {isSubmitting || isEncrypting ? (
            <>
              <ImSpinner8 className="w-4 h-4 animate-spin" />
              {isEncrypting ? "Encrypting..." : "Analyzing..."}
            </>
          ) : (
            <>
              <IoSend className="w-4 h-4" />
              Get Diagnosis
            </>
          )}
        </button>
      </div>
    </form>
  );
}
