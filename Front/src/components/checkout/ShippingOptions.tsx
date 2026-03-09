import { formatPrice } from '@/lib/utils';

interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  eta?: string;
}

interface ShippingOptionsProps {
  options: ShippingOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ShippingOptions({ options, selectedId, onSelect }: ShippingOptionsProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={[
              'w-full rounded-xl border p-3 text-left transition',
              selected ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.10)]' : 'border-white/10 bg-white/5',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-[#F5F0E8]">{option.name}</p>
                <p className="text-xs text-[#F5F0E8]/60">Entrega {option.eta ?? 'estimada'}</p>
              </div>
              <p className="font-mono text-sm text-[#C9A84C]">{option.amount === 0 ? 'Gratis' : formatPrice(option.amount)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
