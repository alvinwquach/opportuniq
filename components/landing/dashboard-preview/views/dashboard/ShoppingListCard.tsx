import { IoCart } from "react-icons/io5";

interface ShoppingItem {
  id: string;
  productName: string;
  storeName: string;
  estimatedCost?: number;
  inStock?: boolean;
}

interface ShoppingListCardProps {
  items: ShoppingItem[];
  maxItems?: number;
}

export function ShoppingListCard({ items, maxItems = 3 }: ShoppingListCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Shopping List</h3>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500">{items.length} items</span>
      </div>
      <div className="space-y-2">
        {items.slice(0, maxItems).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-[10px] sm:text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.inStock && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
              <span className="text-gray-700 truncate">{item.productName}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
              <span className="text-[9px] sm:text-[10px] text-gray-500 hidden sm:inline">{item.storeName}</span>
              {item.estimatedCost && <span className="text-gray-900 font-medium">${item.estimatedCost.toFixed(0)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
