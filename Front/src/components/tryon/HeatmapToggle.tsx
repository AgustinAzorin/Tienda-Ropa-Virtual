interface HeatmapToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function HeatmapToggle({ enabled, onToggle }: HeatmapToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-left"
    >
      <span className="text-sm text-[#F5F0E8]">Ver mapa de calor</span>
      <span
        className={enabled ? 'text-xs font-semibold text-[#C9A84C]' : 'text-xs text-[#F5F0E8]/65'}
      >
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}
