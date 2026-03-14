'use client';

import { useState } from 'react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { VariantSelector } from '@/components/catalog/VariantSelector';

interface Variant {
  id: string;
  size?: string | null;
  color?: string | null;
  color_hex?: string | null;
  stock?: number;
}

interface ProductVariantPanelClientProps {
  productId: string;
  variants: Variant[];
  initialVariantId?: string;
}

export function ProductVariantPanelClient({
  productId,
  variants,
  initialVariantId,
}: ProductVariantPanelClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(initialVariantId);

  return (
    <>
      <PriceDisplay productId={productId} variantId={selectedVariantId} installments={3} />
      <VariantSelector
        variants={variants}
        selectedVariantId={selectedVariantId}
        onChange={setSelectedVariantId}
      />
    </>
  );
}
