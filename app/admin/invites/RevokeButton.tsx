"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoTrash } from "react-icons/io5";
import { revokeInvite } from "./actions";

interface RevokeButtonProps {
  inviteId: string;
  email: string;
}

export function RevokeButton({ inviteId, email }: RevokeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRevoke = async () => {
    setLoading(true);
    try {
      const result = await revokeInvite(inviteId);
      if (result.error) {
        console.error(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to revoke invite:", error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="px-2 py-1 text-[10px] font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-2 py-1 text-[10px] font-medium text-[#666] hover:text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-1.5 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
      title={`Revoke invite for ${email}`}
    >
      <IoTrash className="w-3.5 h-3.5" />
    </button>
  );
}
