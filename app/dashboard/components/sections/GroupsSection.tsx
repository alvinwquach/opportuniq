"use client";

import Link from "next/link";
import { IoPeople } from "react-icons/io5";
import { useGroups } from "@/hooks/useGroups";
import { CreateGroupDialog } from "./CreateGroupDialog";

export function GroupsSection() {
  const { data, isLoading } = useGroups();
  const groups = data?.groups ?? [];

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Your Groups</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gray-50 border border-gray-200 animate-pulse"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="w-16 h-4 rounded bg-gray-100" />
              </div>
              <div className="w-32 h-4 rounded bg-gray-100 mb-2" />
              <div className="w-24 h-3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Your Groups</h2>
        </div>
        <CreateGroupDialog variant="empty" />
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Your Groups</h2>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/groups"
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            View all
          </Link>
          <CreateGroupDialog variant="button" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {groups.map(({ group, membership }) => (
          <Link
            key={group.id}
            href={`/dashboard/groups/${group.id}`}
            className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-200 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center">
                <IoPeople className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 capitalize">
                {membership.role}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
              {group.name}
            </h3>
            <p className="text-xs text-gray-400">
              0 open issues · 0 pending
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
