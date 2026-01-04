"use client";

import { IoCart } from "react-icons/io5";

interface ShoppingItem {
  id: string;
  productName: string;
  storeName: string;
  estimatedCost: number | null;
  inStock: boolean | null;
}

interface ShoppingListSectionProps {
  items: ShoppingItem[];
}

export function ShoppingListSection({ items }: ShoppingListSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-3">
        <IoCart className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-medium text-white">Shopping List</h3>
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.inStock === true && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
              {item.inStock === false && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              )}
              {item.inStock === null && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#555] flex-shrink-0" />
              )}
              <span className="text-[#a3a3a3] truncate">{item.productName}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-[10px] text-[#9a9a9a]">{item.storeName}</span>
              {item.estimatedCost && (
                <span className="text-white">${item.estimatedCost.toFixed(0)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {items.length > 5 && (
        <p className="text-[10px] text-[#9a9a9a] mt-2">+{items.length - 5} more items</p>
      )}
    </div>
  );
}
