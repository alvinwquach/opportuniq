import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { issues, groups, groupMembers } from "@/app/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import Link from "next/link";
import { IoAlertCircle, IoArrowForward, IoCheckmarkCircle, IoTime, IoClose } from "react-icons/io5";

export const dynamic = "force-dynamic";

function getStatusConfig(status: string) {
  switch (status) {
    case "open":
      return { label: "Open", color: "text-orange-400 bg-orange-500/10", icon: IoAlertCircle };
    case "investigating":
      return { label: "Investigating", color: "text-[#00D4FF] bg-[#00D4FF]/10", icon: IoTime };
    case "options_generated":
      return { label: "Options Ready", color: "text-purple-400 bg-purple-500/10", icon: IoTime };
    case "decided":
      return { label: "Decided", color: "text-amber-400 bg-amber-500/10", icon: IoCheckmarkCircle };
    case "in_progress":
      return { label: "In Progress", color: "text-blue-400 bg-blue-500/10", icon: IoTime };
    case "completed":
      return { label: "Completed", color: "text-green-500 bg-green-500/10", icon: IoCheckmarkCircle };
    case "deferred":
      return { label: "Deferred", color: "text-[#666] bg-[#666]/10", icon: IoClose };
    default:
      return { label: status, color: "text-[#666] bg-[#1f1f1f]", icon: IoAlertCircle };
  }
}

export default async function IssuesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/issues");
  }

  // Get user's groups
  const userGroupMemberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (userGroupMemberships.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <IoAlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Issues</h1>
            <p className="text-sm text-[#666]">Track and manage household issues</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
              <IoAlertCircle className="w-8 h-8 text-[#666]" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">No groups yet</h2>
            <p className="text-sm text-[#666] mb-4">
              Join or create a group to start tracking issues
            </p>
            <Link
              href="/dashboard/groups"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors text-sm font-medium"
            >
              Go to Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const groupIds = userGroupMemberships.map((m) => m.groupId);

  // Fetch all issues for user's groups
  // Note: resolutionType requires running db:push migration first
  const userIssues = await db
    .select({
      id: issues.id,
      title: issues.title,
      status: issues.status,
      priority: issues.priority,
      category: issues.category,
      createdAt: issues.createdAt,
      updatedAt: issues.updatedAt,
      groupId: issues.groupId,
      groupName: groups.name,
    })
    .from(issues)
    .innerJoin(groups, eq(issues.groupId, groups.id))
    .where(inArray(issues.groupId, groupIds))
    .orderBy(desc(issues.updatedAt));

  // Group issues by status
  const activeIssues = userIssues.filter(
    (i) => !["completed", "deferred"].includes(i.status)
  );
  const resolvedIssues = userIssues.filter((i) =>
    ["completed", "deferred"].includes(i.status)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <IoAlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Issues</h1>
            <p className="text-sm text-[#666]">
              {userIssues.length} total · {activeIssues.length} active
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-auto">
        {/* Active Issues */}
        {activeIssues.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-white mb-3">Active Issues</h2>
            <div className="space-y-2">
              {activeIssues.map((issue) => {
                const statusConfig = getStatusConfig(issue.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[#00D4FF] transition-colors">
                        {issue.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#666]">{issue.groupName}</span>
                        <span className="text-xs text-[#666]">·</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        {issue.category && (
                          <>
                            <span className="text-xs text-[#666]">·</span>
                            <span className="text-xs text-[#666] capitalize">
                              {issue.category.replace("_", " ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <IoArrowForward className="w-4 h-4 text-[#666] group-hover:text-[#00D4FF] transition-colors" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Resolved Issues */}
        {resolvedIssues.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-[#666] mb-3">
              Resolved ({resolvedIssues.length})
            </h2>
            <div className="space-y-2">
              {resolvedIssues.map((issue) => {
                const statusConfig = getStatusConfig(issue.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors group opacity-75 hover:opacity-100"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#9a9a9a] truncate group-hover:text-white transition-colors">
                        {issue.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#666]">{issue.groupName}</span>
                        <span className="text-xs text-[#666]">·</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        {/* resolutionType display - requires db:push migration */}
                      </div>
                    </div>
                    <IoArrowForward className="w-4 h-4 text-[#666] group-hover:text-[#00D4FF] transition-colors" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {userIssues.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
                <IoAlertCircle className="w-8 h-8 text-[#666]" />
              </div>
              <h2 className="text-lg font-medium text-white mb-2">No issues yet</h2>
              <p className="text-sm text-[#666] max-w-sm">
                Report an issue from the dashboard to start tracking problems
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
