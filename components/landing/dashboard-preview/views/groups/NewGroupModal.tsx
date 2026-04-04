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
    <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Create New Group</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><IoClose className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Group Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g., My Apartment, Parents' House"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => onChange({ ...form, postalCode: e.target.value })}
                placeholder="e.g., 90210"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-[10px] text-gray-600 mt-1">For finding nearby contractors</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Search Radius</label>
              <select
                value={form.searchRadius}
                onChange={(e) => onChange({ ...form, searchRadius: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500/50"
              >
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-900">You&apos;ll be the Coordinator</span> of this group with full control over settings, members, and issues.
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
          <button onClick={onSave} disabled={!form.name} className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
