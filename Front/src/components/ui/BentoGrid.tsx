import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BentoItem {
  id: string;
  content: ReactNode;
}

type BentoLayout = 'discovery' | 'profile';

interface BentoGridProps {
  items: BentoItem[];
  layout?: BentoLayout;
  className?: string;
}

const discoverySpans = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-2',
  'md:col-span-1 md:row-span-1',
];

export function BentoGrid({ items, layout = 'discovery', className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[160px] md:grid-cols-4',
        layout === 'profile' && 'md:auto-rows-[180px] md:grid-cols-4',
        className,
      )}
    >
      {items.map((item, index) => {
        const spanClass =
          layout === 'profile' ? 'md:col-span-1 md:row-span-1' : discoverySpans[index % discoverySpans.length];

        return (
          <article
            key={item.id}
            className={cn(
              'overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]',
              'min-h-[160px] md:min-h-0',
              spanClass,
            )}
          >
            {item.content}
          </article>
        );
      })}
    </div>
  );
}
