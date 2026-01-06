"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
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
  IoEllipsisHorizontal,
} from "react-icons/io5";

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

interface GroupDashboardProps {
  group: {
    id: string;
    name: string;
    zipCode: string | null;
    defaultSearchRadius: number | null;
    createdAt: Date;
  };
  membership: {
    role: string;
    status: string;
    joinedAt: Date | null;
  };
  members: Member[];
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

export function GroupDashboard({
  group,
  membership,
  members,
  currentUserId,
  isCoordinator,
  isCollaborator,
  sharedBalance,
}: GroupDashboardProps) {
  const memberCount = members.length;

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen">
      <div className="border-b border-[#1f1f1f] bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 text-[#9a9a9a] hover:text-white transition-colors"
              >
                <IoChevronBack className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center">
                <IoPeople className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-[#666]">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${getRoleColor(membership.role)}`}
                  >
                    {membership.role}
                  </span>
                  <span>
                    {memberCount} {pluralize(memberCount, "member", "members")}
                  </span>
                  {group.zipCode && (
                    <span className="flex items-center gap-1">
                      <IoLocation className="w-3 h-3" />
                      {group.zipCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isCollaborator && (
                <Link
                  href={`/dashboard/groups/${group.id}/invite`}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors"
                >
                  <IoPersonAdd className="w-4 h-4" />
                  Invite
                </Link>
              )}
              {isCoordinator && (
                <Link
                  href={`/dashboard/groups/${group.id}/settings`}
                  className="p-2 text-[#9a9a9a] hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors"
                  title="Group Settings"
                >
                  <IoSettings className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-2">
                  <IoConstruct className="w-4 h-4 text-yellow-500" />
                  <span className="text-[10px] text-[#666]">
                    Open Issues
                  </span>
                </div>
                <div className="text-2xl font-semibold text-white">0</div>
              </div>
              <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-2">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] text-[#666]">
                    Resolved
                  </span>
                </div>
                <div className="text-2xl font-semibold text-white">0</div>
              </div>
              <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-2">
                  <IoWallet className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-[10px] text-[#666]">
                    Balance
                  </span>
                </div>
                <div className="text-2xl font-semibold text-white">
                  ${sharedBalance.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-2">
                  <IoTrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] text-[#666]">
                    Saved
                  </span>
                </div>
                <div className="text-2xl font-semibold text-white">$0</div>
              </div>
            </div>
            <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                <h2 className="text-sm font-medium text-white">
                  Recent Issues
                </h2>
                <Link
                  href="/dashboard/diagnose"
                  className="flex items-center gap-1 text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                >
                  <IoAdd className="w-3.5 h-3.5" />
                  New Issue
                </Link>
              </div>
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center mx-auto mb-3">
                  <IoConstruct className="w-6 h-6 text-[#666]" />
                </div>
                <p className="text-sm text-[#9a9a9a] mb-1">No issues yet</p>
                <p className="text-xs text-[#666] mb-4">
                  Create your first diagnosis to get started
                </p>
                <Link
                  href="/dashboard/diagnose"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#00D4FF]/90 transition-colors"
                >
                  <IoAdd className="w-4 h-4" />
                  New Diagnosis
                </Link>
              </div>
            </section>
            <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                <h2 className="text-sm font-medium text-white">Activity</h2>
              </div>
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center mx-auto mb-3">
                  <IoChatbubbles className="w-6 h-6 text-[#666]" />
                </div>
                <p className="text-sm text-[#9a9a9a] mb-1">No activity yet</p>
                <p className="text-xs text-[#666]">
                  Activity will appear here as your group collaborates
                </p>
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                <h2 className="text-sm font-medium text-white">
                  Members ({memberCount})
                </h2>
                {isCollaborator && (
                  <Link
                    href={`/dashboard/groups/${group.id}/invite`}
                    className="flex items-center gap-1 text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                  >
                    <IoPersonAdd className="w-3.5 h-3.5" />
                    Invite
                  </Link>
                )}
              </div>
              <div className="divide-y divide-[#1f1f1f]">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
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
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center text-sm font-medium text-[#00D4FF]">
                        {getInitials(member.user.name, member.user.email)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {member.user.name || member.user.email.split("@")[0]}
                        </p>
                        {member.user.id === currentUserId && (
                          <span className="text-[10px] text-[#666]">(you)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(member.role)}`}
                        >
                          {member.role}
                        </span>
                        {member.joinedAt && (
                          <span className="text-[10px] text-[#666]">
                            Joined{" "}
                            {formatDistanceToNow(new Date(member.joinedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    {isCoordinator && member.user.id !== currentUserId && (
                      <button className="p-1.5 text-[#666] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors">
                        <IoEllipsisHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {memberCount === 1 && (
                <div className="px-4 py-3 bg-[#1a1a1a] border-t border-[#1f1f1f]">
                  <p className="text-xs text-[#666] mb-2">
                    Invite others to collaborate on issues and decisions
                  </p>
                  <Link
                    href={`/dashboard/groups/${group.id}/invite`}
                    className="inline-flex items-center gap-2 text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                  >
                    <IoPersonAdd className="w-3.5 h-3.5" />
                    Invite your first member
                  </Link>
                </div>
              )}
            </section>
            <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1f1f1f]">
                <h2 className="text-sm font-medium text-white">Group Info</h2>
              </div>
              <div className="p-4 space-y-3">
                {group.zipCode && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
                      <IoLocation className="w-4 h-4 text-[#9a9a9a]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#666]">
                        Location
                      </p>
                      <p className="text-sm text-white">{group.zipCode}</p>
                    </div>
                  </div>
                )}
                {group.defaultSearchRadius && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
                      <IoShieldCheckmark className="w-4 h-4 text-[#9a9a9a]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#666]">
                        Search Radius
                      </p>
                      <p className="text-sm text-white">
                        {group.defaultSearchRadius} miles
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
                    <IoTime className="w-4 h-4 text-[#9a9a9a]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666]">
                      Created
                    </p>
                    <p className="text-sm text-white">
                      {formatDistanceToNow(new Date(group.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] p-4">
              <h2 className="text-sm font-medium text-white mb-3">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard/diagnose"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center group-hover:bg-[#00D4FF]/20 transition-colors">
                    <IoAdd className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                  <div>
                    <p className="text-sm text-white">New Diagnosis</p>
                    <p className="text-xs text-[#666]">
                      Report an issue or problem
                    </p>
                  </div>
                </Link>
                {isCollaborator && (
                  <Link
                    href={`/dashboard/groups/${group.id}/invite`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <IoPersonAdd className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Invite Members</p>
                      <p className="text-xs text-[#666]">
                        Add people to this group
                      </p>
                    </div>
                  </Link>
                )}
                {isCoordinator && (
                  <Link
                    href={`/dashboard/groups/${group.id}/settings`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center group-hover:bg-[#2a2a2a] transition-colors">
                      <IoSettings className="w-4 h-4 text-[#9a9a9a]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Group Settings</p>
                      <p className="text-xs text-[#666]">
                        Manage preferences and budget
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
