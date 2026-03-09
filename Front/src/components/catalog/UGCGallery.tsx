'use client';

import { useState } from 'react';

interface UGCItem {
  id: string;
  author: string;
}

interface UGCGalleryProps {
  items: UGCItem[];
}

export function UGCGallery({ items }: UGCGalleryProps) {
  const [active, setActive] = useState<UGCItem | null>(null);

  return (
    <section className="space-y-3">
      <h3 className="font-display text-2xl italic">Como lo usan otros</h3>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setActive(item)}
            className="aspect-square rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-xs text-[#F5F0E8]/70"
          >
            @{item.author}
          </button>
        ))}
      </div>

      {active && (
        <div className="glass fixed inset-x-4 bottom-24 z-40 rounded-[12px] p-4 md:inset-auto md:bottom-8 md:right-8 md:w-[320px]">
          <p className="text-sm">Post de @{active.author}</p>
          <button
            type="button"
            className="mt-2 text-xs text-[#C9A84C]"
            onClick={() => setActive(null)}
          >
            Cerrar
          </button>
        </div>
      )}
    </section>
  );
}
