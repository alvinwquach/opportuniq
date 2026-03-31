// Tell React and Next.js to run this component in the browser (client-side).
// Even though this component has no hooks itself, marking it "use client" is
// required because it receives callback props (onSelectGroup, onCreateGroup)
// that ultimately update state in the parent client component.
"use client";

// IoPeople     = people icon displayed inside each group card's icon box.
// IoAddOutline = "+" icon on the "New" button in the sidebar header.
import { IoPeople, IoAddOutline } from "react-icons/io5";

// GroupWithStats = TypeScript type describing a group's summary data as returned
// by the server: name, role, issue count, savings, members list, etc.
// The full GroupDetails shape (with charts, activity feed, etc.) is only loaded
// when a group is selected; the sidebar only needs the lighter summary.
import type { GroupWithStats } from "@/lib/hooks/types";

// Map each role string to a Tailwind CSS class pair (background + text color).
// Coordinator/collaborator/participant/contributor all get the same emerald style;
// observer gets a muted grey to visually signal a lower-permission role.
const roleColors: Record<string, string> = {
  coordinator: "bg-emerald-500/20 text-emerald-400",
  collaborator: "bg-emerald-500/20 text-emerald-400",
  participant: "bg-emerald-500/20 text-emerald-400",
  contributor: "bg-emerald-500/20 text-emerald-400",
  observer: "bg-[#333] text-[#888]",
};

// Map each role string to a human-readable display label.
// e.g. "coordinator" → "Coordinator" instead of the raw lowercase value.
const roleLabels: Record<string, string> = {
  coordinator: "Coordinator",
  collaborator: "Collaborator",
  participant: "Participant",
  contributor: "Contributor",
  observer: "Observer",
};

// Props interface: defines every piece of data and every callback this component needs.
interface GroupsSidebarProps {
  // The list of all groups to display as cards in the sidebar.
  groups: GroupWithStats[];
  // The ID of the currently selected group, or null if none is selected.
  // Used to highlight the active group card.
  selectedGroupId: string | null;
  // Callback: called when the user clicks a group card; receives the clicked group's ID.
  // The parent uses this to update its selectedGroupId state.
  onSelectGroup: (groupId: string) => void;
  // Callback: called when the user clicks "New"; the parent opens the create-group modal.
  onCreateGroup: () => void;
  // The sum of savings across all groups; shown in the "Quick Stats" panel at the bottom.
  totalSavings: number;
}

// GroupsSidebar renders a fixed-width scrollable left panel containing:
// - A header with a title and "New Group" button
// - One card per group (clickable to select)
// - A "Quick Stats" summary panel at the bottom
export function GroupsSidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  totalSavings,
}: GroupsSidebarProps) {
  return (
    // w-[280px]: fixed width; flex-shrink-0 prevents the sidebar from being squashed.
    // overflow-y-auto: allows the group list to scroll independently.
    // border-r: the vertical divider between the sidebar and the detail panel.
    <div className="w-[280px] flex-shrink-0 overflow-y-auto p-4 border-r border-[#2a2a2a] bg-[#0f0f0f]">
      {/* ─── SIDEBAR HEADER ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Groups</h2>
          <p className="text-xs text-[#666]">Manage your households</p>
        </div>
        {/* "New" button: calls onCreateGroup → parent opens the NewGroupModal. */}
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          <IoAddOutline className="w-4 h-4" />
          New
        </button>
      </div>

      {/* ─── GROUP CARDS LIST ────────────────────────────────── */}
      {/* space-y-2 adds a small gap between each card. */}
      <div className="space-y-2">
        {/* Render one card per group in the groups array. */}
        {groups.map((group) => {
          // Determine if this card represents the currently selected group.
          // Used to apply a highlighted border style.
          const isSelected = selectedGroupId === group.id;
          return (
            // The whole card is a button so it's keyboard-accessible.
            // Clicking it calls onSelectGroup(group.id) → parent updates selectedGroupId.
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`w-full text-left bg-[#1a1a1a] rounded-xl border overflow-hidden hover:border-[#333] transition-all ${
                // Selected cards get an emerald ring; unselected cards get the default grey border.
                isSelected ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-[#2a2a2a]"
              }`}
            >
              {/* Card header row: icon, group name, member count, and role badge. */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Emerald icon box with the people silhouette. */}
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <IoPeople className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Group name; truncate prevents overflow when the name is long. */}
                    <h3 className="text-sm font-semibold text-white truncate">{group.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {/* Member count as small grey text. */}
                      <span className="text-[10px] text-[#666]">{group.memberCount} members</span>
                      {/* Role badge using the lookup tables above. */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${roleColors[group.role] || roleColors.observer}`}>
                        {roleLabels[group.role] || group.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card body row: member avatar stack on the left, issue/savings stats on the right. */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                {/* Overlapping avatar stack showing up to 3 member avatars. */}
                <div className="flex items-center gap-1.5">
                  {/* -space-x-1.5 overlaps the avatars horizontally like a stack. */}
                  <div className="flex -space-x-1.5">
                    {/* Only show the first 3 members to keep the stack compact. */}
                    {group.members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        // border-2 border-[#1a1a1a] creates the illusion of a gap between avatars
                        // by drawing a border that matches the card background.
                        className="w-6 h-6 rounded-full bg-[#333] border-2 border-[#1a1a1a] flex items-center justify-center text-xs"
                        // Tooltip on hover shows the member's name and role.
                        title={`${member.name || "Member"} (${roleLabels[member.role] || member.role})`}
                      >
                        {/* Show the member's emoji avatar or "?" if they don't have one. */}
                        {member.avatar || "?"}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Two small stat labels: issue count and total savings for this group. */}
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="text-right">
                    <p className="text-[#555]">Issues</p>
                    <p className="font-semibold text-white">{group.issueCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#555]">Saved</p>
                    {/* Savings highlighted in emerald to signal a positive/good value. */}
                    <p className="font-semibold text-emerald-400">${group.savings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── QUICK STATS PANEL ───────────────────────────────── */}
      {/* A small summary card at the bottom showing total group count and total savings. */}
      <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          {/* Total number of groups the user belongs to. */}
          <div className="text-center">
            <p className="text-lg font-bold text-white">{groups.length}</p>
            <p className="text-[10px] text-[#666]">Groups</p>
          </div>
          {/* Aggregate savings across all groups; highlighted in emerald. */}
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">${totalSavings.toLocaleString()}</p>
            <p className="text-[10px] text-[#666]">Total Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
