'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  className?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export function AvatarUpload({ value, onChange, previewUrl, className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = localPreview ?? previewUrl ?? null;

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no válido. Usá JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_SIZE_MB}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onChange(file);
  }, [onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className="relative"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative w-24 h-24 rounded-full overflow-hidden',
            'border-2 transition-all duration-200',
            isDragging
              ? 'border-[#C9A84C] scale-105'
              : 'border-[rgba(255,255,255,0.12)] hover:border-[#C9A84C]',
            'bg-[rgba(255,255,255,0.04)]',
            'group',
          )}
          aria-label="Subir foto de perfil"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview del avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1.5 text-[rgba(245,240,232,0.3)] group-hover:text-[rgba(245,240,232,0.6)] transition-colors">
              <Camera size={24} />
              <span className="text-xs font-body">Subir foto</span>
            </div>
          )}

          {/* Hover overlay cuando hay preview */}
          {preview && (
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          )}
        </button>

        {/* Remove button */}
        {(value ?? preview) && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute -top-1 -right-1',
              'w-6 h-6 rounded-full',
              'bg-[#D4614A] text-white',
              'flex items-center justify-center',
              'hover:bg-[#C04E39] transition-colors',
              'shadow-lg',
            )}
            aria-label="Quitar foto"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
      />

      <p className="text-xs text-[rgba(245,240,232,0.35)] text-center">
        JPG, PNG o WebP · Máx. {MAX_SIZE_MB}MB
      </p>

      {error && (
        <p className="text-xs text-[#D4614A] text-center animate-slide-up" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
