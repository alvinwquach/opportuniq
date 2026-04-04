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
    <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{isEditing ? "Edit Income Stream" : "Add Income Stream"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><IoClose className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Source *</label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => onChange({ ...form, source: e.target.value })}
              placeholder="e.g., Primary Salary, Freelance, Rental"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => onChange({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Frequency *</label>
              <select
                value={form.frequency}
                onChange={(e) => onChange({ ...form, frequency: e.target.value as IncomeFrequency })}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {Object.entries(frequencyLabels).filter(([k]) => k !== "one_time").map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="e.g., Full-time at Acme Corp"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg">
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
    <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Add Expense</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><IoClose className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => onChange({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => onChange({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => onChange({ ...form, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-200 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">Recurring</span>
              </label>
            </div>
          </div>
          {form.isRecurring && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => onChange({ ...form, frequency: e.target.value as IncomeFrequency })}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {Object.entries(frequencyLabels).filter(([k]) => k !== "one_time").map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="e.g., Monthly insurance premium"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Add Expense
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
