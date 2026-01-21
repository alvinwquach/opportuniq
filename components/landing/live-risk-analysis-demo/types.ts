import type { IconType } from "react-icons";

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  zipCode: string;
}

export interface WeatherConditions {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
}

export interface Risk {
  category: string;
  severity: "low" | "medium" | "high";
  likelihood: number;
  color: string;
}

export interface SafetyEquipment {
  name: string;
  icon: IconType;
  required: boolean;
}

export interface Complication {
  issue: string;
  impact: "high" | "medium" | "low";
}

export interface ToolAvailability {
  storeName: string;
  distance: number;
  tools: string[];
  lat: number;
  lng: number;
}

export interface OpportunityCost {
  timeValue: number;
  estimatedHours: number;
  materialCost: number;
  riskCost: number;
  totalCost: number;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  location: GeoLocation;
  weather: WeatherConditions;
  risks: Risk[];
  safetyEquipment: SafetyEquipment[];
  complications: Complication[];
  toolsNearby: ToolAvailability[];
  opportunityCost: OpportunityCost;
  timeEstimate: string;
  confidenceScore: number;
}

export type CardId = "location" | "risks" | "resources" | "cost" | "verdict";

export interface StreamingPhase {
  messages: string[];
  cardToReveal?: CardId;
}

export interface SummaryMetrics {
  highRisks: number;
  mediumRisks: number;
  requiredPPE: number;
  highComplications: number;
  complexity: "Low" | "Moderate" | "High";
}

export interface DynamicOpportunityCost extends OpportunityCost {
  timeValue: number;
}
