"use client";

import { IoClose } from "react-icons/io5";
import type { NewGroupForm } from "./types";

interface NewGroupModalProps {
  isOpen: boolean;
  form: NewGroupForm;
  onChange: (form: NewGroupForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function NewGroupModal({ isOpen, form, onChange, onSave, onClose }: NewGroupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Create New Group</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g., My Apartment, Parents' House"
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => onChange({ ...form, postalCode: e.target.value })}
                placeholder="e.g., 90210"
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-[10px] text-[#555] mt-1">For finding nearby contractors</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Search Radius</label>
              <select
                value={form.searchRadius}
                onChange={(e) => onChange({ ...form, searchRadius: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>
          </div>
          <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <p className="text-xs text-[#888]">
              <span className="font-medium text-white">You&apos;ll be the Coordinator</span> of this group with full control over settings, members, and issues.
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={onSave} disabled={!form.name} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
