"use client";

import { IoSparkles } from "react-icons/io5";

export function AITipCard() {
  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <IoSparkles className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-white">AI-Powered</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Can&apos;t find a guide? Describe your issue and we&apos;ll generate a custom guide using AI,
        pulling from trusted sources like iFixit and This Old House.
      </p>
    </div>
  );
}
