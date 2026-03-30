"use client";

import React from "react";
import {
  IoConstruct,
  IoCheckmarkCircle,
  IoWallet,
  IoTrendingUp,
  IoPersonAddOutline,
  IoChevronForward,
  IoEllipsisVertical,
  IoMailOutline,
  IoCopyOutline,
  IoShield,
  IoTrash,
  IoPersonCircle,
  IoHammer,
  IoEye,
} from "react-icons/io5";

// Role definitions from schema
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

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: GroupRole;
  createdAt: Date;
  expiresAt: Date;
}

interface GroupOverviewTabProps {
  group: {
    id: string;
    name: string;
    issueCount: number;
    savings: number;
    members: Member[];
  };
  pendingInvitations: PendingInvitation[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  setShowInviteModal: (show: boolean) => void;
  setShowRoleModal: (id: string | null) => void;
  setSelectedMemberRole: (role: GroupRole) => void;
  handleRemoveMember: (id: string) => void;
}

export function GroupOverviewTab({
  group,
  pendingInvitations,
  openMenuId,
  setOpenMenuId,
  setShowInviteModal,
  setShowRoleModal,
  setSelectedMemberRole,
  handleRemoveMember,
}: GroupOverviewTabProps) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoConstruct className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-[#666] uppercase">Open</span>
          </div>
          <div className="text-xl font-semibold text-white">{group.issueCount}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-[#666] uppercase">Resolved</span>
          </div>
          <div className="text-xl font-semibold text-white">8</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoWallet className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-[#666] uppercase">Balance</span>
          </div>
          <div className="text-xl font-semibold text-white">$1,250</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoTrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-[#666] uppercase">Saved</span>
          </div>
          <div className="text-xl font-semibold text-emerald-400">${group.savings.toLocaleString()}</div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <h3 className="text-sm font-medium text-white">Members ({group.members.length})</h3>
          <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            <IoPersonAddOutline className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            {group.members.map((member) => {
              const RoleIcon = roleInfo[member.role as GroupRole]?.icon || IoPersonCircle;
              const isMenuOpen = openMenuId === member.id;
              return (
                <div key={member.id} className="relative flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg hover:bg-[#151515] transition-colors group min-w-[200px] border border-[#2a2a2a]">
                  <div className="w-10 h-10 rounded-full bg-[#333] border border-[#2a2a2a] flex items-center justify-center text-lg">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className="w-3 h-3 text-[#555]" />
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(member.role)} cursor-help`}
                        title={roleInfo[member.role as GroupRole]?.description || ""}
                      >
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : member.id);
                    }}
                    className="p-1.5 text-[#555] hover:text-white hover:bg-[#333] rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IoEllipsisVertical className="w-4 h-4" />
                  </button>
                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-lg py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemberRole(member.role as GroupRole);
                          setShowRoleModal(member.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white"
                      >
                        <IoShield className="w-3.5 h-3.5" />
                        Change Role
                      </button>
                      {member.role !== "coordinator" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(member.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          <IoTrash className="w-3.5 h-3.5" />
                          Remove Member
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Pending Invitations inline */}
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg min-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <IoMailOutline className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{inv.email}</p>
                  <p className="text-[10px] text-amber-400">Pending · {getRoleLabel(inv.role)}</p>
                </div>
                <button className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors">
                  <IoCopyOutline className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <h3 className="text-sm font-medium text-white">Recent Activity</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white">Alex resolved &quot;Leaky faucet&quot;</p>
              <p className="text-xs text-[#555]">2h ago · Saved $152</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <IoWallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white">Jamie contributed $300</p>
              <p className="text-xs text-[#555]">1d ago · Shared budget</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <IoPersonAddOutline className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white">Invited friend@example.com</p>
              <p className="text-xs text-[#555]">2d ago · As Contributor</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <IoConstruct className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white">New issue: &quot;AC not cooling&quot;</p>
              <p className="text-xs text-[#555]">3d ago · High priority</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
