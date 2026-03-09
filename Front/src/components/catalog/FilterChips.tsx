'use client';

import { cn } from '@/lib/utils';

export interface FilterChipOption {
  value: string;
  label: string;
  icon?: string;
  is3d?: boolean;
}

interface FilterChipsProps {
  filters: FilterChipOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  scrollable?: boolean;
  className?: string;
}

export function FilterChips({
  filters,
  selected,
  onChange,
  scrollable = true,
  className,
}: FilterChipsProps) {
  const chip3d = filters.find((chip) => chip.is3d || chip.value === 'tiene_3d');
  const rest = filters.filter((chip) => chip !== chip3d);

  const sorted = [
    ...(chip3d ? [chip3d] : []),
    ...rest.sort((a, b) => {
      const aSelected = selected.includes(a.value);
      const bSelected = selected.includes(b.value);
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    }),
  ];

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  return (
    <div
      className={cn(
        'flex w-full items-center gap-2',
        scrollable && 'overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {sorted.map((chip) => {
        const isActive = selected.includes(chip.value);
        const is3d = chip.is3d || chip.value === 'tiene_3d';

        return (
          <button
            type="button"
            key={chip.value}
            onClick={() => toggle(chip.value)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors duration-300 ease-out',
              'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-[#F5F0E8]/75',
              isActive && 'border-[#C9A84C] bg-[rgba(201,168,76,0.15)] text-[#F5F0E8]',
              is3d && 'font-medium',
            )}
            aria-pressed={isActive}
          >
            {is3d ? (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>{chip.icon ?? '🧍'}</span>
                <span>{chip.label}</span>
              </span>
            ) : (
              <span>{chip.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
