"use client";

import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { roleInfo } from "./config";
import type { GroupRole, InviteForm } from "./types";

interface InviteModalProps {
  isOpen: boolean;
  form: InviteForm;
  onChange: (form: InviteForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function InviteModal({ isOpen, form, onChange, onSave, onClose }: InviteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Invite Member</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><IoClose className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
            <div className="space-y-2">
              {(Object.keys(roleInfo) as GroupRole[]).map((role) => {
                const info = roleInfo[role];
                const Icon = info.icon;
                return (
                  <label
                    key={role}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.role === role ? "border-blue-500/50 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={() => onChange({ ...form, role })}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{info.label}</p>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                    {form.role === role && (
                      <IoCheckmarkCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Message (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => onChange({ ...form, message: e.target.value })}
              placeholder="Add a personal message..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
          <button onClick={onSave} disabled={!form.email} className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
