'use client';

import { cn } from '@/lib/utils';

interface BodySliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function BodySlider({
  label,
  value,
  min,
  max,
  unit,
  step = 1,
  onChange,
  className,
}: BodySliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[rgba(245,240,232,0.6)] font-medium">{label}</span>
        <span className="font-mono text-[#C9A84C] text-sm font-medium tabular-nums">
          {value} {unit}
        </span>
      </div>

      <div className="relative h-10 flex items-center group">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-0.5 bg-[rgba(255,255,255,0.08)] rounded-full" />

        {/* Track fill */}
        <div
          className="absolute left-0 h-0.5 bg-[#C9A84C] rounded-full pointer-events-none transition-all duration-75"
          style={{ width: `${percent}%` }}
        />

        {/* Thumb glow */}
        <div
          className={cn(
            'absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-px',
            'rounded-full bg-[#C9A84C]',
            'shadow-[0_0_0_0_rgba(201,168,76,0)]',
            'group-hover:shadow-[0_0_0_6px_rgba(201,168,76,0.15)]',
            'transition-shadow duration-200',
            'pointer-events-none',
          )}
          style={{ left: `${percent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            'appearance-none',
          )}
          aria-label={`${label}: ${value} ${unit}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      <div className="flex justify-between text-xs font-mono text-[rgba(245,240,232,0.25)]">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}
