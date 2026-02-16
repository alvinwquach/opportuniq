"use client";

import { IoClose, IoWallet } from "react-icons/io5";
import type { ContributionHistoryItem } from "./types";

interface ContributionHistoryModalProps {
  isOpen: boolean;
  contributions: ContributionHistoryItem[];
  onClose: () => void;
}

export function ContributionHistoryModal({ isOpen, contributions, onClose }: ContributionHistoryModalProps) {
  if (!isOpen) return null;

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Contribution History</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {contributions.map((contrib) => (
              <div key={contrib.id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <IoWallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{contrib.member}</p>
                    <p className="text-xs text-[#666]">{contrib.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">+${contrib.amount}</p>
                  <p className="text-[10px] text-[#555]">{contrib.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Total Contributions</span>
            <span className="text-lg font-bold text-emerald-400">${totalContributions.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
