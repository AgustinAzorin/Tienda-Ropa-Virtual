import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function CatalogoLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="skeleton h-9 w-40" />
        <div className="skeleton h-8 w-72" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
