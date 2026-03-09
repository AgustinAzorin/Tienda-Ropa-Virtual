import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
}

interface RelatedProductsProps {
  items: Product[];
}

export function RelatedProducts({ items }: RelatedProductsProps) {
  return (
    <section className="space-y-3">
      <h3 className="font-display text-2xl italic">Tambien te puede gustar</h3>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <div key={item.id} className="w-[220px] shrink-0">
            <ProductCard
              product={{
                ...item,
                stock: 10,
                brand_name: 'Relacionados',
                average_rating: 4.2,
                reviews_count: 34,
              }}
              showBadge3D
            />
          </div>
        ))}
      </div>
    </section>
  );
}
