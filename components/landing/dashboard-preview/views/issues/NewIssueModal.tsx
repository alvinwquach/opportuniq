"use client";

import { IoClose, IoChevronForward } from "react-icons/io5";
import { INPUT_METHODS } from "./config";

interface NewIssueModalProps {
  onClose: () => void;
}

export function NewIssueModal({ onClose }: NewIssueModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#2a2a2a]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Report New Issue</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg transition-colors">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#888] mb-4">Choose how you&apos;d like to report the issue:</p>
          <div className="grid grid-cols-2 gap-3">
            {INPUT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={onClose}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[#2a2a2a] hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white mb-1">{method.label}</p>
                    <p className="text-xs text-[#666]">{method.description}</p>
                  </div>
                  <IoChevronForward className="w-4 h-4 text-[#555] group-hover:text-emerald-400 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
