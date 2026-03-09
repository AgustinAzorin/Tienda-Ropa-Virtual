'use client';

interface TryonLoadingProps {
  progress?: number;
}

export function TryonLoading({ progress = 0 }: TryonLoadingProps) {
  const clamped = Math.max(0, Math.min(progress, 100));

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0D0A08]">
      <div className="w-full max-w-md space-y-6 px-6 text-center">
        <div className="mx-auto h-56 w-28 rounded-[48px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.04)] skeleton" />
        <p className="font-mono text-sm text-[#F5F0E8]/85">Preparando tu probador...</p>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className="h-full bg-[#C9A84C] transition-[width] duration-200"
            style={{ width: `${clamped}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="font-mono text-xs text-[#C9A84C] tabular-nums">{clamped}%</p>
      </div>
    </div>
  );
}
