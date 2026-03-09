import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function CatalogoCategoriaLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] pb-24">
      <section className="skeleton h-[30vh] w-full md:h-[40vh]" />
      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pt-5 md:px-8">
        <div className="skeleton h-5 w-64" />
        <div className="skeleton h-8 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
