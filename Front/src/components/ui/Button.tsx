'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-amber text-cacao font-semibold hover:bg-amber/90 active:scale-[0.98] disabled:opacity-50',
  secondary:
    'border border-white/20 text-warm-white hover:bg-white/5 active:scale-[0.98] disabled:opacity-50',
  ghost:
    'text-warm-white/70 hover:text-warm-white hover:bg-white/5 disabled:opacity-40',
  danger:
    'bg-coral text-white font-semibold hover:bg-coral/90 active:scale-[0.98] disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-[8px]',
  md: 'h-10 px-5 text-sm rounded-[8px]',
  lg: 'h-12 px-6 text-base rounded-[12px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-amber/50 cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
