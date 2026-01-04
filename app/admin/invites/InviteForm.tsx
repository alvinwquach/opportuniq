"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoSend, IoCheckmarkCircle, IoCopy, IoLink } from "react-icons/io5";

type InviteTier = "johatsu" | "alpha" | "beta";

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<InviteTier>("alpha");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ email: string; link: string; tier: string; emailSent?: boolean } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tier, sendEmail: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send invite");
      } else {
        setSuccess({
          email: email.trim(),
          link: data.inviteLink,
          tier,
          emailSent: data.emailSent,
        });
        setEmail("");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (success?.link) {
      await navigator.clipboard.writeText(success.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLinkDirect = async () => {
    if (!email.trim()) {
      setError("Enter an email to generate an invite link");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create invite");
      } else {
        // Copy to clipboard immediately
        await navigator.clipboard.writeText(data.inviteLink);
        setSuccess({ email: email.trim(), link: data.inviteLink, tier });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setEmail("");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const tierColors: Record<InviteTier, { bg: string; text: string; border: string }> = {
    johatsu: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    alpha: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    beta: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  };

  return (
    <div className="h-full p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
      <div className="mb-3">
        <h3 className="text-[13px] font-medium text-white mb-0.5">Send Invite</h3>
        <p className="text-[11px] text-[#666]">Invite users to join the platform</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {(["johatsu", "alpha", "beta"] as InviteTier[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                tier === t
                  ? `${tierColors[t].bg} ${tierColors[t].text} border ${tierColors[t].border}`
                  : 'bg-[#1f1f1f] text-[#888] border border-transparent hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 h-9 px-3 rounded-md bg-[#1f1f1f] border border-[#2a2a2a] text-[13px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#3a3a3a] transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={copyLinkDirect}
            disabled={loading || !email.trim()}
            className="h-9 px-4 rounded-md bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IoLink className="h-3.5 w-3.5" />
            Copy Link
          </button>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="h-9 px-4 rounded-md bg-white hover:bg-gray-100 text-black text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <IoSend className="h-3.5 w-3.5" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-3 p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mt-3 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-2">
            <IoCheckmarkCircle className="h-3.5 w-3.5" />
            <span className="text-[12px] font-medium">
              {success.tier.charAt(0).toUpperCase() + success.tier.slice(1)} invite {success.emailSent ? "sent to" : "created for"} {success.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] text-[#888] bg-[#1f1f1f] px-2.5 py-2 rounded overflow-hidden text-ellipsis font-mono">
              {success.link}
            </code>
            <button
              onClick={copyLink}
              className="h-8 px-3 flex items-center justify-center gap-1.5 rounded text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors text-xs"
            >
              {copied ? (
                <>
                  <IoCheckmarkCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <IoCopy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
