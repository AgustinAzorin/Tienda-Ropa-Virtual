import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  current,
  total,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <p className="text-sm text-[rgba(245,240,232,0.5)] mb-3 text-right">
          Paso{' '}
          <span className="font-mono text-[#C9A84C] font-medium">{current}</span>
          {' '}de{' '}
          <span className="font-mono text-[rgba(245,240,232,0.7)]">{total}</span>
        </p>
      )}
      <div className="h-0.5 w-full bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C9A84C] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
