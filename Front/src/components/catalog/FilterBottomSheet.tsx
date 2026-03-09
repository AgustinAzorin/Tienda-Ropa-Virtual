'use client';

import { FilterSidebar, type CatalogFilterState } from './FilterSidebar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

interface Option {
  id: string;
  name: string;
  slug?: string;
}

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  onApply: () => void;
  onClear: () => void;
  categories: Option[];
  brands: Option[];
  resultCount?: number;
}

export function FilterBottomSheet(props: FilterBottomSheetProps) {
  const {
    open,
    onClose,
    value,
    onChange,
    onApply,
    onClear,
    categories,
    brands,
    resultCount,
  } = props;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filtros"
      footer={
        <Button
          className="w-full"
          onClick={() => {
            onApply();
            onClose();
          }}
        >
          Ver {resultCount ?? 0} resultados
        </Button>
      }
    >
      <FilterSidebar
        categories={categories}
        brands={brands}
        value={value}
        onChange={onChange}
        onApply={onApply}
        onClear={onClear}
        className="flex h-auto w-full border-none bg-transparent p-0 md:hidden"
      />
    </BottomSheet>
  );
}
