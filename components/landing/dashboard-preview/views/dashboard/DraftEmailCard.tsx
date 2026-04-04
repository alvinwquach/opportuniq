"use client";

import { IoMailOutline, IoSend, IoChevronForward } from "react-icons/io5";

interface PendingVendor {
  id: string;
  vendorName: string;
  issueTitle: string;
  rating: number;
  quoteAmount: number;
}

interface DraftEmailCardProps {
  vendors: PendingVendor[];
}

export function DraftEmailCard({ vendors }: DraftEmailCardProps) {
  if (vendors.length === 0) return null;

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <IoMailOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-900">Draft Emails</h3>
            <p className="text-[9px] sm:text-[10px] text-gray-500">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} to contact</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {vendors.slice(0, 3).map((vendor) => (
          <button
            key={vendor.id}
            className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-white hover:bg-gray-100 transition-colors group text-left"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IoSend className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {vendor.vendorName}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                Re: {vendor.issueTitle}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-blue-600 font-medium">
                ${vendor.quoteAmount}
              </span>
              <IoChevronForward className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {vendors.length > 0 && (
        <button className="w-full mt-3 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-[10px] sm:text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
          <IoMailOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Draft All Emails
        </button>
      )}
    </div>
  );
}
