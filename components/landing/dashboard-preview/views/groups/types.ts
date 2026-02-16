import React from "react";

export type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

export interface RoleInfo {
  label: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ContributionHistoryItem {
  id: string;
  member: string;
  amount: number;
  date: string;
  note: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: GroupRole;
  createdAt: Date;
  expiresAt: Date;
}

export interface NewGroupForm {
  name: string;
  postalCode: string;
  searchRadius: string;
}

export interface InviteForm {
  email: string;
  role: GroupRole;
  message: string;
}

export interface SettingsForm {
  name: string;
  postalCode: string;
  searchRadius: string;
  monthlyBudget: string;
}
