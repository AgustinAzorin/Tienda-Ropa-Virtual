export function HeatmapLegend() {
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-2 backdrop-blur-md">
      <div className="flex items-center gap-3 text-[11px] text-[#F5F0E8]/85">
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#4A90D9]" /> Azul - Holgado</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#5BBE7A]" /> Verde - Perfecto</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#D4614A]" /> Rojo - Ajustado</span>
      </div>
    </div>
  );
}
