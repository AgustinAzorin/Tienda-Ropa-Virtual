interface TimelineItem {
  label: string;
  done: boolean;
  current?: boolean;
}

interface OrderTimelineProps {
  items: TimelineItem[];
}

export function OrderTimeline({ items }: OrderTimelineProps) {
  return (
    <ol className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-sm">
          <span className={[
            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
            item.done ? 'bg-[#C9A84C] text-[#0D0A08]' : item.current ? 'border border-[#C9A84C] text-[#C9A84C] animate-pulse-amber' : 'border border-white/20 text-[#F5F0E8]/60',
          ].join(' ')}>
            {item.done ? '✓' : '•'}
          </span>
          <span className={item.current ? 'text-[#F5F0E8]' : 'text-[#F5F0E8]/70'}>{item.label}</span>
        </li>
      ))}
    </ol>
  );
}
