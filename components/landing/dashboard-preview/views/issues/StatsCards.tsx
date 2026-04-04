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
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <IoWallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">${totalSavings}</p>
            <p className="text-xs text-gray-500">Total Saved</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <IoConstruct className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{diyCount}</p>
            <p className="text-xs text-gray-500">DIY Repairs</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <IoLocationSharp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{proCount}</p>
            <p className="text-xs text-gray-500">Pro Repairs</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <IoTrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-xs text-gray-500">Active Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
