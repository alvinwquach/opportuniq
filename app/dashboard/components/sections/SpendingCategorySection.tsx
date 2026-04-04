"use client";

import { SpendingBar } from "../charts";

interface SpendingCategory {
  category: string;
  total: string | number;
}

interface SpendingCategorySectionProps {
  categories: SpendingCategory[];
}

export function SpendingCategorySection({ categories }: SpendingCategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Spending</h3>
      <SpendingBar
        data={categories.map((s) => ({
          category: s.category,
          total: Number(s.total),
        }))}
        height={160}
      />
    </div>
  );
}
