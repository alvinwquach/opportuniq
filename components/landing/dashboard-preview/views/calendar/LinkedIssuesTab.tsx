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
    case "high": return "bg-red-100 text-red-600";
    case "medium": return "bg-amber-100 text-amber-600";
    case "low": return "bg-gray-100 text-gray-500";
    default: return "bg-gray-100 text-gray-500";
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "open": return { color: "text-amber-600", label: "Open", icon: IoAlertCircleOutline };
    case "investigating": return { color: "text-blue-600", label: "Investigating", icon: IoConstructOutline };
    case "in_progress": return { color: "text-blue-600", label: "In Progress", icon: IoConstructOutline };
    case "resolved": return { color: "text-gray-500", label: "Resolved", icon: IoCheckmarkCircle };
    default: return { color: "text-gray-500", label: status, icon: IoAlertCircleOutline };
  }
};

const getEventStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-blue-100 text-blue-600";
    case "pending": return "bg-amber-100 text-amber-600";
    case "completed": return "bg-gray-100 text-gray-500";
    default: return "bg-gray-100 text-gray-500";
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
          <h3 className="text-sm font-medium text-gray-900">Linked Issues</h3>
          <p className="text-xs text-gray-500">Issues connected to calendar events</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-gray-900">{linkedIssues.length}</p>
          <p className="text-[10px] text-gray-500">Total Issues</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-blue-600">{issuesWithEvents.length}</p>
          <p className="text-[10px] text-gray-500">Scheduled</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-amber-600">{issuesNeedingSchedule.length}</p>
          <p className="text-[10px] text-gray-500">Need Scheduling</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-gray-500">{resolvedIssues.length}</p>
          <p className="text-[10px] text-gray-500">Resolved</p>
        </div>
      </div>

      {/* Issues Needing Scheduling - Alert */}
      {issuesNeedingSchedule.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-600">Issues Need Scheduling</h4>
              <p className="text-xs text-gray-500 mt-1">
                {issuesNeedingSchedule.length} open issue{issuesNeedingSchedule.length > 1 ? "s" : ""} without scheduled events
              </p>
              <div className="mt-3 space-y-2">
                {issuesNeedingSchedule.map((issue) => {
                  const statusInfo = getStatusInfo(issue.status);
                  return (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className="text-xs text-gray-900">{issue.issueTitle}</span>
                        <span className="text-[10px] text-gray-500">· {issue.category}</span>
                      </div>
                      <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-blue-600 hover:bg-blue-50 rounded transition-colors">
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Issues with Scheduled Events</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {issuesWithEvents.filter(i => i.status !== "resolved").map((issue) => {
            const statusInfo = getStatusInfo(issue.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={issue.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <h5 className="text-sm font-medium text-gray-900">{issue.issueTitle}</h5>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{issue.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-600">Est. Savings</p>
                    <p className="text-sm font-medium text-blue-600">${issue.estimatedSavings}</p>
                  </div>
                </div>

                {/* Linked Events */}
                <div className="mt-3 space-y-2">
                  {issue.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-900">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{event.date}</span>
                        <span className="text-[10px] text-gray-600">·</span>
                        <span className="text-xs text-gray-500">{event.time}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${getEventStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-600 transition-colors">
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Recently Resolved</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {resolvedIssues.map((issue) => (
              <div key={issue.id} className="p-4 opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
                      <h5 className="text-sm font-medium text-gray-900">{issue.issueTitle}</h5>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{issue.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-600">Saved</p>
                    <p className="text-sm font-medium text-blue-600">${issue.actualSavings}</p>
                  </div>
                </div>
                {issue.events[0] && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
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
