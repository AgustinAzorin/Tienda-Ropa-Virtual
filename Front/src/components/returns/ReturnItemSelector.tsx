import type { CartItem } from '@/lib/cart/types';

interface ReturnItemSelectorProps {
  items: CartItem[];
  selectedIds: string[];
  onToggle: (itemId: string) => void;
}

export function ReturnItemSelector({ items, selectedIds, onToggle }: ReturnItemSelectorProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <span>{item.productName}</span>
          <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} />
        </label>
      ))}
    </div>
  );
}
