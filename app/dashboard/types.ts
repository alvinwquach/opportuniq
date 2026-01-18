export interface SafetyAlert {
  id: string;
  title: string;
  riskLevel: string;
  severity: string;
  groupName: string;
  emergencyInstructions: string | null;
  createdAt: Date;
}

export interface PendingDecision {
  issue: {
    id: string;
    title: string;
    priority: string | null;
  };
  option: {
    type: string;
    costMin: string | number | null;
    costMax: string | number | null;
    timeEstimate: string | null;
  };
  group: {
    name: string;
  };
  voteCount: number;
  totalMembers: number;
}

export interface OpenIssue {
  issue: {
    id: string;
    title: string;
    status: string | null;
  };
  group: {
    name: string;
  };
}