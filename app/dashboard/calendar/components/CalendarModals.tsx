"use client";

import { createPortal } from "react-dom";
import {
  IoClose,
  IoCalendarOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoRepeat,
  IoPersonOutline,
  IoWallet,
  IoNotificationsOutline,
  IoLinkOutline,
  IoPencil,
  IoTrash,
} from "react-icons/io5";
import type { CalendarEvent, EventType, NewEventFormData } from "../types";

// ============================================================================
// Event Detail Modal
// ============================================================================

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const getEventColor = (type: string) => {
  switch (type) {
    case "contractor":
      return "bg-blue-100 border-blue-500/30 text-blue-600";
    case "diy":
      return "bg-blue-100 border-blue-500/30 text-blue-600";
    case "reminder":
      return "bg-amber-500/20 border-amber-500/30 text-amber-400";
    case "income":
      return "bg-blue-100 border-blue-500/30 text-blue-600";
    case "expense":
      return "bg-red-500/20 border-red-500/30 text-red-400";
    default:
      return "bg-[#333] border-[#444] text-gray-500";
  }
};

export function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  if (!event || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-100 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div
          className={`p-5 border-b border-gray-200 ${getEventColor(event.type).replace("text-", "bg-").split(" ")[0]}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                <IoCalendarOutline className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-white">
                    {event.title}
                  </h3>
                  {event.isRecurring && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#333] rounded-full text-[10px] text-gray-500">
                      <IoRepeat className="w-3 h-3" />
                      {event.recurringPattern}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {event.date} {event.time && `at ${event.time}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-[#333] rounded-lg transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {event.location && (
            <div className="flex items-start gap-3">
              <IoLocationOutline className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Location</p>
                <p className="text-sm text-white">{event.location}</p>
              </div>
            </div>
          )}

          {event.assignee && (
            <div className="flex items-start gap-3">
              <IoPersonOutline className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Assigned To</p>
                <p className="text-sm text-white">{event.assignee}</p>
              </div>
            </div>
          )}

          {event.estimatedCost && event.estimatedCost > 0 && (
            <div className="flex items-start gap-3">
              <IoWallet className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Estimated Cost</p>
                <p className="text-sm text-white">${event.estimatedCost}</p>
              </div>
            </div>
          )}

          {event.reminder && (
            <div className="flex items-start gap-3">
              <IoNotificationsOutline className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Reminder</p>
                <p className="text-sm text-white">{event.reminder}</p>
              </div>
            </div>
          )}

          {event.linkedIssueTitle && (
            <div className="flex items-start gap-3">
              <IoLinkOutline className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Linked Issue</p>
                <button className="text-sm text-blue-600 hover:underline">
                  {event.linkedIssueTitle}
                </button>
              </div>
            </div>
          )}

          {event.notes && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Notes</p>
              <p className="text-sm text-[#ccc] leading-relaxed">
                {event.notes}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <IoTrash className="w-4 h-4" />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <IoPencil className="w-4 h-4" />
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// Add Event Modal
// ============================================================================

interface AddEventModalProps {
  isOpen: boolean;
  newEvent: NewEventFormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (event: NewEventFormData) => void;
  isLoading?: boolean;
}

export function AddEventModal({
  isOpen,
  newEvent,
  onClose,
  onSave,
  onChange,
  isLoading,
}: AddEventModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const eventTypes: { id: EventType; label: string; color: string }[] = [
    { id: "diy", label: "DIY Project", color: "emerald" },
    { id: "contractor", label: "Pro Visit", color: "emerald" },
    { id: "reminder", label: "Reminder", color: "amber" },
    { id: "expense", label: "Expense", color: "red" },
  ];

  const getTypeStyles = (typeId: string, color: string) => {
    if (newEvent.type !== typeId) return {};
    const colorMap: Record<
      string,
      { bg: string; border: string; text: string }
    > = {
      emerald: {
        bg: "rgba(62, 207, 142, 0.2)",
        border: "rgba(62, 207, 142, 0.3)",
        text: "#2563EB",
      },
      amber: {
        bg: "rgba(245, 158, 11, 0.2)",
        border: "rgba(245, 158, 11, 0.3)",
        text: "#fbbf24",
      },
      red: {
        bg: "rgba(239, 68, 68, 0.2)",
        border: "rgba(239, 68, 68, 0.3)",
        text: "#f87171",
      },
    };
    const c = colorMap[color];
    return { backgroundColor: c.bg, borderColor: c.border, color: c.text };
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-100 rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-white">Add Event</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-[#333] rounded-lg transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => onChange({ ...newEvent, title: e.target.value })}
              placeholder="e.g., Fix kitchen faucet"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IoCalendarOutline className="w-4 h-4" />
                  Date
                </span>
              </label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  onChange({ ...newEvent, date: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IoTimeOutline className="w-4 h-4" />
                  Time
                </span>
              </label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  onChange({ ...newEvent, time: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Event Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onChange({ ...newEvent, type: type.id })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    newEvent.type === type.id
                      ? ""
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-[#333]"
                  }`}
                  style={getTypeStyles(type.id, type.color)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Location (optional)
            </label>
            <div className="relative">
              <IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) =>
                  onChange({ ...newEvent, location: e.target.value })
                }
                placeholder="e.g., Kitchen, Basement"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Recurring
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onChange({ ...newEvent, isRecurring: !newEvent.isRecurring })
                }
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  newEvent.isRecurring
                    ? "bg-blue-100 border-blue-500/30 text-blue-600"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-[#333]"
                }`}
              >
                <IoRepeat className="w-4 h-4" />
                {newEvent.isRecurring ? "Repeating" : "One-time"}
              </button>
              {newEvent.isRecurring && (
                <select
                  value={newEvent.recurringPattern}
                  onChange={(e) =>
                    onChange({ ...newEvent, recurringPattern: e.target.value })
                  }
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select frequency...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Every 3 months</option>
                  <option value="biannual">Every 6 months</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Reminder
            </label>
            <select
              value={newEvent.reminder}
              onChange={(e) =>
                onChange({ ...newEvent, reminder: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No reminder</option>
              <option value="at_time">At time of event</option>
              <option value="15_min">15 minutes before</option>
              <option value="1_hour">1 hour before</option>
              <option value="1_day">1 day before</option>
              <option value="3_days">3 days before</option>
              <option value="1_week">1 week before</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={newEvent.notes}
              onChange={(e) => onChange({ ...newEvent, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!newEvent.title || !newEvent.date || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : "Add Event"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
