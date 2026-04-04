"use client";

import { IoCamera, IoCalendar, IoBook, IoPeople, IoMic, IoVideocam } from "react-icons/io5";
import { QuickAction } from "../QuickAction";
import { ReportIssueModal } from "./ReportIssueModal";

export function QuickActionsSection() {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
      <div className="space-y-1">
        <ReportIssueModal
          variant="quick-action"
          trigger={
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left group">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <IoCamera className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Report Issue</p>
                <p className="text-[11px] text-gray-500 truncate">Photo, voice, video, or upload</p>
              </div>
              {/* Input method indicators */}
              <div className="flex items-center gap-1">
                <IoCamera className="w-3 h-3 text-gray-400" />
                <IoMic className="w-3 h-3 text-gray-400" />
                <IoVideocam className="w-3 h-3 text-gray-400" />
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
