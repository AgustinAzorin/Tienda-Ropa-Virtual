'use client';

import { cn } from '@/lib/utils';

export type Vibe =
  | 'Casual'
  | 'Aesthetic'
  | 'Oversize'
  | 'Minimalista'
  | 'Deportivo'
  | 'Clásico'
  | 'Preppy'
  | 'Romántico'
  | 'Streetwear'
  | 'Vintage';

const VIBES: { label: Vibe; icon: string }[] = [
  { label: 'Casual',      icon: '◌' },
  { label: 'Aesthetic',   icon: '✿' },
  { label: 'Oversize',    icon: '◰' },
  { label: 'Minimalista', icon: '◻' },
  { label: 'Deportivo',   icon: '▷' },
  { label: 'Clásico',     icon: '▪' },
  { label: 'Preppy',      icon: '◆' },
  { label: 'Romántico',   icon: '◉' },
  { label: 'Streetwear',  icon: '⬡' },
  { label: 'Vintage',     icon: '◎' },
];

interface VibePickerProps {
  selected: Vibe[];
  onChange: (vibes: Vibe[]) => void;
  className?: string;
}

export function VibePicker({ selected, onChange, className }: VibePickerProps) {
  const toggle = (vibe: Vibe) => {
    if (selected.includes(vibe)) {
      onChange(selected.filter((v) => v !== vibe));
    } else {
      onChange([...selected, vibe]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-[rgba(245,240,232,0.7)]">
        Tu estilo{' '}
        <span className="text-[rgba(245,240,232,0.35)] font-normal">
          (elegí todos los que te representen)
        </span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {VIBES.map(({ label, icon }) => {
          const active = selected.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[12px]',
                'border transition-all duration-200 ease-out',
                'text-sm font-body text-left',
                active
                  ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.12)] text-[#F5F0E8]'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[rgba(245,240,232,0.6)]',
                'hover:border-[rgba(255,255,255,0.18)] hover:text-[#F5F0E8]',
                active && 'hover:border-[#C9A84C]',
              )}
              aria-pressed={active}
            >
              <span
                className={cn(
                  'text-lg leading-none',
                  active ? 'text-[#C9A84C]' : 'text-[rgba(245,240,232,0.3)]',
                )}
                aria-hidden="true"
              >
                {icon}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
