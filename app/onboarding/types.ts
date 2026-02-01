export type RiskTolerance = "none" | "very_low" | "low" | "moderate" | "high" | "very_high" | "";

export interface OnboardingFormData {
  country: string;
  postalCode: string;
  searchRadius: number;
  riskTolerance: RiskTolerance;
  primaryUseCase: string;
}

export interface StepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  onNext: () => void;
  onPrev: () => void;
  canProceed?: boolean;
  isPreview?: boolean;
  userName?: string | null;
}
