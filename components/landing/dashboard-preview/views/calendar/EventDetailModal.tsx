"use client";

import { createPortal } from "react-dom";
import {
  IoClose,
  IoLocationOutline,
  IoPersonOutline,
  IoWallet,
  IoNotificationsOutline,
  IoLinkOutline,
  IoRepeat,
  IoPencil,
  IoTrash,
} from "react-icons/io5";
import { CalendarEvent } from "./types";
import { getEventColor, getEventIcon } from "./utils";

interface EventDetailModalProps {
  event: CalendarEvent | undefined;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className="relative bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-[#2a2a2a]">
        <div className={`p-5 border-b border-[#2a2a2a] ${getEventColor(event.type).replace('text-', 'bg-').split(' ')[0]}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)({ className: "w-5 h-5" })}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  {event.isRecurring && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#333] rounded-full text-[10px] text-[#888]">
                      <IoRepeat className="w-3 h-3" />
                      {event.recurringPattern}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#888] mt-0.5">{event.date} at {event.time}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#666] hover:text-white hover:bg-[#333] rounded-lg transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {event.location && (
            <div className="flex items-start gap-3">
              <IoLocationOutline className="w-5 h-5 text-[#666] mt-0.5" />
              <div>
                <p className="text-xs text-[#666] mb-0.5">Location</p>
                <p className="text-sm text-white">{event.location}</p>
              </div>
            </div>
          )}

          {event.assignee && (
            <div className="flex items-start gap-3">
              <IoPersonOutline className="w-5 h-5 text-[#666] mt-0.5" />
              <div>
                <p className="text-xs text-[#666] mb-0.5">Assigned To</p>
                <p className="text-sm text-white">{event.assignee}</p>
              </div>
            </div>
          )}

          {event.estimatedCost && event.estimatedCost > 0 && (
            <div className="flex items-start gap-3">
              <IoWallet className="w-5 h-5 text-[#666] mt-0.5" />
              <div>
                <p className="text-xs text-[#666] mb-0.5">Estimated Cost</p>
                <p className="text-sm text-white">${event.estimatedCost}</p>
              </div>
            </div>
          )}

          {event.reminder && (
            <div className="flex items-start gap-3">
              <IoNotificationsOutline className="w-5 h-5 text-[#666] mt-0.5" />
              <div>
                <p className="text-xs text-[#666] mb-0.5">Reminder</p>
                <p className="text-sm text-white">{event.reminder}</p>
              </div>
            </div>
          )}

          {event.linkedIssue && (
            <div className="flex items-start gap-3">
              <IoLinkOutline className="w-5 h-5 text-[#666] mt-0.5" />
              <div>
                <p className="text-xs text-[#666] mb-0.5">Linked Issue</p>
                <button className="text-sm text-emerald-400 hover:underline">{event.linkedIssue}</button>
              </div>
            </div>
          )}

          {event.notes && (
            <div className="pt-3 border-t border-[#2a2a2a]">
              <p className="text-xs text-[#666] mb-2">Notes</p>
              <p className="text-sm text-[#ccc] leading-relaxed">{event.notes}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 p-5 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <IoTrash className="w-4 h-4" />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#888] hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
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
