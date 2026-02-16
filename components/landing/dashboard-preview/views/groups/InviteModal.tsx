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
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Invite Member</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Role</label>
            <div className="space-y-2">
              {(Object.keys(roleInfo) as GroupRole[]).map((role) => {
                const info = roleInfo[role];
                const Icon = info.icon;
                return (
                  <label
                    key={role}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.role === role ? "border-emerald-500/50 bg-emerald-500/10" : "border-[#2a2a2a] hover:border-[#333]"
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
                      <p className="text-sm font-medium text-white">{info.label}</p>
                      <p className="text-xs text-[#666]">{info.description}</p>
                    </div>
                    {form.role === role && (
                      <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Message (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => onChange({ ...form, message: e.target.value })}
              placeholder="Add a personal message..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={onSave} disabled={!form.email} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
