"use client";

import { IoMail, IoSend, IoChevronForward, IoBusiness, IoOpenOutline } from "react-icons/io5";
import Link from "next/link";

interface PendingVendor {
  id: string;
  vendorName: string;
  issueTitle: string;
  rating: string | number | null;
  quoteAmount: number | null;
  groupName?: string;
  contacted?: boolean;
}

interface DraftEmailCardProps {
  vendors: PendingVendor[];
}

export function DraftEmailCard({ vendors }: DraftEmailCardProps) {
  // Show vendors that haven't been contacted yet
  const uncontactedVendors = vendors.filter(v => !v.contacted);
  const topVendor = uncontactedVendors[0];

  if (uncontactedVendors.length === 0) {
    return null;
  }

  const generateEmailDraft = (vendor: PendingVendor) => {
    return {
      subject: `Quote Request: ${vendor.issueTitle}`,
      body: `Hi ${vendor.vendorName},

I'm reaching out regarding ${vendor.issueTitle.toLowerCase()}. I found your business while researching local professionals in my area.

I would appreciate if you could provide:
1. An estimate or quote for the work
2. Your availability in the next 2 weeks
3. Any information about your process

Please let me know if you need any additional details or photos of the issue.

Thank you,
[Your Name]`,
    };
  };

  const handleReviewAndSend = (vendor: PendingVendor) => {
    const draft = generateEmailDraft(vendor);
    // Open mailto without 'to' since we don't have vendor emails in the current data
    const mailtoLink = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <IoMail className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">Draft Email</h3>
          <p className="text-[10px] text-[#9a9a9a]">Contact vendors quickly</p>
        </div>
      </div>

      {/* Primary CTA - Top Vendor */}
      {topVendor && (
        <div className="p-3 rounded-lg bg-[#1f1f1f]/50 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center">
              <IoBusiness className="w-3 h-3 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{topVendor.vendorName}</p>
              <p className="text-[10px] text-[#9a9a9a] truncate">{topVendor.issueTitle}</p>
            </div>
          </div>
          <button
            onClick={() => handleReviewAndSend(topVendor)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors"
          >
            <IoSend className="w-3.5 h-3.5" />
            Review & Send
          </button>
        </div>
      )}

      {/* Vendor List */}
      {uncontactedVendors.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-[#9a9a9a] uppercase tracking-wider mb-2">
            Other vendors ({uncontactedVendors.length - 1})
          </p>
          {uncontactedVendors.slice(1, 4).map((vendor) => (
            <button
              key={vendor.id}
              onClick={() => handleReviewAndSend(vendor)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors group text-left"
            >
              <div className="w-6 h-6 rounded bg-[#1f1f1f] flex items-center justify-center flex-shrink-0">
                <IoBusiness className="w-3 h-3 text-[#9a9a9a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#a3a3a3] group-hover:text-white truncate transition-colors">
                  {vendor.vendorName}
                </p>
                <p className="text-[10px] text-[#9a9a9a] truncate">{vendor.issueTitle}</p>
              </div>
              <IoChevronForward className="w-3.5 h-3.5 text-[#9a9a9a] group-hover:text-[#a3a3a3] transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* View All Link */}
      {uncontactedVendors.length > 4 && (
        <Link
          href="/issues"
          className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-[#1f1f1f] text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
        >
          <span>View all {uncontactedVendors.length} vendors</span>
          <IoOpenOutline className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
