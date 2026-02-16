import { IconType } from "react-icons";

export interface Issue {
  id: string;
  title: string;
  icon: IconType;
  iconColor: string;
  iconBg: string;
  status: "open" | "investigating" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  group: string;
  createdAt: string;
  updatedAt: string;
  diagnosis: string;
  confidence: number;
  difficulty: string;
  diyCost: number;
  proCost: number;
  resolvedBy: "diy" | "pro" | null;
  assignee: { name: string };
  resolvedAt?: string;
  savedAmount?: number;
  proUsed?: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

export interface PriorityConfig {
  label: string;
  color: string;
}

export interface InputMethod {
  id: "photo" | "voice" | "video" | "upload";
  icon: IconType;
  label: string;
  description: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface SavingsDataItem {
  month: string;
  savings: number;
  issues: number;
}

export interface Filters {
  status: string | null;
  priority: string | null;
  category: string | null;
  group: string | null;
}
