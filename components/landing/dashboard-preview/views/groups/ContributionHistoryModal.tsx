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
    <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Contribution History</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><IoClose className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {contributions.map((contrib) => (
              <div key={contrib.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <IoWallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contrib.member}</p>
                    <p className="text-xs text-gray-500">{contrib.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">+${contrib.amount}</p>
                  <p className="text-[10px] text-gray-600">{contrib.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Contributions</span>
            <span className="text-lg font-bold text-blue-600">${totalContributions.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
