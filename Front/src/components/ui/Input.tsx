'use client';

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
  /** Shorthand for type="password" with toggle button */
  passwordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, passwordToggle, className, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password' || passwordToggle === true;
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm text-warm-white/70 font-medium"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={resolvedType}
            className={cn(
              'w-full h-11 px-4 bg-white/5 border border-white/10 rounded-[8px] text-warm-white placeholder:text-warm-white/30 text-sm',
              'transition-all duration-300 outline-none',
              'focus:border-amber/60 focus:bg-white/8 focus:ring-1 focus:ring-amber/20',
              error && 'border-coral/60 focus:border-coral focus:ring-coral/20',
              (isPassword || suffix) && 'pr-11',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-white/40 hover:text-warm-white/70 transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {suffix && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-white/40 text-sm">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-coral text-xs">{error}</p>}
        {!error && hint && <p className="text-warm-white/40 text-xs">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
