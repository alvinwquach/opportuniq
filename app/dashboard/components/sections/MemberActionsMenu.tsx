"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IoEllipsisHorizontal,
  IoShieldOutline,
  IoPersonRemoveOutline,
  IoCheckmark,
  IoClose,
  IoWarning,
} from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateMemberRole, useRemoveMember } from "@/hooks/useGroupMembers";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

interface MemberActionsMenuProps {
  groupId: string;
  member: Member;
}

const roleOptions: { value: GroupRole; label: string; description: string }[] = [
  {
    value: "coordinator",
    label: "Coordinator",
    description: "Full control over group settings and members",
  },
  {
    value: "collaborator",
    label: "Collaborator",
    description: "Can invite members and manage issues",
  },
  {
    value: "participant",
    label: "Participant",
    description: "Can view and contribute to issues",
  },
  {
    value: "contributor",
    label: "Contributor",
    description: "Can create and manage issues",
  },
  {
    value: "observer",
    label: "Observer",
    description: "View-only access to the group",
  },
];

function getRoleColor(role: string) {
  switch (role) {
    case "coordinator":
      return "bg-[#00D4FF]/10 text-[#00D4FF]";
    case "collaborator":
      return "bg-purple-500/10 text-purple-400";
    case "contributor":
      return "bg-green-500/10 text-green-400";
    default:
      return "bg-[#1f1f1f] text-[#9a9a9a]";
  }
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export function MemberActionsMenu({ groupId, member }: MemberActionsMenuProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<GroupRole>(member.role as GroupRole);

  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const handleRoleChange = () => {
    if (selectedRole === member.role) {
      setShowRoleDialog(false);
      return;
    }

    updateRole(
      {
        groupId,
        memberId: member.id,
        newRole: selectedRole,
      },
      {
        onSuccess: () => {
          setShowRoleDialog(false);
        },
      }
    );
  };

  const handleRemove = () => {
    removeMember(
      {
        groupId,
        memberId: member.id,
      },
      {
        onSuccess: () => {
          setShowRemoveDialog(false);
        },
      }
    );
  };

  const displayName = member.user.name || member.user.email.split("@")[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 text-[#666] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors">
            <IoEllipsisHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-[#1a1a1a] border-[#2a2a2a]"
        >
          <DropdownMenuItem
            onClick={() => {
              setSelectedRole(member.role as GroupRole);
              setShowRoleDialog(true);
            }}
            className="flex items-center gap-2 text-sm text-white hover:bg-[#2a2a2a] cursor-pointer"
          >
            <IoShieldOutline className="w-4 h-4 text-[#9a9a9a]" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
          >
            <IoPersonRemoveOutline className="w-4 h-4" />
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Change Role</DialogTitle>
            <DialogDescription className="text-[#9a9a9a]">
              Update the role for {displayName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] mb-4">
            {member.user.avatarUrl ? (
              <Image
                src={member.user.avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center text-sm font-medium text-[#00D4FF]">
                {getInitials(member.user.name, member.user.email)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-[#666]">{member.user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === option.value
                    ? "bg-[#00D4FF]/5 border-[#00D4FF]/30"
                    : "bg-[#0c0c0c] border-[#2a2a2a] hover:border-[#3a3a3a]"
                } ${isUpdatingRole ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={selectedRole === option.value}
                  onChange={() => setSelectedRole(option.value)}
                  disabled={isUpdatingRole}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">
                      {option.label}
                    </p>
                    {member.role === option.value && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#666]">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">
                    {option.description}
                  </p>
                </div>
                {selectedRole === option.value && (
                  <IoCheckmark className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
                )}
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleRoleChange}
              disabled={isUpdatingRole || selectedRole === member.role}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:bg-[#1f1f1f] disabled:text-[#666] text-[#0c0c0c] font-medium text-sm transition-colors"
            >
              {isUpdatingRole ? "Updating..." : "Update Role"}
            </button>
            <button
              onClick={() => setShowRoleDialog(false)}
              disabled={isUpdatingRole}
              className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#1f1f1f] text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <IoWarning className="w-5 h-5 text-red-400" />
              Remove Member
            </DialogTitle>
            <DialogDescription className="text-[#9a9a9a]">
              Are you sure you want to remove {displayName} from this group?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] mb-4">
            {member.user.avatarUrl ? (
              <Image
                src={member.user.avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center text-sm font-medium text-[#00D4FF]">
                {getInitials(member.user.name, member.user.email)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{displayName}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(member.role)}`}
                >
                  {member.role}
                </span>
                <span className="text-xs text-[#666]">{member.user.email}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
            <p className="text-xs text-red-400">
              This action cannot be undone. The member will lose access to all
              group content and will need to be re-invited to rejoin.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium text-sm transition-colors"
            >
              {isRemoving ? (
                "Removing..."
              ) : (
                <>
                  <IoPersonRemoveOutline className="w-4 h-4" />
                  Remove Member
                </>
              )}
            </button>
            <button
              onClick={() => setShowRemoveDialog(false)}
              disabled={isRemoving}
              className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#1f1f1f] text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
