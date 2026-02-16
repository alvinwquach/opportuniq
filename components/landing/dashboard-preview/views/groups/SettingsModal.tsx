"use client";

import { IoClose, IoReceiptOutline, IoTrash } from "react-icons/io5";
import type { SettingsForm } from "./types";

interface SettingsModalProps {
  isOpen: boolean;
  form: SettingsForm;
  onChange: (form: SettingsForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function SettingsModal({ isOpen, form, onChange, onSave, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Group Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => onChange({ ...form, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
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
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Monthly Budget Target</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">$</span>
              <input
                type="number"
                value={form.monthlyBudget}
                onChange={(e) => onChange({ ...form, monthlyBudget: e.target.value })}
                className="w-full pl-7 pr-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-[#2a2a2a] space-y-3">
            <button className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors">
              <IoReceiptOutline className="w-4 h-4" />
              Export Group Data
            </button>
            <div>
              <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                <IoTrash className="w-4 h-4" />
                Delete Group
              </button>
              <p className="text-[10px] text-[#555] mt-1">This will permanently delete the group and all its data.</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
