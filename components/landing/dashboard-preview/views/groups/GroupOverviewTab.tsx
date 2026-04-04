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
  coordinator: { label: "Coordinator", description: "Full control over group", color: "bg-blue-100 text-blue-600", icon: IoShield },
  collaborator: { label: "Collaborator", description: "Can manage issues and members", color: "bg-blue-100 text-blue-600", icon: IoPersonCircle },
  participant: { label: "Participant", description: "Can create and work on issues", color: "bg-blue-100 text-blue-600", icon: IoHammer },
  contributor: { label: "Contributor", description: "Can contribute to budget", color: "bg-blue-100 text-blue-600", icon: IoWallet },
  observer: { label: "Observer", description: "View-only access", color: "bg-gray-100 text-gray-500", icon: IoEye },
};

function getRoleColor(role: string) {
  return roleInfo[role as GroupRole]?.color || "bg-gray-100 text-gray-500";
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
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoConstruct className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] text-gray-500 uppercase">Open</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">{group.issueCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase">Resolved</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">8</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoWallet className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase">Balance</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">$1,250</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoTrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase">Saved</span>
          </div>
          <div className="text-xl font-semibold text-blue-600">${group.savings.toLocaleString()}</div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Members ({group.members.length})</h3>
          <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
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
                <div key={member.id} className="relative flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors group min-w-[200px] border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-lg">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className="w-3 h-3 text-gray-600" />
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
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IoEllipsisVertical className="w-4 h-4" />
                  </button>
                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemberRole(member.role as GroupRole);
                          setShowRoleModal(member.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"
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
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
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
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg min-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <IoMailOutline className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                  <p className="text-[10px] text-amber-600">Pending · {getRoleLabel(inv.role)}</p>
                </div>
                <button className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors">
                  <IoCopyOutline className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-900">Alex resolved &quot;Leaky faucet&quot;</p>
              <p className="text-xs text-gray-600">2h ago · Saved $152</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IoWallet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-900">Jamie contributed $300</p>
              <p className="text-xs text-gray-600">1d ago · Shared budget</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IoPersonAddOutline className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-900">Invited friend@example.com</p>
              <p className="text-xs text-gray-600">2d ago · As Contributor</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <IoConstruct className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-900">New issue: &quot;AC not cooling&quot;</p>
              <p className="text-xs text-gray-600">3d ago · High priority</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
