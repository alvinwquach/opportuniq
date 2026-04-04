"use client";

import {
  IoCalendarOutline,
  IoConstructOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoEllipsisHorizontal,
  IoChevronForward,
} from "react-icons/io5";

// Timeline events organized by date
const timelineData = [
  {
    date: "Today - Jan 27",
    isToday: true,
    events: [
      {
        id: "1",
        title: "Plumber - Fix Leak",
        time: "10:00 AM",
        type: "contractor",
        location: "Kitchen",
        status: "confirmed",
        estimatedCost: 150,
        assignee: "Mike's Plumbing",
      },
    ],
  },
  {
    date: "Wednesday, Jan 29",
    isToday: false,
    events: [
      {
        id: "2",
        title: "HVAC Filter Change",
        time: "2:00 PM",
        type: "diy",
        location: "Utility Room",
        status: "scheduled",
        estimatedCost: 45,
        assignee: "Self",
      },
    ],
  },
  {
    date: "Friday, Jan 31",
    isToday: false,
    events: [
      {
        id: "3",
        title: "Gutter Inspection",
        time: "9:00 AM",
        type: "reminder",
        location: "Exterior",
        status: "scheduled",
        estimatedCost: 0,
        assignee: null,
      },
    ],
  },
  {
    date: "Saturday, Feb 1",
    isToday: false,
    events: [
      {
        id: "4",
        title: "Rent Due",
        time: "All Day",
        type: "expense",
        location: null,
        status: "scheduled",
        estimatedCost: 2200,
        assignee: null,
      },
      {
        id: "5",
        title: "Smoke Detector Test",
        time: "10:00 AM",
        type: "reminder",
        location: "All Rooms",
        status: "scheduled",
        estimatedCost: 0,
        assignee: null,
      },
    ],
  },
  {
    date: "Monday, Feb 3",
    isToday: false,
    events: [
      {
        id: "6",
        title: "Electrician - Outlet Repair",
        time: "11:00 AM",
        type: "contractor",
        location: "Living Room",
        status: "pending",
        estimatedCost: 200,
        assignee: "Spark Electric",
      },
    ],
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "contractor": return IoPersonOutline;
    case "diy": return IoConstructOutline;
    case "reminder": return IoAlertCircleOutline;
    case "expense": return IoCashOutline;
    case "income": return IoTrendingUpOutline;
    default: return IoCalendarOutline;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "contractor": return "bg-blue-500 text-white";
    case "diy": return "bg-blue-500 text-white";
    case "reminder": return "bg-amber-500 text-white";
    case "expense": return "bg-red-500 text-white";
    case "income": return "bg-green-500 text-white";
    default: return "bg-gray-100 text-gray-900";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-blue-100 text-blue-600";
    case "scheduled": return "bg-blue-100 text-blue-600";
    case "pending": return "bg-amber-100 text-amber-600";
    case "completed": return "bg-gray-100 text-gray-500";
    default: return "bg-gray-100 text-gray-500";
  }
};

export function TimelineTab() {
  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Upcoming Events</h3>
          <p className="text-xs text-gray-500">Next 14 days</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-500 focus:outline-none focus:border-blue-500/50">
            <option>All Types</option>
            <option>DIY</option>
            <option>Pro Visits</option>
            <option>Reminders</option>
            <option>Expenses</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {timelineData.map((day) => (
          <div key={day.date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${day.isToday ? "bg-blue-500" : "bg-gray-300"}`} />
              <h4 className={`text-sm font-medium ${day.isToday ? "text-blue-600" : "text-gray-900"}`}>
                {day.date}
              </h4>
              {day.isToday && (
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                  Today
                </span>
              )}
            </div>

            {/* Events for this day */}
            <div className="ml-6 space-y-2 border-l border-gray-200 pl-4">
              {day.events.map((event) => {
                const Icon = getTypeIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(event.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <IoTimeOutline className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs text-gray-500">{event.time}</span>
                              {event.location && (
                                <>
                                  <span className="text-gray-600">·</span>
                                  <IoLocationOutline className="w-3.5 h-3.5 text-gray-600" />
                                  <span className="text-xs text-gray-500">{event.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${getStatusBadge(event.status)}`}>
                              {event.status}
                            </span>
                            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-all">
                              <IoEllipsisHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                          {event.assignee && (
                            <div className="flex items-center gap-1.5">
                              <IoPersonOutline className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs text-gray-500">{event.assignee}</span>
                            </div>
                          )}
                          {event.estimatedCost > 0 && (
                            <div className="flex items-center gap-1.5">
                              <IoCashOutline className="w-3.5 h-3.5 text-gray-600" />
                              <span className={`text-xs ${event.type === "expense" ? "text-red-600" : "text-gray-500"}`}>
                                ${event.estimatedCost}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <button className="px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Load more events
        </button>
      </div>
    </div>
  );
}
