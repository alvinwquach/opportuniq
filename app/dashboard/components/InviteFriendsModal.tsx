"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IoCopy,
  IoCheckmark,
  IoSend,
  IoMail,
  IoTime,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoRefresh,
  IoPeople,
  IoLink,
  IoPersonAdd,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  trackInviteModalOpened,
  trackReferralLinkCopied,
  trackInviteSent,
  trackInviteFailed,
  trackInviteResent,
} from "@/lib/analytics";

type InviteTier = "johatsu" | "alpha" | "beta" | "public";

interface InviteData {
  user: {
    id: string;
    name: string | null;
    email: string;
    accessTier: InviteTier | null;
    referralCode: string | null;
    referralCount: number;
  };
  sentInvites: {
    id: string;
    email: string;
    tier: InviteTier;
    acceptedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }[];
  stats: {
    totalSent: number;
    accepted: number;
    pending: number;
    expired: number;
  };
  canInvite: boolean;
  inviteTier: InviteTier;
}

interface InviteFriendsModalProps {
  userId: string;
  trigger?: React.ReactNode;
  variant?: "default" | "sidebar" | "sidebar-collapsed";
}

// Server actions - imported dynamically to avoid issues
async function getUserInviteData(userId: string): Promise<InviteData | null> {
  const response = await fetch(`/api/invites?userId=${userId}`);
  if (!response.ok) return null;
  return response.json();
}

async function sendUserInvite(
  userId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("/api/invites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email }),
  });
  return response.json();
}

async function resendInvite(
  userId: string,
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("/api/invites/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, inviteId }),
  });
  return response.json();
}

export function InviteFriendsModal({
  userId,
  trigger,
  variant = "default",
}: InviteFriendsModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Fetch data when modal opens
  useEffect(() => {
    if (open && !data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      getUserInviteData(userId)
        .then((result) => {
          setData(result);
          trackInviteModalOpened({
            hasExistingInvites: (result?.stats.totalSent || 0) > 0,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [open, userId, data]);

  const referralUrl = data?.user.referralCode
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}?ref=${data.user.referralCode}`
    : "";

  const handleCopyLink = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      trackReferralLinkCopied({
        referralCode: data?.user.referralCode,
        accessTier: data?.user.accessTier,
        source: "modal",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    startTransition(async () => {
      const result = await sendUserInvite(userId, email.trim());
      if (result.success) {
        setSuccess(`Invite sent to ${email}`);
        setEmail("");
        trackInviteSent({
          inviteTier: data?.inviteTier,
          senderTier: data?.user.accessTier,
          source: "modal",
        });
        // Refresh data
        const newData = await getUserInviteData(userId);
        setData(newData);
      } else {
        setError(result.error || "Failed to send invite");
        trackInviteFailed({
          error: result.error,
          senderTier: data?.user.accessTier,
          source: "modal",
        });
      }
    });
  };

  const handleResend = async (inviteId: string, inviteEmail: string) => {
    setResendingId(inviteId);
    startTransition(async () => {
      const result = await resendInvite(userId, inviteId);
      if (result.success) {
        setSuccess(`Invite resent to ${inviteEmail}`);
        trackInviteResent({
          inviteTier: data?.inviteTier,
          source: "modal",
        });
        // Refresh data
        const newData = await getUserInviteData(userId);
        setData(newData);
      } else {
        setError(result.error || "Failed to resend invite");
      }
      setResendingId(null);
    });
  };

  const tierLabel: Record<InviteTier, string> = {
    johatsu: "Johatsu",
    alpha: "Alpha",
    beta: "Beta",
    public: "Public",
  };

  const tierColor: Record<InviteTier, string> = {
    johatsu: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    alpha: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    beta: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    public: "text-green-400 bg-green-500/10 border-green-500/20",
  };

  // Render a static button during SSR to prevent hydration mismatch
  const buttonElement =
    variant === "sidebar" ? (
      <button
        className={cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors mb-2 w-full",
          "text-[#5eead4] hover:text-[#5eead4] hover:bg-[#5eead4]/10 border border-[#5eead4]/20"
        )}
        onClick={() => setOpen(true)}
      >
        <IoPersonAdd className="h-4 w-4 shrink-0" />
        <span className="text-[13px] font-medium">Invite Friends</span>
      </button>
    ) : variant === "sidebar-collapsed" ? (
      <button
        className={cn(
          "flex items-center justify-center w-9 h-9 mx-auto rounded-md transition-colors mb-2",
          "text-[#5eead4] hover:bg-[#5eead4]/10 border border-[#5eead4]/20"
        )}
        onClick={() => setOpen(true)}
      >
        <IoPersonAdd className="h-4 w-4 shrink-0" />
      </button>
    ) : (
      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5eead4]/10 text-[#5eead4] text-sm font-medium hover:bg-[#5eead4]/20 transition-colors"
        onClick={() => setOpen(true)}
      >
        <IoPersonAdd className="w-4 h-4" />
        Invite Friends
      </button>
    );

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        buttonElement
      )}
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <IoPersonAdd className="w-5 h-5 text-[#5eead4]" />
            Invite Friends
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <ImSpinner8 className="w-6 h-6 animate-spin text-[#5eead4]" />
          </div>
        ) : data ? (
          <div className="space-y-4 mt-2">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
                <p className="text-xl font-semibold text-white">
                  {data.stats.totalSent}
                </p>
                <p className="text-[10px] text-[#666]">Total Sent</p>
              </div>
              <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
                <p className="text-xl font-semibold text-green-400">
                  {data.stats.accepted}
                </p>
                <p className="text-[10px] text-[#666]">Accepted</p>
              </div>
              <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
                <p className="text-xl font-semibold text-amber-400">
                  {data.stats.pending}
                </p>
                <p className="text-[10px] text-[#666]">Pending</p>
              </div>
              <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
                <p className="text-xl font-semibold text-[#555]">
                  {data.stats.expired}
                </p>
                <p className="text-[10px] text-[#666]">Expired</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-2">
                <IoLink className="w-4 h-4 text-[#5eead4]" />
                <h3 className="text-sm font-medium text-white">
                  Your Referral Link
                </h3>
              </div>
              <p className="text-[11px] text-[#666] mb-2">
                Share this link. When they sign up, they&apos;ll be a{" "}
                <span
                  className={`px-1 py-0.5 rounded text-[9px] font-medium border ${tierColor[data.inviteTier]}`}
                >
                  {tierLabel[data.inviteTier]}
                </span>{" "}
                user.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 px-2.5 py-1.5 rounded-md bg-[#0c0c0c] border border-[#2a2a2a] text-white text-xs font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#0c0c0c] font-medium text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <IoCheckmark className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <IoCopy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Send Invite */}
            <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-2">
                <IoSend className="w-4 h-4 text-[#5eead4]" />
                <h3 className="text-sm font-medium text-white">
                  Send Direct Invite
                </h3>
              </div>
              <form onSubmit={handleSendInvite} className="flex gap-2">
                <div className="relative flex-1">
                  <IoMail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-[#0c0c0c] border border-[#2a2a2a] text-white text-xs placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-xs transition-colors"
                >
                  {isPending ? (
                    <ImSpinner8 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <IoSend className="w-3.5 h-3.5" />
                  )}
                  Send
                </button>
              </form>
              {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
              {success && (
                <p className="mt-2 text-[11px] text-green-400">{success}</p>
              )}
            </div>

            {/* Sent Invites */}
            {data.sentInvites.length > 0 && (
              <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-3">
                  <IoPeople className="w-4 h-4 text-[#5eead4]" />
                  <h3 className="text-sm font-medium text-white">
                    Sent Invites
                  </h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.sentInvites.map((invite) => {
                    const now = new Date();
                    const isExpired =
                      !invite.acceptedAt && new Date(invite.expiresAt) <= now;
                    const isAccepted = !!invite.acceptedAt;
                    const isPendingInvite = !isAccepted && !isExpired;

                    return (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-2.5 rounded-md bg-[#0c0c0c] border border-[#1f1f1f]"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              isAccepted
                                ? "bg-green-500/10 text-green-400"
                                : isExpired
                                  ? "bg-[#1f1f1f] text-[#555]"
                                  : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {isAccepted ? (
                              <IoCheckmarkCircle className="w-3.5 h-3.5" />
                            ) : isExpired ? (
                              <IoCloseCircle className="w-3.5 h-3.5" />
                            ) : (
                              <IoTime className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-white">{invite.email}</p>
                            <p className="text-[9px] text-[#666]">
                              {isAccepted
                                ? `Accepted ${new Date(invite.acceptedAt!).toLocaleDateString()}`
                                : isExpired
                                  ? "Expired"
                                  : `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${tierColor[invite.tier]}`}
                          >
                            {tierLabel[invite.tier]}
                          </span>
                          {(isPendingInvite || isExpired) && (
                            <button
                              onClick={() => handleResend(invite.id, invite.email)}
                              disabled={resendingId === invite.id}
                              className="p-1 rounded text-[#555] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                              title="Resend invite"
                            >
                              {resendingId === invite.id ? (
                                <ImSpinner8 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <IoRefresh className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-[#666]">Unable to load invite data</p>
          </div>
        )}
      </DialogContent>
      </Dialog>
    </>
  );
}
