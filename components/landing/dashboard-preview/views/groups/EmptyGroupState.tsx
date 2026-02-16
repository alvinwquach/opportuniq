"use client";

import { IoAddOutline, IoCheckmarkCircle, IoPeople } from "react-icons/io5";

interface EmptyGroupStateProps {
  onNewGroup: () => void;
}

export function EmptyGroupState({ onNewGroup }: EmptyGroupStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
          <IoPeople className="w-8 h-8 text-[#444]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Group Selected</h3>
        <p className="text-sm text-[#666] mb-4">
          Select a group from the sidebar to view members, budget, and activity, or create a new group to get started.
        </p>
        <button
          onClick={onNewGroup}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          <IoAddOutline className="w-4 h-4" />
          Create New Group
        </button>
        <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
          <p className="text-xs text-[#555] mb-3">What you can do with groups:</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="flex items-start gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#888]">Track issues across multiple properties</span>
            </div>
            <div className="flex items-start gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#888]">Share a budget with family members</span>
            </div>
            <div className="flex items-start gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#888]">Invite collaborators with different roles</span>
            </div>
            <div className="flex items-start gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#888]">See total savings across all properties</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
