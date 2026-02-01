"use client";

import {
  IoCalendarOutline,
  IoRepeat,
  IoLinkOutline,
  IoChevronForward,
  IoConstructOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { extendedEvents } from "./data";

// Upcoming events timeline data
const upcomingTimeline = [
  {
    id: "1",
    title: "Plumber - Fix Leak",
    date: "Jan 27",
    time: "10:00 AM",
    type: "contractor",
    location: "Kitchen",
    status: "confirmed",
    linkedIssue: "Kitchen Sink Leak",
  },
  {
    id: "2",
    title: "HVAC Filter Change",
    date: "Jan 29",
    time: "2:00 PM",
    type: "diy",
    location: "Utility Room",
    status: "scheduled",
    linkedIssue: null,
  },
  {
    id: "3",
    title: "Gutter Inspection",
    date: "Jan 31",
    time: "9:00 AM",
    type: "reminder",
    location: "Exterior",
    status: "scheduled",
    linkedIssue: null,
  },
  {
    id: "4",
    title: "Electrician - Outlet Repair",
    date: "Feb 3",
    time: "11:00 AM",
    type: "contractor",
    location: "Living Room",
    status: "pending",
    linkedIssue: "Dead Outlet",
  },
  {
    id: "5",
    title: "Rent Due",
    date: "Feb 1",
    time: "All Day",
    type: "expense",
    location: null,
    status: "scheduled",
    linkedIssue: null,
  },
];

// Recurring events
const recurringEvents = [
  {
    id: "1",
    title: "HVAC Filter Change",
    pattern: "Every 3 months",
    nextDate: "Jan 29",
    type: "diy",
  },
  {
    id: "2",
    title: "Gutter Inspection",
    pattern: "Every 6 months",
    nextDate: "Jan 31",
    type: "reminder",
  },
  {
    id: "3",
    title: "Smoke Detector Test",
    pattern: "Monthly",
    nextDate: "Feb 1",
    type: "reminder",
  },
  {
    id: "4",
    title: "Pest Control",
    pattern: "Quarterly",
    nextDate: "Mar 15",
    type: "contractor",
  },
];

// Linked issues
const linkedIssues = [
  {
    id: "1",
    issueTitle: "Kitchen Sink Leak",
    eventTitle: "Plumber - Fix Leak",
    eventDate: "Jan 27",
    status: "scheduled",
    category: "Plumbing",
  },
  {
    id: "2",
    issueTitle: "Dead Outlet in Living Room",
    eventTitle: "Electrician - Outlet Repair",
    eventDate: "Feb 3",
    status: "pending",
    category: "Electrical",
  },
  {
    id: "3",
    issueTitle: "AC Not Cooling Properly",
    eventTitle: null,
    eventDate: null,
    status: "needs_scheduling",
    category: "HVAC",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "contractor":
      return IoPersonOutline;
    case "diy":
      return IoConstructOutline;
    case "reminder":
      return IoAlertCircleOutline;
    case "expense":
      return IoCashOutline;
    case "income":
      return IoTrendingUpOutline;
    default:
      return IoCalendarOutline;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "contractor":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "diy":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "reminder":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "expense":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "income":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-[#333] text-[#888] border-[#444]";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/20 text-emerald-400";
    case "scheduled":
      return "bg-blue-500/20 text-blue-400";
    case "pending":
      return "bg-amber-500/20 text-amber-400";
    case "needs_scheduling":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-[#333] text-[#888]";
  }
};

export function CalendarBottomSection() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mt-4">
      {/* Upcoming Timeline */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <IoCalendarOutline className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">Upcoming Timeline</h3>
          </div>
          <span className="text-[10px] text-[#666]">Next 7 days</span>
        </div>
        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
          {upcomingTimeline.map((event, index) => {
            const Icon = getTypeIcon(event.type);
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:bg-[#151515] cursor-pointer transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getTypeColor(event.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#888]">{event.date}</span>
                    <span className="text-[10px] text-[#555]">·</span>
                    <span className="text-[10px] text-[#888]">{event.time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <IoLocationOutline className="w-3 h-3 text-[#555]" />
                      <span className="text-[10px] text-[#666]">{event.location}</span>
                    </div>
                  )}
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${getStatusBadge(event.status)}`}>
                  {event.status.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Events */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <IoRepeat className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">Recurring Events</h3>
          </div>
          <button className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
            Manage <IoChevronForward className="w-3 h-3" />
          </button>
        </div>
        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
          {recurringEvents.map((event) => {
            const Icon = getTypeIcon(event.type);
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:bg-[#151515] cursor-pointer transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getTypeColor(event.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <IoRepeat className="w-3 h-3 text-[#555]" />
                    <span className="text-[10px] text-[#888]">{event.pattern}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#666]">Next</p>
                  <p className="text-xs font-medium text-white">{event.nextDate}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/30">
            <IoRepeat className="w-4 h-4" />
            Add Recurring Event
          </button>
        </div>
      </div>

      {/* Linked Issues */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <IoLinkOutline className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">Linked Issues</h3>
          </div>
          <span className="text-[10px] text-[#666]">{linkedIssues.length} issues</span>
        </div>
        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
          {linkedIssues.map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:bg-[#151515] cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{item.issueTitle}</p>
                  <span className="text-[10px] text-[#666]">{item.category}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${getStatusBadge(item.status)}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>
              {item.eventTitle ? (
                <div className="mt-2 pt-2 border-t border-[#2a2a2a] flex items-center gap-2">
                  <IoCalendarOutline className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">{item.eventTitle}</span>
                  <span className="text-[10px] text-[#555]">·</span>
                  <span className="text-[10px] text-[#888]">{item.eventDate}</span>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                  <button className="flex items-center gap-1.5 text-[10px] text-amber-400 hover:text-amber-300">
                    <IoTimeOutline className="w-3 h-3" />
                    Schedule appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#666]">Issues needing scheduling</span>
            <span className="font-medium text-amber-400">1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
