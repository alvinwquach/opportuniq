// Tell React and Next.js to run this component in the browser (client-side).
// This is required because the component uses useState (for the open dropdown menu).
"use client";

// useState = track which member's dropdown menu is currently open.
//            When the user clicks the "..." button on a member card, the menu
//            for that member is shown; clicking elsewhere closes it.
import { useState } from "react";

// Icon components from the react-icons Ionicons 5 set.
// Each is used to illustrate a specific action or data type in the UI.
import {
  IoSettingsOutline,    // Gear icon on the "Settings" button in the header
  IoPersonAddOutline,   // Person+ icon on the "Invite" button and "Add Member" link
  IoConstruct,          // Wrench/build icon for "open issues" stat and issue list items
  IoCheckmarkCircle,    // Checkmark icon for "resolved" stat and resolved activity items
  IoWallet,             // Wallet icon for "balance" stat and shared budget section
  IoTrendingUp,         // Trending-up arrow icon for "saved" stat
  IoLocation,           // Location pin icon next to the postal code
  IoEllipsisVertical,   // Three-dot vertical menu icon on each member card
  IoShield,             // Shield icon on the "Change Role" dropdown item
  IoTrash,              // Trash icon on the "Remove Member" dropdown item
  IoMailOutline,        // Envelope icon on pending invitation cards
  IoCopyOutline,        // Copy icon on the invitation card (to copy the invite link)
  IoChevronForward,     // Right-arrow icon on recent issue list items (navigate to issue)
  IoAddOutline,         // "+" icon on the "New" link in the Recent Issues header
  IoPeople,             // People icon (imported but used by child/future elements)
} from "react-icons/io5";

// Chart components from the Recharts library.
// PieChart / Pie / Cell = donut chart for member contributions.
// ResponsiveContainer   = makes any chart fill its parent element's width automatically.
// BarChart / Bar        = bar chart for resolution methods (DIY vs hired).
// XAxis / YAxis         = the horizontal and vertical axes on bar/area charts.
// Tooltip               = the hover tooltip that shows data values.
// AreaChart / Area      = filled area chart for monthly savings trend.
// Line                  = a line overlay on the area chart (used for "spent" line).
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Line,
} from "recharts";

// GroupDetails = TypeScript type describing the full shape of a group's detail data
// (members, budget, savings charts, activity feed, recent issues, etc.).
import type { GroupDetails as GroupDetailsType } from "@/lib/hooks/types";

// Next.js Link component for client-side navigation without a full page reload.
import Link from "next/link";

// Map each role string to a Tailwind CSS class pair (background + text color).
// Used to style the role badge on each member card and the group header.
const roleColors: Record<string, string> = {
  coordinator: "bg-blue-100 text-blue-600",
  collaborator: "bg-blue-100 text-blue-600",
  participant: "bg-blue-100 text-blue-600",
  contributor: "bg-blue-100 text-blue-600",
  // Observers get a more muted grey style to visually distinguish their lower role.
  observer: "bg-[#333] text-gray-500",
};

// Map each role string to a human-readable display label.
// e.g. "coordinator" → "Coordinator" instead of showing the raw lowercase value.
const roleLabels: Record<string, string> = {
  coordinator: "Coordinator",
  collaborator: "Collaborator",
  participant: "Participant",
  contributor: "Contributor",
  observer: "Observer",
};

// Props interface: defines every piece of data and every callback this component needs.
interface GroupDetailsProps {
  // The full detail object for the group being displayed.
  group: GroupDetailsType;
  // Callback: called when the user clicks "Settings" — parent opens the settings modal.
  onOpenSettings: () => void;
  // Callback: called when the user clicks "Invite" — parent opens the invite modal.
  onOpenInvite: () => void;
  // Callback: called when the user clicks "View History" — parent opens the contribution history modal.
  onOpenContributionHistory: () => void;
  // Callback: called when the user chooses "Change Role" from a member's dropdown menu.
  // memberId    = which member to change.
  // currentRole = the role they currently have (pre-populates the role modal).
  onChangeRole: (memberId: string, currentRole: string) => void;
  // Callback: called when the user chooses "Remove Member" from a member's dropdown menu.
  onRemoveMember: (memberId: string) => void;
}

// GroupDetails is a presentational component that renders the full detail panel
// for a selected group: header, stats, member list, charts, and activity feed.
export function GroupDetails({
  group,
  onOpenSettings,
  onOpenInvite,
  onOpenContributionHistory,
  onChangeRole,
  onRemoveMember,
}: GroupDetailsProps) {
  // Track which member's three-dot dropdown menu is currently open.
  // null = no menu open. A member's id = that member's menu is open.
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Return the appropriate icon element for an activity item based on its type.
  // Each activity type has a semantically meaningful icon and color.
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "resolved":
        return <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />;
      case "contribution":
        return <IoWallet className="w-4 h-4 text-blue-600" />;
      case "invitation":
        return <IoPersonAddOutline className="w-4 h-4 text-blue-600" />;
      default:
        // Any unknown activity type defaults to the generic "work in progress" icon.
        return <IoConstruct className="w-4 h-4 text-amber-400" />;
    }
  };

  // Return the Tailwind background-color class for the circular icon container
  // behind each activity entry's icon.
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "resolved":
      case "contribution":
      case "invitation":
        return "bg-blue-100";
      default:
        // Unknown types get the amber/warning background.
        return "bg-amber-500/20";
    }
  };

  // Format a raw ISO timestamp string into a relative human-readable label.
  // e.g. "2024-01-15T10:30:00Z" → "3h ago" or "2d ago".
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    // Difference in milliseconds between now and the event.
    const diffMs = now.getTime() - date.getTime();
    // Convert to whole hours and whole days for comparison.
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  };

  return (
    // flex-1 makes this panel take up the remaining horizontal space beside the sidebar.
    // overflow-y-auto allows the content to scroll independently of the sidebar.
    <div className="flex-1 overflow-y-auto p-5">
      {/* ─── GROUP HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          {/* Group name + role badge */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-white">{group.name}</h2>
            {/* Show the role badge using the colour and label lookup tables above.
                Falls back to the "observer" style if the role is unrecognized. */}
            <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${roleColors[group.role] || roleColors.observer}`}>
              {roleLabels[group.role] || group.role}
            </span>
          </div>
          {/* Postal code (if set) and member count, shown as small grey metadata. */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Only render the postal code span if the group has one. */}
            {group.postalCode && (
              <span className="flex items-center gap-1">
                <IoLocation className="w-3.5 h-3.5" />
                {group.postalCode}
              </span>
            )}
            <span>{group.members.length} members</span>
          </div>
        </div>
        {/* Action buttons: Settings and Invite */}
        <div className="flex items-center gap-2">
          {/* Settings button: triggers onOpenSettings callback → parent opens settings modal. */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 hover:border-[#333] hover:text-gray-900 rounded-lg transition-colors"
          >
            <IoSettingsOutline className="w-4 h-4" />
            Settings
          </button>
          {/* Invite button: triggers onOpenInvite callback → parent opens invite modal. */}
          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-500/30 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <IoPersonAddOutline className="w-4 h-4" />
            Invite
          </button>
        </div>
      </div>

      {/* ─── STATS CARDS ──────────────────────────────────────── */}
      {/* Four small stat cards in a row: Open Issues, Resolved, Balance, Saved. */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {/* Open issues count */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoConstruct className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-gray-500 uppercase">Open</span>
          </div>
          <div className="text-xl font-semibold text-white">{group.openIssueCount}</div>
        </div>
        {/* Resolved issues count */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase">Resolved</span>
          </div>
          <div className="text-xl font-semibold text-white">{group.resolvedCount}</div>
        </div>
        {/* Available balance in the shared fund */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoWallet className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase">Balance</span>
          </div>
          {/* toLocaleString() adds thousands separators (e.g. 1000 → "1,000"). */}
          <div className="text-xl font-semibold text-white">${group.balance.toLocaleString()}</div>
        </div>
        {/* Total money saved by the group through DIY and avoided costs */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoTrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase">Saved</span>
          </div>
          {/* Savings amount highlighted in emerald green to show it's positive. */}
          <div className="text-xl font-semibold text-blue-600">${group.savings.toLocaleString()}</div>
        </div>
      </div>

      {/* ─── MEMBERS SECTION ──────────────────────────────────── */}
      <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden mb-5">
        {/* Section header row: title + "Add Member" shortcut link */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          {/* Show the count in the heading so it's clear at a glance. */}
          <h3 className="text-sm font-medium text-white">Members ({group.members.length})</h3>
          {/* "Add Member" link triggers the same invite callback as the header button. */}
          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 transition-colors"
          >
            <IoPersonAddOutline className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
        <div className="p-4">
          {/* Wrap all member cards in a flex row that wraps to the next line when full. */}
          <div className="flex flex-wrap gap-3">
            {/* Render one card per group member. */}
            {group.members.map((member) => {
              // Determine if THIS member's dropdown is the one currently open.
              const isMenuOpen = openMenuId === member.id;
              return (
                // "group" Tailwind class enables group-hover utilities on child elements
                // (e.g. the three-dot button only appears when hovering the card).
                <div
                  key={member.id}
                  className="relative flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group min-w-[200px] border border-gray-200"
                >
                  {/* Avatar circle: shows the member's emoji avatar or "?" if none. */}
                  <div className="w-10 h-10 rounded-full bg-[#333] border border-gray-200 flex items-center justify-center text-lg">
                    {member.avatar || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Member name; falls back to "Member" if name is missing. */}
                    <p className="text-sm font-medium text-white">{member.name || "Member"}</p>
                    {/* Role badge using the same lookup tables as the group header. */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${roleColors[member.role] || roleColors.observer}`}
                        title={`${roleLabels[member.role] || member.role}`}
                      >
                        {roleLabels[member.role] || member.role}
                      </span>
                    </div>
                  </div>
                  {/* Three-dot menu button: only visible when the card is hovered (opacity-0 → group-hover:opacity-100).
                      e.stopPropagation() prevents the click from bubbling up and immediately closing the menu. */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle: if this menu is already open, close it; otherwise open it.
                      setOpenMenuId(isMenuOpen ? null : member.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-[#333] rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IoEllipsisVertical className="w-4 h-4" />
                  </button>
                  {/* Dropdown menu: only rendered when this member's menu is open. */}
                  {isMenuOpen && (
                    // z-50 ensures the dropdown appears above all other content.
                    <div className="absolute top-full right-0 mt-1 w-40 bg-gray-100 rounded-lg border border-gray-200 shadow-lg py-1 z-50">
                      {/* "Change Role" option: opens the role modal for this member. */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeRole(member.id, member.role);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <IoShield className="w-3.5 h-3.5" />
                        Change Role
                      </button>
                      {/* "Remove Member" option: only shown for non-coordinators.
                          A coordinator cannot be removed this way (they must transfer the role first). */}
                      {member.role !== "coordinator" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMember(member.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          <IoTrash className="w-3.5 h-3.5" />
                          Remove Member
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Render one card per pending (not yet accepted) invitation.
                These use an amber/warning style to distinguish them from active members. */}
            {group.pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg min-w-[200px]"
              >
                {/* Email icon indicates this is a pending invitation, not an active member. */}
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <IoMailOutline className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Show the invitee's email address. truncate prevents overflow. */}
                  <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                  {/* Show "Pending" status with the role they were invited as. */}
                  <p className="text-[10px] text-amber-400">
                    Pending · {roleLabels[inv.role] || inv.role}
                  </p>
                  {/* Show expiry date so coordinators know when to resend. */}
                  <p className="text-[10px] text-gray-400">
                    Expires {new Date(inv.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                {/* Copy button: would copy the invitation link to the clipboard (not yet wired up). */}
                <button className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors">
                  <IoCopyOutline className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW 1 ─────────────────────────────────────── */}
      {/* Two charts side by side: Shared Budget (left) and Member Contributions pie (right). */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Shared Budget card: shows available balance, monthly spend progress, and two bottom stats. */}
        <div className="bg-gradient-to-br from-blue-500/10 to-[#1a1a1a] rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IoWallet className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium text-white">Shared Budget</h3>
            </div>
            {/* "View History" link: triggers onOpenContributionHistory → parent opens the modal. */}
            <button
              onClick={onOpenContributionHistory}
              className="text-[10px] text-blue-600 hover:text-blue-500 transition-colors"
            >
              View History
            </button>
          </div>
          {/* Balance and monthly spend summary */}
          <div className="flex items-end justify-between mb-4">
            <div>
              {/* Large balance figure in emerald to draw the eye. */}
              <p className="text-3xl font-bold text-blue-600">${group.balance.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Available balance</p>
            </div>
            <div className="text-right">
              {/* Monthly spent / monthly budget. The budget uses "||" to show "0" if null. */}
              <p className="text-sm font-semibold text-white">
                ${group.monthlySpent.toLocaleString()}{" "}
                <span className="text-gray-400 font-normal">/ ${group.monthlyBudget?.toLocaleString() || "0"}</span>
              </p>
              <p className="text-[10px] text-gray-500">Monthly spent</p>
            </div>
          </div>
          {/* Budget usage progress bar.
              Width is capped at 100% with Math.min to prevent overflow beyond the container. */}
          <div className="h-2 bg-[#333] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min(group.budgetUsedPercent, 100)}%` }}
            />
          </div>
          {/* Two bottom stats: emergency fund and DIY rate */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-500/20">
            <div className="text-center">
              {/* Emergency fund balance; shows "0" if none is set. */}
              <p className="text-lg font-semibold text-white">${group.emergencyFund?.toLocaleString() || "0"}</p>
              <p className="text-[10px] text-gray-500">Emergency Fund</p>
            </div>
            <div className="text-center">
              {/* DIY rate = percentage of issues resolved by doing it yourself. */}
              <p className="text-lg font-semibold text-white">{group.diyRate}%</p>
              <p className="text-[10px] text-gray-500">DIY Rate</p>
            </div>
          </div>
        </div>

        {/* Member Contributions pie chart: shows each member's share of total contributions. */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Member Contributions</h3>
          {/* Only render the chart if contribution data exists; show a fallback message otherwise. */}
          {group.contributionData.length > 0 ? (
            <div className="flex items-center gap-4">
              {/* Fixed-size donut chart container. */}
              <div className="h-28 w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={group.contributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}  // Inner hole makes it a donut chart.
                      outerRadius={45}
                      paddingAngle={2}  // Small gap between slices for readability.
                      dataKey="value"   // The numeric field to size each slice by.
                    >
                      {/* Each Cell gets the color defined on its contributionData entry. */}
                      {group.contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Tooltip shown on hover: formats value as a percentage. */}
                    <Tooltip
                      contentStyle={{
                        fontSize: 10,
                        borderRadius: 6,
                        border: "1px solid #2a2a2a",
                        backgroundColor: "#1a1a1a",
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend: one row per member with their color dot and percentage. */}
              <div className="flex-1 space-y-2">
                {group.contributionData.map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Small color swatch matching the pie slice. */}
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
                      <span className="text-xs text-gray-500">{member.name}</span>
                    </div>
                    {/* Percentage formatted to no decimal places (e.g. "45%"). */}
                    <span className="text-xs font-medium text-white">{member.value.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Empty state for when no one has recorded contributions yet.
            <div className="h-28 flex items-center justify-center text-xs text-gray-500">
              No contribution data yet
            </div>
          )}
        </div>
      </div>

      {/* ─── CHARTS ROW 2 ─────────────────────────────────────── */}
      {/* Two charts side by side: Monthly Savings trend (left) and Resolution Methods bar (right). */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Monthly Savings area chart: savings (green area) vs spending (red line) over time. */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Monthly Savings</h3>
          <p className="text-xs text-gray-500 mb-3">Savings vs spending over time</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              {/* monthlySavingsData = array of { month, savings, spent } objects. */}
              <AreaChart data={group.monthlySavingsData}>
                <defs>
                  {/* Linear gradient fills the area under the savings line from semi-opaque
                      emerald at the top to transparent at the bottom. */}
                  <linearGradient id="savingsGradientGroup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* X-axis: month labels; minimal styling to match the dark theme. */}
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                {/* Y-axis: dollar amounts; same minimal styling. */}
                <YAxis tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 6,
                    border: "1px solid #2a2a2a",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                />
                {/* Green filled area representing accumulated savings per month. */}
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#savingsGradientGroup)"
                  name="Saved"
                />
                {/* Red line overlaid on the area showing spending per month.
                    dot={false} removes the data-point circles to keep the chart clean. */}
                <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={false} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Chart legend: color swatches + labels for saved (green) and spent (red). */}
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Saved
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Spent
            </span>
          </div>
        </div>

        {/* Resolution Methods grouped bar chart: DIY (bright green) vs Hired (dark green) per month. */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Resolution Methods</h3>
          <p className="text-xs text-gray-500 mb-3">DIY vs hired by group</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              {/* resolutionData = array of { name (month), diy, hired } objects. */}
              <BarChart data={group.resolutionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 6,
                    border: "1px solid #2a2a2a",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                />
                {/* DIY bar in bright emerald. radius rounds the top corners. */}
                <Bar dataKey="diy" fill="#2563EB" radius={[4, 4, 0, 0]} name="DIY" />
                {/* Hired bar in darker green to visually distinguish from DIY. */}
                <Bar dataKey="hired" fill="#249361" radius={[4, 4, 0, 0]} name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Chart legend: color swatches + labels for DIY (bright green) and Hired (dark green). */}
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              DIY
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              {/* Inline style needed because this hex color isn't in the Tailwind config. */}
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#249361" }} />
              Hired
            </span>
          </div>
        </div>
      </div>

      {/* ─── RECENT ISSUES & ACTIVITY ROW ──────────────────────── */}
      {/* Two panels side by side: Recent Issues (left) and Recent Activity (right). */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Issues list */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-white">Recent Issues</h3>
            {/* "New" link navigates to the Diagnose page to report a new issue. */}
            <Link
              href="/dashboard/diagnose"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 transition-colors"
            >
              <IoAddOutline className="w-3.5 h-3.5" />
              New
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {/* Render each recent issue as a clickable row that links to its detail page. */}
            {group.recentIssues.length > 0 ? (
              group.recentIssues.map((issue) => (
                // Link to the issue detail page using the issue's id in the URL.
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Small amber icon box to visually indicate this is an issue. */}
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <IoConstruct className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{issue.title}</p>
                      {/* Category + relative timestamp below the title. */}
                      <p className="text-[10px] text-gray-500">
                        {issue.category || "General"} · {formatTimestamp(issue.createdAt)}
                      </p>
                    </div>
                  </div>
                  {/* Right-arrow chevron signals this row is clickable/navigable. */}
                  <IoChevronForward className="w-4 h-4 text-gray-400" />
                </Link>
              ))
            ) : (
              // Empty state shown when the group has no issues yet.
              <div className="py-4 text-center text-xs text-gray-500">No issues yet</div>
            )}
          </div>
        </div>

        {/* Recent Activity feed */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-white">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-3">
            {group.recentActivity.length > 0 ? (
              group.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {/* Circular icon container with type-specific background color and icon. */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBgColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    {/* Main activity description text. */}
                    <p className="text-sm text-white">{activity.message}</p>
                    {/* Timestamp and optional savings amount below the message. */}
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                      {/* Only show the savings amount if this activity resulted in savings. */}
                      {activity.savings ? ` · Saved $${activity.savings}` : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Empty state shown when the group has no recorded activity yet.
              <div className="py-4 text-center text-xs text-gray-500">No activity yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Invisible full-screen overlay rendered when any dropdown is open.
          Clicking anywhere outside the dropdown triggers setOpenMenuId(null),
          closing the menu. z-[9998] puts it below the dropdown (z-50) but above
          everything else so clicks are captured. */}
      {openMenuId && <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
}
