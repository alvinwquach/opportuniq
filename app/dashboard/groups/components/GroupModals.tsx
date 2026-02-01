"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  IoClose,
  IoCheckmarkCircle,
  IoWallet,
  IoReceiptOutline,
  IoTrash,
  IoShield,
  IoPersonCircle,
  IoHammer,
  IoEye,
} from "react-icons/io5";
import type { GroupRole } from "../types";

// Role definitions
const roleInfo: Record<
  GroupRole,
  { label: string; description: string; color: string; icon: React.ElementType }
> = {
  coordinator: {
    label: "Coordinator",
    description: "Full control over group",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: IoShield,
  },
  collaborator: {
    label: "Collaborator",
    description: "Can manage issues and members",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: IoPersonCircle,
  },
  participant: {
    label: "Participant",
    description: "Can create and work on issues",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: IoHammer,
  },
  contributor: {
    label: "Contributor",
    description: "Can contribute to budget",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: IoWallet,
  },
  observer: {
    label: "Observer",
    description: "View-only access",
    color: "bg-[#333] text-[#888]",
    icon: IoEye,
  },
};

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; postalCode: string; searchRadius: string }) => void;
  isLoading?: boolean;
}

export function NewGroupModal({ isOpen, onClose, onSubmit, isLoading }: NewGroupModalProps) {
  const [form, setForm] = useState({ name: "", postalCode: "", searchRadius: "25" });

  const handleSubmit = () => {
    if (form.name) {
      onSubmit(form);
      setForm({ name: "", postalCode: "", searchRadius: "25" });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Create New Group</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="e.g., 90210"
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-[10px] text-[#555] mt-1">For finding nearby contractors</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Search Radius</label>
              <select
                value={form.searchRadius}
                onChange={(e) => setForm({ ...form, searchRadius: e.target.value })}
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
              <span className="font-medium text-white">You'll be the Coordinator</span> of this group
              with full control over settings, members, and issues.
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; role: GroupRole; message: string }) => void;
  isLoading?: boolean;
}

export function InviteModal({ isOpen, onClose, onSubmit, isLoading }: InviteModalProps) {
  const [form, setForm] = useState<{ email: string; role: GroupRole; message: string }>({
    email: "",
    role: "participant",
    message: "",
  });

  const handleSubmit = () => {
    if (form.email) {
      onSubmit(form);
      setForm({ email: "", role: "participant", message: "" });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Invite Member</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Role</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {(Object.keys(roleInfo) as GroupRole[]).map((role) => {
                const info = roleInfo[role];
                const Icon = info.icon;
                return (
                  <label
                    key={role}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.role === role
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-[#2a2a2a] hover:border-[#333]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={() => setForm({ ...form, role })}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{info.label}</p>
                      <p className="text-xs text-[#666]">{info.description}</p>
                    </div>
                    {form.role === role && <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />}
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Message (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Add a personal message..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.email || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; postalCode: string; searchRadius: string; monthlyBudget: string }) => void;
  onDelete: () => void;
  initialData: { name: string; postalCode: string; searchRadius: string; monthlyBudget: string };
  isLoading?: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  isLoading,
}: SettingsModalProps) {
  const [form, setForm] = useState(initialData);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData);
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    onSubmit(form);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Group Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Search Radius</label>
              <select
                value={form.searchRadius}
                onChange={(e) => setForm({ ...form, searchRadius: e.target.value })}
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
                onChange={(e) => setForm({ ...form, monthlyBudget: e.target.value })}
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
              <button
                onClick={onDelete}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <IoTrash className="w-4 h-4" />
                Delete Group
              </button>
              <p className="text-[10px] text-[#555] mt-1">
                This will permanently delete the group and all its data.
              </p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: GroupRole) => void;
  currentRole: GroupRole;
  isLoading?: boolean;
}

export function RoleModal({ isOpen, onClose, onSubmit, currentRole, isLoading }: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<GroupRole>(currentRole);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(currentRole);
    }
  }, [isOpen, currentRole]);

  const handleSubmit = () => {
    onSubmit(selectedRole);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Change Role</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
          {(Object.keys(roleInfo) as GroupRole[]).map((role) => {
            const info = roleInfo[role];
            const Icon = info.icon;
            return (
              <label
                key={role}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === role
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-[#2a2a2a] hover:border-[#333]"
                }`}
              >
                <input
                  type="radio"
                  name="memberRole"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
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
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Role"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ContributionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributions: Array<{
    id: string;
    member: string;
    amount: number;
    date: string;
    note: string;
  }>;
  totalContributions: number;
}

export function ContributionHistoryModal({
  isOpen,
  onClose,
  contributions,
  totalContributions,
}: ContributionHistoryModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Contribution History</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {contributions.length > 0 ? (
            <div className="space-y-2">
              {contributions.map((contrib) => (
                <div
                  key={contrib.id}
                  className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <IoWallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{contrib.member}</p>
                      <p className="text-xs text-[#666]">{contrib.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">+${contrib.amount}</p>
                    <p className="text-[10px] text-[#555]">{contrib.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[#666]">No contributions yet</div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Total Contributions</span>
            <span className="text-lg font-bold text-emerald-400">${totalContributions.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
