"use client";

import { cn } from "@/lib/utils";
import type { Category } from "./types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-800/50">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              isActive
                ? "bg-emerald-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
