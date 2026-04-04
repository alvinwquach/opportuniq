/**
 * Issues list page (app segment). Server-rendered; checks auth and group
 * membership. If user has no groups, renders empty state with CTA to groups;
 * otherwise renders IssuesClient which fetches issues via GraphQL.
 *
 * Caching: force-dynamic (user-specific). Loading: app/issues/loading.tsx
 * shows IssuesSkeleton until this resolves.
 */
import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { groupMembers } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { IoAlertCircle } from "react-icons/io5";
import { IssuesClient } from "./IssuesClient";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/projects");
  }

  // Check if user has any groups
  const userGroupMemberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    )
    .limit(1);

  // No groups empty state
  if (userGroupMemberships.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-48px)] bg-white">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IoAlertCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Issue History</h1>
              <p className="text-sm text-gray-400">Track and manage household issues</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IoAlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h2>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Join or create a group to start tracking issues
            </p>
            <Link
              href="/dashboard/groups"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-sm font-medium"
            >
              Go to Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render the client component that fetches data via GraphQL
  return <IssuesClient />;
}
