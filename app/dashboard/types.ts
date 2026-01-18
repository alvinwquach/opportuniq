export interface SafetyAlert {
  id: string;
  title: string;
  riskLevel: string;
  severity: string;
  groupName: string;
  emergencyInstructions: string | null;
  createdAt: Date;
}
