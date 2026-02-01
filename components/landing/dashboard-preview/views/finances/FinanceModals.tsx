"use client";

import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { IncomeStream, IncomeFrequency, frequencyLabels, expenseCategories } from "./types";

interface IncomeFormState {
  source: string;
  amount: string;
  frequency: IncomeFrequency;
  description: string;
}

interface ExpenseFormState {
  category: string;
  amount: string;
  description: string;
  isRecurring: boolean;
  frequency: IncomeFrequency;
}

interface IncomeModalProps {
  isOpen: boolean;
  isEditing: boolean;
  form: IncomeFormState;
  onChange: (form: IncomeFormState) => void;
  onSave: () => void;
  onClose: () => void;
}

interface ExpenseModalProps {
  isOpen: boolean;
  form: ExpenseFormState;
  onChange: (form: ExpenseFormState) => void;
  onSave: () => void;
  onClose: () => void;
}

export function IncomeModal({ isOpen, isEditing, form, onChange, onSave, onClose }: IncomeModalProps) {
  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">{isEditing ? "Edit Income Stream" : "Add Income Stream"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Source *</label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => onChange({ ...form, source: e.target.value })}
              placeholder="e.g., Primary Salary, Freelance, Rental"
              className="w-full px-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] text-sm">$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => onChange({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Frequency *</label>
              <select
                value={form.frequency}
                onChange={(e) => onChange({ ...form, frequency: e.target.value as IncomeFrequency })}
                className="w-full px-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {Object.entries(frequencyLabels).filter(([k]) => k !== "one_time").map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="e.g., Full-time at Acme Corp"
              className="w-full px-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
            {isEditing ? "Save Changes" : "Add Income"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ExpenseModal({ isOpen, form, onChange, onSave, onClose }: ExpenseModalProps) {
  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white">Add Expense</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#333] rounded-lg"><IoClose className="w-5 h-5 text-[#666]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => onChange({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] text-sm">$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => onChange({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => onChange({ ...form, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 bg-[#0f0f0f] border-[#2a2a2a] rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-[#888]">Recurring</span>
              </label>
            </div>
          </div>
          {form.isRecurring && (
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => onChange({ ...form, frequency: e.target.value as IncomeFrequency })}
                className="w-full px-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {Object.entries(frequencyLabels).filter(([k]) => k !== "one_time").map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="e.g., Monthly insurance premium"
              className="w-full px-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
            Add Expense
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
