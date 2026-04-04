import { IoPeople } from "react-icons/io5";

interface Group {
  id: string;
  name: string;
  role: string;
  issues: number;
  savings: number;
}

interface GroupsCardProps {
  groups: Group[];
  onAddNew?: () => void;
}

export function GroupsCard({ groups, onAddNew }: GroupsCardProps) {
  if (groups.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">Your Groups</h3>
        <span
          className="text-[10px] sm:text-xs text-blue-600 cursor-pointer hover:text-blue-700"
          onClick={onAddNew}
        >
          + New
        </span>
      </div>
      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-2.5 sm:p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <IoPeople className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{group.name}</h4>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize ml-auto flex-shrink-0">
                {group.role}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 ml-8 sm:ml-9">
              {group.issues} open · ${group.savings.toLocaleString()} saved
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
