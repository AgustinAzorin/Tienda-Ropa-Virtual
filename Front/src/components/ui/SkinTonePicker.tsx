'use client';

import { cn } from '@/lib/utils';

// Paleta basada en la escala Fitzpatrick, traducida a tonos cálidos sin labels raciales
const SKIN_TONES = [
  '#FDDBB4',
  '#F3C89A',
  '#E0A87A',
  '#C8895C',
  '#A8693C',
  '#8B4F28',
  '#6B3419',
  '#4A2010',
] as const;

export type SkinTone = (typeof SKIN_TONES)[number];

interface SkinTonePickerProps {
  selected: SkinTone | null;
  onChange: (tone: SkinTone) => void;
  className?: string;
}

export function SkinTonePicker({ selected, onChange, className }: SkinTonePickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-[rgba(245,240,232,0.7)]">
        Tono de piel
      </p>
      <div className="flex gap-2 flex-wrap">
        {SKIN_TONES.map((tone) => {
          const isSelected = selected === tone;
          return (
            <button
              key={tone}
              type="button"
              onClick={() => onChange(tone)}
              className={cn(
                'w-9 h-9 rounded-full',
                'transition-all duration-150',
                'hover:scale-110',
                isSelected
                  ? 'ring-2 ring-[#C9A84C] ring-offset-2 ring-offset-[#0D0A08] scale-110'
                  : 'ring-0',
              )}
              style={{ backgroundColor: tone }}
              aria-label={`Tono ${SKIN_TONES.indexOf(tone) + 1}`}
              aria-pressed={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
