"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoSend, IoLink, IoCheckmark, IoClose, IoCopy } from "react-icons/io5";

type InviteTier = "johatsu" | "alpha" | "beta";

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<InviteTier>("johatsu");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<"sent" | "copied" | null>(null);
  const [error, setError] = useState("");
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleSubmit = async (sendEmail: boolean) => {
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(null);
    setLastToken(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tier, sendEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send invite");
      } else {
        // Extract token from invite link
        const tokenMatch = data.inviteLink?.match(/token=([A-Z0-9]+)/i);
        if (tokenMatch) {
          setLastToken(tokenMatch[1]);
        }

        if (!sendEmail) {
          await navigator.clipboard.writeText(data.inviteLink);
          setSuccess("copied");
        } else {
          setSuccess("sent");
        }
        setEmail("");
        router.refresh();
        if (!tokenMatch) {
          setTimeout(() => setSuccess(null), 2000);
        }
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    if (lastToken) {
      await navigator.clipboard.writeText(lastToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 1500);
    }
  };

  const dismissToken = () => {
    setLastToken(null);
    setSuccess(null);
  };

  const tierColors: Record<InviteTier, string> = {
    johatsu: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    alpha: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    beta: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };

  return (
    <div className="flex flex-col gap-2 items-stretch sm:items-end">
      {lastToken && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
          <IoCheckmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-400 whitespace-nowrap">Token:</span>
          <code className="text-xs font-mono text-white tracking-wider font-medium truncate">{lastToken}</code>
          <button
            type="button"
            onClick={copyToken}
            className="p-1 hover:bg-emerald-500/20 rounded transition-colors shrink-0"
            title="Copy token"
          >
            {tokenCopied ? (
              <IoCheckmark className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <IoCopy className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
          <button
            type="button"
            onClick={dismissToken}
            className="p-1 hover:bg-emerald-500/20 rounded transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <IoClose className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      )}
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      {success && !lastToken && (
        <span className="text-xs text-emerald-400 flex items-center gap-1">
          <IoCheckmark className="w-3.5 h-3.5" />
          {success === "sent" ? "Sent" : "Copied"}
        </span>
      )}
      <div className="flex items-center border border-[#2a2a2a] rounded-md overflow-hidden w-fit">
        {(["johatsu", "alpha", "beta"] as InviteTier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              tier === t
                ? tierColors[t]
                : "text-[#555] hover:text-[#888] bg-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="email@example.com"
          className="flex-1 sm:w-44 h-8 px-3 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(true);
            }
          }}
        />
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading || !email.trim()}
          className="h-8 px-2.5 rounded-md bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-[#888] hover:text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          title="Copy invite link"
        >
          <IoLink className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading || !email.trim()}
          className="h-8 px-3 rounded-md bg-white hover:bg-gray-100 text-black text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoSend className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
