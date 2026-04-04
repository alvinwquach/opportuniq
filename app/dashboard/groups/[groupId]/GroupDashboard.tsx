"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  IoPeople,
  IoSettings,
  IoChevronBack,
  IoAdd,
  IoLocation,
  IoPersonAdd,
  IoCheckmarkCircle,
  IoTime,
  IoWallet,
  IoTrendingUp,
  IoShieldCheckmark,
  IoConstruct,
  IoChatbubbles,
  IoMailOutline,
  IoClose,
  IoCopyOutline,
  IoCheckmark,
  IoRefresh,
  IoCalendarOutline,
} from "react-icons/io5";
import { EditGroupDialog } from "@/app/dashboard/components/sections/EditGroupDialog";
import { InviteMemberDialog } from "@/app/dashboard/components/sections/InviteMemberDialog";
import { BulkInviteMemberDialog } from "@/app/dashboard/components/sections/BulkInviteMemberDialog";
import { ExtendInvitationDialog } from "@/app/dashboard/components/sections/ExtendInvitationDialog";
import { InvitationHistorySection } from "@/app/dashboard/components/sections/InvitationHistorySection";
import { MemberActionsMenu } from "@/app/dashboard/components/sections/MemberActionsMenu";
import { useCancelInvitation, useUpdateInvitationRole, useResendInvitation } from "@/hooks/useGroupMembers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

const roleOptions: { value: GroupRole; label: string }[] = [
  { value: "participant", label: "Participant" },
  { value: "contributor", label: "Contributor" },
  { value: "collaborator", label: "Collaborator" },
  { value: "observer", label: "Observer" },
];

interface Member {
  id: string;
  role: string;
  status: string;
  joinedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface GroupDashboardProps {
  group: {
    id: string;
    name: string;
    postalCode: string | null;
    defaultSearchRadius: number | null;
    createdAt: Date;
  };
  membership: {
    role: string;
    status: string;
    joinedAt: Date | null;
  };
  members: Member[];
  pendingInvitations: PendingInvitation[];
  constraints: {
    monthlyBudget: string | null;
    sharedBalance: string;
    riskTolerance: string | null;
    diyPreference: string | null;
  } | null;
  currentUserId: string;
  isCoordinator: boolean;
  isCollaborator: boolean;
  sharedBalance: number;
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function getRoleColor(role: string) {
  switch (role) {
    case "coordinator":
      return "bg-blue-50 text-blue-600";
    case "collaborator":
      return "bg-purple-50 text-purple-600";
    case "contributor":
      return "bg-green-50 text-green-600";
    default:
      return "bg-gray-100 text-gray-400";
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

export function GroupDashboard({
  group,
  membership,
  members,
  pendingInvitations,
  currentUserId,
  isCoordinator,
  isCollaborator,
  sharedBalance,
}: GroupDashboardProps) {
  const memberCount = members.length;
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(null);
  const { mutate: cancelInvitation, isPending: isCancelling } =
    useCancelInvitation();
  const { mutate: updateInvitationRole, isPending: isUpdatingRole } =
    useUpdateInvitationRole();
  const { mutate: resendInvitation, isPending: isResending } =
    useResendInvitation();

  const copyInviteLink = async (token: string, invitationId: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvitationId(invitationId);
      setTimeout(() => setCopiedInvitationId(null), 2000);
    } catch (err) {
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen">
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <IoChevronBack className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center">
                <IoPeople className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${getRoleColor(membership.role)}`}
                  >
                    {membership.role}
                  </span>
                  <span>
                    {memberCount} {pluralize(memberCount, "member", "members")}
                  </span>
                  {group.postalCode && (
                    <span className="flex items-center gap-1">
                      <IoLocation className="w-3 h-3" />
                      {group.postalCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isCollaborator && (
                <>
                  <InviteMemberDialog
                    groupId={group.id}
                    groupName={group.name}
                    trigger={
                      <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <IoPersonAdd className="w-4 h-4" />
                        Invite
                      </button>
                    }
                  />
                  <BulkInviteMemberDialog
                    groupId={group.id}
                    groupName={group.name}
                    trigger={
                      <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <IoPeople className="w-4 h-4" />
                        Bulk
                      </button>
                    }
                  />
                </>
              )}
              {isCoordinator && (
                <EditGroupDialog
                  group={group}
                  trigger={
                    <button
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Group"
                    >
                      <IoSettings className="w-5 h-5" />
                    </button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <IoConstruct className="w-4 h-4 text-yellow-500" />
                  <span className="text-[10px] text-gray-500">
                    Open Issues
                  </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">0</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] text-gray-500">
                    Resolved
                  </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">0</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <IoWallet className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] text-gray-500">
                    Balance
                  </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${sharedBalance.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <IoTrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] text-gray-500">
                    Saved
                  </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">$0</div>
              </div>
            </div>
            <section className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">
                  Recent Issues
                </h2>
                <Link
                  href="/dashboard/projects"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-600/80 transition-colors"
                >
                  <IoAdd className="w-3.5 h-3.5" />
                  New Issue
                </Link>
              </div>
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <IoConstruct className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400 mb-1">No issues yet</p>
                <p className="text-xs text-gray-500 mb-4">
                  Create your first diagnosis to get started
                </p>
                <Link
                  href="/dashboard/projects"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-600/90 transition-colors"
                >
                  <IoAdd className="w-4 h-4" />
                  New Diagnosis
                </Link>
              </div>
            </section>
            <section className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">Activity</h2>
              </div>
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <IoChatbubbles className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400 mb-1">No activity yet</p>
                <p className="text-xs text-gray-500">
                  Activity will appear here as your group collaborates
                </p>
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">
                  Members ({memberCount})
                </h2>
                {isCollaborator && (
                  <InviteMemberDialog
                    groupId={group.id}
                    groupName={group.name}
                    trigger={
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-600/80 transition-colors">
                        <IoPersonAdd className="w-3.5 h-3.5" />
                        Invite
                      </button>
                    }
                  />
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    {member.user.avatarUrl ? (
                      <Image
                        src={member.user.avatarUrl}
                        alt={member.user.name || member.user.email}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center text-sm font-medium text-blue-600">
                        {getInitials(member.user.name, member.user.email)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.user.name || member.user.email.split("@")[0]}
                        </p>
                        {member.user.id === currentUserId && (
                          <span className="text-[10px] text-gray-500">(you)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(member.role)}`}
                        >
                          {member.role}
                        </span>
                        {member.joinedAt && (
                          <span className="text-[10px] text-gray-500">
                            Joined{" "}
                            {formatDistanceToNow(new Date(member.joinedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    {isCoordinator && member.user.id !== currentUserId && (
                      <MemberActionsMenu
                        groupId={group.id}
                        member={member}
                      />
                    )}
                  </div>
                ))}
              </div>
              {memberCount === 1 && (
                <div className="px-4 py-3 bg-gray-100 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">
                    Invite others to collaborate on issues and decisions
                  </p>
                  <InviteMemberDialog
                    groupId={group.id}
                    groupName={group.name}
                    trigger={
                      <button className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-600/80 transition-colors">
                        <IoPersonAdd className="w-3.5 h-3.5" />
                        Invite your first member
                      </button>
                    }
                  />
                </div>
              )}
            </section>
            <section className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">Group Info</h2>
              </div>
              <div className="p-4 space-y-3">
                {group.postalCode && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <IoLocation className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Location
                      </p>
                      <p className="text-sm text-gray-900">{group.postalCode}</p>
                    </div>
                  </div>
                )}
                {group.defaultSearchRadius && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <IoShieldCheckmark className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Search Radius
                      </p>
                      <p className="text-sm text-gray-900">
                        {group.defaultSearchRadius} miles
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <IoTime className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">
                      Created
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatDistanceToNow(new Date(group.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard/projects"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <IoAdd className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">New Diagnosis</p>
                    <p className="text-xs text-gray-500">
                      Report an issue or problem
                    </p>
                  </div>
                </Link>
                {isCollaborator && (
                  <>
                    <InviteMemberDialog
                      groupId={group.id}
                      groupName={group.name}
                      trigger={
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group text-left">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <IoPersonAdd className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">Invite Member</p>
                            <p className="text-xs text-gray-500">
                              Add a person to this group
                            </p>
                          </div>
                        </button>
                      }
                    />
                    <BulkInviteMemberDialog
                      groupId={group.id}
                      groupName={group.name}
                      trigger={
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group text-left">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <IoPeople className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">Bulk Invite</p>
                            <p className="text-xs text-gray-500">
                              Invite multiple people at once
                            </p>
                          </div>
                        </button>
                      }
                    />
                  </>
                )}
                {isCoordinator && (
                  <EditGroupDialog
                    group={group}
                    trigger={
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group text-left">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <IoSettings className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">Edit Group</p>
                          <p className="text-xs text-gray-500">
                            Update name, location, and settings
                          </p>
                        </div>
                      </button>
                    }
                  />
                )}
              </div>
            </section>
          </div>
        </div>
        {isCollaborator && pendingInvitations.length > 0 && (
          <section className="mt-6 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <IoMailOutline className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-medium text-gray-900">
                  Pending Invitations ({pendingInvitations.length})
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      Role
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      Sent
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingInvitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-xs font-medium text-amber-500 shrink-0">
                            {invitation.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900 truncate max-w-[200px]">
                            {invitation.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={invitation.role}
                          onValueChange={(value) =>
                            updateInvitationRole({
                              groupId: group.id,
                              invitationId: invitation.id,
                              newRole: value as GroupRole,
                            })
                          }
                          disabled={isUpdatingRole}
                        >
                          <SelectTrigger
                            className={`h-7 w-auto min-w-[110px] text-xs px-2 py-1 rounded border-0 capitalize ${getRoleColor(invitation.role)} bg-transparent hover:bg-gray-100 focus:ring-1 focus:ring-blue-300`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-100 border-gray-200">
                            {roleOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-xs text-gray-900 capitalize hover:bg-gray-200 focus:bg-gray-200 focus:text-gray-900 cursor-pointer"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(invitation.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-500/80 whitespace-nowrap">
                        {formatDistanceToNow(new Date(invitation.expiresAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => copyInviteLink(invitation.token, invitation.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Copy invite link"
                          >
                            {copiedInvitationId === invitation.id ? (
                              <>
                                <IoCheckmark className="w-3.5 h-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <IoCopyOutline className="w-3.5 h-3.5" />
                                Copy Link
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              resendInvitation({
                                groupId: group.id,
                                invitationId: invitation.id,
                              })
                            }
                            disabled={isResending}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-500 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Resend invitation email"
                          >
                            <IoRefresh className="w-3.5 h-3.5" />
                            Resend
                          </button>
                          <ExtendInvitationDialog
                            groupId={group.id}
                            invitationId={invitation.id}
                            inviteeEmail={invitation.email}
                            currentExpiresAt={invitation.expiresAt}
                            trigger={
                              <button
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-amber-500 hover:bg-amber-50 rounded transition-colors"
                                title="Extend invitation expiration"
                              >
                                <IoCalendarOutline className="w-3.5 h-3.5" />
                                Extend
                              </button>
                            }
                          />
                          <button
                            onClick={() =>
                              cancelInvitation({
                                groupId: group.id,
                                invitationId: invitation.id,
                              })
                            }
                            disabled={isCancelling}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Revoke invitation"
                          >
                            <IoClose className="w-3.5 h-3.5" />
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {isCollaborator && (
          <div className="mt-6">
            <InvitationHistorySection
              groupId={group.id}
              isCollaborator={isCollaborator}
            />
          </div>
        )}
      </div>
    </div>
  );
}
