export type InviteTier = "johatsu" | "alpha" | "beta" | "public";

export interface InviteData {
  id: string;
  email: string;
  token: string;
  tier: InviteTier | null;
  acceptedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  inviterName: string | null;
  emailSent: boolean;
}

export interface InviteStats {
  pendingCount: number;
  acceptedCount: number;
  expiredCount: number;
}

export interface TierConfig {
  dot: string;
  text: string;
  label: string;
}

export const TIER_CONFIG: Record<string, TierConfig> = {
  johatsu: { dot: "bg-rose-400", text: "text-rose-400", label: "Johatsu" },
  alpha: { dot: "bg-purple-400", text: "text-purple-400", label: "Alpha" },
  beta: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Beta" },
};

export function getInviteStatus(invite: InviteData) {
  const isExpired = !invite.acceptedAt && new Date() >= invite.expiresAt;
  const isAccepted = !!invite.acceptedAt;
  const isPending = !isExpired && !isAccepted;

  return { isExpired, isAccepted, isPending };
}
