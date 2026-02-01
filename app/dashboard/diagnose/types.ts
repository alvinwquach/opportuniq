/**
 * Diagnose Page Types
 */

export type TabType = "diy" | "hire";

export interface DiagnoseIssue {
  id: string;
  title: string;
  icon: string | null;
  iconColor: string;
  status: string;
  category: string | null;
  createdAt: string;
  isResolved: boolean;
  confidence: number | null;
}

export interface DiagnoseIssueDetail {
  id: string;
  title: string;
  icon: string | null;
  iconColor: string;
  status: string;
  category: string | null;
  createdAt: string;
  isResolved: boolean;
  diagnosis: string | null;
  difficulty: string;
  estimatedTime: string | null;
  diyCost: number | null;
  proCost: number | null;
  confidence: number;
  safetyNote: string | null;
  chatMessages: ChatMessage[];
  guides: Guide[];
  parts: Part[];
  pros: Pro[];
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  hasImage: boolean;
  hasVoice: boolean;
  visionAnalysis: boolean;
  createdAt: string;
}

export interface Guide {
  id: string;
  source: string;
  title: string;
  url: string | null;
  duration: string | null;
  steps: number | null;
  rating: number | null;
  icon: string;
}

export interface Part {
  id: string;
  name: string;
  price: number;
  store: string;
  distance: string | null;
  inStock: boolean;
  storeUrl: string | null;
}

export interface Pro {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  price: number;
  available: string | null;
  source: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
}
