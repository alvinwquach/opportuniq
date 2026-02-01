import { IoHome, IoCar, IoPhonePortrait, IoLeaf } from "react-icons/io5";
import type { RiskTolerance } from "./types";

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
] as const;

export const COMFORT_LEVELS: { value: RiskTolerance; label: string; description: string }[] = [
  { value: "none", label: "Always Hire", description: "I prefer professionals for everything" },
  { value: "very_low", label: "Mostly Hire", description: "Professionals for most tasks" },
  { value: "low", label: "Some DIY", description: "Basic repairs only" },
  { value: "moderate", label: "Balanced", description: "Comfortable with common DIY" },
  { value: "high", label: "Mostly DIY", description: "DIY most tasks myself" },
  { value: "very_high", label: "Always DIY", description: "I do almost everything myself" },
];

export const USE_CASES = [
  { value: "home", label: "Home", description: "Home repairs & maintenance", icon: IoHome },
  { value: "auto", label: "Auto", description: "Car repairs & diagnostics", icon: IoCar },
  { value: "electronics", label: "Electronics", description: "Phones, laptops, appliances", icon: IoPhonePortrait },
  { value: "outdoor", label: "Outdoor", description: "Lawn, garden, exterior", icon: IoLeaf },
] as const;

export const MILES_COUNTRIES = ["US", "GB", "MM", "LR"];

export const TOTAL_STEPS = 6;
