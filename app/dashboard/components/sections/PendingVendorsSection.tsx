"use client";

import { IoCall, IoStar } from "react-icons/io5";

interface Vendor {
  id: string;
  vendorName: string;
  issueTitle: string;
  rating: string | number | null;
  quoteAmount: number | null;
}

interface PendingVendorsSectionProps {
  vendors: Vendor[];
}

export function PendingVendorsSection({ vendors }: PendingVendorsSectionProps) {
  if (vendors.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <IoCall className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-white">Get Quotes</h3>
      </div>
      <div className="space-y-2">
        {vendors.slice(0, 3).map((vendor) => (
          <div
            key={vendor.id}
            className="p-2.5 -mx-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-white">{vendor.vendorName}</p>
              {vendor.rating && (
                <div className="flex items-center gap-1">
                  <IoStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] text-[#a3a3a3]">{vendor.rating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-gray-400 truncate">{vendor.issueTitle}</p>
              {vendor.quoteAmount && (
                <span className="text-[10px] text-blue-600">
                  ~${vendor.quoteAmount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
