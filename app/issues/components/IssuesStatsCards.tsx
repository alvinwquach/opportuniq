"use client";

import { IoWallet, IoConstruct, IoLocationSharp, IoTrendingUp } from "react-icons/io5";

interface IssuesStatsCardsProps {
  totalSaved: number;
  diyCount: number;
  proCount: number;
  activeIssueCount: number;
}

export function IssuesStatsCards({
  totalSaved,
  diyCount,
  proCount,
  activeIssueCount,
}: IssuesStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoWallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">${totalSaved.toFixed(0)}</p>
            <p className="text-xs text-gray-400">Total Saved</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoConstruct className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{diyCount}</p>
            <p className="text-xs text-gray-400">DIY Repairs</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoLocationSharp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{proCount}</p>
            <p className="text-xs text-gray-400">Pro Repairs</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <IoTrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeIssueCount}</p>
            <p className="text-xs text-gray-400">Active Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
