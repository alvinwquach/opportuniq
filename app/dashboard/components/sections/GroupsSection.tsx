"use client";

import Link from "next/link";
import { IoPeople, IoAdd, IoPersonAdd } from "react-icons/io5";

interface GroupMembership {
  group: {
    id: string;
    name: string;
  };
  membership: {
    role: string;
  };
}

interface GroupsSectionProps {
  groups: GroupMembership[];
}

export function GroupsSection({ groups }: GroupsSectionProps) {
  // Show create group prompt when no groups
  if (groups.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Your Groups</h2>
        </div>
        <Link
          href="/groups/new"
          className="flex items-center gap-4 p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#00D4FF]/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center group-hover:bg-[#00D4FF]/20 transition-colors">
            <IoPersonAdd className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white group-hover:text-[#00D4FF] transition-colors">
              Create your first group
            </h3>
            <p className="text-xs text-[#666]">
              Organize decisions by property or project, invite family members
            </p>
          </div>
          <IoAdd className="w-5 h-5 text-[#555] group-hover:text-[#00D4FF] transition-colors" />
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Your Groups</h2>
        <Link
          href="/groups/new"
          className="flex items-center gap-1 text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
        >
          <IoAdd className="w-3.5 h-3.5" />
          New
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {groups.map(({ group, membership }) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#00B4D8]/20 flex items-center justify-center">
                <IoPeople className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#9a9a9a] uppercase tracking-wider">
                {membership.role}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white group-hover:text-[#00D4FF] transition-colors mb-1">
              {group.name}
            </h3>
            <p className="text-xs text-[#9a9a9a]">
              0 open issues · 0 pending
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
