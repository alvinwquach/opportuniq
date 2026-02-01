import { IconType } from "react-icons";

export interface ComparePriceItem {
  store: string;
  price: number;
  inStock: boolean;
}

export interface PartItem {
  name: string;
  price: number;
  store: string;
  address: string;
  distance: string;
  inStock: boolean;
  link: string;
  comparePrices?: ComparePriceItem[];
}

export interface ResearchItem {
  type: "reddit" | "youtube";
  title: string;
  meta: string;
  url: string;
}

export interface GuideItem {
  source: string;
  title: string;
  duration?: string;
  steps?: number;
  rating?: number;
  icon: "youtube" | "ifixit" | "article";
}

export interface ProItem {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  price: number;
  available: string;
  source: "yelp" | "angi" | "thumbtack" | "homeadvisor";
  email: string;
  phone: string;
  calendarSlots?: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  hasImage?: boolean;
  hasVoice?: boolean;
}

export interface PermitInfo {
  required: boolean;
  type?: string;
  cost?: number;
  processingTime?: string;
  municipality?: string;
}

export interface SeasonalTip {
  tip: string;
  season: string;
  urgency: "low" | "medium" | "high";
}

export interface FollowUp {
  enabled: boolean;
  nextCheck: string;
  message: string;
}

export interface AreaCost {
  low: number;
  high: number;
  source: string;
}

export interface IssueData {
  title: string;
  icon: IconType;
  iconColor: string;
  status: "active" | "resolved" | "pending";
  date: string;
  preview: string;
  diagnosis: string;
  difficulty: string;
  estimatedTime: string;
  diyCost: number;
  proCost: number;
  confidence: number;
  parts: PartItem[];
  safety: { ppe: string[]; doNotProceed: string[] };
  research: ResearchItem[];
  guides: GuideItem[];
  pros: ProItem[];
  chatMessages: ChatMessage[];
  permit?: PermitInfo;
  seasonalTip?: SeasonalTip;
  followUp?: FollowUp;
  avgAreaCost?: AreaCost;
}

export type TabType = "research" | "guides" | "parts" | "pros" | "schedule" | "insights";
