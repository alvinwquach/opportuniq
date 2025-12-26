import { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface Diagnosis {
  description: string;
  urgency: "LOW" | "LOW-MEDIUM" | "MEDIUM" | "MEDIUM-HIGH" | "HIGH";
  timeline: string;
  confidence: number;
}

export interface Budget {
  estimatedCost: string;
  recommendation: string;
}

export interface Option {
  type: string;
  name: string;
  details: string;
  steps?: string[];
}

export interface Tradeoffs {
  diy: {
    cost: string;
    time: string;
    difficulty: string;
    safety: string;
  };
  professional: {
    cost: string;
    time: string;
    difficulty: string;
    safety: string;
  };
}

export interface Scenario {
  id: string;
  category: string;
  prompt: string;
  diagnosis: Diagnosis;
  risks: string[];
  budget: Budget;
  options: Option[];
  tradeoffs: Tradeoffs;
}

export type StreamingCardType = "diagnosis" | "risks" | "budget" | "options";

export interface StreamingState {
  visibleCards: StreamingCardType[];
  isStreaming: boolean;
}
