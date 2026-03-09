interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  badge?: string;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function PaymentMethodSelector({ methods, selectedId, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      {methods.map((method) => {
        const selected = method.id === selectedId;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={[
              'w-full rounded-xl border p-3 text-left transition',
              selected ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.10)]' : 'border-white/10 bg-white/5',
            ].join(' ')}
          >
            <p className="text-sm text-[#F5F0E8]">{method.label}</p>
            <p className="text-xs text-[#F5F0E8]/60">{method.description}</p>
            {method.badge ? <span className="mt-2 inline-block rounded-full bg-[#C9A84C]/15 px-2 py-1 text-[10px] text-[#C9A84C]">{method.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
