"use client";

import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { roleInfo } from "./config";
import type { GroupRole } from "./types";

interface RoleModalProps {
  isOpen: boolean;
  memberId: string | null;
  selectedRole: GroupRole;
  onRoleChange: (role: GroupRole) => void;
  onSave: () => void;
  onClose: () => void;
}

export function RoleModal({ isOpen, memberId, selectedRole, onRoleChange, onSave, onClose }: RoleModalProps) {
  if (!isOpen || !memberId) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Change Role</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-4 space-y-2">
          {(Object.keys(roleInfo) as GroupRole[]).map((role) => {
            const info = roleInfo[role];
            const Icon = info.icon;
            return (
              <label
                key={role}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === role ? "border-emerald-500/50 bg-emerald-500/10" : "border-[#2a2a2a] hover:border-[#333]"
                }`}
              >
                <input
                  type="radio"
                  name="memberRole"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => onRoleChange(role)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{info.label}</p>
                  <p className="text-[10px] text-[#666]">{info.description}</p>
                </div>
                {selectedRole === role && <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />}
              </label>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg">
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
}
