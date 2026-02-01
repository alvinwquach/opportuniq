"use client";

import { createPortal } from "react-dom";
import {
  IoClose,
  IoCalendarOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoRepeat,
} from "react-icons/io5";
import { EventType } from "./types";

interface NewEventState {
  title: string;
  date: string;
  time: string;
  type: EventType;
  notes: string;
  isRecurring: boolean;
  recurringPattern: string;
  location: string;
  reminder: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  newEvent: NewEventState;
  onClose: () => void;
  onSave: () => void;
  onChange: (event: NewEventState) => void;
}

export function AddEventModal({ isOpen, newEvent, onClose, onSave, onChange }: AddEventModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  const eventTypes = [
    { id: 'diy' as EventType, label: 'DIY Project', color: 'emerald' },
    { id: 'contractor' as EventType, label: 'Pro Visit', color: 'emerald' },
    { id: 'reminder' as EventType, label: 'Reminder', color: 'amber' },
    { id: 'expense' as EventType, label: 'Expense', color: 'red' },
  ];

  const getTypeStyles = (typeId: string, color: string) => {
    if (newEvent.type !== typeId) return {};
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      emerald: { bg: 'rgba(62, 207, 142, 0.2)', border: 'rgba(62, 207, 142, 0.3)', text: '#3ECF8E' },
      amber: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },
      red: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },
    };
    const c = colorMap[color];
    return { backgroundColor: c.bg, borderColor: c.border, color: c.text };
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className="relative bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-[#2a2a2a]">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Add Event</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666] hover:text-white hover:bg-[#333] rounded-lg transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">Event Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => onChange({ ...newEvent, title: e.target.value })}
              placeholder="e.g., Fix kitchen faucet"
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#888] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IoCalendarOutline className="w-4 h-4" />
                  Date
                </span>
              </label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => onChange({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#888] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IoTimeOutline className="w-4 h-4" />
                  Time
                </span>
              </label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => onChange({ ...newEvent, time: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">Event Type</label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onChange({ ...newEvent, type: type.id })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    newEvent.type === type.id
                      ? ''
                      : 'bg-[#0f0f0f] border-[#2a2a2a] text-[#888] hover:bg-[#333]'
                  }`}
                  style={getTypeStyles(type.id, type.color)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">Location (optional)</label>
            <div className="relative">
              <IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => onChange({ ...newEvent, location: e.target.value })}
                placeholder="e.g., Kitchen, Basement"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">Recurring</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onChange({ ...newEvent, isRecurring: !newEvent.isRecurring })}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  newEvent.isRecurring
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-[#0f0f0f] border-[#2a2a2a] text-[#888] hover:bg-[#333]'
                }`}
              >
                <IoRepeat className="w-4 h-4" />
                {newEvent.isRecurring ? 'Repeating' : 'One-time'}
              </button>
              {newEvent.isRecurring && (
                <select
                  value={newEvent.recurringPattern}
                  onChange={(e) => onChange({ ...newEvent, recurringPattern: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-[#888] mb-1.5">Reminder</label>
            <select
              value={newEvent.reminder}
              onChange={(e) => onChange({ ...newEvent, reminder: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-[#888] mb-1.5">Notes (optional)</label>
            <textarea
              value={newEvent.notes}
              onChange={(e) => onChange({ ...newEvent, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#888] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!newEvent.title || !newEvent.date}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Event
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
