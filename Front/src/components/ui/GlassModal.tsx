'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Si true, click en el backdrop no cierra el modal */
  persistent?: boolean;
  /** Ancho máximo. Default: md (448px) */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function GlassModal({
  open,
  onClose,
  children,
  className,
  persistent = false,
  size = 'md',
}: GlassModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open || persistent) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, persistent]);

  if (!open) return null;

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (!persistent && e.target === overlayRef.current) onClose?.();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D0A08]/80 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full rounded-[12px] animate-slide-up',
          'bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl',
          'border border-[rgba(255,255,255,0.08)]',
          'shadow-[0_32px_64px_rgba(0,0,0,0.6)]',
          'p-6',
          sizeMap[size],
          className,
        )}
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className={cn(
              'absolute top-4 right-4',
              'p-1.5 rounded-lg',
              'text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8]',
              'hover:bg-[rgba(255,255,255,0.06)]',
              'transition-colors duration-150',
            )}
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
