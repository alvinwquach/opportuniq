"use client";

import { IoCamera, IoCalendar, IoBook, IoPeople, IoMic, IoVideocam } from "react-icons/io5";
import { QuickAction } from "../QuickAction";
import { ReportIssueModal } from "./ReportIssueModal";

export function QuickActionsSection() {
  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
      <div className="space-y-1">
        <ReportIssueModal
          variant="quick-action"
          trigger={
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors text-left group">
              <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center group-hover:bg-[#2a2a2a] transition-colors">
                <IoCamera className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Report Issue</p>
                <p className="text-[11px] text-[#666] truncate">Photo, voice, video, or upload</p>
              </div>
              {/* Input method indicators */}
              <div className="flex items-center gap-1">
                <IoCamera className="w-3 h-3 text-[#555]" />
                <IoMic className="w-3 h-3 text-[#555]" />
                <IoVideocam className="w-3 h-3 text-[#555]" />
              </div>
            </button>
          }
        />
        <QuickAction
          href="/calendar"
          icon={IoCalendar}
          label="Schedule DIY"
          description="Plan work time"
        />
        <QuickAction
          href="/guides"
          icon={IoBook}
          label="Browse Guides"
          description="DIY tutorials"
        />
        <QuickAction
          href="/dashboard/groups"
          icon={IoPeople}
          label="Manage Groups"
          description="Members & budget"
        />
      </div>
    </div>
  );
}
