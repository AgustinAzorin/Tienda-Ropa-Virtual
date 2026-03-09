interface TryonFeedbackCardProps {
  value: 'yes' | 'no' | 'unknown';
  onChange: (value: 'yes' | 'no' | 'unknown') => void;
}

export function TryonFeedbackCard({ value, onChange }: TryonFeedbackCardProps) {
  const options: Array<{ id: 'yes' | 'no' | 'unknown'; label: string }> = [
    { id: 'yes', label: 'Si, lo use' },
    { id: 'no', label: 'No lo use' },
    { id: 'unknown', label: 'No lo conocia' },
  ];

  return (
    <article className="rounded-xl border border-[#C9A84C]/35 bg-[#C9A84C]/10 p-3">
      <p className="text-sm text-[#F5F0E8]">Ayudanos a mejorar</p>
      <p className="text-xs text-[#F5F0E8]/70">Usaste el probador virtual antes de comprar esta prenda?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              'rounded-full border px-3 py-1 text-xs',
              value === option.id ? 'border-[#C9A84C] bg-[#C9A84C]/20 text-[#F5F0E8]' : 'border-white/20 text-[#F5F0E8]/70',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </article>
  );
}
