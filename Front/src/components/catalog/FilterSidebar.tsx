'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface CatalogFilterState {
  category?: string;
  brand?: string;
  has3dModel: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface Option {
  id: string;
  name: string;
  slug?: string;
}

interface FilterSidebarProps {
  categories: Option[];
  brands: Option[];
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  onApply: () => void;
  onClear: () => void;
  className?: string;
}

export function FilterSidebar({
  categories,
  brands,
  value,
  onChange,
  onApply,
  onClear,
  className,
}: FilterSidebarProps) {
  const update = (patch: Partial<CatalogFilterState>) => onChange({ ...value, ...patch });

  return (
    <aside
      className={cn(
        'hidden h-[calc(100dvh-120px)] w-[280px] shrink-0 flex-col rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] md:flex',
        className,
      )}
    >
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => update({ has3dModel: !value.has3dModel })}
            className={cn(
              'flex w-full items-center justify-between rounded-[8px] border px-3 py-2 text-sm transition-colors',
              value.has3dModel
                ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.15)] text-[#F5F0E8]'
                : 'border-[rgba(255,255,255,0.12)] text-[#F5F0E8]/75',
            )}
          >
            <span>🧍 Solo con modelo 3D</span>
            <span>{value.has3dModel ? 'On' : 'Off'}</span>
          </button>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-[#F5F0E8]/80">Categoria</h3>
          <div className="space-y-1.5">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-[#F5F0E8]/70">
                <input
                  type="radio"
                  name="category"
                  checked={value.category === category.id}
                  onChange={() => update({ category: category.id })}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-[#F5F0E8]/80">Marca</h3>
          <div className="space-y-1.5">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-[#F5F0E8]/70">
                <input
                  type="radio"
                  name="brand"
                  checked={value.brand === brand.id}
                  onChange={() => update({ brand: brand.id })}
                />
                <span>{brand.name}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium text-[#F5F0E8]/80">Precio</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={value.minPrice ?? ''}
              onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Min"
              className="h-10 rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-2 text-sm"
            />
            <input
              type="number"
              value={value.maxPrice ?? ''}
              onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Max"
              className="h-10 rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-2 text-sm"
            />
          </div>
        </section>
      </div>

      <div className="space-y-2 border-t border-[rgba(255,255,255,0.08)] p-4">
        <Button className="w-full" onClick={onApply}>Aplicar filtros</Button>
        <button
          type="button"
          onClick={onClear}
          className="w-full text-center text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8]"
        >
          Limpiar todo
        </button>
      </div>
    </aside>
  );
}
