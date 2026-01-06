import Link from "next/link";
import {
  IoPeople,
  IoChevronForward,
  IoLocation,
} from "react-icons/io5";
import { getUserGroups } from "./actions";
import { CreateGroupDialog } from "../components/sections/CreateGroupDialog";
import { formatDistanceToNow } from "date-fns";
import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

export default async function Groups() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const result = await getUserGroups();
  const groups = result.success ? result.groups ?? [] : [];

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen">
      <div className="border-b border-[#1f1f1f] bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center">
                <IoPeople className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Groups</h1>
                <p className="text-xs text-[#666]">
                  Manage your groups and collaborators
                </p>
              </div>
            </div>
            <CreateGroupDialog variant="button" />
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
              <IoPeople className="w-8 h-8 text-[#666]" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">
              No groups yet
            </h2>
            <p className="text-sm text-[#666] mb-6 max-w-md mx-auto">
              Create a group to collaborate with others on home maintenance
              issues, share costs, and make decisions together.
            </p>
            <CreateGroupDialog variant="empty" />
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(({ group, membership }) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center flex-shrink-0">
                  <IoPeople className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white group-hover:text-[#00D4FF] transition-colors truncate">
                      {group.name}
                    </h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${getRoleColor(membership.role)}`}
                    >
                      {membership.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#666]">
                    {group.zipCode && (
                      <span className="flex items-center gap-1">
                        <IoLocation className="w-3 h-3" />
                        {group.zipCode}
                      </span>
                    )}
                    <span>
                      Created{" "}
                      {formatDistanceToNow(new Date(group.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-[#666] group-hover:text-[#00D4FF] transition-colors">
                  <IoChevronForward className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
