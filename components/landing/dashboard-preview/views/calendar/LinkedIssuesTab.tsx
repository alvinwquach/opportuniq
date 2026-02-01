"use client";

import {
  IoLinkOutline,
  IoCalendarOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoChevronForward,
  IoAddOutline,
  IoConstructOutline,
  IoWarningOutline,
} from "react-icons/io5";

// Issues linked to calendar events
const linkedIssues = [
  {
    id: "1",
    issueTitle: "Kitchen Sink Leak",
    category: "Plumbing",
    priority: "high",
    status: "in_progress",
    events: [
      {
        id: "e1",
        title: "Plumber - Fix Leak",
        date: "Jan 27, 2025",
        time: "10:00 AM",
        status: "confirmed",
      },
    ],
    estimatedSavings: 150,
  },
  {
    id: "2",
    issueTitle: "Dead Outlet in Living Room",
    category: "Electrical",
    priority: "medium",
    status: "investigating",
    events: [
      {
        id: "e2",
        title: "Electrician - Outlet Repair",
        date: "Feb 3, 2025",
        time: "11:00 AM",
        status: "pending",
      },
    ],
    estimatedSavings: 200,
  },
  {
    id: "3",
    issueTitle: "AC Not Cooling Properly",
    category: "HVAC",
    priority: "high",
    status: "open",
    events: [],
    estimatedSavings: 350,
  },
  {
    id: "4",
    issueTitle: "Garage Door Squeaking",
    category: "Garage",
    priority: "low",
    status: "open",
    events: [],
    estimatedSavings: 50,
  },
  {
    id: "5",
    issueTitle: "Bathroom Exhaust Fan Noisy",
    category: "Ventilation",
    priority: "low",
    status: "resolved",
    events: [
      {
        id: "e3",
        title: "DIY - Replace Fan",
        date: "Jan 20, 2025",
        time: "2:00 PM",
        status: "completed",
      },
    ],
    estimatedSavings: 120,
    actualSavings: 95,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500/20 text-red-400";
    case "medium": return "bg-amber-500/20 text-amber-400";
    case "low": return "bg-[#333] text-[#888]";
    default: return "bg-[#333] text-[#888]";
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "open": return { color: "text-amber-400", label: "Open", icon: IoAlertCircleOutline };
    case "investigating": return { color: "text-blue-400", label: "Investigating", icon: IoConstructOutline };
    case "in_progress": return { color: "text-emerald-400", label: "In Progress", icon: IoConstructOutline };
    case "resolved": return { color: "text-[#888]", label: "Resolved", icon: IoCheckmarkCircle };
    default: return { color: "text-[#888]", label: status, icon: IoAlertCircleOutline };
  }
};

const getEventStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-emerald-500/20 text-emerald-400";
    case "pending": return "bg-amber-500/20 text-amber-400";
    case "completed": return "bg-[#333] text-[#888]";
    default: return "bg-[#333] text-[#888]";
  }
};

export function LinkedIssuesTab() {
  const issuesWithEvents = linkedIssues.filter(i => i.events.length > 0);
  const issuesNeedingSchedule = linkedIssues.filter(i => i.events.length === 0 && i.status !== "resolved");
  const resolvedIssues = linkedIssues.filter(i => i.status === "resolved");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Linked Issues</h3>
          <p className="text-xs text-[#666]">Issues connected to calendar events</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <p className="text-lg font-bold text-white">{linkedIssues.length}</p>
          <p className="text-[10px] text-[#666]">Total Issues</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <p className="text-lg font-bold text-emerald-400">{issuesWithEvents.length}</p>
          <p className="text-[10px] text-[#666]">Scheduled</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <p className="text-lg font-bold text-amber-400">{issuesNeedingSchedule.length}</p>
          <p className="text-[10px] text-[#666]">Need Scheduling</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <p className="text-lg font-bold text-[#888]">{resolvedIssues.length}</p>
          <p className="text-[10px] text-[#666]">Resolved</p>
        </div>
      </div>

      {/* Issues Needing Scheduling - Alert */}
      {issuesNeedingSchedule.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-400">Issues Need Scheduling</h4>
              <p className="text-xs text-[#888] mt-1">
                {issuesNeedingSchedule.length} open issue{issuesNeedingSchedule.length > 1 ? "s" : ""} without scheduled events
              </p>
              <div className="mt-3 space-y-2">
                {issuesNeedingSchedule.map((issue) => {
                  const statusInfo = getStatusInfo(issue.status);
                  return (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-2.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className="text-xs text-white">{issue.issueTitle}</span>
                        <span className="text-[10px] text-[#666]">· {issue.category}</span>
                      </div>
                      <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
                        <IoCalendarOutline className="w-3 h-3" />
                        Schedule
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Issues */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <h4 className="text-sm font-medium text-white">Issues with Scheduled Events</h4>
        </div>
        <div className="divide-y divide-[#2a2a2a]">
          {issuesWithEvents.filter(i => i.status !== "resolved").map((issue) => {
            const statusInfo = getStatusInfo(issue.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={issue.id} className="p-4 hover:bg-[#1f1f1f] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <h5 className="text-sm font-medium text-white">{issue.issueTitle}</h5>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#666] mt-1">{issue.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#555]">Est. Savings</p>
                    <p className="text-sm font-medium text-emerald-400">${issue.estimatedSavings}</p>
                  </div>
                </div>

                {/* Linked Events */}
                <div className="mt-3 space-y-2">
                  {issue.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
                    >
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#888]">{event.date}</span>
                        <span className="text-[10px] text-[#555]">·</span>
                        <span className="text-xs text-[#888]">{event.time}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${getEventStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-1 text-[10px] text-[#666] hover:text-emerald-400 transition-colors">
                    <IoAddOutline className="w-3 h-3" />
                    Add another event
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Resolved */}
      {resolvedIssues.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <h4 className="text-sm font-medium text-white">Recently Resolved</h4>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {resolvedIssues.map((issue) => (
              <div key={issue.id} className="p-4 opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                      <h5 className="text-sm font-medium text-white">{issue.issueTitle}</h5>
                    </div>
                    <p className="text-xs text-[#666] mt-1">{issue.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#555]">Saved</p>
                    <p className="text-sm font-medium text-emerald-400">${issue.actualSavings}</p>
                  </div>
                </div>
                {issue.events[0] && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#666]">
                    <IoCalendarOutline className="w-3.5 h-3.5" />
                    <span>{issue.events[0].title}</span>
                    <span>·</span>
                    <span>{issue.events[0].date}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
