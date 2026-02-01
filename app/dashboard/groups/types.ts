/**
 * Groups Page Types
 */

export type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

export interface RoleInfo {
  label: string;
  description: string;
  color: string;
  icon: React.ElementType;
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
