'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar filtros"
      />

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-hidden rounded-t-[16px]',
          'border border-[rgba(255,255,255,0.08)] bg-[#141010] animate-slide-up',
        )}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[rgba(245,240,232,0.2)]" />
        {title && <h3 className="px-4 pb-2 pt-3 font-display text-xl italic">{title}</h3>}
        <div className="max-h-[58dvh] overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="border-t border-[rgba(255,255,255,0.08)] p-4">{footer}</div>}
      </div>
    </div>
  );
}
