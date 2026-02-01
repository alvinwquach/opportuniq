"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  IoAddOutline,
  IoSettingsOutline,
  IoPersonAddOutline,
  IoCheckmarkCircle,
  IoWallet,
  IoLocation,
  IoClose,
  IoPeople,
  IoShieldCheckmark,
  IoEye,
  IoHammer,
  IoPersonCircle,
  IoShield,
  IoReceiptOutline,
  IoTrash,
} from "react-icons/io5";
import { households, issues, mockWeatherData, mockUserLocation } from "../mockData";
import {
  GroupTabs,
  GroupOverviewTab,
  GroupIssuesTab,
  GroupBudgetTab,
  GroupPlanningTab,
  type GroupTab,
} from "./groups";

// Role definitions from schema: coordinator, collaborator, participant, contributor, observer
type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

const roleInfo: Record<GroupRole, { label: string; description: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  coordinator: { label: "Coordinator", description: "Full control over group", color: "bg-emerald-500/20 text-emerald-400", icon: IoShield },
  collaborator: { label: "Collaborator", description: "Can manage issues and members", color: "bg-emerald-500/20 text-emerald-400", icon: IoPersonCircle },
  participant: { label: "Participant", description: "Can create and work on issues", color: "bg-emerald-500/20 text-emerald-400", icon: IoHammer },
  contributor: { label: "Contributor", description: "Can contribute to budget", color: "bg-emerald-500/20 text-emerald-400", icon: IoWallet },
  observer: { label: "Observer", description: "View-only access", color: "bg-[#333] text-[#888]", icon: IoEye },
};

function getRoleColor(role: string) {
  return roleInfo[role as GroupRole]?.color || "bg-[#333] text-[#888]";
}

function getRoleLabel(role: string) {
  return roleInfo[role as GroupRole]?.label || role;
}

// Analytics data
const contributionData = [
  { name: "Alex", value: 45, color: "#3ECF8E" },
  { name: "Jamie", value: 35, color: "#249361" },
  { name: "Mom", value: 20, color: "#f59e0b" },
];

// Issue resolution by group
const resolutionByGroup = [
  { name: "My Apartment", diy: 4, hired: 1 },
  { name: "Parents' House", diy: 2, hired: 1 },
];

// Monthly savings trend
const monthlySavingsData = [
  { month: "Aug", savings: 125, spent: 85 },
  { month: "Sep", savings: 210, spent: 120 },
  { month: "Oct", savings: 180, spent: 95 },
  { month: "Nov", savings: 320, spent: 150 },
  { month: "Dec", savings: 275, spent: 180 },
  { month: "Jan", savings: 185, spent: 110 },
];

// Budget contribution history
const contributionHistory = [
  { id: "1", member: "Alex", amount: 500, date: "Jan 15", note: "Monthly contribution" },
  { id: "2", member: "Jamie", amount: 300, date: "Jan 10", note: "Emergency fund top-up" },
  { id: "3", member: "Alex", amount: 200, date: "Dec 28", note: "Year-end bonus" },
  { id: "4", member: "Jamie", amount: 150, date: "Dec 15", note: "Monthly contribution" },
  { id: "5", member: "Mom", amount: 200, date: "Dec 1", note: "Holiday gift" },
];

// Mock pending invitations
const pendingInvitations = [
  {
    id: "1",
    email: "friend@example.com",
    role: "contributor" as GroupRole,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];

export function GroupsView() {
  const totalSavings = households.reduce((sum, h) => sum + h.savings, 0);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(households[0]?.id || null);
  const [activeTab, setActiveTab] = useState<GroupTab>("overview");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showContributionHistory, setShowContributionHistory] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null);
  const [newGroupForm, setNewGroupForm] = useState({ name: "", postalCode: "", searchRadius: "25" });
  const [inviteForm, setInviteForm] = useState({ email: "", role: "participant" as GroupRole, message: "" });
  const [settingsForm, setSettingsForm] = useState({ name: "", postalCode: "", searchRadius: "25", monthlyBudget: "800" });
  const [selectedMemberRole, setSelectedMemberRole] = useState<GroupRole>("participant");

  const selectedGroupData = households.find((h) => h.id === selectedGroup);

  const handleCreateGroup = () => {
    setShowNewGroupModal(false);
    setNewGroupForm({ name: "", postalCode: "", searchRadius: "25" });
  };

  const handleInviteMember = () => {
    setShowInviteModal(false);
    setInviteForm({ email: "", role: "participant", message: "" });
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
  };

  const handleChangeRole = () => {
    setShowRoleModal(null);
  };

  const handleRemoveMember = (memberId: string) => {
    setOpenMenuId(null);
  };

  // Initialize settings form when group changes
  useEffect(() => {
    if (selectedGroupData) {
      setSettingsForm({
        name: selectedGroupData.name,
        postalCode: "90210",
        searchRadius: "25",
        monthlyBudget: "800",
      });
    }
  }, [selectedGroupData]);

  // New Group Modal
  const NewGroupModal = showNewGroupModal ? (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowNewGroupModal(false)}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Create New Group</h3>
          <button onClick={() => setShowNewGroupModal(false)} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name *</label>
            <input
              type="text"
              value={newGroupForm.name}
              onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
              placeholder="e.g., My Apartment, Parents' House"
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Postal Code</label>
              <input
                type="text"
                value={newGroupForm.postalCode}
                onChange={(e) => setNewGroupForm({ ...newGroupForm, postalCode: e.target.value })}
                placeholder="e.g., 90210"
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-[10px] text-[#555] mt-1">For finding nearby contractors</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Search Radius</label>
              <select
                value={newGroupForm.searchRadius}
                onChange={(e) => setNewGroupForm({ ...newGroupForm, searchRadius: e.target.value })}
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
              <span className="font-medium text-white">You'll be the Coordinator</span> of this group with full control over settings, members, and issues.
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={() => setShowNewGroupModal(false)} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={handleCreateGroup} disabled={!newGroupForm.name} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Create Group
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Invite Member Modal
  const InviteModal = showInviteModal ? (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Invite Member</h3>
          <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Email Address *</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
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
                      inviteForm.role === role ? "border-emerald-500/50 bg-emerald-500/10" : "border-[#2a2a2a] hover:border-[#333]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={inviteForm.role === role}
                      onChange={() => setInviteForm({ ...inviteForm, role })}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{info.label}</p>
                      <p className="text-xs text-[#666]">{info.description}</p>
                    </div>
                    {inviteForm.role === role && (
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
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              placeholder="Add a personal message..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={handleInviteMember} disabled={!inviteForm.email} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Settings Modal
  const SettingsModal = showSettingsModal ? (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowSettingsModal(false)}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Group Settings</h3>
          <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name</label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Postal Code</label>
              <input
                type="text"
                value={settingsForm.postalCode}
                onChange={(e) => setSettingsForm({ ...settingsForm, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Search Radius</label>
              <select
                value={settingsForm.searchRadius}
                onChange={(e) => setSettingsForm({ ...settingsForm, searchRadius: e.target.value })}
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
                value={settingsForm.monthlyBudget}
                onChange={(e) => setSettingsForm({ ...settingsForm, monthlyBudget: e.target.value })}
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
          <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={handleSaveSettings} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Change Role Modal
  const RoleModal = showRoleModal ? (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowRoleModal(null)}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Change Role</h3>
          <button onClick={() => setShowRoleModal(null)} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-4 space-y-2">
          {(Object.keys(roleInfo) as GroupRole[]).map((role) => {
            const info = roleInfo[role];
            const Icon = info.icon;
            return (
              <label
                key={role}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMemberRole === role ? "border-emerald-500/50 bg-emerald-500/10" : "border-[#2a2a2a] hover:border-[#333]"
                }`}
              >
                <input
                  type="radio"
                  name="memberRole"
                  value={role}
                  checked={selectedMemberRole === role}
                  onChange={() => setSelectedMemberRole(role)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{info.label}</p>
                  <p className="text-[10px] text-[#666]">{info.description}</p>
                </div>
                {selectedMemberRole === role && <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />}
              </label>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={() => setShowRoleModal(null)} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={handleChangeRole} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg">
            Update Role
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Contribution History Modal
  const ContributionHistoryModal = showContributionHistory ? (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowContributionHistory(false)}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Contribution History</h3>
          <button onClick={() => setShowContributionHistory(false)} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {contributionHistory.map((contrib) => (
              <div key={contrib.id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
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
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Total Contributions</span>
            <span className="text-lg font-bold text-emerald-400">$1,350</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {typeof window !== "undefined" && createPortal(NewGroupModal, document.body)}
      {typeof window !== "undefined" && createPortal(InviteModal, document.body)}
      {typeof window !== "undefined" && createPortal(SettingsModal, document.body)}
      {typeof window !== "undefined" && createPortal(RoleModal, document.body)}
      {typeof window !== "undefined" && createPortal(ContributionHistoryModal, document.body)}

      <div className="flex min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Left: Groups List */}
        <div className="w-[280px] flex-shrink-0 overflow-y-auto p-4 border-r border-[#2a2a2a] bg-[#0f0f0f]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Groups</h2>
              <p className="text-xs text-[#666]">Manage your households</p>
            </div>
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
            >
              <IoAddOutline className="w-4 h-4" />
              New
            </button>
          </div>

          {/* Household Cards */}
          <div className="space-y-2">
            {households.map((household) => {
              const isSelected = selectedGroup === household.id;
              const userRole = household.members[0]?.role || "participant";
              return (
                <button
                  key={household.id}
                  onClick={() => {
                    setSelectedGroup(household.id);
                    setActiveTab("overview");
                  }}
                  className={`w-full text-left bg-[#1a1a1a] rounded-xl border overflow-hidden hover:border-[#333] transition-all ${
                    isSelected ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-[#2a2a2a]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <IoPeople className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{household.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-[#666]">{household.members.length} members</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(userRole)}`}>
                            {getRoleLabel(userRole)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members & Stats Row */}
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        {household.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 rounded-full bg-[#333] border-2 border-[#1a1a1a] flex items-center justify-center text-xs"
                            title={`${member.name} (${getRoleLabel(member.role)})`}
                          >
                            {member.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="text-right">
                        <p className="text-[#555]">Issues</p>
                        <p className="font-semibold text-white">{household.issueCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#555]">Saved</p>
                        <p className="font-semibold text-emerald-400">${household.savings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{households.length}</p>
                <p className="text-[10px] text-[#666]">Groups</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">${totalSavings.toLocaleString()}</p>
                <p className="text-[10px] text-[#666]">Total Saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Group Details with Tabs */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedGroupData ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-white">{selectedGroupData.name}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${getRoleColor(selectedGroupData.members[0]?.role || "participant")}`}>
                      {getRoleLabel(selectedGroupData.members[0]?.role || "participant")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#666]">
                    <span className="flex items-center gap-1"><IoLocation className="w-3.5 h-3.5" />90210</span>
                    <span>{selectedGroupData.members.length} members</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#888] border border-[#2a2a2a] hover:border-[#333] hover:text-white rounded-lg transition-colors">
                    <IoSettingsOutline className="w-4 h-4" />
                    Settings
                  </button>
                  <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg transition-colors">
                    <IoPersonAddOutline className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Tab Content */}
              {activeTab === "overview" && (
                <GroupOverviewTab
                  group={selectedGroupData}
                  pendingInvitations={pendingInvitations}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  setShowInviteModal={setShowInviteModal}
                  setShowRoleModal={setShowRoleModal}
                  setSelectedMemberRole={setSelectedMemberRole}
                  handleRemoveMember={handleRemoveMember}
                />
              )}

              {activeTab === "issues" && (
                <GroupIssuesTab
                  issues={issues}
                  resolutionByGroup={resolutionByGroup}
                />
              )}

              {activeTab === "budget" && (
                <GroupBudgetTab
                  contributionData={contributionData}
                  monthlySavingsData={monthlySavingsData}
                  contributionHistory={contributionHistory}
                  setShowContributionHistory={setShowContributionHistory}
                />
              )}

              {activeTab === "planning" && (
                <GroupPlanningTab
                  weather={mockWeatherData}
                  location={mockUserLocation}
                />
              )}
            </>
          ) : (
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
                  onClick={() => setShowNewGroupModal(true)}
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
          )}
        </div>

        {/* Close menu when clicking outside */}
        {openMenuId && (
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
        )}
      </div>
    </>
  );
}
