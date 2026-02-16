"use client";

import {
  IoWallet,
  IoConstruct,
  IoLocationSharp,
  IoTrendingUp,
} from "react-icons/io5";

interface StatsCardsProps {
  totalSavings: number;
  diyCount: number;
  proCount: number;
  activeCount: number;
}

export function StatsCards({ totalSavings, diyCount, proCount, activeCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoWallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">${totalSavings}</p>
            <p className="text-xs text-[#666]">Total Saved</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoConstruct className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{diyCount}</p>
            <p className="text-xs text-[#666]">DIY Repairs</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoLocationSharp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{proCount}</p>
            <p className="text-xs text-[#666]">Pro Repairs</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoTrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
            <p className="text-xs text-[#666]">Active Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
