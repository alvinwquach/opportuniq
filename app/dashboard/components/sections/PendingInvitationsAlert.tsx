import Link from "next/link";
import { IoPeople } from "react-icons/io5";

interface PendingGroup {
  group: {
    id: string;
    name: string;
  };
}

interface PendingInvitationsAlertProps {
  pendingGroups: PendingGroup[];
}

export function PendingInvitationsAlert({ pendingGroups }: PendingInvitationsAlertProps) {
  if (pendingGroups.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <IoPeople className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium">
            {pendingGroups.length} pending invitation{pendingGroups.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-[#9a9a9a]">
            {pendingGroups.map((g) => g.group.name).join(", ")}
          </p>
        </div>
        <Link
          href={`/dashboard/groups/${pendingGroups[0].group.id}/pending`}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium"
        >
          View
        </Link>
      </div>
    </div>
  );
}
